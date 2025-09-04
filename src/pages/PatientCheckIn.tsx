import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Appointment {
  id: string;
  patient_id: string;
  scheduled_time: string;
  status: 'booked' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  booking_type?: string;
  notes?: string;
  profiles?: {
    full_name: string;
  };
}

export function PatientCheckIn() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && profile) {
      fetchAppointments();
    }
  }, [user, profile]);

  const fetchAppointments = async () => {
    try {
      if (!user?.id || !profile) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      console.log('Fetching appointments for user:', user.id);
      console.log('User profile role:', profile.role);

      // Check if user is a patient
      if (profile.role !== 'patient') {
        setError('This page is only accessible to patients.');
        setLoading(false);
        return;
      }

      // Get user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, clinic_id, role')
        .eq('user_id', user.id)
        .single();

      console.log('User lookup result:', userData, userError);

      if (userError || !userData) {
        console.error('User lookup error:', userError);
        setError('Failed to load user data');
        setLoading(false);
        return;
      }

      // Get patient record  
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, clinic_id')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: true })
        .limit(1);

      console.log('Patient lookup result:', patientData, patientError);

      if (patientError || !patientData || patientData.length === 0) {
        console.error('Patient lookup error:', patientError);
        setError('No patient record found');
        setLoading(false);
        return;
      }

      const patient = patientData[0];
      console.log('Found patient:', patient);

      // Get appointments for today and future dates for this specific patient
      // For testing, let's get all appointments regardless of date
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles:users!dentist_id(full_name)
        `)
        .eq('patient_id', patient.id)
        .in('status', ['booked', 'checked_in'])
        .order('scheduled_time', { ascending: true });

      console.log('Appointments query result:', data, error);

      if (error) throw error;

      console.log('Fetched appointments:', data);
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'checked_in'
        })
        .eq('id', appointmentId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Successfully checked in!",
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Error",
        description: "Failed to check in",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Patient Check-In</h1>
      </div>
      
      {appointments.length === 0 ? (
        <Card className="text-center p-8">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Upcoming Appointments</h2>
          <p className="text-muted-foreground">
            You don't have any appointments scheduled for today or future dates.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointment Details
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(appointment.scheduled_time).toLocaleDateString()} at{' '}
                    {new Date(appointment.scheduled_time).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {appointment.profiles?.full_name && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Dr. {appointment.profiles.full_name}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Badge 
                       variant={
                         appointment.status === 'checked_in' ? 'default' : 
                         'outline'
                       }
                     >
                       {appointment.status === 'checked_in' ? 'Checked In' : 
                        'Booked'}
                     </Badge>
                    {appointment.booking_type && (
                      <Badge variant="outline">{appointment.booking_type}</Badge>
                    )}
                  </div>
                  {appointment.status !== 'checked_in' && (
                    <Button 
                      onClick={() => handleCheckIn(appointment.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Check In
                    </Button>
                  )}
                </div>
                {appointment.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}