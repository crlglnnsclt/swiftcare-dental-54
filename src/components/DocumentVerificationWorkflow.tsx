import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Download, 
  Signature,
  FileText,
  User,
  Calendar,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DigitalSignature } from '@/components/DigitalSignature';

interface PendingDocument {
  id: string;
  type: 'form_response' | 'patient_document';
  name: string;
  patient_name: string;
  patient_id: string;
  submitted_at: string;
  status: string;
  verification_status: string;
  requires_dentist_signature?: boolean;
  signature_data?: string;
  metadata?: any;
}

interface AuditEntry {
  id: string;
  action_type: string;
  action_description: string;
  performed_by: string;
  performed_at: string;
  patient_name?: string;
  document_name?: string;
}

export default function DocumentVerificationWorkflow() {
  const { user, profile } = useAuth();
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<PendingDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dentistSignature, setDentistSignature] = useState('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingDocuments();
    fetchAuditTrail();
  }, []);

  const fetchPendingDocuments = async () => {
    try {
      setLoading(true);

      // Fetch pending form responses
      const { data: formResponses } = await supabase
        .from('form_responses')
        .select(`
          id,
          verification_status,
          requires_dentist_signature,
          signature_data,
          created_at,
          digital_forms(name),
          patients(full_name, id)
        `)
        .in('verification_status', ['pending_verification', 'needs_correction'])
        .order('created_at', { ascending: true });

      // Fetch pending patient documents
      const { data: patientDocs } = await supabase
        .from('patient_documents')
        .select(`
          id,
          verification_status,
          file_name,
          created_at,
          patients(full_name, id)
        `)
        .in('verification_status', ['pending_verification', 'needs_correction'])
        .order('created_at', { ascending: true });

      const documents: PendingDocument[] = [
        ...(formResponses || []).map(response => ({
          id: response.id,
          type: 'form_response' as const,
          name: response.digital_forms?.name || 'Unknown Form',
          patient_name: response.patients?.full_name || 'Unknown Patient',
          patient_id: response.patients?.id || '',
          submitted_at: response.created_at,
          status: 'signed',
          verification_status: response.verification_status,
          requires_dentist_signature: response.requires_dentist_signature,
          signature_data: response.signature_data
        })),
        ...(patientDocs || []).map(doc => ({
          id: doc.id,
          type: 'patient_document' as const,
          name: doc.file_name,
          patient_name: doc.patients?.full_name || 'Unknown Patient',
          patient_id: doc.patients?.id || '',
          submitted_at: doc.created_at,
          status: 'uploaded',
          verification_status: doc.verification_status
        }))
      ].sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());

      setPendingDocuments(documents);
    } catch (error) {
      console.error('Error fetching pending documents:', error);
      toast.error('Failed to load pending documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const { data } = await supabase
        .from('document_audit_trail')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(50);

      const auditEntries = (data || []).map(entry => ({
        id: entry.id,
        action_type: entry.action_type,
        action_description: entry.action_description || '',
        performed_by: 'System User', // Simplified for now
        performed_at: entry.performed_at,
        patient_name: typeof entry.metadata === 'object' && entry.metadata ? (entry.metadata as any)?.patient_name : undefined,
        document_name: typeof entry.metadata === 'object' && entry.metadata ? (entry.metadata as any)?.document_name : undefined
      }));

      setAuditTrail(auditEntries);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
    }
  };

  const logDocumentAction = async (
    documentId: string,
    documentType: string,
    actionType: string,
    actionDescription: string,
    patientId?: string,
    documentName?: string
  ) => {
    try {
      await supabase
        .from('document_audit_trail')
        .insert({
          document_id: documentId,
          document_type: documentType,
          action_type: actionType,
          action_description: actionDescription,
          performed_by: user?.id,
          clinic_id: profile?.clinic_id,
          patient_id: patientId,
          metadata: {
            patient_name: selectedDocument?.patient_name,
            document_name: documentName || selectedDocument?.name
          }
        });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const sendNotification = async (
    recipientId: string,
    type: string,
    title: string,
    message: string,
    documentId: string,
    documentType: string
  ) => {
    try {
      await supabase
        .from('workflow_notifications')
        .insert({
          recipient_user_id: recipientId,
          notification_type: type,
          title,
          message,
          document_id: documentId,
          document_type: documentType,
          clinic_id: profile?.clinic_id
        });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const approveDocument = async (doc: PendingDocument) => {
    if (!profile?.role || !['dentist', 'clinic_admin'].includes(profile.role)) {
      toast.error('Only dentists and admins can approve documents');
      return;
    }

    setProcessingAction('approve');
    try {
      const table = doc.type === 'form_response' ? 'form_responses' : 'patient_documents';
      const updateData: any = {
        verification_status: 'approved',
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
        is_visible_to_patient: true
      };

      // If requires dentist signature and we have one, add it
      if (doc.requires_dentist_signature && dentistSignature) {
        updateData.dentist_signature_data = dentistSignature;
        updateData.dentist_signed_by = user?.id;
        updateData.dentist_signed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', doc.id);

      if (error) throw error;

      await logDocumentAction(
        doc.id,
        doc.type,
        'approved',
        `Document approved by ${profile.full_name}`,
        doc.patient_id,
        doc.name
      );

      // Get patient's user_id to send notification
      const { data: patient } = await supabase
        .from('patients')
        .select('user_id')
        .eq('id', doc.patient_id)
        .single();

      if (patient?.user_id) {
        await sendNotification(
          patient.user_id,
          'document_approved',
          'Document Approved',
          `Your ${doc.name} has been approved and is now available for download.`,
          doc.id,
          doc.type
        );
      }

      toast.success('Document approved successfully');
      setSelectedDocument(null);
      setDentistSignature('');
      fetchPendingDocuments();
      fetchAuditTrail();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
    } finally {
      setProcessingAction(null);
    }
  };

  const rejectDocument = async (doc: PendingDocument) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessingAction('reject');
    try {
      const table = doc.type === 'form_response' ? 'form_responses' : 'patient_documents';
      
      const { error } = await supabase
        .from(table)
        .update({
          verification_status: 'rejected',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          is_visible_to_patient: false
        })
        .eq('id', doc.id);

      if (error) throw error;

      await logDocumentAction(
        doc.id,
        doc.type,
        'rejected',
        `Document rejected: ${rejectionReason}`,
        doc.patient_id,
        doc.name
      );

      // Get patient's user_id to send notification
      const { data: patient } = await supabase
        .from('patients')
        .select('user_id')
        .eq('id', doc.patient_id)
        .single();

      if (patient?.user_id) {
        await sendNotification(
          patient.user_id,
          'document_rejected',
          'Document Requires Correction',
          `Your ${doc.name} needs correction: ${rejectionReason}`,
          doc.id,
          doc.type
        );
      }

      toast.success('Document rejected with feedback');
      setSelectedDocument(null);
      setRejectionReason('');
      fetchPendingDocuments();
      fetchAuditTrail();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending Verification
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'needs_correction':
        return (
          <Badge className="bg-orange-100 text-orange-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Needs Correction
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'submitted':
      case 'signed':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'downloaded':
        return <Download className="w-4 h-4 text-purple-500" />;
      case 'viewed':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading verification workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Verification</h2>
          <p className="text-gray-600">Review and approve patient documents and forms</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700">
          {pendingDocuments.length} Pending Review
        </Badge>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Documents</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Shield className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">All documents verified!</h3>
                <p className="text-muted-foreground text-center">
                  No documents are currently pending verification.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingDocuments.map((doc) => (
                <Card key={`${doc.type}-${doc.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                          {getStatusBadge(doc.verification_status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {doc.patient_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(doc.submitted_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {doc.type === 'form_response' ? 'Form' : 'Document'}
                          </Badge>
                        </div>
                        {doc.requires_dentist_signature && (
                          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-md">
                            <Signature className="w-4 h-4" />
                            Requires Dentist Counter-Signature
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="space-y-3">
            {auditTrail.map((entry) => (
              <Card key={entry.id} className="p-4">
                <div className="flex items-center gap-3">
                  {getActionIcon(entry.action_type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{entry.action_type}</span>
                      <span className="text-sm text-gray-500">by {entry.performed_by}</span>
                      <span className="text-sm text-gray-400">
                        {format(new Date(entry.performed_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{entry.action_description}</p>
                    {entry.document_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        Document: {entry.document_name}
                        {entry.patient_name && ` • Patient: ${entry.patient_name}`}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Review Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Review Document: {selectedDocument?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Patient:</span> {selectedDocument.patient_name}
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span> {format(new Date(selectedDocument.submitted_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedDocument.type === 'form_response' ? 'Form Response' : 'Patient Document'}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {getStatusBadge(selectedDocument.verification_status)}
                  </div>
                </div>
              </div>

              {selectedDocument.signature_data && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Signature className="w-4 h-4" />
                    Patient Signature
                  </h4>
                  <div className="bg-white border rounded p-2">
                    <img 
                      src={selectedDocument.signature_data} 
                      alt="Patient Signature" 
                      className="max-h-24 mx-auto"
                    />
                  </div>
                </div>
              )}

              {selectedDocument.requires_dentist_signature && (
                <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-orange-800">
                    <Signature className="w-4 h-4" />
                    Dentist Counter-Signature Required
                  </h4>
                  <p className="text-sm text-orange-700 mb-4">
                    This document requires a dentist's counter-signature for approval.
                  </p>
                  <DigitalSignature
                    onSignatureChange={setDentistSignature}
                    required={true}
                    width={400}
                    height={120}
                  />
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Rejection Reason (if rejecting)
                </label>
                <Textarea
                  placeholder="Provide detailed feedback for the patient..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDocument(null)}
                  disabled={!!processingAction}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => rejectDocument(selectedDocument)}
                  disabled={!!processingAction || !rejectionReason.trim()}
                  className="min-w-24"
                >
                  {processingAction === 'reject' ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Rejecting...
                    </div>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => approveDocument(selectedDocument)}
                  disabled={
                    !!processingAction || 
                    (selectedDocument.requires_dentist_signature && !dentistSignature)
                  }
                  className="min-w-24"
                >
                  {processingAction === 'approve' ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Approving...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}