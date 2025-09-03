import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Heart, 
  Shield, 
  Globe, 
  FileText, 
  Signature,
  CheckCircle,
  Clock,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Download,
  Eye,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DigitalSignature } from '@/components/DigitalSignature';
import { format } from 'date-fns';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface DigitalForm {
  id: string;
  name: string;
  description: string;
  form_type: string;
  category: string;
  form_fields: any;
  requires_signature: boolean;
  template_data: any;
}

interface PatientFormViewerProps {
  formId?: string;
  patientId?: string;
  onClose: () => void;
}

export default function PatientFormViewer({ formId, patientId, onClose }: PatientFormViewerProps) {
  const { user, profile } = useAuth();
  const [form, setForm] = useState<DigitalForm | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [signature, setSignature] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) throw error;
      
      // Parse JSON fields
      const formData = {
        ...data,
        form_fields: Array.isArray(data.form_fields) ? data.form_fields : JSON.parse(data.form_fields as string || '[]'),
        template_data: typeof data.template_data === 'object' ? data.template_data : JSON.parse(data.template_data as string || '{}')
      };
      
      setForm(formData);
    } catch (error) {
      console.error('Error fetching form:', error);
      toast.error('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateRequired = () => {
    if (!form) return false;
    
    const requiredFields = form.form_fields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!responses[field.id] || responses[field.id] === '') {
        toast.error(`${field.label} is required`);
        return false;
      }
    }

    if (form.requires_signature && !signature) {
      toast.error('Digital signature is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateRequired()) return;

    setSubmitting(true);
    try {
      // First, get or create a patient record
      let targetPatientId = patientId;
      
      if (!targetPatientId && profile) {
        // Check if user is already a patient
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', profile.user_id)
          .single();

        if (existingPatient) {
          targetPatientId = existingPatient.id;
        } else {
          // Create a new patient record
          const { data: newPatient, error: patientError } = await supabase
            .from('patients')
            .insert({
              user_id: profile.user_id,
              clinic_id: profile.clinic_id,
              full_name: profile.full_name,
              email: profile.email,
              contact_number: profile.phone
            })
            .select('id')
            .single();

          if (patientError) throw patientError;
          targetPatientId = newPatient.id;
        }
      }

      const { error } = await supabase
        .from('form_responses')
        .insert({
          form_id: formId,
          patient_id: targetPatientId,
          clinic_id: profile?.clinic_id,
          responses,
          signature_data: signature,
          signed_by: user?.id,
          signed_at: signature ? new Date().toISOString() : null,
          ip_address: '192.168.1.1', // In production, get real IP
          device_info: navigator.userAgent,
          status: form?.requires_signature ? 'signed' : 'submitted'
        });

      if (error) throw error;

      toast.success('Form submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = responses[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="h-11 rounded-xl border-gray-200"
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={3}
            className="rounded-xl border-gray-200"
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            <SelectTrigger className="h-11 rounded-xl">
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

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        if (field.options) {
          // Multiple checkboxes
          return (
            <div className="space-y-2">
              {field.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={(value as string[])?.includes(option) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = (value as string[]) || [];
                      if (checked) {
                        handleFieldChange(field.id, [...currentValues, option]);
                      } else {
                        handleFieldChange(field.id, currentValues.filter(v => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={value || false}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              />
              <Label htmlFor={field.id}>{field.label}</Label>
            </div>
          );
        }

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="h-11 rounded-xl border-gray-200"
          />
        );

      default:
        return (
          <Input
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="h-11 rounded-xl border-gray-200"
          />
        );
    }
  };

  const getFormIcon = () => {
    if (!form) return <FileText className="w-6 h-6" />;
    
    switch (form.form_type) {
      case 'medical_history':
        return <Heart className="w-6 h-6 text-red-500" />;
      case 'consent':
        return <Shield className="w-6 h-6 text-blue-500" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getCategoryBadge = () => {
    if (!form) return null;
    
    switch (form.category) {
      case 'ph_template':
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Globe className="w-3 h-3 mr-1" />
            Philippine Template
          </Badge>
        );
      case 'regulatory':
        return (
          <Badge className="bg-red-100 text-red-700">
            <Shield className="w-3 h-3 mr-1" />
            Regulatory Compliance
          </Badge>
        );
      default:
        return <Badge variant="outline">Custom Form</Badge>;
    }
  };

  if (loading) {
    return (
      <Dialog open={!!formId} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading form...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!form) {
    return (
      <Dialog open={!!formId} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Form not found</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const fieldsPerStep = 5;
  const totalSteps = Math.ceil(form.form_fields.length / fieldsPerStep);
  const currentFields = form.form_fields.slice(
    currentStep * fieldsPerStep,
    (currentStep + 1) * fieldsPerStep
  );

  return (
    <Dialog open={!!formId} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 border-b">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {getFormIcon()}
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    {form.name}
                  </DialogTitle>
                  <p className="text-gray-600 mt-1">{form.description}</p>
                </div>
              </div>
              {getCategoryBadge()}
            </div>
            
            {/* Progress Bar */}
            {totalSteps > 1 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Step {currentStep + 1} of {totalSteps}</span>
                  <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </DialogHeader>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Philippine Healthcare Notice */}
            {form.category === 'ph_template' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Philippine Healthcare Standard</h4>
                      <p className="text-sm text-blue-700">
                        This form complies with Philippine Department of Health (DOH) and Professional Regulation Commission (PRC) requirements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Privacy Notice for RA 10173 forms */}
            {form.template_data?.law_reference === 'RA_10173' && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-red-900">Data Privacy Act (RA 10173) Compliance</h4>
                      <p className="text-sm text-red-700">
                        This consent form ensures compliance with the Republic Act 10173 - Data Privacy Act of 2012.
                        Your personal and health information will be protected according to Philippine law.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {currentFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            {/* Digital Signature (on last step) */}
            {form.requires_signature && currentStep === totalSteps - 1 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Signature className="w-5 h-5" />
                    Digital Signature Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 mb-4">
                    Please provide your digital signature to complete this form. 
                    This signature will be legally binding and timestamped.
                  </p>
                  <DigitalSignature
                    onSignatureChange={setSignature}
                    required={true}
                    width={400}
                    height={150}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="rounded-xl"
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              
              {currentStep < totalSteps - 1 ? (
                <Button 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl min-w-[120px]"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Submit Form
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}