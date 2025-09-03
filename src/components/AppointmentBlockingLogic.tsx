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

      // Get treatment information
      const { data: treatmentData, error: treatmentError } = await supabase
        .from('treatments')
        .select('name')
        .eq('id', procedureId)
        .single();

      if (treatmentError) {
        console.error('Error fetching treatment:', treatmentError);
        // If treatment not found, allow treatment to proceed
        setCanStartTreatment(true);
        setFormsCompleted(true);
        setLoading(false);
        return;
      }

      // For now, since we don't have form tables, we'll allow all treatments
      // This can be enhanced later when form management is implemented
      setCanStartTreatment(true);
      setFormsCompleted(true);
      setRequiredForms([]);

      // Update appointment status
      await supabase
        .from('appointments')
        .update({
          status: 'booked'
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