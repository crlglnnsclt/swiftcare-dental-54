import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DigitalSignature } from '@/components/DigitalSignature';
import { FileText, Clock, CheckCircle, AlertCircle, Signature } from 'lucide-react';
import { toast } from 'sonner';

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'checkbox' | 'select' | 'signature';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface DigitalForm {
  id: string;
  name: string;
  description?: string;
  form_fields: FormField[];
  requires_signature: boolean;
  attached_document_url?: string;
  terms_and_conditions?: string;
  display_mode?: string;
}

interface FormResponse {
  id: string;
  form_id: string;
  patient_id: string;
  responses: Record<string, any>;
  signature_data?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  submitted_at: string;
  form?: DigitalForm;
}

export function PatientForms() {
  const { profile } = useAuth();
  const [forms, setForms] = useState<DigitalForm[]>([]);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<DigitalForm | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [signatureData, setSignatureData] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchPatientForms();
      fetchFormResponses();
    }
  }, [profile?.id]);

  const fetchPatientForms = async () => {
    try {
      // Since we don't have digital_forms table, we'll create a simple mock form
      const mockForms = [{
        id: '1',
        name: 'Basic Information Form',
        requires_signature: true,
        form_fields: [
          { id: '1', label: 'Full Name', type: 'text' as const, required: true },
          { id: '2', label: 'Email', type: 'text' as const, required: true }
        ]
      }];
      
      setForms(mockForms);
    } catch (error) {
      console.error('Error fetching patient forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormResponses = async () => {
    try {
      // Since we don't have patient_form_responses table, show empty state
      setFormResponses([]);
    } catch (error) {
      console.error('Error fetching form responses:', error);
      toast.error('Failed to load responses');
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const submitForm = async () => {
    if (!selectedForm || !profile?.id) return;

    // Validate required fields
    const missingFields = selectedForm.form_fields
      .filter(field => field.required && !formData[field.id])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (selectedForm.requires_signature && !signatureData) {
      toast.error('Digital signature is required for this form');
      return;
    }

    setSubmitting(true);
    try {
      const responseData = {
        form_id: selectedForm.id,
        patient_id: profile.id,
        responses: formData,
        signature_data: signatureData || null,
        branch_id: profile.branch_id,
        verification_status: 'pending',
        signer_ip: null, // Would be populated on server side
        signature_timestamp: signatureData ? new Date().toISOString() : null,
      };

      // Since we don't have patient_form_responses table, this is a no-op
      toast.error('Form submission not available in this version');
      return;

      toast.success('Form submitted successfully');
      setSelectedForm(null);
      setFormData({});
      setSignatureData('');
      fetchFormResponses();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
          />
        );
      
      case 'checkbox':
        return (
          <Checkbox
            checked={value || false}
            onCheckedChange={(checked) => handleInputChange(field.id, checked)}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'signature':
        return (
          <DigitalSignature
            onSignatureChange={(signature) => handleInputChange(field.id, signature)}
            required={field.required}
          />
        );
      
      default:
        return null;
    }
  };

  const getFormStatus = (formId: string) => {
    const response = formResponses.find(r => r.form_id === formId);
    if (!response) return 'pending';
    return response.verification_status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Loading forms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Forms</h1>
          <p className="text-muted-foreground">Complete required forms for your appointments</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Forms</TabsTrigger>
          <TabsTrigger value="completed">Completed Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {selectedForm ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {selectedForm.name}
                    </CardTitle>
                    <CardDescription>{selectedForm.description}</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedForm(null)}>
                    Back to Forms
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedForm.display_mode === 'document' && selectedForm.attached_document_url ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <iframe
                        src={selectedForm.attached_document_url}
                        className="w-full h-96"
                        title="Form Document"
                      />
                    </div>
                    {selectedForm.terms_and_conditions && (
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Terms and Conditions</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedForm.terms_and_conditions}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedForm.form_fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          {field.label}
                          {field.required && <span className="text-destructive">*</span>}
                        </Label>
                        {renderFormField(field)}
                      </div>
                    ))}
                  </div>
                )}

                {selectedForm.requires_signature && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Signature className="w-4 h-4" />
                      Digital Signature *
                    </Label>
                    <DigitalSignature
                      onSignatureChange={setSignatureData}
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedForm(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitForm}
                    disabled={submitting}
                    className="flex items-center gap-2"
                  >
                    {submitting ? 'Submitting...' : 'Submit Form'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {forms.filter(form => getFormStatus(form.id) === 'pending').map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          {form.name}
                        </CardTitle>
                        <CardDescription>{form.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Fields: {form.form_fields.length}</p>
                      <p>Signature: {form.requires_signature ? 'Required' : 'Not required'}</p>
                    </div>
                    
                    <Button
                      onClick={() => setSelectedForm(form)}
                      className="w-full"
                    >
                      Complete Form
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {forms.filter(form => getFormStatus(form.id) === 'pending').length === 0 && !selectedForm && (
            <Card className="text-center p-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Forms Completed</h3>
              <p className="text-muted-foreground">
                You have completed all required forms for your appointments.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {formResponses.map((response) => (
              <Card key={response.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {response.form?.name || 'Unknown Form'}
                      </CardTitle>
                      <CardDescription>
                        Submitted on {new Date(response.submitted_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={getStatusColor(response.verification_status)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(response.verification_status)}
                      {response.verification_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Response ID:</strong> {response.id}</p>
                    <p><strong>Status:</strong> {response.verification_status}</p>
                    {response.signature_data && (
                      <p><strong>Signed:</strong> Yes</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {formResponses.length === 0 && (
            <Card className="text-center p-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Completed Forms</h3>
              <p className="text-muted-foreground">
                Your completed forms will appear here once submitted.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}