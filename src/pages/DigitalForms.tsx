import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, FileText, Edit, Trash2, Eye, Users, Upload, Stethoscope } from 'lucide-react';
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
  is_active: boolean;
  requires_signature: boolean;
  created_at: string;
  updated_at: string;
  branch_id?: string;
  attached_document_url?: string;
  terms_and_conditions?: string;
  display_mode?: string;
}

interface Procedure {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category?: string;
  is_active: boolean;
}

export function DigitalForms() {
  const { profile } = useAuth();
  const [forms, setForms] = useState<DigitalForm[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<DigitalForm | null>(null);

  // Form creation/editing state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [requiresSignature, setRequiresSignature] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [attachedDocumentUrl, setAttachedDocumentUrl] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [displayMode, setDisplayMode] = useState<'form' | 'document'>('form');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);

  useEffect(() => {
    fetchForms();
    fetchProcedures();
  }, []);

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms((data || []).map(form => ({
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

  const fetchProcedures = async () => {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProcedures(data || []);
    } catch (error) {
      console.error('Error fetching procedures:', error);
      toast.error('Failed to load procedures');
    }
  };

  const resetFormData = () => {
    setFormName('');
    setFormDescription('');
    setRequiresSignature(false);
    setFormFields([]);
    setAttachedDocumentUrl('');
    setTermsAndConditions('');
    setDisplayMode('form');
    setSelectedProcedures([]);
    setEditingForm(null);
  };

  const openCreateModal = () => {
    resetFormData();
    setIsCreateModalOpen(true);
  };

  const openEditModal = async (form: DigitalForm) => {
    setEditingForm(form);
    setFormName(form.name);
    setFormDescription(form.description || '');
    setRequiresSignature(form.requires_signature);
    setFormFields(form.form_fields);
    setAttachedDocumentUrl(form.attached_document_url || '');
    setTermsAndConditions(form.terms_and_conditions || '');
    setDisplayMode((form.display_mode as 'form' | 'document') || 'form');
    
    // Fetch associated procedures
    try {
      const { data, error } = await supabase
        .from('form_procedures')
        .select('procedure_name')
        .eq('form_id', form.id);
      
      if (error) throw error;
      setSelectedProcedures(data?.map(fp => fp.procedure_name) || []);
    } catch (error) {
      console.error('Error fetching form procedures:', error);
    }
    
    setIsCreateModalOpen(true);
  };

  const addFormField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: 'text',
      label: '',
      required: false,
    };
    setFormFields([...formFields, newField]);
  };

  const updateFormField = (id: string, updates: Partial<FormField>) => {
    setFormFields(formFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeFormField = (id: string) => {
    setFormFields(formFields.filter(field => field.id !== id));
  };

  const saveForm = async () => {
    if (!formName.trim()) {
      toast.error('Form name is required');
      return;
    }

    if (formFields.length === 0) {
      toast.error('At least one form field is required');
      return;
    }

    try {
      const formData = {
        name: formName,
        description: formDescription,
        form_fields: formFields as any,
        requires_signature: requiresSignature,
        branch_id: profile?.branch_id,
        is_active: true,
        attached_document_url: attachedDocumentUrl || null,
        terms_and_conditions: termsAndConditions || null,
        display_mode: displayMode,
      };

      let formId = editingForm?.id;

      if (editingForm) {
        const { error } = await supabase
          .from('digital_forms')
          .update(formData)
          .eq('id', editingForm.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('digital_forms')
          .insert(formData)
          .select('id')
          .single();
        
        if (error) throw error;
        formId = data.id;
      }

      // Update form-procedure associations
      if (formId) {
        // Delete existing associations
        await supabase
          .from('form_procedures')
          .delete()
          .eq('form_id', formId);

        // Insert new associations
        if (selectedProcedures.length > 0) {
          const formProcedures = selectedProcedures.map(procedureName => ({
            form_id: formId,
            procedure_name: procedureName,
            is_required: true,
          }));

          const { error: procedureError } = await supabase
            .from('form_procedures')
            .insert(formProcedures);

          if (procedureError) throw procedureError;
        }
      }

      toast.success(editingForm ? 'Form updated successfully' : 'Form created successfully');
      setIsCreateModalOpen(false);
      resetFormData();
      fetchForms();
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form');
    }
  };

  const toggleFormStatus = async (formId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('digital_forms')
        .update({ is_active: !isActive })
        .eq('id', formId);

      if (error) throw error;
      toast.success(`Form ${!isActive ? 'activated' : 'deactivated'}`);
      fetchForms();
    } catch (error) {
      console.error('Error updating form status:', error);
      toast.error('Failed to update form status');
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      const { error } = await supabase
        .from('digital_forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;
      toast.success('Form deleted successfully');
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Loading digital forms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Digital Forms</h1>
          <p className="text-muted-foreground">Create and manage digital forms for patients</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Form
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
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
                <Badge variant={form.is_active ? 'default' : 'secondary'}>
                  {form.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Fields: {form.form_fields.length}</p>
                <p>Signature: {form.requires_signature ? 'Required' : 'Not required'}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(form)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFormStatus(form.id, form.is_active)}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  {form.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Users className="w-3 h-3" />
                  Responses
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteForm(form.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {forms.length === 0 && (
        <Card className="text-center p-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Digital Forms</h3>
          <p className="text-muted-foreground mb-4">
            Create your first digital form to start collecting patient information.
          </p>
          <Button onClick={openCreateModal}>Create Your First Form</Button>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingForm ? 'Edit Form' : 'Create New Form'}
            </DialogTitle>
            <DialogDescription>
              Design a digital form for patients to fill out
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Form Info */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="formName">Form Name *</Label>
                <Input
                  id="formName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Patient Registration Form"
                />
              </div>
              <div>
                <Label htmlFor="formDescription">Description</Label>
                <Textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of this form"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayMode">Display Mode</Label>
                  <Select value={displayMode} onValueChange={(value: 'form' | 'document') => setDisplayMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form">Form Fields</SelectItem>
                      <SelectItem value="document">Document with Signature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {displayMode === 'document' && (
                  <>
                    <div>
                      <Label htmlFor="attachedDocument">Document URL</Label>
                      <Input
                        id="attachedDocument"
                        value={attachedDocumentUrl}
                        onChange={(e) => setAttachedDocumentUrl(e.target.value)}
                        placeholder="https://example.com/document.pdf"
                      />
                    </div>
                    <div>
                      <Label htmlFor="termsConditions">Terms and Conditions</Label>
                      <Textarea
                        id="termsConditions"
                        value={termsAndConditions}
                        onChange={(e) => setTermsAndConditions(e.target.value)}
                        placeholder="Terms and conditions text..."
                        rows={4}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresSignature"
                    checked={requiresSignature}
                    onCheckedChange={setRequiresSignature}
                  />
                  <Label htmlFor="requiresSignature">Requires Digital Signature</Label>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Form Fields</h3>
                <Button onClick={addFormField} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>

              {formFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Field {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFormField(field.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Field Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value: FormField['type']) =>
                            updateFormField(field.id, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Input</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="select">Dropdown</SelectItem>
                            <SelectItem value="signature">Signature</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Field Label *</Label>
                        <Input
                          value={field.label}
                          onChange={(e) =>
                            updateFormField(field.id, { label: e.target.value })
                          }
                          placeholder="Enter field label"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Placeholder</Label>
                        <Input
                          value={field.placeholder || ''}
                          onChange={(e) =>
                            updateFormField(field.id, { placeholder: e.target.value })
                          }
                          placeholder="Enter placeholder text"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) =>
                            updateFormField(field.id, { required: checked })
                          }
                        />
                        <Label>Required Field</Label>
                      </div>
                    </div>

                    {field.type === 'select' && (
                      <div>
                        <Label>Options (one per line)</Label>
                        <Textarea
                          value={field.options?.join('\n') || ''}
                          onChange={(e) =>
                            updateFormField(field.id, {
                              options: e.target.value.split('\n').filter(opt => opt.trim())
                            })
                          }
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Procedure Associations */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Associated Procedures</h3>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" />
                  {selectedProcedures.length} selected
                </Badge>
              </div>

              <div className="grid gap-3 max-h-40 overflow-y-auto border rounded-lg p-3">
                {procedures.map((procedure) => (
                  <div key={procedure.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`procedure-${procedure.id}`}
                      checked={selectedProcedures.includes(procedure.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProcedures([...selectedProcedures, procedure.name]);
                        } else {
                          setSelectedProcedures(selectedProcedures.filter(p => p !== procedure.name));
                        }
                      }}
                    />
                    <Label htmlFor={`procedure-${procedure.id}`} className="text-sm">
                      {procedure.name}
                      {procedure.code && (
                        <span className="text-muted-foreground ml-1">({procedure.code})</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedProcedures.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Selected procedures:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProcedures.map(procedure => (
                      <Badge key={procedure} variant="secondary" className="text-xs">
                        {procedure}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveForm}>
                {editingForm ? 'Update Form' : 'Create Form'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}