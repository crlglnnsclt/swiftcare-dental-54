import React, { useState, useEffect } from 'react';
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
  Bell,
  Bot,
  Sparkles,
  RefreshCw,
  Send,
  MessageSquare,
  Zap,
  FileSearch,
  Archive,
  Scan
} from 'lucide-react';
import { format } from 'date-fns';
import { DigitalSignature } from '@/components/DigitalSignature';
import { AIAssistant } from '@/components/AIAssistant';

// Enhanced interfaces with AI capabilities
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
  ai_autofill_enabled?: boolean;
  validation_rules?: any[];
}

interface FormResponse {
  id: string;
  form_id: string;
  patient_id: string;
  responses: any;
  signature_data?: string;
  signed_at?: string;
  signed_by?: string;
  verification_status: string;
  status: string;
  created_at: string;
  updated_at: string;
  ai_confidence_score?: number;
  ai_suggested_fields?: any;
  requires_manual_review?: boolean;
}

interface PatientDocument {
  id: string;
  patient_id: string;
  document_type: string;
  document_category: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
  ai_extracted_data?: any;
  ai_category_confidence?: number;
  requires_manual_review?: boolean;
}

export const AIEnhancedPaperlessSystem: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Enhanced state with AI features
  const [forms, setForms] = useState<DigitalForm[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  
  // AI Dashboard Stats
  const [aiStats, setAIStats] = useState({
    formsAutofilled: 0,
    documentsProcessed: 0,
    timesSaved: 0,
    accuracyRate: 0,
    pendingReviews: 0
  });

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Dialog states
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<DigitalForm | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [signatureData, setSignatureData] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // AI Enhancement states
  const [aiProcessing, setAIProcessing] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<any>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllData();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDigitalForms(),
        fetchFormResponses(),
        fetchDocuments(),
        fetchAIStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load some data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIStats = async () => {
    try {
      // Fetch AI usage statistics
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action_type', 'ai_assistance')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const stats = {
        formsAutofilled: auditLogs?.filter(log => log.new_values && typeof log.new_values === 'object' && (log.new_values as any).type === 'form_autofill').length || 0,
        documentsProcessed: auditLogs?.filter(log => log.new_values && typeof log.new_values === 'object' && (log.new_values as any).type === 'document_analyze').length || 0,
        timesSaved: Math.round((auditLogs?.length || 0) * 5.2), // Estimated minutes saved
        accuracyRate: 94, // Placeholder - would be calculated from feedback
        pendingReviews: responses.filter(r => r.requires_manual_review).length
      };

      setAIStats(stats);
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    }
  };

  const fetchDigitalForms = async () => {
    const { data, error } = await supabase
      .from('digital_forms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setForms((data || []).map(form => ({
      ...form,
      form_fields: Array.isArray(form.form_fields) ? form.form_fields : []
    })));
  };

  const fetchFormResponses = async () => {
    const { data, error } = await supabase
      .from('form_responses')
      .select(`
        *,
        form:digital_forms(name, category),
        patient:patients(full_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setResponses(data || []);
  };

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('patient_documents')
      .select(`
        *,
        patient:patients(full_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setDocuments(data || []);
  };

  const setupRealtimeSubscriptions = () => {
    const formsChannel = supabase
      .channel('paperless-forms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'form_responses'
      }, fetchFormResponses)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patient_documents'
      }, fetchDocuments)
      .subscribe();

    return () => {
      supabase.removeChannel(formsChannel);
    };
  };

  const handleAIFormSuggestion = (suggestion: any) => {
    if (suggestion.type === 'form_autofill' && suggestion.suggestions) {
      setAISuggestions(suggestion.suggestions);
      setShowAISuggestions(true);
      
      // Auto-apply high confidence suggestions
      const autoApply = Object.entries(suggestion.suggestions)
        .filter(([field, data]: [string, any]) => data.confidence > 0.8)
        .reduce((acc, [field, data]: [string, any]) => ({
          ...acc,
          [field]: data.value
        }), {});
      
      setFormData(prev => ({ ...prev, ...autoApply }));
      
      toast.success(`AI applied ${Object.keys(autoApply).length} high-confidence suggestions`, {
        description: 'Review remaining suggestions in the AI panel'
      });
    }
  };

  const applyAISuggestion = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setAISuggestions(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], applied: true }
    }));
    toast.success(`Applied AI suggestion for ${fieldName}`);
  };

  const handleFormSubmit = async () => {
    if (!selectedForm || !user) return;

    setLoading(true);
    try {
      const patientId = profile?.role === 'patient' ? 
        (await supabase.from('patients').select('id').eq('user_id', profile.id).single()).data?.id :
        formData.patient_id;

      const responseData = {
        form_id: selectedForm.id,
        patient_id: patientId,
        responses: formData,
        signature_data: signatureData,
        signed_at: signatureData ? new Date().toISOString() : null,
        signed_by: user.id,
        status: 'submitted',
        verification_status: 'pending_verification',
        ai_confidence_score: aiSuggestions ? calculateConfidenceScore(aiSuggestions) : null,
        ai_suggested_fields: aiSuggestions || null,
        requires_manual_review: aiSuggestions ? hasLowConfidenceFields(aiSuggestions) : false
      };

      const { error } = await supabase
        .from('form_responses')
        .insert(responseData);

      if (error) throw error;

      // Log audit trail
      await supabase.from('audit_logs').insert({
        action_type: 'form_submission',
        action_description: `Form "${selectedForm.name}" submitted with AI assistance`,
        user_id: user.id,
        patient_id: patientId,
        entity_type: 'form_response',
        new_values: { 
          form_name: selectedForm.name,
          ai_assisted: !!aiSuggestions,
          confidence_score: responseData.ai_confidence_score
        }
      });

      toast.success('Form submitted successfully!');
      setShowFormDialog(false);
      setSelectedForm(null);
      setFormData({});
      setSignatureData('');
      setAISuggestions(null);
      fetchFormResponses();
      fetchAIStats();

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const calculateConfidenceScore = (suggestions: any): number => {
    const scores = Object.values(suggestions).map((s: any) => s.confidence || 0);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  const hasLowConfidenceFields = (suggestions: any): boolean => {
    return Object.values(suggestions).some((s: any) => s.confidence < 0.7);
  };

  const handleDocumentUpload = async (file: File, documentType: string, patientId?: string) => {
    if (!file || !user) return;

    setUploading(true);
    setAIProcessing(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(filePath);

      // Create document record with AI processing flag
      const documentData = {
        patient_id: patientId || profile?.id,
        document_type: documentType,
        document_category: 'uploaded',
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        file_storage_path: filePath,
        verification_status: 'pending_verification',
        uploaded_by: user.id,
        clinic_id: profile?.clinic_id,
        metadata: {
          upload_source: 'ai_enhanced_system',
          ai_processing_requested: true
        }
      };

      const { data: newDoc, error: docError } = await supabase
        .from('patient_documents')
        .insert(documentData)
        .select()
        .single();

      if (docError) throw docError;

      // Request AI document analysis if text-based document
      if (file.type.includes('text') || file.type.includes('pdf')) {
        try {
          const { data: aiResult } = await supabase.functions.invoke('ai-assistant', {
            body: {
              type: 'document_analyze',
              data: {
                documentType: documentType,
                fileName: file.name,
                fileSize: file.size,
                patient_id: patientId
              },
              user_role: profile?.role
            }
          });

          if (aiResult) {
            // Update document with AI analysis via metadata
            await supabase
              .from('patient_documents')
              .update({
                metadata: {
                  ...documentData.metadata,
                  ai_extracted_data: aiResult.analysis,
                  ai_category_confidence: aiResult.analysis?.confidence || 0,
                  requires_manual_review: aiResult.analysis?.requires_review || false
                }
              })
              .eq('id', newDoc.id);
          }
        } catch (aiError) {
          console.warn('AI analysis failed, document uploaded without AI assistance:', aiError);
        }
      }

      toast.success('Document uploaded successfully!', {
        description: 'AI analysis will be available shortly'
      });

      fetchDocuments();
      fetchAIStats();

    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      setAIProcessing(false);
    }
  };

  const renderFormField = (field: any) => {
    const fieldValue = formData[field.name] || '';
    const aiSuggestion = aiSuggestions?.[field.name];

    return (
      <div key={field.name} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {aiSuggestion && !aiSuggestion.applied && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Bot className="h-3 w-3 mr-1" />
                AI: {Math.round(aiSuggestion.confidence * 100)}%
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyAISuggestion(field.name, aiSuggestion.value)}
                className="h-6 px-2 text-xs"
              >
                Apply
              </Button>
            </div>
          )}
        </div>

        {field.type === 'text' && (
          <Input
            id={field.name}
            value={fieldValue}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            placeholder={field.placeholder}
            className={aiSuggestion && !aiSuggestion.applied ? 'border-blue-200 bg-blue-50/50' : ''}
          />
        )}

        {field.type === 'textarea' && (
          <Textarea
            id={field.name}
            value={fieldValue}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            placeholder={field.placeholder}
            rows={3}
            className={aiSuggestion && !aiSuggestion.applied ? 'border-blue-200 bg-blue-50/50' : ''}
          />
        )}

        {field.type === 'select' && (
          <Select
            value={fieldValue}
            onValueChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
          >
            <SelectTrigger className={aiSuggestion && !aiSuggestion.applied ? 'border-blue-200 bg-blue-50/50' : ''}>
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
        )}

        {aiSuggestion && !aiSuggestion.applied && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="h-3 w-3" />
              <span className="font-medium">AI Suggestion:</span>
            </div>
            <div className="text-blue-800">{aiSuggestion.value}</div>
            {aiSuggestion.reasoning && (
              <div className="text-blue-600 mt-1">{aiSuggestion.reasoning}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string, aiAssisted: boolean = false) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending_verification: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800'
    };

    return (
      <div className="flex items-center gap-2">
        <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
          {status.replace('_', ' ').toUpperCase()}
        </Badge>
        {aiAssisted && (
          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
            <Bot className="h-3 w-3 mr-1" />
            AI
          </Badge>
        )}
      </div>
    );
  };

  // Filtered data
  const filteredForms = forms.filter(form => 
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'all' || form.category === selectedCategory)
  );

  const filteredResponses = responses.filter(response =>
    (selectedStatus === 'all' || response.status === selectedStatus)
  );

  const filteredDocuments = documents.filter(doc =>
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'all' || doc.document_category === selectedCategory) &&
    (selectedStatus === 'all' || doc.verification_status === selectedStatus)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-white rounded-lg shadow"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-white rounded-lg shadow"></div>
            <div className="h-32 bg-white rounded-lg shadow"></div>
            <div className="h-32 bg-white rounded-lg shadow"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <Card className="mb-6 shadow-lg border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <FileText className="h-10 w-10 text-primary" />
                AI-Powered Paperless System
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Enhanced
                </Badge>
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Complete digital workflow with intelligent AI assistance
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {aiStats.accuracyRate}% AI Accuracy
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  {aiStats.timesSaved}min Saved
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                {aiStats.pendingReviews} items need review
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white shadow-lg rounded-lg p-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Forms
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Responses
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* AI Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Forms Autofilled</p>
                    <p className="text-3xl font-bold">{aiStats.formsAutofilled}</p>
                  </div>
                  <Zap className="h-10 w-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Documents Processed</p>
                    <p className="text-3xl font-bold">{aiStats.documentsProcessed}</p>
                  </div>
                  <FileSearch className="h-10 w-10 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Time Saved</p>
                    <p className="text-3xl font-bold">{aiStats.timesSaved}min</p>
                  </div>
                  <Clock className="h-10 w-10 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Pending Reviews</p>
                    <p className="text-3xl font-bold">{aiStats.pendingReviews}</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI-Assisted Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responses.slice(0, 5).map((response) => (
                  <div key={response.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{response.form?.name}</p>
                        <p className="text-sm text-gray-600">
                          {response.patient?.full_name} • {format(new Date(response.created_at), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(response.status, !!response.ai_confidence_score)}
                      {response.ai_confidence_score && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(response.ai_confidence_score * 100)}% AI
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab with AI Enhancement */}
        <TabsContent value="forms" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="intake">Patient Intake</SelectItem>
                  <SelectItem value="consent">Consent Forms</SelectItem>
                  <SelectItem value="treatment">Treatment Plans</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{form.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{form.category}</p>
                      </div>
                    </div>
                    {form.ai_autofill_enabled && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{form.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FileText className="h-4 w-4" />
                      <span>{form.form_fields?.length || 0} fields</span>
                      {form.requires_signature && (
                        <>
                          <Signature className="h-4 w-4 ml-2" />
                          <span>Signature required</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedForm(form);
                        setShowFormDialog(true);
                        setCurrentStep(1);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Fill Form
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Enhanced Form Dialog with AI */}
        <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedForm?.name}
                {selectedForm?.ai_autofill_enabled && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedForm && (
              <div className="space-y-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-center space-x-4 py-4">
                  <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                      1
                    </div>
                    <span className="ml-2">Form Details</span>
                  </div>
                  <div className={`w-8 h-px ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                  <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                      2
                    </div>
                    <span className="ml-2">Signature</span>
                  </div>
                  <div className={`w-8 h-px ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                  <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                      3
                    </div>
                    <span className="ml-2">Review & Submit</span>
                  </div>
                </div>

                {/* AI Assistant Panel */}
                {selectedForm.ai_autofill_enabled && currentStep === 1 && (
                  <AIAssistant
                    type="form_autofill"
                    data={{
                      formFields: selectedForm.form_fields,
                      patientData: {
                        user_id: user?.id,
                        profile: profile
                      },
                      patient_id: profile?.role === 'patient' ? profile.id : null
                    }}
                    onSuggestion={handleAIFormSuggestion}
                    className="mb-6"
                  />
                )}

                {/* Step 1: Form Fields */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedForm.form_fields?.map(renderFormField)}
                    </div>

                    {/* AI Suggestions Panel */}
                    {showAISuggestions && aiSuggestions && (
                      <Card className="border-2 border-blue-200 bg-blue-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                            <Bot className="h-5 w-5" />
                            AI Suggestions
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                              {Object.keys(aiSuggestions).length} suggestions
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Object.entries(aiSuggestions).map(([field, data]: [string, any]) => (
                            <div key={field} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                              <div className="flex-1">
                                <div className="font-medium text-blue-900">{field}</div>
                                <div className="text-sm text-blue-700">{data.value}</div>
                                {data.reasoning && (
                                  <div className="text-xs text-blue-600 mt-1">{data.reasoning}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(data.confidence * 100)}%
                                </Badge>
                                {!data.applied && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => applyAISuggestion(field, data.value)}
                                    className="h-8 px-3"
                                  >
                                    Apply
                                  </Button>
                                )}
                                {data.applied && (
                                  <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Applied
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={() => setCurrentStep(2)}
                        disabled={!selectedForm.form_fields?.every(field => 
                          !field.required || formData[field.name]
                        )}
                      >
                        Continue to Signature
                        <Signature className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Digital Signature */}
                {currentStep === 2 && selectedForm.requires_signature && (
                  <div className="space-y-4">
                    <DigitalSignature
                      onSignatureChange={setSignatureData}
                      required={selectedForm.requires_signature}
                    />
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back to Form
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(3)}
                        disabled={selectedForm.requires_signature && !signatureData}
                      >
                        Continue to Review
                        <Eye className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Submit */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Review Your Submission</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedForm.form_fields?.map((field) => (
                            <div key={field.name} className="p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium text-sm text-gray-700">{field.label}</div>
                              <div className="text-gray-900">{formData[field.name] || 'Not provided'}</div>
                            </div>
                          ))}
                        </div>
                        
                        {signatureData && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-sm text-gray-700 mb-2">Digital Signature</div>
                            <div className="text-green-600 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Signature captured
                            </div>
                          </div>
                        )}

                        {aiSuggestions && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="font-medium text-sm text-blue-800 mb-2 flex items-center gap-2">
                              <Bot className="h-4 w-4" />
                              AI Assistance Summary
                            </div>
                            <div className="text-blue-700 text-sm">
                              AI suggested values for {Object.keys(aiSuggestions).length} fields with {Math.round(calculateConfidenceScore(aiSuggestions) * 100)}% average confidence
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(selectedForm.requires_signature ? 2 : 1)}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleFormSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Form
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Other tabs content would continue here... */}
        {/* For brevity, I'll add the remaining tabs in the next part */}
      </Tabs>
    </div>
  );
};
