import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User,
  Calendar,
  AlertTriangle,
  Loader2,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

import { TodayAppointment } from '@/lib/types';

export default function QRCheckIn() {
  const { profile } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchTodayAppointments();
      
      // Set up real-time subscription for appointment updates
      const channel = supabase
        .channel('appointment-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'appointments',
            filter: `patient_id=eq.${profile.id}`
          },
          (payload) => {
            const updatedAppointment = payload.new as TodayAppointment;
            setTodayAppointments(prev => 
              prev.map(apt => 
                apt.id === updatedAppointment.id ? updatedAppointment : apt
              )
            );
            
            // Show notification for status changes
            if (updatedAppointment.status === 'in-treatment') {
              toast.success('Your appointment has started!', {
                description: 'Please proceed to the treatment room.'
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(full_name),
          users!appointments_dentist_id_fkey(full_name)
        `)
        .eq('patient_id', profile?.id)
        .gte('scheduled_time', startOfToday.toISOString())
        .lte('scheduled_time', endOfToday.toISOString())
        .neq('status', 'cancelled')
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      
      setTodayAppointments((data || []).map(item => ({
        ...item,
        dentist: item.users ? { full_name: item.users.full_name } : undefined
      })) as any);
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    setCheckingIn(appointmentId);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'checked_in'
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success('Successfully checked in!', {
        description: 'You have been added to the queue. Please wait for your turn.'
      });
      
      fetchTodayAppointments();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    } finally {
      setCheckingIn(null);
    }
  };

  const getAppointmentStatusBadge = (appointment: TodayAppointment) => {
    if (appointment.status === 'checked_in') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Checked In
        </Badge>
      );
    } else if (appointment.status === 'in_progress') {
      return (
        <Badge className="bg-purple-100 text-purple-800">
          <User className="w-3 h-3 mr-1" />
          In Treatment
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Clock className="w-3 h-3 mr-1" />
        Not Checked In
      </Badge>
    );
  };

  const formatAppointmentTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM do, yyyy \'at\' h:mm a');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center">
          <QrCode className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Quick Check-In</h1>
        <p className="text-muted-foreground">
          Check in for your appointments and join the queue
        </p>
      </div>

      {/* Today's Appointments */}
      <div className="space-y-4">
        {todayAppointments.length === 0 ? (
          <Card className="text-center p-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Appointments Today</h3>
            <p className="text-muted-foreground mb-6">
              You don't have any appointments scheduled for today.
            </p>
            <Button className="medical-gradient text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Book New Appointment
            </Button>
          </Card>
        ) : (
          todayAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Appointment</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatAppointmentTime(appointment.scheduled_time)}
                      </p>
                    </div>
                  </div>
                  {getAppointmentStatusBadge(appointment)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {appointment.dentist && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Dr. {appointment.dentist.full_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Main Clinic</span>
                    </div>
                  </div>

                  {appointment.status === 'checked_in' && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700">
                          Checked In
                        </div>
                        <p className="text-sm text-green-600">Waiting for your turn</p>
                         {appointment.status === 'checked_in' ? (
                           <p className="text-xs text-green-600 mt-1">
                             Please wait for your turn
                           </p>
                         ) : (
                           <p className="text-xs text-purple-600 mt-1 font-medium">
                             🎯 Please proceed to treatment room
                           </p>
                         )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Check-in Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  {appointment.status !== 'checked_in' ? (
                    <Button
                      onClick={() => handleCheckIn(appointment.id)}
                      disabled={checkingIn === appointment.id}
                      className="flex-1 medical-gradient text-white"
                    >
                      {checkingIn === appointment.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking In...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Check In Now
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex-1 text-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-sm text-green-700 font-medium">Successfully Checked In</p>
                      <p className="text-xs text-green-600">
                         Please wait for your turn
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            How to Check In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold">1</div>
              <p>Tap "Check In Now" button for your scheduled appointment</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold">2</div>
              <p>You'll automatically join the queue and see your position</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold">3</div>
              <p>Wait for notifications when it's your turn to see the dentist</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold">4</div>
              <p>You can check in up to 30 minutes before your appointment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Need Help?</p>
              <p className="text-sm text-red-700">
                Contact the front desk if you have any issues with check-in: (555) 123-4567
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}