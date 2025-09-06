import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Type, 
  CheckSquare, 
  Calendar, 
  Mail, 
  Phone, 
  List, 
  FileSignature,
  Eye,
  Save,
  Wand2,
  Palette,
  Settings
} from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date' | 'email' | 'phone' | 'signature';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  aiSuggestion?: string;
}

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  form_fields: FormField[];
  requires_signature: boolean;
  is_active: boolean;
  rich_content: {
    header?: string;
    footer?: string;
    clauses?: string[];
    disclaimers?: string[];
  };
  clinic_branding: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    show_clinic_info?: boolean;
  };
  ai_assistance_enabled: boolean;
  compliance_settings: {
    retention_period?: number;
    encryption_required?: boolean;
    audit_trail?: boolean;
  };
  notification_settings: {
    auto_remind?: boolean;
    reminder_interval_hours?: number;
    send_completion_notification?: boolean;
  };
}

interface PaperlessFormBuilderProps {
  template?: FormTemplate;
  onSave: (template: FormTemplate) => void;
  onCancel: () => void;
  treatments: Array<{ id: string; name: string; requires_consent: boolean; risk_level: string }>;
}

const fieldTypeIcons = {
  text: Type,
  textarea: Type,
  checkbox: CheckSquare,
  radio: CheckSquare,
  select: List,
  date: Calendar,
  email: Mail,
  phone: Phone,
  signature: FileSignature,
};

const templateClauses = {
  consent: [
    "I understand the nature of the proposed treatment and the risks involved.",
    "I acknowledge that no guarantee has been made as to the outcome of treatment.",
    "I understand that there may be alternative treatments available.",
    "I have been given the opportunity to ask questions about my treatment.",
    "I consent to the treatment as explained to me."
  ],
  liability: [
    "I understand that dentistry is not an exact science and acknowledge that no guarantee of success has been made to me.",
    "I acknowledge that I have been informed of the need for follow-up care.",
    "I understand that failure to follow post-treatment instructions may result in complications.",
    "I release the dental practice from any liability arising from my failure to follow instructions."
  ],
  privacy: [
    "I consent to the use of my information for treatment purposes.",
    "I understand that my records will be kept confidential in accordance with applicable laws.",
    "I consent to the sharing of my information with other healthcare providers involved in my care.",
    "I understand my rights regarding access to my personal health information."
  ]
};

export const PaperlessFormBuilder: React.FC<PaperlessFormBuilderProps> = ({
  template,
  onSave,
  onCancel,
  treatments
}) => {
  const [formTemplate, setFormTemplate] = useState<FormTemplate>(
    template || {
      id: '',
      name: '',
      description: '',
      category: 'consent',
      form_fields: [],
      requires_signature: true,
      is_active: true,
      rich_content: {
        header: '',
        footer: '',
        clauses: [],
        disclaimers: []
      },
      clinic_branding: {
        primary_color: '#2563eb',
        secondary_color: '#10b981',
        show_clinic_info: true
      },
      ai_assistance_enabled: true,
      compliance_settings: {
        retention_period: 7,
        encryption_required: true,
        audit_trail: true
      },
      notification_settings: {
        auto_remind: true,
        reminder_interval_hours: 24,
        send_completion_notification: true
      }
    }
  );

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [draggedField, setDraggedField] = useState<number | null>(null);

  const addFormField = useCallback((type: FormField['type']) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: type === 'text' ? 'Enter text...' : undefined,
    };

    setFormTemplate(prev => ({
      ...prev,
      form_fields: [...prev.form_fields, newField]
    }));
  }, []);

  const updateFormField = useCallback((index: number, updates: Partial<FormField>) => {
    setFormTemplate(prev => ({
      ...prev,
      form_fields: prev.form_fields.map((field, i) => 
        i === index ? { ...field, ...updates } : field
      )
    }));
  }, []);

  const removeFormField = useCallback((index: number) => {
    setFormTemplate(prev => ({
      ...prev,
      form_fields: prev.form_fields.filter((_, i) => i !== index)
    }));
  }, []);

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setFormTemplate(prev => {
      const fields = [...prev.form_fields];
      const [moved] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, moved);
      return { ...prev, form_fields: fields };
    });
  }, []);

  const addTemplateClause = useCallback((category: keyof typeof templateClauses, clause: string) => {
    setFormTemplate(prev => ({
      ...prev,
      rich_content: {
        ...prev.rich_content,
        clauses: [...(prev.rich_content.clauses || []), clause]
      }
    }));
    toast.success('Clause added to form');
  }, []);

  const generateAISuggestion = useCallback(async (fieldType: string, context: string) => {
    // Mock AI suggestion - in real implementation, this would call an AI API
    const suggestions = {
      text: `AI suggests: Consider adding validation for ${context}`,
      textarea: `AI suggests: For ${context}, consider multi-line input with character limit`,
      checkbox: `AI suggests: For consent forms, ensure this checkbox is clearly mandatory`,
      signature: `AI suggests: Digital signatures require proper legal disclaimers`
    };

    return suggestions[fieldType as keyof typeof suggestions] || 'AI suggests: Review field requirements';
  }, []);

  const handleSave = useCallback(() => {
    if (!formTemplate.name.trim()) {
      toast.error('Please enter a form name');
      return;
    }

    if (formTemplate.form_fields.length === 0) {
      toast.error('Please add at least one form field');
      return;
    }

    onSave({
      ...formTemplate,
      id: formTemplate.id || Math.random().toString(36).substr(2, 9)
    });
  }, [formTemplate, onSave]);

  const renderFieldEditor = (field: FormField, index: number) => {
    const IconComponent = fieldTypeIcons[field.type];

    return (
      <Card key={field.id} className="mb-4 border-2 border-dashed border-gray-200 hover:border-primary transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2">
              <div 
                className="cursor-move p-2 rounded hover:bg-gray-100"
                draggable
                onDragStart={() => setDraggedField(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedField !== null) {
                    moveField(draggedField, index);
                    setDraggedField(null);
                  }
                }}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              <IconComponent className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Field Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateFormField(index, { label: e.target.value })}
                    placeholder="Enter field label"
                  />
                </div>
                <div>
                  <Label>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) => updateFormField(index, { type: value as FormField['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Input</SelectItem>
                      <SelectItem value="textarea">Text Area</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="radio">Radio Buttons</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="signature">Digital Signature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'phone') && (
                <div>
                  <Label>Placeholder</Label>
                  <Input
                    value={field.placeholder || ''}
                    onChange={(e) => updateFormField(index, { placeholder: e.target.value })}
                    placeholder="Enter placeholder text"
                  />
                </div>
              )}

              {(field.type === 'radio' || field.type === 'select' || field.type === 'checkbox') && (
                <div>
                  <Label>Options (one per line)</Label>
                  <Textarea
                    value={field.options?.join('\n') || ''}
                    onChange={(e) => updateFormField(index, { 
                      options: e.target.value.split('\n').filter(opt => opt.trim()) 
                    })}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`required-${field.id}`}
                    checked={field.required}
                    onCheckedChange={(checked) => updateFormField(index, { required: !!checked })}
                  />
                  <Label htmlFor={`required-${field.id}`}>Required Field</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const suggestion = await generateAISuggestion(field.type, field.label);
                      updateFormField(index, { aiSuggestion: suggestion });
                      toast.success('AI suggestion generated');
                    }}
                  >
                    <Wand2 className="w-4 h-4 mr-1" />
                    AI Suggest
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFormField(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {field.aiSuggestion && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Wand2 className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">AI Suggestion</p>
                      <p className="text-sm text-blue-700">{field.aiSuggestion}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paperless Form Builder</h1>
          <p className="text-muted-foreground">Create procedure-aware, customizable digital forms</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Form Name</Label>
                <Input
                  value={formTemplate.name}
                  onChange={(e) => setFormTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter form name"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formTemplate.description}
                  onChange={(e) => setFormTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the form purpose"
                  rows={3}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={formTemplate.category}
                  onValueChange={(value) => setFormTemplate(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consent">Consent Form</SelectItem>
                    <SelectItem value="medical_history">Medical History</SelectItem>
                    <SelectItem value="insurance">Insurance Information</SelectItem>
                    <SelectItem value="registration">Patient Registration</SelectItem>
                    <SelectItem value="discharge">Discharge Instructions</SelectItem>
                    <SelectItem value="treatment_plan">Treatment Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Requires Digital Signature</Label>
                <Switch
                  checked={formTemplate.requires_signature}
                  onCheckedChange={(checked) => setFormTemplate(prev => ({ 
                    ...prev, 
                    requires_signature: checked 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>AI Assistance Enabled</Label>
                <Switch
                  checked={formTemplate.ai_assistance_enabled}
                  onCheckedChange={(checked) => setFormTemplate(prev => ({ 
                    ...prev, 
                    ai_assistance_enabled: checked 
                  }))}
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </Button>
            </CardContent>
          </Card>

          {/* Field Palette */}
          <Card>
            <CardHeader>
              <CardTitle>Field Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(fieldTypeIcons).map(([type, IconComponent]) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-12 flex flex-col items-center justify-center text-xs"
                    onClick={() => addFormField(type as FormField['type'])}
                  >
                    <IconComponent className="w-4 h-4 mb-1" />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Clauses */}
          <Card>
            <CardHeader>
              <CardTitle>Template Clauses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(templateClauses).map(([category, clauses]) => (
                <div key={category}>
                  <Label className="text-sm font-medium capitalize">{category}</Label>
                  <div className="space-y-1 mt-1">
                    {clauses.map((clause, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full text-left text-xs h-auto p-2 justify-start"
                        onClick={() => addTemplateClause(category as keyof typeof templateClauses, clause)}
                      >
                        <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{clause.substring(0, 50)}...</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Form Builder Canvas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Form Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {formTemplate.form_fields.length} fields
                  </Badge>
                  {formTemplate.requires_signature && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      <FileSignature className="w-3 h-3 mr-1" />
                      Signature Required
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Rich Content Editor */}
          {formTemplate.rich_content.header && (
            <Card>
              <CardContent className="p-4">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formTemplate.rich_content.header }}
                />
              </CardContent>
            </Card>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {formTemplate.form_fields.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-12 text-center">
                  <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No fields added yet</h3>
                  <p className="text-gray-500 mb-4">
                    Add form fields from the palette on the left to start building your form
                  </p>
                </CardContent>
              </Card>
            ) : (
              formTemplate.form_fields.map((field, index) => renderFieldEditor(field, index))
            )}
          </div>

          {/* Signature Field */}
          {formTemplate.requires_signature && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileSignature className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">Digital Signature Required</h4>
                    <p className="text-sm text-blue-700">
                      Patient signature will be captured digitally with timestamp and device information
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rich Content Clauses */}
          {formTemplate.rich_content.clauses && formTemplate.rich_content.clauses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formTemplate.rich_content.clauses.map((clause, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-500 mt-1">{index + 1}.</span>
                      <p className="text-sm text-gray-700">{clause}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Advanced Settings Modal */}
      {showAdvancedSettings && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Clinic Branding */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Clinic Branding
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <Input
                    type="color"
                    value={formTemplate.clinic_branding.primary_color}
                    onChange={(e) => setFormTemplate(prev => ({
                      ...prev,
                      clinic_branding: {
                        ...prev.clinic_branding,
                        primary_color: e.target.value
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <Input
                    type="color"
                    value={formTemplate.clinic_branding.secondary_color}
                    onChange={(e) => setFormTemplate(prev => ({
                      ...prev,
                      clinic_branding: {
                        ...prev.clinic_branding,
                        secondary_color: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Compliance Settings */}
            <div>
              <h4 className="font-medium mb-3">Compliance & Security</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Retention Period (years)</Label>
                    <Input
                      type="number"
                      value={formTemplate.compliance_settings.retention_period}
                      onChange={(e) => setFormTemplate(prev => ({
                        ...prev,
                        compliance_settings: {
                          ...prev.compliance_settings,
                          retention_period: parseInt(e.target.value)
                        }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Encryption Required</Label>
                    <Switch
                      checked={formTemplate.compliance_settings.encryption_required}
                      onCheckedChange={(checked) => setFormTemplate(prev => ({
                        ...prev,
                        compliance_settings: {
                          ...prev.compliance_settings,
                          encryption_required: checked
                        }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Full Audit Trail</Label>
                    <Switch
                      checked={formTemplate.compliance_settings.audit_trail}
                      onCheckedChange={(checked) => setFormTemplate(prev => ({
                        ...prev,
                        compliance_settings: {
                          ...prev.compliance_settings,
                          audit_trail: checked
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notification Settings */}
            <div>
              <h4 className="font-medium mb-3">Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto-remind patients</Label>
                  <Switch
                    checked={formTemplate.notification_settings.auto_remind}
                    onCheckedChange={(checked) => setFormTemplate(prev => ({
                      ...prev,
                      notification_settings: {
                        ...prev.notification_settings,
                        auto_remind: checked
                      }
                    }))}
                  />
                </div>
                
                {formTemplate.notification_settings.auto_remind && (
                  <div>
                    <Label>Reminder Interval (hours)</Label>
                    <Input
                      type="number"
                      value={formTemplate.notification_settings.reminder_interval_hours}
                      onChange={(e) => setFormTemplate(prev => ({
                        ...prev,
                        notification_settings: {
                          ...prev.notification_settings,
                          reminder_interval_hours: parseInt(e.target.value)
                        }
                      }))}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};