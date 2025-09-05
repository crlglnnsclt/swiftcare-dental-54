import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FileText, 
  Upload, 
  Signature, 
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Save,
  X,
  Loader2,
  Shield,
  FileCheck,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { DigitalSignature } from '@/components/DigitalSignature';

interface DigitalForm {
  id: string;
  name: string;
  description: string;
  form_type: string;
  category: string;
  form_fields: any[];
  requires_signature: boolean;
  is_active: boolean;
  created_at: string;
}

interface FormResponse {
  id: string;
  form_id: string;
  patient_id: string;
  responses: any;
  signature_data?: string;
  signed_at?: string;
  status: 'draft' | 'submitted' | 'signed' | 'approved';
  verification_status: 'pending_verification' | 'approved' | 'rejected' | 'needs_correction';
  created_at: string;
  updated_at: string;
  digital_forms?: { name: string; form_type: string };
  patients?: { full_name: string };
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
}

interface PatientDocument {
  id: string;
  patient_id: string;
  document_type: string;
  document_category: string;
  file_name: string;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  is_signed: boolean;
  verification_status: string;
  created_at: string;
  updated_at: string;
  patients?: { full_name: string };
  metadata?: any;
}

export function RealTimePaperlessSystem() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('forms');
  const [forms, setForms] = useState<DigitalForm[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedForm, setSelectedForm] = useState<DigitalForm | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [signatureData, setSignatureData] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time subscriptions
  useEffect(() => {
    const formsChannel = supabase
      .channel('paperless-forms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'form_responses'
        },
        (payload) => {
          console.log('Form response change:', payload);
          fetchFormResponses();
          
          // Show real-time notification
          if (payload.eventType === 'INSERT') {
            toast.success('New form submission received');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Form response updated');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_documents'
        },
        (payload) => {
          console.log('Document change:', payload);
          fetchDocuments();
          
          if (payload.eventType === 'INSERT') {
            toast.success('New document uploaded');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(formsChannel);
    };
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDigitalForms(),
      fetchFormResponses(),
      fetchDocuments()
    ]);
    setLoading(false);
  };

  const fetchDigitalForms = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_forms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setForms((data || []).map(form => ({
        ...form,
        form_fields: Array.isArray(form.form_fields) ? form.form_fields : JSON.parse(form.form_fields as string || '[]')
      })));
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load digital forms');
    }
  };

  const fetchFormResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select(`
          *,
          digital_forms(name, form_type),
          patients(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResponses((data || []).map(response => ({
        ...response,
        status: (response.status as 'draft' | 'submitted' | 'signed' | 'approved') || 'draft',
        verification_status: (response.verification_status as 'pending_verification' | 'approved' | 'rejected' | 'needs_correction') || 'pending_verification',
        responses: typeof response.responses === 'object' ? response.responses : JSON.parse(response.responses as string || '{}')
      })) as FormResponse[]);
    } catch (error) {
      console.error('Error fetching form responses:', error);
      toast.error('Failed to load form responses');
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_documents')
        .select(`
          *,
          patients(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const handleFormSubmit = async () => {
    if (!selectedForm || !profile) return;

    setIsSubmitting(true);
    
    try {
      // Get patient ID
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (patientError) throw patientError;

      // Submit form response
      const { data: responseData, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: selectedForm.id,
          patient_id: patientData.id,
          responses: formData,
          signature_data: signatureData,
          status: signatureData ? 'signed' : 'submitted',
          signed_at: signatureData ? new Date().toISOString() : null,
          verification_status: 'pending_verification'
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Create audit log entry
      await supabase.from('document_audit_trail').insert({
        document_type: 'form_response',
        action_type: 'CREATE',
        action_description: `Form "${selectedForm.name}" submitted by patient`,
        performed_by: profile.id,
        patient_id: patientData.id,
        metadata: {
          form_id: selectedForm.id,
          response_id: responseData.id,
          has_signature: !!signatureData
        }
      });

      toast.success('Form submitted successfully!');
      setIsFormDialogOpen(false);
      setFormData({});
      setSignatureData('');
      fetchFormResponses();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    if (!profile) return;

    try {
      setUploadProgress(0);
      
      // Get patient ID
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (patientError) throw patientError;

      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(`${patientData.id}/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { error: docError } = await supabase
        .from('patient_documents')
        .insert({
          patient_id: patientData.id,
          clinic_id: '00000000-0000-0000-0000-000000000000', // Default clinic ID
          document_type: documentType,
          document_category: 'uploaded',
          file_name: file.name,
          file_storage_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          verification_status: 'pending_verification',
          metadata: {
            original_name: file.name,
            upload_timestamp: new Date().toISOString()
          }
        });

      if (docError) throw docError;

      // Create audit log
      await supabase.from('document_audit_trail').insert({
        document_type: documentType,
        action_type: 'UPLOAD',
        action_description: `Document "${file.name}" uploaded by patient`,
        performed_by: profile.id,
        patient_id: patientData.id,
        metadata: {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type
        }
      });

      toast.success('Document uploaded successfully!');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleVerifyDocument = async (documentId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const { error } = await supabase
        .from('patient_documents')
        .update({
          verification_status: status,
          verified_by: profile?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: reason || null
        })
        .eq('id', documentId);

      if (error) throw error;

      // Create audit log
      await supabase.from('document_audit_trail').insert({
        document_type: 'verification',
        action_type: 'VERIFY',
        action_description: `Document ${status} by staff`,
        performed_by: profile?.id,
        metadata: {
          document_id: documentId,
          verification_status: status,
          rejection_reason: reason
        }
      });

      toast.success(`Document ${status} successfully`);
      fetchDocuments();
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to verify document');
    }
  };

  const renderFormField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
              required={field.required}
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
              required={field.required}
              rows={4}
            />
          </div>
        );
      
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
            <Select value={formData[field.id] || ''} onValueChange={(value) => setFormData({...formData, [field.id]: value})}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={formData[field.id] || false}
              onChange={(e) => setFormData({...formData, [field.id]: e.target.checked})}
              className="rounded border-gray-300"
            />
            <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, verificationType?: string) => {
    if (verificationType) {
      switch (verificationType) {
        case 'pending_verification':
          return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
        case 'approved':
          return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
        case 'rejected':
          return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Rejected</Badge>;
        case 'needs_correction':
          return <Badge className="bg-orange-100 text-orange-700"><Edit className="w-3 h-3 mr-1" />Needs Correction</Badge>;
      }
    }
    
    switch (status) {
      case 'signed':
        return <Badge className="bg-green-100 text-green-700"><Signature className="w-3 h-3 mr-1" />Signed</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-700"><FileCheck className="w-3 h-3 mr-1" />Submitted</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredForms = forms.filter(form => 
    (selectedCategory === 'all' || form.category === selectedCategory) &&
    (searchTerm === '' || form.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredResponses = responses.filter(response =>
    searchTerm === '' || 
    response.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.digital_forms?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc =>
    searchTerm === '' || 
    doc.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Real-Time Paperless System
          </h1>
          <p className="text-gray-600">
            Digital forms, e-signatures, and document management with live updates
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{forms.length}</div>
              <div className="text-sm text-gray-600">Active Forms</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Signature className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {responses.filter(r => r.status === 'signed').length}
              </div>
              <div className="text-sm text-gray-600">Signed Forms</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{documents.length}</div>
              <div className="text-sm text-gray-600">Documents</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {responses.filter(r => r.verification_status === 'pending_verification').length +
                 documents.filter(d => d.verification_status === 'pending_verification').length}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search forms, patients, or documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="medical_history">Medical History</SelectItem>
                  <SelectItem value="consent">Consent Forms</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="custom">Custom Forms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="forms" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Forms ({filteredForms.length})
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <Signature className="w-4 h-4" />
              Responses ({filteredResponses.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Documents ({filteredDocuments.length})
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Verification
            </TabsTrigger>
          </TabsList>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredForms.map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{form.name}</span>
                      {form.requires_signature && (
                        <Badge variant="outline">
                          <Signature className="w-3 h-3 mr-1" />
                          E-Sign
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{form.description}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedForm(form);
                          setIsFormDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Fill Form
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-4">
            {filteredResponses.map((response) => (
              <Card key={response.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">{response.patients?.full_name}</h3>
                        {getStatusBadge(response.status, response.verification_status)}
                      </div>
                      <p className="text-gray-600 mb-2">{response.digital_forms?.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Submitted: {format(new Date(response.created_at), 'MMM dd, yyyy')}</span>
                        {response.signed_at && (
                          <span>Signed: {format(new Date(response.signed_at), 'MMM dd, yyyy HH:mm')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {profile?.role !== 'patient' && response.verification_status === 'pending_verification' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleVerifyDocument(response.id, 'approved')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleVerifyDocument(response.id, 'rejected', 'Needs review')}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Patient Documents</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Document Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="insurance_card">Insurance Card</SelectItem>
                          <SelectItem value="id_document">ID Document</SelectItem>
                          <SelectItem value="medical_record">Medical Record</SelectItem>
                          <SelectItem value="payment_proof">Payment Proof</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>File</Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleDocumentUpload(file, 'other');
                          }
                        }}
                      />
                    </div>
                    {uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{doc.file_name}</h3>
                        <p className="text-xs text-gray-500">{doc.patients?.full_name}</p>
                      </div>
                      {getStatusBadge(doc.verification_status)}
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Type: {doc.document_type}</p>
                      <p>Size: {doc.file_size ? `${Math.round(doc.file_size / 1024)}KB` : 'Unknown'}</p>
                      <p>Uploaded: {format(new Date(doc.created_at), 'MMM dd, yyyy')}</p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-4">
            <div className="text-center py-8">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Document Verification Center</h3>
              <p className="text-gray-600">
                Review and approve submitted forms and documents
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedForm?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {selectedForm?.form_fields?.map(renderFormField)}
              
              {selectedForm?.requires_signature && (
                <div className="space-y-4">
                  <Label>Digital Signature</Label>
                  <DigitalSignature
                    onSignatureChange={setSignatureData}
                    required={selectedForm.requires_signature}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsFormDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Submit Form
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}