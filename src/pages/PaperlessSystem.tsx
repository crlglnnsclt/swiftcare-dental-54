import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Upload, 
  Signature, 
  Shield, 
  Calendar,
  User,
  Plus,
  Eye,
  Edit,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Smartphone,
  Globe,
  Heart,
  CreditCard,
  Receipt
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PatientFormViewer from '@/components/PatientFormViewer';

interface DigitalForm {
  id: string;
  name: string;
  description: string;
  form_type: string;
  category: string;
  form_fields: any;
  requires_signature: boolean;
  is_active: boolean;
  created_at: string;
  template_data: any;
}

interface FormResponse {
  id: string;
  form_id: string;
  patient_id: string;
  responses: any;
  signature_data?: string;
  signed_at?: string;
  status: string;
  created_at: string;
  digital_forms?: { name: string; form_type: string };
  patients?: { full_name: string };
}

interface PatientDocument {
  id: string;
  patient_id: string;
  document_type: string;
  document_category?: string;
  file_name: string;
  file_url?: string;
  is_signed: boolean;
  created_at: string;
  patients?: { full_name: string };
}

export default function PaperlessSystem() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('forms');
  const [forms, setForms] = useState<DigitalForm[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch digital forms
      const { data: formsData } = await supabase
        .from('digital_forms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Fetch form responses
      const { data: responsesData } = await supabase
        .from('form_responses')
        .select(`
          *,
          digital_forms(name, form_type),
          patients(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch patient documents
      const { data: documentsData } = await supabase
        .from('patient_documents')
        .select(`
          *,
          patients(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      setForms((formsData || []).map(form => ({
        ...form,
        form_fields: Array.isArray(form.form_fields) ? form.form_fields : JSON.parse(form.form_fields as string || '[]'),
        template_data: typeof form.template_data === 'object' ? form.template_data : JSON.parse(form.template_data as string || '{}')
      })));
      setResponses((responsesData || []).map(response => ({
        ...response,
        responses: typeof response.responses === 'object' ? response.responses : JSON.parse(response.responses as string || '{}')
      })));
      setDocuments(documentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load paperless system data');
    } finally {
      setLoading(false);
    }
  };

  const getFormTypeIcon = (type: string) => {
    switch (type) {
      case 'medical_history':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'consent':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'insurance':
        return <CreditCard className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Signed</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" />Submitted</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ph_template':
        return <Globe className="w-4 h-4 text-blue-500" />;
      case 'regulatory':
        return <Shield className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-4">
            <Smartphone className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              SwiftCare Paperless System
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Complete digital forms, e-signatures, and document management for Philippine healthcare
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card hover-scale">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{forms.length}</div>
              <div className="text-sm text-gray-600">Digital Forms</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover-scale">
            <CardContent className="p-4 text-center">
              <Signature className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {responses.filter(r => r.status === 'signed').length}
              </div>
              <div className="text-sm text-gray-600">Signed Forms</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover-scale">
            <CardContent className="p-4 text-center">
              <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
              <div className="text-sm text-gray-600">Documents</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover-scale">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {forms.filter(f => f.category === 'regulatory').length}
              </div>
              <div className="text-sm text-gray-600">Compliance</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search forms, patients, or documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-gray-200"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-11 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ph_template">Philippine Templates</SelectItem>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                  <SelectItem value="custom">Custom Forms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <TabsTrigger value="forms" className="flex items-center gap-2 rounded-lg">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Forms</span>
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2 rounded-lg">
              <Signature className="w-4 h-4" />
              <span className="hidden sm:inline">Responses</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2 rounded-lg">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-lg">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Digital Forms Tab */}
          <TabsContent value="forms" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Digital Forms Library</h2>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg rounded-xl px-6">
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <Card key={form.id} className="glass-card hover-scale group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getFormTypeIcon(form.form_type)}
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {form.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {getCategoryIcon(form.category)}
                            <span className="text-sm text-gray-500 capitalize">{form.category.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      {form.requires_signature && (
                        <Badge variant="outline" className="text-xs">
                          <Signature className="w-3 h-3 mr-1" />
                          E-Sign
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{form.description}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        onClick={() => {
                          setSelectedFormId(form.id);
                          setSelectedPatientId(profile?.id || null);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Use Form
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Form Responses Tab */}
          <TabsContent value="responses" className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Form Responses & Signatures</h2>
            
            <div className="space-y-4">
              {filteredResponses.map((response) => (
                <Card key={response.id} className="glass-card hover-scale">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-5 h-5 text-blue-500" />
                          <h3 className="font-semibold text-gray-900">{response.patients?.full_name}</h3>
                          {getStatusBadge(response.status)}
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
                        <Button variant="outline" size="sm" className="rounded-lg">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-lg">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    {response.signature_data && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Digitally Signed</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Patient Documents</h2>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg rounded-xl px-6">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="glass-card hover-scale">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{document.file_name}</h3>
                          <p className="text-sm text-gray-600">{document.patients?.full_name}</p>
                        </div>
                      </div>
                      {document.is_signed && (
                        <Badge className="bg-green-100 text-green-700">
                          <Signature className="w-3 h-3 mr-1" />
                          Signed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="capitalize">{document.document_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="capitalize">{document.document_category?.replace('_', ' ') || 'General'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Uploaded:</span>
                        <span>{format(new Date(document.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Paperless System Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Monthly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                  <p className="text-gray-600">Forms digitized this month</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Compliance Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                  <p className="text-gray-600">RA 10173 compliance</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Avg. Processing Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">3.2m</div>
                  <p className="text-gray-600">Form completion time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Patient Form Viewer Modal */}
        {selectedFormId && (
          <PatientFormViewer
            formId={selectedFormId}
            patientId={selectedPatientId}
            onClose={() => {
              setSelectedFormId(null);
              setSelectedPatientId(null);
              fetchData(); // Refresh data after form submission
            }}
          />
        )}
      </div>
    </div>
  );
}