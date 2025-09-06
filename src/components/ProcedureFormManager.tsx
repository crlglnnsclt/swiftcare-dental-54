import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Link2, 
  FileText, 
  Stethoscope, 
  AlertTriangle, 
  Clock, 
  Plus,
  Trash2,
  Eye,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Treatment {
  id: string;
  name: string;
  description?: string;
  requires_consent: boolean;
  risk_level: 'low' | 'medium' | 'high';
  duration_minutes: number;
  price?: number;
}

interface DigitalForm {
  id: string;
  name: string;
  description?: string;
  category: string;
  requires_signature: boolean;
  is_active: boolean;
}

interface ProcedureFormRequirement {
  id: string;
  treatment_id: string;
  form_id: string;
  is_mandatory: boolean;
  trigger_timing: 'before_appointment' | 'at_appointment' | 'after_appointment';
  treatment?: Treatment;
  form?: DigitalForm;
}

interface ProcedureFormManagerProps {
  onFormAssigned?: () => void;
}

export const ProcedureFormManager: React.FC<ProcedureFormManagerProps> = ({
  onFormAssigned
}) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [forms, setForms] = useState<DigitalForm[]>([]);
  const [requirements, setRequirements] = useState<ProcedureFormRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [triggerTiming, setTriggerTiming] = useState<'before_appointment' | 'at_appointment' | 'after_appointment'>('before_appointment');
  const [isMandatory, setIsMandatory] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch treatments - using available columns only
      const { data: treatmentsData, error: treatmentsError } = await supabase
        .from('treatments')
        .select('id, name')
        .order('name');

      if (treatmentsError) throw treatmentsError;
      
      // Map the data to match our Treatment interface with defaults
      const mappedTreatments = treatmentsData?.map(treatment => ({
        id: treatment.id,
        name: treatment.name,
        description: '',
        requires_consent: false,
        risk_level: 'low' as const,
        duration_minutes: 30,
        price: 0
      })) || [];
      
      setTreatments(mappedTreatments);

      // Fetch digital forms
      const { data: formsData, error: formsError } = await supabase
        .from('digital_forms')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (formsError) throw formsError;
      setForms(formsData || []);

      // Fetch procedure form requirements with relations
      const { data: requirementsData, error: requirementsError } = await supabase
        .from('procedure_form_requirements')
        .select(`
          id,
          treatment_id,
          form_id,
          is_mandatory,
          trigger_timing,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (requirementsError) throw requirementsError;
      
      // For now, we'll fetch related data separately to avoid complex joins
      // In a production app, you might want to create a view or use RPC for this
      const formattedRequirements: ProcedureFormRequirement[] = requirementsData?.map(req => ({
        id: req.id,
        treatment_id: req.treatment_id,
        form_id: req.form_id,
        is_mandatory: req.is_mandatory,
        trigger_timing: req.trigger_timing as 'before_appointment' | 'at_appointment' | 'after_appointment',
        // We'll add the related data fetching separately
        treatment: mappedTreatments.find(t => t.id === req.treatment_id),
        form: formsData?.find(f => f.id === req.form_id)
      })) || [];

      setRequirements(formattedRequirements);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load procedure form data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignForm = async () => {
    if (!selectedTreatment || !selectedForm) {
      toast.error('Please select both a treatment and a form');
      return;
    }

    try {
      const { error } = await supabase
        .from('procedure_form_requirements')
        .insert({
          treatment_id: selectedTreatment,
          form_id: selectedForm,
          is_mandatory: isMandatory,
          trigger_timing: triggerTiming
        });

      if (error) throw error;

      toast.success('Form successfully assigned to procedure');
      setSelectedTreatment('');
      setSelectedForm('');
      setTriggerTiming('before_appointment');
      setIsMandatory(true);
      fetchData();
      onFormAssigned?.();
    } catch (error: any) {
      console.error('Error assigning form:', error);
      if (error.code === '23505') {
        toast.error('This form is already assigned to this treatment');
      } else {
        toast.error('Failed to assign form to procedure');
      }
    }
  };

  const handleRemoveRequirement = async (requirementId: string) => {
    try {
      const { error } = await supabase
        .from('procedure_form_requirements')
        .delete()
        .eq('id', requirementId);

      if (error) throw error;

      toast.success('Form requirement removed');
      fetchData();
    } catch (error) {
      console.error('Error removing requirement:', error);
      toast.error('Failed to remove form requirement');
    }
  };

  const toggleRequirementStatus = async (requirementId: string, isMandatory: boolean) => {
    try {
      const { error } = await supabase
        .from('procedure_form_requirements')
        .update({ is_mandatory: !isMandatory })
        .eq('id', requirementId);

      if (error) throw error;

      toast.success(`Form requirement updated to ${!isMandatory ? 'mandatory' : 'optional'}`);
      fetchData();
    } catch (error) {
      console.error('Error updating requirement:', error);
      toast.error('Failed to update form requirement');
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTriggerTimingColor = (timing: string) => {
    switch (timing) {
      case 'before_appointment': return 'text-blue-600 bg-blue-100';
      case 'at_appointment': return 'text-purple-600 bg-purple-100';
      case 'after_appointment': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Procedure-Aware Forms</h2>
          <p className="text-muted-foreground">
            Automatically trigger required forms based on selected treatments
          </p>
        </div>
      </div>

      {/* Form Assignment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Assign Forms to Procedures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Treatment/Procedure</Label>
              <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  {treatments.map((treatment) => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        {treatment.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Digital Form</Label>
              <Select value={selectedForm} onValueChange={setSelectedForm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {form.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trigger Timing</Label>
              <Select value={triggerTiming} onValueChange={(value: any) => setTriggerTiming(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before_appointment">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Before Appointment
                    </div>
                  </SelectItem>
                  <SelectItem value="at_appointment">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      At Appointment
                    </div>
                  </SelectItem>
                  <SelectItem value="after_appointment">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      After Appointment
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAssignForm} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Assign Form
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="mandatory"
              checked={isMandatory}
              onCheckedChange={setIsMandatory}
            />
            <Label htmlFor="mandatory">
              Mandatory (blocks treatment if not completed)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Current Form Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No forms assigned yet</h3>
              <p className="text-gray-500">
                Start by assigning forms to procedures to enable automatic triggering
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requirements.map((requirement) => (
                <Card key={requirement.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-primary" />
                            <span className="font-medium">{requirement.treatment?.name}</span>
                            <Badge 
                              variant="outline" 
                              className={getRiskLevelColor(requirement.treatment?.risk_level || 'low')}
                            >
                              {requirement.treatment?.risk_level?.toUpperCase()} RISK
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">{requirement.form?.name}</span>
                            {requirement.form?.requires_signature && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Signature Required
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge 
                            variant="outline"
                            className={getTriggerTimingColor(requirement.trigger_timing)}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {requirement.trigger_timing.replace('_', ' ').toUpperCase()}
                          </Badge>
                          
                          <div className="flex items-center gap-1">
                            {requirement.is_mandatory ? (
                              <>
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-red-600 font-medium">Mandatory</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-green-600">Optional</span>
                              </>
                            )}
                          </div>

                          {requirement.treatment?.duration_minutes && (
                            <span>{requirement.treatment.duration_minutes} minutes</span>
                          )}
                        </div>

                        {requirement.treatment?.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {requirement.treatment.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRequirementStatus(requirement.id, requirement.is_mandatory)}
                        >
                          {requirement.is_mandatory ? (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Make Optional
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Make Mandatory
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveRequirement(requirement.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Treatments</p>
                <p className="text-2xl font-bold">{treatments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Forms</p>
                <p className="text-2xl font-bold">{forms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Form Assignments</p>
                <p className="text-2xl font-bold">{requirements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};