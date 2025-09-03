import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  FileImage,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { format } from 'date-fns';

interface Document {
  id: string;
  document_type: string;
  document_category: string;
  file_name: string;
  file_url: string | null;
  file_storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  is_signed: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
  patients: {
    full_name: string;
  } | null;
}

interface DocumentViewerProps {
  patientId?: string;
  showUpload?: boolean;
  className?: string;
}

export function DocumentViewer({ patientId, showUpload = true, className = "" }: DocumentViewerProps) {
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, [patientId]);

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

      // If patientId is provided, filter by patient
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while loading documents');
    } finally {
      setLoading(false);
    }
  };

  const generateFileUrl = (doc: Document): string | null => {
    if (doc.file_url) return doc.file_url;
    if (doc.file_storage_path) {
      return `https://ojytxmiuitrjtrocfgei.supabase.co/storage/v1/object/public/patient-documents/${doc.file_storage_path}`;
    }
    return null;
  };

  const downloadDocument = async (doc: Document) => {
    const fileUrl = generateFileUrl(doc);
    if (!fileUrl) {
      toast.error('File URL not available');
      return;
    }

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const viewDocument = (doc: Document) => {
    const fileUrl = generateFileUrl(doc);
    if (!fileUrl) {
      toast.error('File URL not available');
      return;
    }
    window.open(fileUrl, '_blank');
  };

  const deleteDocument = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.file_name}"?`)) {
      return;
    }

    try {
      // Delete from storage if path exists
      if (doc.file_storage_path) {
        const { error: storageError } = await supabase.storage
          .from('patient-documents')
          .remove([doc.file_storage_path]);
        
        if (storageError) {
          console.error('Storage deletion error:', storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('patient_documents')
        .delete()
        .eq('id', doc.id);

      if (error) {
        throw error;
      }

      toast.success('Document deleted successfully');
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const getDocumentIcon = (doc: Document) => {
    if (doc.mime_type?.startsWith('image/')) {
      return <FileImage className="w-5 h-5 text-blue-500" />;
    }
    if (doc.is_signed) {
      return <FileCheck className="w-5 h-5 text-green-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'medical_history', label: 'Medical History' },
    { value: 'consent', label: 'Consent Forms' },
    { value: 'insurance_card', label: 'Insurance' },
    { value: 'diagnostic_image', label: 'X-rays & Images' },
    { value: 'lab_report', label: 'Lab Reports' },
    { value: 'other', label: 'Other' }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || doc.document_category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            {categories.map((category) => (
              <TabsTrigger key={category.value} value={category.value} className="text-xs">
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Upload documents to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getDocumentIcon(doc)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{doc.file_name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {doc.document_type}
                        </Badge>
                        {doc.is_signed && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Signed
                          </Badge>
                        )}
                        {doc.patients && (
                          <Badge variant="outline" className="text-xs">
                            {doc.patients.full_name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                        </span>
                        <span>{formatFileSize(doc.file_size)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewDocument(doc)}
                      disabled={!generateFileUrl(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadDocument(doc)}
                      disabled={!generateFileUrl(doc)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {(profile?.role === 'clinic_admin' || profile?.role === 'super_admin') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(doc)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {!generateFileUrl(doc) && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-yellow-50 rounded-md">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">File URL not available</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}