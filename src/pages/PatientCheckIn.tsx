import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  patient_id: string;
  scheduled_time: string;
  status: string;
  booking_type?: string;
  patient_name?: string;
}

export function PatientCheckIn() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [profile]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('scheduled_time', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      setAppointments((data || []).map(apt => ({
        ...apt,
        patient_name: 'Patient ' + apt.patient_id.slice(-4),
      })));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          is_checked_in: true,
          check_in_time: new Date().toISOString(),
          status: 'checked_in'
        })
        .eq('id', appointmentId);

      if (error) throw error;
      toast.success('Successfully checked in!');
      fetchAppointments();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Patient Check-In</h1>
      
      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {appointment.patient_name}
              </CardTitle>
               <CardDescription>
                 {new Date(appointment.scheduled_time).toLocaleDateString()} - {appointment.booking_type || 'Standard'}
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="flex items-center justify-between">
                 <Badge variant={appointment.status === 'checked_in' ? 'default' : 'secondary'}>
                   {appointment.status}
                 </Badge>
                 {appointment.status !== 'checked_in' && (
                  <Button onClick={() => handleCheckIn(appointment.id)}>
                    Check In
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}