import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DigitalSignature } from '@/components/DigitalSignature';
import { DocumentViewer } from '@/components/DocumentViewer';
import { FileUpload } from '@/components/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  FileText, 
  PenTool, 
  Upload, 
  Download, 
  Check, 
  X, 
  Clock, 
  User,
  Calendar,
  Signature,
  Eye,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface DentistSignature {
  id: string;
  dentist_id: string;
  patient_id: string;
  signature_data: string;
  signature_type: string;
  signed_at: string;
  metadata: any;
  patients?: { full_name: string };
}

interface TreatmentRecord {
  id: string;
  patient_id: string;
  tooth_number?: number;
  treatment_type: string;
  treatment_notes?: string;
  procedure_date: string;
  status: string;
  cost?: number;
  patients?: { full_name: string };
}

export default function DentistStaffSignatures() {
  const { user, profile } = useAuth();
  const [signatures, setSignatures] = useState<DentistSignature[]>([]);
  const [treatmentRecords, setTreatmentRecords] = useState<TreatmentRecord[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [signatureType, setSignatureType] = useState('treatment_approval');
  const [signatureNotes, setSignatureNotes] = useState('');
  const [currentSignature, setCurrentSignature] = useState('');

  useEffect(() => {
    if (profile?.role && ['dentist', 'clinic_admin', 'staff'].includes(profile.role)) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch dentist signatures
      const { data: signaturesData } = await supabase
        .from('dentist_signatures')
        .select(`
          *,
          patients!dentist_signatures_patient_id_fkey(full_name)
        `)
        .eq('clinic_id', profile?.clinic_id)
        .order('signed_at', { ascending: false });

      // For now, skip treatment records since the table structure doesn't match
      // This will be populated when the correct table structure is available
      setTreatmentRecords([]);

      // Fetch patients for this clinic
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, full_name, email')
        .eq('clinic_id', profile?.clinic_id)
        .order('full_name');

      // Transform signatures data to handle the patients relation
      const transformedSignatures = (signaturesData || []).map(sig => ({
        ...sig,
        patients: Array.isArray(sig.patients) && sig.patients.length > 0 ? sig.patients[0] : undefined
      }));

      setSignatures(transformedSignatures);
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load signatures and records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSignature = async () => {
    if (!currentSignature || !selectedPatient || !signatureType) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('dentist_signatures')
        .insert({
          dentist_id: user?.id,
          clinic_id: profile?.clinic_id,
          patient_id: selectedPatient,
          signature_data: currentSignature,
          signature_type: signatureType,
          metadata: {
            notes: signatureNotes,
            signed_by: profile?.full_name
          }
        });

      if (error) throw error;

      toast.success('Signature created successfully');
      setShowSignDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating signature:', error);
      toast.error('Failed to create signature');
    }
  };

  const resetForm = () => {
    setSelectedPatient('');
    setSignatureType('treatment_approval');
    setSignatureNotes('');
    setCurrentSignature('');
  };

  const getSignatureTypeLabel = (type: string) => {
    switch (type) {
      case 'treatment_approval': return 'Treatment Approval';
      case 'procedure_completion': return 'Procedure Completion';
      case 'medical_clearance': return 'Medical Clearance';
      case 'consultation_notes': return 'Consultation Notes';
      case 'treatment_plan': return 'Treatment Plan';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
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
          <h1 className="text-3xl font-bold">Dentist & Staff Signatures</h1>
          <p className="text-muted-foreground">
            Digital signatures for treatment approvals and medical documents
          </p>
        </div>
        
        <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
          <DialogTrigger asChild>
            <Button>
              <PenTool className="w-4 h-4 mr-2" />
              Create Signature
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Digital Signature</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Patient</label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Signature Type</label>
                <select
                  value={signatureType}
                  onChange={(e) => setSignatureType(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="treatment_approval">Treatment Approval</option>
                  <option value="procedure_completion">Procedure Completion</option>
                  <option value="medical_clearance">Medical Clearance</option>
                  <option value="consultation_notes">Consultation Notes</option>
                  <option value="treatment_plan">Treatment Plan</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  value={signatureNotes}
                  onChange={(e) => setSignatureNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </div>

              <DigitalSignature
                onSignatureChange={setCurrentSignature}
                required={true}
                width={500}
                height={200}
              />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSignDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateSignature}
                  disabled={!currentSignature || !selectedPatient}
                >
                  Create Signature
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="signatures" className="space-y-6">
        <TabsList>
          <TabsTrigger value="signatures">Digital Signatures</TabsTrigger>
          <TabsTrigger value="treatments">Treatment Records</TabsTrigger>
        </TabsList>

        <TabsContent value="signatures">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signature className="w-5 h-5" />
                Digital Signatures
              </CardTitle>
              <CardDescription>
                All signatures created by dentists and staff for patient treatments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signatures.length === 0 ? (
                  <div className="text-center py-12">
                    <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No signatures yet</h3>
                    <p className="text-muted-foreground">Create your first digital signature</p>
                  </div>
                ) : (
                  signatures.map((signature) => (
                    <Card key={signature.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">
                                {signature.patients?.full_name}
                              </span>
                              <Badge variant="outline">
                                {getSignatureTypeLabel(signature.signature_type)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Signed: {new Date(signature.signed_at).toLocaleDateString()}
                            </div>
                            {signature.metadata?.notes && (
                              <p className="text-sm text-muted-foreground">
                                {signature.metadata.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Treatment Records
              </CardTitle>
              <CardDescription>
                Patient treatment records and procedure notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {treatmentRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No treatment records</h3>
                    <p className="text-muted-foreground">Treatment records will appear here</p>
                  </div>
                ) : (
                  treatmentRecords.map((record) => (
                    <Card key={record.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-green-500" />
                              <span className="font-medium">
                                {record.patients?.full_name}
                              </span>
                              <Badge className={getStatusColor(record.status)}>
                                {record.status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <strong>Treatment:</strong> {record.treatment_type}
                                {record.tooth_number && (
                                  <span> (Tooth #{record.tooth_number})</span>
                                )}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(record.procedure_date).toLocaleDateString()}
                                {record.cost && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>${record.cost}</span>
                                  </>
                                )}
                              </div>
                              {record.treatment_notes && (
                                <p className="text-sm text-muted-foreground">
                                  {record.treatment_notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}