import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AppointmentBlockingLogicProps {
  appointmentId: string;
  patientId: string;
  procedureId?: string;
  onStatusChange?: (canStart: boolean, formsCompleted: boolean) => void;
}

interface RequiredForm {
  form_id: string;
  form_name: string;
  is_required: boolean;
  is_completed: boolean;
}

export function AppointmentBlockingLogic({ 
  appointmentId, 
  patientId, 
  procedureId, 
  onStatusChange 
}: AppointmentBlockingLogicProps) {
  const [requiredForms, setRequiredForms] = useState<RequiredForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [canStartTreatment, setCanStartTreatment] = useState(false);
  const [formsCompleted, setFormsCompleted] = useState(false);

  useEffect(() => {
    if (appointmentId && patientId) {
      checkFormRequirements();
    }
  }, [appointmentId, patientId, procedureId]);

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(canStartTreatment, formsCompleted);
    }
  }, [canStartTreatment, formsCompleted, onStatusChange]);

  const checkFormRequirements = async () => {
    try {
      if (!procedureId) {
        // No specific procedure, allow treatment
        setCanStartTreatment(true);
        setFormsCompleted(true);
        setLoading(false);
        return;
      }

      // Get procedure name
      const { data: procedureData, error: procedureError } = await supabase
        .from('procedures')
        .select('name')
        .eq('id', procedureId)
        .single();

      if (procedureError) {
        console.error('Error fetching procedure:', procedureError);
        setLoading(false);
        return;
      }

      // Get required forms for this procedure
      const { data: formProcedures, error: formProceduresError } = await supabase
        .from('form_procedures')
        .select(`
          form_id,
          is_required,
          digital_forms!inner(name, is_active)
        `)
        .eq('procedure_name', procedureData.name)
        .eq('digital_forms.is_active', true);

      if (formProceduresError) throw formProceduresError;

      if (!formProcedures || formProcedures.length === 0) {
        // No forms required for this procedure
        setCanStartTreatment(true);
        setFormsCompleted(true);
        setRequiredForms([]);
        setLoading(false);
        return;
      }

      // Check which forms have been completed by the patient
      const formIds = formProcedures.map(fp => fp.form_id);
      const { data: completedForms, error: completedFormsError } = await supabase
        .from('patient_form_responses')
        .select('form_id, verification_status')
        .eq('patient_id', patientId)
        .in('form_id', formIds);

      if (completedFormsError) throw completedFormsError;

      // Build required forms status
      const formsStatus: RequiredForm[] = formProcedures.map((fp: any) => {
        const completedForm = completedForms?.find(cf => cf.form_id === fp.form_id);
        const isCompleted = completedForm && completedForm.verification_status === 'verified';
        
        return {
          form_id: fp.form_id,
          form_name: fp.digital_forms.name,
          is_required: fp.is_required,
          is_completed: !!isCompleted
        };
      });

      setRequiredForms(formsStatus);

      // Check if all required forms are completed
      const allRequiredCompleted = formsStatus
        .filter(form => form.is_required)
        .every(form => form.is_completed);

      setFormsCompleted(allRequiredCompleted);
      setCanStartTreatment(allRequiredCompleted);

      // Update appointment in database
      await supabase
        .from('appointments')
        .update({
          forms_completed: allRequiredCompleted,
          can_start_treatment: allRequiredCompleted
        })
        .eq('id', appointmentId);

    } catch (error) {
      console.error('Error checking form requirements:', error);
      toast.error('Failed to check form requirements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Checking form requirements...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requiredForms.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Ready for Treatment</p>
              <p className="text-sm text-green-700">No forms required for this appointment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${canStartTreatment ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {canStartTreatment ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600" />
            )}
            <div>
              <p className={`font-medium ${canStartTreatment ? 'text-green-800' : 'text-orange-800'}`}>
                {canStartTreatment ? 'Ready for Treatment' : 'Forms Required'}
              </p>
              <p className={`text-sm ${canStartTreatment ? 'text-green-700' : 'text-orange-700'}`}>
                {canStartTreatment 
                  ? 'All required forms have been completed and verified'
                  : 'Patient must complete required forms before treatment can begin'
                }
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">Required Forms Status:</p>
            {requiredForms.map((form) => (
              <div key={form.form_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{form.form_name}</span>
                </div>
                <Badge variant={form.is_completed ? 'default' : 'destructive'}>
                  {form.is_completed ? 'Completed' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>

          {!canStartTreatment && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Contact the patient to complete missing forms before proceeding with treatment.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}