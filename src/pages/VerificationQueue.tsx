import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Eye, Check, X, Clock, User, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationItem {
  id: string;
  type: 'document' | 'form_response' | 'patient_data';
  patient_name: string;
  patient_id: string;
  submitted_at: string;
  status: 'pending_verification' | 'approved' | 'rejected';
  document_type?: string;
  form_name?: string;
  rejection_reason?: string;
  urgency: 'low' | 'normal' | 'high';
}

export default function VerificationQueue() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    fetchVerificationQueue();
  }, []);

  const fetchVerificationQueue = async () => {
    try {
      // Fetch documents needing verification
      const { data: documents, error: docError } = await supabase
        .from('patient_documents')
        .select(`
          id,
          document_type,
          created_at,
          verification_status,
          rejection_reason,
          patient_id,
          patients!inner (full_name)
        `)
        .eq('verification_status', 'pending_verification');

      // Fetch form responses needing verification
      const { data: forms, error: formError } = await supabase
        .from('form_responses')
        .select(`
          id,
          created_at,
          verification_status,
          rejection_reason,
          patient_id,
          patients!inner (full_name),
          digital_forms!inner (name)
        `)
        .eq('verification_status', 'pending_verification');

      if (docError) throw docError;
      if (formError) throw formError;

      const verificationItems: VerificationItem[] = [
        ...(documents || []).map(doc => ({
          id: doc.id,
          type: 'document' as const,
          patient_name: doc.patients.full_name,
          patient_id: doc.patient_id,
          submitted_at: doc.created_at,
          status: doc.verification_status as any,
          document_type: doc.document_type,
          rejection_reason: doc.rejection_reason,
          urgency: getUrgencyLevel(doc.document_type)
        })),
        ...(forms || []).map(form => ({
          id: form.id,
          type: 'form_response' as const,
          patient_name: form.patients.full_name,
          patient_id: form.patient_id,
          submitted_at: form.created_at,
          status: form.verification_status as any,
          form_name: form.digital_forms.name,
          rejection_reason: form.rejection_reason,
          urgency: 'normal' as const
        }))
      ];

      setItems(verificationItems.sort((a, b) => {
        // Sort by urgency first, then by submission time
        const urgencyOrder = { high: 3, normal: 2, low: 1 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      }));
    } catch (error) {
      console.error('Error fetching verification queue:', error);
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyLevel = (documentType: string): 'low' | 'normal' | 'high' => {
    if (documentType?.includes('emergency') || documentType?.includes('urgent')) return 'high';
    if (documentType?.includes('consent') || documentType?.includes('medical')) return 'normal';
    return 'low';
  };

  const approveItem = async (item: VerificationItem) => {
    try {
      const table = item.type === 'document' ? 'patient_documents' : 'form_responses';
      const { error } = await supabase
        .from(table)
        .update({
          verification_status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: profile?.id,
          is_visible_to_patient: true
        })
        .eq('id', item.id);

      if (error) throw error;

      toast.success(`${item.type === 'document' ? 'Document' : 'Form'} approved successfully`);
      fetchVerificationQueue();
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Failed to approve item');
    }
  };

  const rejectItem = async () => {
    if (!selectedItem || !rejectionReason.trim()) return;

    try {
      const table = selectedItem.type === 'document' ? 'patient_documents' : 'form_responses';
      const { error } = await supabase
        .from(table)
        .update({
          verification_status: 'rejected',
          rejection_reason: rejectionReason,
          verified_at: new Date().toISOString(),
          verified_by: profile?.id
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success(`${selectedItem.type === 'document' ? 'Document' : 'Form'} rejected`);
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedItem(null);
      fetchVerificationQueue();
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Failed to reject item');
    }
  };

  const filteredItems = items.filter(item =>
    item.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.document_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.form_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Verification Queue</h1>
          <p className="text-muted-foreground">Review and approve patient submissions</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {filteredItems.length} pending
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
          <CardDescription>
            Documents and forms submitted by patients requiring staff review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by patient name, document type, or form..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-6"
          />

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({filteredItems.length})</TabsTrigger>
              <TabsTrigger value="documents">
                Documents ({filteredItems.filter(i => i.type === 'document').length})
              </TabsTrigger>
              <TabsTrigger value="forms">
                Forms ({filteredItems.filter(i => i.type === 'form_response').length})
              </TabsTrigger>
              <TabsTrigger value="urgent">
                Urgent ({filteredItems.filter(i => i.urgency === 'high').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">All caught up!</h3>
                  <p className="text-muted-foreground">No items pending verification</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {item.type === 'document' ? (
                              <FileText className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Calendar className="h-4 w-4 text-purple-500" />
                            )}
                            <span className="font-medium">
                              {item.document_type || item.form_name}
                            </span>
                            <Badge className={getUrgencyColor(item.urgency)}>
                              {item.urgency}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            {item.patient_name}
                            <Clock className="h-3 w-3 ml-2" />
                            {new Date(item.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => approveItem(item)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowRejectDialog(true);
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="documents">
              {/* Filter for documents only */}
            </TabsContent>

            <TabsContent value="forms">
              {/* Filter for forms only */}
            </TabsContent>

            <TabsContent value="urgent">
              {/* Filter for urgent items only */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this submission. The patient will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={rejectItem}
              disabled={!rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}