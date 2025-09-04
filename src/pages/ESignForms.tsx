import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DigitalSignature } from '@/components/DigitalSignature';
import { FileUpload } from '@/components/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Check, 
  X, 
  PenTool,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ESignForm {
  id: string;
  name: string;
  description: string;
  requires_signature: boolean;
  form_fields: any[];
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
  status: string;
  verification_status: string;
  created_at: string;
  digital_forms?: { name: string };
  patients?: { full_name: string };
}

export default function ESignForms() {
  const { user, profile } = useAuth();
  const [forms, setForms] = useState<ESignForm[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<ESignForm | null>(null);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [signature, setSignature] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch active digital forms
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
          digital_forms(name),
          patients(full_name)
        `)
        .order('created_at', { ascending: false });

      const transformedForms = (formsData || []).map(form => ({
        ...form,
        form_fields: Array.isArray(form.form_fields) ? form.form_fields : 
                    typeof form.form_fields === 'string' ? JSON.parse(form.form_fields) : []
      }));
      
      setForms(transformedForms);
      setResponses(responsesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load forms and responses');
    } finally {
      setLoading(false);
    }
  };

  const handleFillForm = (form: ESignForm) => {
    setSelectedForm(form);
    setFormData({});
    setSignature('');
    setShowSignDialog(true);
  };

  const handleSubmitForm = async () => {
    if (!selectedForm || !profile?.id) {
      toast.error('Form or patient information missing');
      return;
    }

    if (selectedForm.requires_signature && !signature) {
      toast.error('Digital signature is required for this form');
      return;
    }

    try {
      const { error } = await supabase
        .from('form_responses')
        .insert({
          form_id: selectedForm.id,
          patient_id: profile.id,
          clinic_id: profile.clinic_id,
          responses: formData,
          signature_data: signature || null,
          signed_at: signature ? new Date().toISOString() : null,
          status: signature ? 'signed' : 'submitted',
          verification_status: 'pending_verification'
        });

      if (error) throw error;

      toast.success('Form submitted successfully');
      setShowSignDialog(false);
      setSelectedForm(null);
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    }
  };

  const getStatusBadge = (response: FormResponse) => {
    if (response.verification_status === 'pending_verification') {
      return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending Review</Badge>;
    }
    if (response.verification_status === 'approved') {
      return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
    }
    if (response.verification_status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
    if (response.status === 'signed') {
      return <Badge className="bg-blue-100 text-blue-800"><PenTool className="w-3 h-3 mr-1" />Signed</Badge>;
    }
    return <Badge variant="outline">{response.status}</Badge>;
  };

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResponses = responses.filter(response =>
    response.digital_forms?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">E-Sign Forms</h1>
          <p className="text-muted-foreground">
            Digital forms with electronic signature capabilities
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search forms by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Forms ({filteredForms.length})</TabsTrigger>
          <TabsTrigger value="submitted">My Submissions ({filteredResponses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No forms available</h3>
                <p className="text-muted-foreground">Contact your clinic for available forms</p>
              </div>
            ) : (
              filteredForms.map((form) => (
                <Card key={form.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{form.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {form.description}
                        </CardDescription>
                      </div>
                      {form.requires_signature && (
                        <Badge variant="outline">
                          <PenTool className="w-3 h-3 mr-1" />
                          E-Sign Required
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 mr-2" />
                        {form.form_fields?.length || 0} fields
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFillForm(form)}
                          className="flex-1"
                        >
                          <PenTool className="w-4 h-4 mr-1" />
                          Fill & Sign
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="submitted">
          <div className="space-y-4">
            {filteredResponses.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No submissions yet</h3>
                <p className="text-muted-foreground">Your form submissions will appear here</p>
              </div>
            ) : (
              filteredResponses.map((response) => (
                <Card key={response.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {response.digital_forms?.name}
                          </span>
                          {getStatusBadge(response)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Submitted: {new Date(response.created_at).toLocaleDateString()}
                          {response.signed_at && (
                            <>
                              <span className="mx-2">•</span>
                              <PenTool className="h-3 w-3" />
                              Signed: {new Date(response.signed_at).toLocaleDateString()}
                            </>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Sign Form Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fill & Sign Form: {selectedForm?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedForm && (
            <div className="space-y-6">
              <div className="space-y-4">
                {selectedForm.form_fields?.map((field: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <label className="text-sm font-medium">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'text' && (
                      <Input
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                      />
                    )}
                    {field.type === 'checkbox' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData[field.id] || false}
                          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.checked })}
                          required={field.required}
                        />
                        <span className="text-sm">{field.label}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedForm.requires_signature && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Digital Signature Required</h3>
                  <DigitalSignature
                    onSignatureChange={setSignature}
                    required={true}
                    width={600}
                    height={200}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSignDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitForm}>
                  Submit Form
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}