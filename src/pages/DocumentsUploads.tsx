import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { DocumentViewer } from '@/components/DocumentViewer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Download, 
  Eye, 
  Check,
  X,
  Clock,
  Calendar,
  User,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUpload {
  id: string;
  patient_id: string;
  document_type: string;
  document_category?: string;
  file_name: string;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  verification_status: string;
  is_visible_to_patient: boolean;
  created_at: string;
  patients?: { full_name: string };
}

const DOCUMENT_TYPES = [
  'id_card',
  'insurance_card',
  'medical_records',
  'x_ray',
  'panoramic_xray',
  'prescription',
  'lab_results',
  'consent_form',
  'treatment_plan',
  'other'
];

const DOCUMENT_CATEGORIES = [
  'identification',
  'insurance',
  'medical',
  'imaging',
  'legal',
  'treatment'
];

export default function DocumentsUploads() {
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchDocuments();
  }, [profile]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('patient_documents')
        .select(`
          *,
          patients(full_name)
        `)
        .order('created_at', { ascending: false });

      // If user is a patient, only show their documents
      if (profile?.role === 'patient') {
        query = query.eq('patient_id', profile.id);
      } else {
        // For staff, show all documents in their clinic
        query = query.eq('clinic_id', profile?.clinic_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string, category?: string) => {
    if (!profile?.id) {
      toast.error('User profile not found');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(fileName);

      // Save document record
      const { error: dbError } = await supabase
        .from('patient_documents')
        .insert({
          patient_id: profile.id,
          clinic_id: profile.clinic_id,
          document_type: documentType,
          document_category: category,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user?.id,
          verification_status: 'pending_verification'
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  };

  const approveDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('patient_documents')
        .update({
          verification_status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
          is_visible_to_patient: true
        })
        .eq('id', documentId);

      if (error) throw error;

      toast.success('Document approved');
      fetchDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
    }
  };

  const rejectDocument = async (documentId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('patient_documents')
        .update({
          verification_status: 'rejected',
          rejection_reason: reason,
          verified_at: new Date().toISOString(),
          verified_by: user?.id
        })
        .eq('id', documentId);

      if (error) throw error;

      toast.success('Document rejected');
      fetchDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType?.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.document_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || doc.verification_status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold">Documents & Uploads</h1>
          <p className="text-muted-foreground">
            Upload and manage patient documents, x-rays, and medical records
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              {DOCUMENT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending_verification">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">All Documents ({filteredDocuments.length})</TabsTrigger>
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          {profile?.role !== 'patient' && (
            <TabsTrigger value="pending">
              Pending Review ({documents.filter(d => d.verification_status === 'pending_verification').length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="documents">
          <div className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No documents found</h3>
                <p className="text-muted-foreground">Upload your first document to get started</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.mime_type)}
                          <span className="font-medium">{doc.file_name}</span>
                          {getStatusBadge(doc.verification_status)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Type: {doc.document_type.replace('_', ' ')}</span>
                            <span>Size: {formatFileSize(doc.file_size)}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {doc.patients?.full_name && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              {doc.patients.full_name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        {profile?.role !== 'patient' && doc.verification_status === 'pending_verification' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => approveDocument(doc.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => rejectDocument(doc.id, 'Document requires revision')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
              <CardDescription>
                Upload patient documents, x-rays, insurance cards, and other medical records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DOCUMENT_TYPES.map((type) => (
                  <Card key={type} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {type.replace('_', ' ').toUpperCase()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FileUpload
                        onUploadComplete={(fileUrl, fileName) => {
                          toast.success(`${type.replace('_', ' ')} uploaded successfully`);
                          fetchDocuments();
                        }}
                        acceptedTypes={[type.includes('xray') || type.includes('x_ray') ? 
                          'image/*,.dcm' : 'image/*,application/pdf,.doc,.docx']}
                        maxSize={10}
                        className="w-full"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {profile?.role !== 'patient' && (
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verification</CardTitle>
                <CardDescription>
                  Documents waiting for staff review and approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.filter(d => d.verification_status === 'pending_verification').map((doc) => (
                    <Card key={doc.id} className="border-yellow-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getFileIcon(doc.mime_type)}
                              <span className="font-medium">{doc.file_name}</span>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Needs Review
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {doc.patients?.full_name}
                              </div>
                              <div>Type: {doc.document_type.replace('_', ' ')}</div>
                              <div>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => approveDocument(doc.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => rejectDocument(doc.id, 'Document requires revision')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {documents.filter(d => d.verification_status === 'pending_verification').length === 0 && (
                    <div className="text-center py-12">
                      <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">All caught up!</h3>
                      <p className="text-muted-foreground">No documents pending review</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}