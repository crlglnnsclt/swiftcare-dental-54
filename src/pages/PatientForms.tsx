import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Send, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'email' | 'phone';
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
  is_active: boolean;
  created_at: string;
}

interface FormResponse {
  id: string;
  form_id: string;
  patient_id: string;
  responses: Record<string, any>;
  submitted_at: string;
}

export default function PatientForms() {
  const { profile } = useAuth();
  const [forms, setForms] = useState<DigitalForm[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<DigitalForm | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchForms();
      fetchResponses();
    }
  }, [profile]);

  const fetchForms = async () => {
    try {
      // Mock digital forms since table doesn't exist
      const mockForms = [
        {
          id: '1',
          name: 'Medical History Form',
          description: 'Complete your medical history for better care',
          form_fields: [
            { id: '1', label: 'Current Medications', type: 'textarea' as const, required: true, placeholder: 'List any medications you are currently taking...' },
            { id: '2', label: 'Allergies', type: 'textarea' as const, required: false, placeholder: 'List any known allergies...' },
            { id: '3', label: 'Previous Dental Work', type: 'checkbox' as const, required: false, options: ['Fillings', 'Crowns', 'Root Canal', 'Orthodontics'] },
            { id: '4', label: 'Emergency Contact', type: 'text' as const, required: true, placeholder: 'Name and phone number' }
          ],
          requires_signature: true,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Treatment Consent Form',
          description: 'Consent for proposed dental treatment',
          form_fields: [
            { id: '1', label: 'I understand the proposed treatment', type: 'checkbox' as const, required: true, options: ['Yes, I understand'] },
            { id: '2', label: 'Additional Questions or Concerns', type: 'textarea' as const, required: false, placeholder: 'Any questions about the treatment...' }
          ],
          requires_signature: true,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];
      setForms(mockForms);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      // Mock form responses since table doesn't exist
      const mockResponses: FormResponse[] = [
        {
          id: '1',
          form_id: '1',
          patient_id: profile?.id || '',
          responses: { 
            'Current Medications': 'Aspirin 81mg daily',
            'Emergency Contact': 'John Doe - 555-0123'
          },
          submitted_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
        }
      ];
      setResponses(mockResponses);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const isFormCompleted = (formId: string) => {
    return responses.some(response => response.form_id === formId);
  };

  const submitForm = async () => {
    if (!selectedForm) return;

    // Validate required fields
    const missingFields = selectedForm.form_fields
      .filter(field => field.required && !formData[field.id])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      // Mock submission since table doesn't exist
      console.log('Form submitted:', {
        form_id: selectedForm.id,
        patient_id: profile?.id,
        responses: formData
      });

      toast.success('Form submitted successfully!');
      setSelectedForm(null);
      setFormData({});
      fetchResponses();
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
      case 'email':
      case 'phone':
        return (
          <Input
            type={field.type}
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
        if (field.options) {
          return (
            <div className="space-y-2">
              {field.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (checked) {
                        handleFieldChange(field.id, [...currentValues, option]);
                      } else {
                        handleFieldChange(field.id, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          );
        }
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              required={field.required}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
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
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 page-container">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="w-8 h-8 float-gentle" />
          Digital Forms
        </h1>
        <p className="text-muted-foreground">Complete required forms and review your submissions</p>
      </div>

      {selectedForm ? (
        /* Form Completion View */
        <Card className="card-3d interactive-3d">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{selectedForm.name}</CardTitle>
                {selectedForm.description && (
                  <p className="text-muted-foreground mt-1">{selectedForm.description}</p>
                )}
              </div>
              <Button variant="outline" onClick={() => setSelectedForm(null)}>
                Back to Forms
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {selectedForm.form_fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="flex items-center gap-2">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                {renderFormField(field)}
              </div>
            ))}

            {selectedForm.requires_signature && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-medium">Digital Signature Required</p>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  By submitting this form, you are providing your digital signature and consent.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedForm(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={submitForm}
                disabled={submitting}
                className="flex-1 medical-gradient text-white btn-3d"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Form
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Forms List View */
        <>
          {/* Available Forms */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Forms</h2>
            {forms.filter(form => !isFormCompleted(form.id)).length === 0 ? (
              <Card className="text-center p-8 card-3d interactive-3d">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3 float-gentle" />
                <h3 className="text-lg font-medium mb-2">All Forms Completed</h3>
                <p className="text-muted-foreground">
                  You have completed all required forms. New forms will appear here when available.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {forms
                  .filter(form => !isFormCompleted(form.id))
                  .map((form, index) => (
                    <Card key={form.id} className={`cursor-pointer hover:shadow-md transition-all card-3d interactive-3d card-stagger-${(index % 4) + 1}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-100">
                              <FileText className="w-5 h-5 text-blue-600 float-gentle" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{form.name}</CardTitle>
                              {form.description && (
                                <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Required
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Estimated time: 5-10 minutes</span>
                          </div>
                          
                          {form.requires_signature && (
                            <div className="flex items-center gap-2 text-sm text-yellow-600">
                              <AlertCircle className="w-4 h-4" />
                              <span>Digital signature required</span>
                            </div>
                          )}
                          
                          <Button 
                            onClick={() => setSelectedForm(form)}
                            className="w-full medical-gradient text-white btn-3d"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Complete Form
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>

          {/* Completed Forms */}
          {responses.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Completed Forms</h2>
                <div className="space-y-3">
                  {responses.map((response, index) => {
                    const form = forms.find(f => f.id === response.form_id);
                    if (!form) return null;
                    
                    return (
                      <Card key={response.id} className={`card-3d interactive-3d card-stagger-${(index % 4) + 1}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-green-100">
                                <CheckCircle className="w-5 h-5 text-green-600 float-gentle" />
                              </div>
                              <div>
                                <h4 className="font-medium">{form.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>Completed on {format(new Date(response.submitted_at), 'MMM dd, yyyy')}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}