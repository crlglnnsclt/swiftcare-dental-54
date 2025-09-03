import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DigitalSignature } from '@/components/DigitalSignature';
import { FileText, CheckCircle, Clock } from 'lucide-react';
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
}

interface FormResponse {
  id: string;
  form_id: string;
  patient_id: string;
  responses: Record<string, any>;
  signature_data?: string;
  submitted_at: string;
}

export function PatientForms() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('form');
  
  const [availableForms, setAvailableForms] = useState<DigitalForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<DigitalForm | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [signatureData, setSignatureData] = useState<string>('');
  const [submittedForms, setSubmittedForms] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailableForms();
    if (profile?.id) {
      fetchSubmittedForms();
    }
  }, [profile]);

  useEffect(() => {
    if (formId && availableForms.length > 0) {
      const form = availableForms.find(f => f.id === formId);
      if (form) {
        setSelectedForm(form);
      }
    }
  }, [formId, availableForms]);

  const fetchAvailableForms = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_forms')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableForms((data || []).map(form => ({
        ...form,
        form_fields: form.form_fields as unknown as FormField[]
      })));
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedForms = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('patient_form_responses')
        .select('*')
        .eq('patient_id', profile.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmittedForms((data || []).map(response => ({
        ...response,
        responses: response.responses as Record<string, any>
      })));
    } catch (error) {
      console.error('Error fetching submitted forms:', error);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!selectedForm) return false;

    for (const field of selectedForm.form_fields) {
      if (field.required) {
        const value = formResponses[field.id];
        if (!value || (typeof value === 'string' && !value.trim())) {
          toast.error(`${field.label} is required`);
          return false;
        }
      }
    }

    if (selectedForm.requires_signature && !signatureData) {
      toast.error('Digital signature is required');
      return false;
    }

    return true;
  };

  const submitForm = async () => {
    if (!selectedForm || !profile?.id || !validateForm()) return;

    setSubmitting(true);
    try {
      const formData = {
        form_id: selectedForm.id,
        patient_id: profile.id,
        responses: formResponses as any,
        signature_data: signatureData || null,
        branch_id: profile.branch_id,
      };

      const { error } = await supabase
        .from('patient_form_responses')
        .insert(formData);

      if (error) throw error;

      toast.success('Form submitted successfully!');
      setSelectedForm(null);
      setFormResponses({});
      setSignatureData('');
      fetchSubmittedForms();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormSubmitted = (formId: string): boolean => {
    return submittedForms.some(response => response.form_id === formId);
  };

  const renderFormField = (field: FormField) => {
    const value = formResponses[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              required={field.required}
            />
            <Label>{field.label}</Label>
          </div>
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(selectedValue) => handleFieldChange(field.id, selectedValue)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
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
            onSignatureChange={(signature) => handleFieldChange(field.id, signature)}
            required={field.required}
          />
        );

      default:
        return null;
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

  if (selectedForm) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              {selectedForm.name}
            </CardTitle>
            {selectedForm.description && (
              <CardDescription>{selectedForm.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedForm.form_fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>
                {field.type !== 'checkbox' && renderFormField(field)}
                {field.type === 'checkbox' && renderFormField(field)}
              </div>
            ))}

            {selectedForm.requires_signature && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Digital Signature
                  <span className="text-destructive">*</span>
                </Label>
                <DigitalSignature
                  onSignatureChange={setSignatureData}
                  required={true}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedForm(null)}
                disabled={submitting}
              >
                Back to Forms
              </Button>
              <Button
                onClick={submitForm}
                disabled={submitting}
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Form'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patient Forms</h1>
        <p className="text-muted-foreground">Complete required forms before your appointment</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableForms.map((form) => {
          const isSubmitted = isFormSubmitted(form.id);
          
          return (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {form.name}
                  </div>
                  {isSubmitted && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription>{form.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Fields: {form.form_fields.length}</p>
                  <p>Signature: {form.requires_signature ? 'Required' : 'Not required'}</p>
                  {isSubmitted && (
                    <p className="text-green-600 font-medium">✓ Completed</p>
                  )}
                </div>
                
                <Button
                  onClick={() => setSelectedForm(form)}
                  disabled={isSubmitted}
                  className="w-full"
                  variant={isSubmitted ? 'secondary' : 'default'}
                >
                  {isSubmitted ? 'Form Completed' : 'Fill Out Form'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {availableForms.length === 0 && (
        <Card className="text-center p-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Forms Available</h3>
          <p className="text-muted-foreground">
            There are currently no forms available to fill out.
          </p>
        </Card>
      )}

      {submittedForms.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Previously Submitted Forms</h2>
          <div className="space-y-2">
            {submittedForms.map((response) => {
              const form = availableForms.find(f => f.id === response.form_id);
              return (
                <Card key={response.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{form?.name || 'Unknown Form'}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(response.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}