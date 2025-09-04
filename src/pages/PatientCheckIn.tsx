import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, AlertCircle, Loader2, QrCode } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';

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
  const [showQR, setShowQR] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      fetchAppointments();
    }
  }, [user, profile]);

  const fetchAppointments = async () => {
    try {
      setError('');
      
      if (!user?.id || !profile) {
        console.log('Authentication check failed:', { userId: user?.id, profile });
        setError('Authentication required. Please sign in.');
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

      console.log('User lookup result:', { userData, userError });

      if (userError || !userData) {
        console.error('User lookup error:', userError);
        setError('Failed to load user data. Please try signing out and back in.');
        setLoading(false);
        return;
      }

      // Get patient record  
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, clinic_id, full_name')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: true })
        .limit(1);

      console.log('Patient lookup result:', { patientData, patientError });

      if (patientError || !patientData || patientData.length === 0) {
        console.error('Patient lookup error:', patientError);
        setError('No patient record found. Please contact the clinic to set up your account.');
        setLoading(false);
        return;
      }

      const patient = patientData[0];
      console.log('Found patient:', patient);

      // Get appointments for this week and future for this specific patient
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      
      console.log('Querying appointments for patient:', patient.id, 'from date:', oneWeekAgo.toISOString());

      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles:users!dentist_id(full_name)
        `)
        .eq('patient_id', patient.id)
        .gte('scheduled_time', oneWeekAgo.toISOString())
        .in('status', ['booked', 'checked_in'])
        .order('scheduled_time', { ascending: true });

      console.log('Appointments query result:', { appointmentData, appointmentError });

      if (appointmentError) {
        console.error('Appointments query error:', appointmentError);
        throw new Error(`Failed to load appointments: ${appointmentError.message}`);
      }

      console.log('Setting appointments:', appointmentData || []);
      setAppointments(appointmentData || []);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(`Failed to load appointments: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try refreshing the page.",
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
                     <div className="flex gap-2">
                       <Button 
                         onClick={() => handleCheckIn(appointment.id)}
                         className="flex items-center gap-2"
                       >
                         <CheckCircle className="w-4 h-4" />
                         Check In
                       </Button>
                       <Button 
                         onClick={() => setShowQR(showQR === appointment.id ? null : appointment.id)}
                         variant="outline"
                         className="flex items-center gap-2"
                       >
                         <QrCode className="w-4 h-4" />
                         {showQR === appointment.id ? 'Hide QR' : 'Show QR'}
                       </Button>
                     </div>
                   )}
                </div>
                 {appointment.notes && (
                   <div className="mt-3 p-3 bg-muted rounded-md">
                     <p className="text-sm text-muted-foreground">
                       <strong>Notes:</strong> {appointment.notes}
                     </p>
                   </div>
                 )}
                 {showQR === appointment.id && (
                   <div className="mt-4 flex flex-col items-center p-4 bg-background border rounded-md">
                     <h3 className="text-sm font-medium mb-3">Scan QR Code to Check In</h3>
                     <QRCodeSVG 
                       value={`checkin:${appointment.id}`} 
                       size={200} 
                       includeMargin={true}
                       className="border border-border rounded"
                     />
                     <p className="text-xs text-muted-foreground mt-2 text-center">
                       Show this QR code to clinic staff for quick check-in
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