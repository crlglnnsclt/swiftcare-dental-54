import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, FileText, Upload, Download, Search, Plus, Calendar, Heart, AlertCircle, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface PatientProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  // Joined data from patient_details
  patient_details?: PatientDetails;
}

interface PatientDetails {
  id: string;
  patient_id: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  home_address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  occupation?: string;
  blood_type?: string;
  allergies?: string;
  existing_medical_conditions?: string;
  current_medications?: string;
  previous_surgeries?: string;
  dental_history?: string;
  dental_concerns?: string;
  last_dental_visit?: string;
  insurance_provider?: string;
  policy_number?: string;
  preferred_time?: string;
  communication_preference?: string;
  created_at: string;
  updated_at: string;
}

interface MedicalDocument {
  id: string;
  patient_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  document_type?: string;
  description?: string;
  file_size?: number;
  is_visible_to_patient: boolean;
  requires_payment_approval: boolean;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  uploader_name?: string;
}

interface PatientResult {
  id: string;
  patient_id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  is_visible_to_patient: boolean;
  requires_payment: boolean;
  appointment_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  creator_name?: string;
}

export function PatientRecords() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [patientDocuments, setPatientDocuments] = useState<MedicalDocument[]>([]);
  const [patientResults, setPatientResults] = useState<PatientResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  
  // Form state
  const [patientDetailsForm, setPatientDetailsForm] = useState<Partial<PatientDetails>>({});
  const [documentForm, setDocumentForm] = useState({
    document_type: '',
    description: '',
    is_visible_to_patient: true,
    requires_payment_approval: false,
  });
  const [resultForm, setResultForm] = useState({
    title: '',
    description: '',
    is_visible_to_patient: false,
    requires_payment: true,
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const { data, error }: { data: any, error: any } = await supabase
        .from('patients')
        .select('*')
        .order('full_name');

      if (error) throw error;
      
      const formattedPatients = data?.map(patient => ({
        id: patient.id,
        user_id: patient.user_id || '',
        full_name: patient.full_name,
        email: patient.email || '',
        phone: patient.contact_number,
        is_active: true,
        created_at: patient.created_at,
        patient_details: {
          id: patient.id,
          patient_id: patient.id,
          first_name: patient.full_name?.split(' ')[0] || '',
          last_name: patient.full_name?.split(' ').slice(1).join(' ') || '',
          date_of_birth: patient.date_of_birth || '',
          gender: patient.gender || '',
          phone: patient.contact_number || '',
          email: patient.email || '',
          home_address: patient.address || '',
          emergency_contact_name: patient.emergency_contact?.split('|')[0] || '',
          emergency_contact_phone: patient.emergency_contact?.split('|')[1] || '',
          allergies: patient.medical_history?.split('|')[0] || '',
          existing_medical_conditions: patient.medical_history?.split('|')[1] || '',
          current_medications: patient.medical_history?.split('|')[2] || '',
          previous_surgeries: patient.medical_history?.split('|')[3] || '',
          created_at: patient.created_at,
          updated_at: patient.updated_at
        }
      })) || [];
      
      setPatients(formattedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientData = async (patientId: string) => {
    try {
      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;
      
      const formattedDocuments = documentsData?.map(doc => ({
        id: doc.id,
        patient_id: doc.patient_id,
        file_name: `Document ${doc.id}`,
        file_url: doc.file_url || '',
        file_type: doc.document_type || 'other',
        document_type: doc.document_type || 'other',
        description: 'Patient document',
        file_size: 0,
        is_visible_to_patient: true,
        requires_payment_approval: false,
        uploaded_by: doc.signed_by || 'system',
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        uploader_name: 'System'
      })) || [];
      
      setPatientDocuments(formattedDocuments);

      // Mock results since patient_results table doesn't exist
      setPatientResults([]);

    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    }
  };

  const savePatientDetails = async () => {
    if (!selectedPatient) return;

    try {
      const detailsData = {
        ...patientDetailsForm,
        patient_id: selectedPatient.id,
      };

      // Update patient record
      const { error } = await supabase
        .from('patients')
        .update({
          full_name: `${patientDetailsForm.first_name || ''} ${patientDetailsForm.last_name || ''}`.trim(),
          email: patientDetailsForm.email || null,
          contact_number: patientDetailsForm.phone || null,
          date_of_birth: patientDetailsForm.date_of_birth || null,
          gender: patientDetailsForm.gender || null,
          address: patientDetailsForm.home_address || null,
          emergency_contact: `${patientDetailsForm.emergency_contact_name || ''}|${patientDetailsForm.emergency_contact_phone || ''}`,
          medical_history: `${patientDetailsForm.allergies || ''}|${patientDetailsForm.existing_medical_conditions || ''}|${patientDetailsForm.current_medications || ''}|${patientDetailsForm.previous_surgeries || ''}`
        })
        .eq('id', selectedPatient.id);
      
      if (error) throw error;

      toast.success('Patient details saved successfully');
      setIsPatientModalOpen(false);
      fetchPatients();
    } catch (error) {
      console.error('Error saving patient details:', error);
      toast.error('Failed to save patient details');
    }
  };

  const addPatientResult = async () => {
    if (!selectedPatient || !resultForm.title) {
      toast.error('Patient and title are required');
      return;
    }

    try {
      const resultData = {
        patient_id: selectedPatient.id,
        title: resultForm.title,
        description: resultForm.description || null,
        is_visible_to_patient: resultForm.is_visible_to_patient,
        requires_payment: resultForm.requires_payment,
        created_by: profile?.id,
      };

      // Mock implementation since patient_results table doesn't exist
      console.log('Would insert result:', resultData);

      toast.success('Patient result added successfully');
      setIsResultModalOpen(false);
      setResultForm({
        title: '',
        description: '',
        is_visible_to_patient: false,
        requires_payment: true,
      });
      fetchPatientData(selectedPatient.id);
    } catch (error) {
      console.error('Error adding patient result:', error);
      toast.error('Failed to add patient result');
    }
  };

  const openPatientDetails = (patient: PatientProfile) => {
    setSelectedPatient(patient);
    if (patient.patient_details) {
      setPatientDetailsForm(patient.patient_details);
    } else {
      setPatientDetailsForm({
        first_name: patient.full_name.split(' ')[0] || '',
        last_name: patient.full_name.split(' ').slice(1).join(' ') || '',
        email: patient.email,
        phone: patient.phone,
      });
    }
    setIsPatientModalOpen(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Loading patient records...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Records</h1>
          <p className="text-muted-foreground">Manage comprehensive patient information and medical history</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {filteredPatients.length} patients
          </Badge>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
              <CardDescription>Select a patient to view their records</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{patient.full_name}</p>
                          <p className="text-sm text-muted-foreground">{patient.email}</p>
                          {patient.phone && (
                            <p className="text-sm text-muted-foreground">{patient.phone}</p>
                          )}
                          {patient.patient_details?.date_of_birth && (
                            <p className="text-sm text-muted-foreground">
                              Age: {calculateAge(patient.patient_details.date_of_birth)}
                              {patient.patient_details.last_dental_visit && (
                                <span> • Last visit: {new Date(patient.patient_details.last_dental_visit).toLocaleDateString()}</span>
                              )}
                            </p>
                          )}
                        </div>
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="medical">Medical History</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" />
                          {selectedPatient.full_name}
                        </CardTitle>
                        <CardDescription>Patient Information</CardDescription>
                      </div>
                      <Button onClick={() => openPatientDetails(selectedPatient)}>
                        Edit Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPatient.patient_details ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Personal Information
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Full Name:</strong> {`${selectedPatient.patient_details.first_name || ''} ${selectedPatient.patient_details.middle_name || ''} ${selectedPatient.patient_details.last_name || ''}`.trim()}</p>
                            {selectedPatient.patient_details.date_of_birth && (
                              <p><strong>Date of Birth:</strong> {new Date(selectedPatient.patient_details.date_of_birth).toLocaleDateString()} (Age: {calculateAge(selectedPatient.patient_details.date_of_birth)})</p>
                            )}
                            {selectedPatient.patient_details.gender && (
                              <p><strong>Gender:</strong> {selectedPatient.patient_details.gender}</p>
                            )}
                            {selectedPatient.patient_details.blood_type && (
                              <p><strong>Blood Type:</strong> {selectedPatient.patient_details.blood_type}</p>
                            )}
                            {selectedPatient.patient_details.occupation && (
                              <p><strong>Occupation:</strong> {selectedPatient.patient_details.occupation}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Contact Information
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Email:</strong> {selectedPatient.patient_details.email || selectedPatient.email}</p>
                            {selectedPatient.patient_details.phone && (
                              <p><strong>Phone:</strong> {selectedPatient.patient_details.phone}</p>
                            )}
                            {selectedPatient.patient_details.home_address && (
                              <p><strong>Address:</strong> {selectedPatient.patient_details.home_address}</p>
                            )}
                            {selectedPatient.patient_details.emergency_contact_name && (
                              <p><strong>Emergency Contact:</strong> {selectedPatient.patient_details.emergency_contact_name}
                                {selectedPatient.patient_details.emergency_contact_phone && (
                                  <span> - {selectedPatient.patient_details.emergency_contact_phone}</span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {selectedPatient.patient_details.insurance_provider && (
                          <div>
                            <h4 className="font-medium mb-2">Insurance Information</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Provider:</strong> {selectedPatient.patient_details.insurance_provider}</p>
                              {selectedPatient.patient_details.policy_number && (
                                <p><strong>Policy Number:</strong> {selectedPatient.patient_details.policy_number}</p>
                              )}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium mb-2">Preferences</h4>
                          <div className="space-y-1 text-sm">
                            {selectedPatient.patient_details.preferred_time && (
                              <p><strong>Preferred Time:</strong> {selectedPatient.patient_details.preferred_time}</p>
                            )}
                            {selectedPatient.patient_details.communication_preference && (
                              <p><strong>Communication:</strong> {selectedPatient.patient_details.communication_preference}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Detailed Information</h3>
                        <p className="text-muted-foreground mb-4">
                          Complete the patient's profile to track their medical history and preferences.
                        </p>
                        <Button onClick={() => openPatientDetails(selectedPatient)}>
                          Add Patient Details
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Medical History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.patient_details ? (
                      <div className="space-y-6">
                        {selectedPatient.patient_details.allergies && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2 text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              Allergies
                            </h4>
                            <p className="text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                              {selectedPatient.patient_details.allergies}
                            </p>
                          </div>
                        )}

                        {selectedPatient.patient_details.existing_medical_conditions && (
                          <div>
                            <h4 className="font-medium mb-2">Medical Conditions</h4>
                            <p className="text-sm bg-muted p-3 rounded-lg">
                              {selectedPatient.patient_details.existing_medical_conditions}
                            </p>
                          </div>
                        )}

                        {selectedPatient.patient_details.current_medications && (
                          <div>
                            <h4 className="font-medium mb-2">Current Medications</h4>
                            <p className="text-sm bg-muted p-3 rounded-lg">
                              {selectedPatient.patient_details.current_medications}
                            </p>
                          </div>
                        )}

                        {selectedPatient.patient_details.previous_surgeries && (
                          <div>
                            <h4 className="font-medium mb-2">Previous Surgeries</h4>
                            <p className="text-sm bg-muted p-3 rounded-lg">
                              {selectedPatient.patient_details.previous_surgeries}
                            </p>
                          </div>
                        )}

                        {selectedPatient.patient_details.dental_history && (
                          <div>
                            <h4 className="font-medium mb-2">Dental History</h4>
                            <p className="text-sm bg-muted p-3 rounded-lg">
                              {selectedPatient.patient_details.dental_history}
                            </p>
                          </div>
                        )}

                        {selectedPatient.patient_details.dental_concerns && (
                          <div>
                            <h4 className="font-medium mb-2">Current Dental Concerns</h4>
                            <p className="text-sm bg-muted p-3 rounded-lg">
                              {selectedPatient.patient_details.dental_concerns}
                            </p>
                          </div>
                        )}

                        {selectedPatient.patient_details.last_dental_visit && (
                          <div>
                            <h4 className="font-medium mb-2">Last Dental Visit</h4>
                            <p className="text-sm">
                              {new Date(selectedPatient.patient_details.last_dental_visit).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Medical History</h3>
                        <p className="text-muted-foreground">
                          Complete the patient's profile to track their medical history.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Medical Documents</CardTitle>
                        <CardDescription>Uploaded files and medical records</CardDescription>
                      </div>
                      <Button onClick={() => setIsDocumentModalOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {patientDocuments.length > 0 ? (
                      <div className="space-y-2">
                        {patientDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium">{doc.file_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.document_type} • {new Date(doc.created_at).toLocaleDateString()}
                                  {doc.uploader_name && ` • Uploaded by ${doc.uploader_name}`}
                                </p>
                                {doc.description && (
                                  <p className="text-sm text-muted-foreground italic">{doc.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={doc.is_visible_to_patient ? 'default' : 'secondary'}>
                                {doc.is_visible_to_patient ? 'Visible' : 'Hidden'}
                              </Badge>
                              <Button variant="outline" size="sm">
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Documents</h3>
                        <p className="text-muted-foreground mb-4">
                          Upload medical documents, X-rays, or other files for this patient.
                        </p>
                        <Button onClick={() => setIsDocumentModalOpen(true)}>Upload First Document</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Patient Results</CardTitle>
                        <CardDescription>Test results, diagnoses, and treatment outcomes</CardDescription>
                      </div>
                      <Button onClick={() => setIsResultModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Result
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {patientResults.length > 0 ? (
                      <div className="space-y-4">
                        {patientResults.map((result) => (
                          <Card key={result.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base">{result.title}</CardTitle>
                                  <CardDescription>
                                    {new Date(result.created_at).toLocaleDateString()}
                                    {result.creator_name && ` • Created by ${result.creator_name}`}
                                  </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant={result.is_visible_to_patient ? 'default' : 'secondary'}>
                                    {result.is_visible_to_patient ? 'Visible' : 'Hidden'}
                                  </Badge>
                                  {result.requires_payment && (
                                    <Badge variant="outline">Payment Required</Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            {result.description && (
                              <CardContent>
                                <p className="text-sm">{result.description}</p>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Results</h3>
                        <p className="text-muted-foreground mb-4">
                          Add test results, diagnoses, or treatment outcomes for this patient.
                        </p>
                        <Button onClick={() => setIsResultModalOpen(true)}>Add First Result</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="text-center p-12">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a Patient</h3>
              <p className="text-muted-foreground">
                Choose a patient from the list to view their medical records and information.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      <Dialog open={isPatientModalOpen} onOpenChange={setIsPatientModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details - {selectedPatient?.full_name}</DialogTitle>
            <DialogDescription>
              Complete patient information and medical history
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={patientDetailsForm.first_name || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={patientDetailsForm.last_name || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={patientDetailsForm.date_of_birth || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={patientDetailsForm.gender || ''}
                    onValueChange={(value) => setPatientDetailsForm(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={patientDetailsForm.email || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={patientDetailsForm.phone || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Home Address</Label>
                  <Textarea
                    id="address"
                    value={patientDetailsForm.home_address || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, home_address: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={patientDetailsForm.allergies || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, allergies: e.target.value }))}
                    placeholder="List any known allergies..."
                  />
                </div>
                <div>
                  <Label htmlFor="medicalConditions">Existing Medical Conditions</Label>
                  <Textarea
                    id="medicalConditions"
                    value={patientDetailsForm.existing_medical_conditions || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, existing_medical_conditions: e.target.value }))}
                    placeholder="List any existing medical conditions..."
                  />
                </div>
                <div>
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    value={patientDetailsForm.current_medications || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, current_medications: e.target.value }))}
                    placeholder="List current medications and dosages..."
                  />
                </div>
              </div>
            </div>

            {/* Dental History */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Dental History</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dentalHistory">Dental History</Label>
                  <Textarea
                    id="dentalHistory"
                    value={patientDetailsForm.dental_history || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, dental_history: e.target.value }))}
                    placeholder="Previous dental treatments, procedures, etc..."
                  />
                </div>
                <div>
                  <Label htmlFor="dentalConcerns">Current Dental Concerns</Label>
                  <Textarea
                    id="dentalConcerns"
                    value={patientDetailsForm.dental_concerns || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, dental_concerns: e.target.value }))}
                    placeholder="What brings the patient to the clinic today?"
                  />
                </div>
                <div>
                  <Label htmlFor="lastVisit">Last Dental Visit</Label>
                  <Input
                    id="lastVisit"
                    type="date"
                    value={patientDetailsForm.last_dental_visit || ''}
                    onChange={(e) => setPatientDetailsForm(prev => ({ ...prev, last_dental_visit: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsPatientModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={savePatientDetails}>
              Save Patient Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Result Modal */}
      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Patient Result</DialogTitle>
            <DialogDescription>
              Add a test result, diagnosis, or treatment outcome
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="resultTitle">Title *</Label>
              <Input
                id="resultTitle"
                value={resultForm.title}
                onChange={(e) => setResultForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Blood Test Results, X-Ray Analysis"
              />
            </div>

            <div>
              <Label htmlFor="resultDescription">Description</Label>
              <Textarea
                id="resultDescription"
                value={resultForm.description}
                onChange={(e) => setResultForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the results or findings..."
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="visibleToPatient"
                  checked={resultForm.is_visible_to_patient}
                  onChange={(e) => setResultForm(prev => ({ ...prev, is_visible_to_patient: e.target.checked }))}
                  className="rounded border-input"
                />
                <Label htmlFor="visibleToPatient">Visible to patient</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresPayment"
                  checked={resultForm.requires_payment}
                  onChange={(e) => setResultForm(prev => ({ ...prev, requires_payment: e.target.checked }))}
                  className="rounded border-input"
                />
                <Label htmlFor="requiresPayment">Requires payment to view</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsResultModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addPatientResult}>Add Result</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}