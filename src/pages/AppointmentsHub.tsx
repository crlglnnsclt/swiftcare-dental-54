import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, AlertCircle, Loader2, QrCode, Plus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string;
  scheduled_time: string;
  status: 'booked' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  booking_type?: string;
  notes?: string;
  duration_minutes?: number;
  profiles?: {
    full_name: string;
  };
  patients?: {
    full_name: string;
    contact_number?: string;
  };
}

export default function AppointmentsHub() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (user && profile) {
      fetchAppointments();
    }
  }, [user, profile]);

  const fetchAppointments = async () => {
    try {
      setError('');
      
      if (!user?.id || !profile) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      let query = supabase.from('appointments').select(`
        *,
        profiles:users!dentist_id(full_name),
        patients!inner(full_name, contact_number)
      `);

      // Filter based on role
      if (profile.role === 'patient') {
        // Get patient record first
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (userData) {
          const { data: patientData } = await supabase
            .from('patients')
            .select('id')
            .eq('user_id', userData.id)
            .limit(1);

          if (patientData && patientData.length > 0) {
            query = query.eq('patient_id', patientData[0].id);
          }
        }
      } else if (profile.role === 'dentist') {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (userData) {
          query = query.eq('dentist_id', userData.id);
        }
      }
      // For clinic_admin and other staff roles, show all appointments
      // since appointments table doesn't have clinic_id column

      // Date filtering based on active tab
      const today = new Date();
      if (activeTab === 'upcoming') {
        query = query.gte('scheduled_time', today.toISOString());
      } else if (activeTab === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query
          .gte('scheduled_time', today.toISOString().split('T')[0])
          .lt('scheduled_time', tomorrow.toISOString().split('T')[0]);
      } else if (activeTab === 'past') {
        query = query.lt('scheduled_time', today.toISOString());
      }

      const { data, error } = await query
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
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
        .update({ status: 'checked_in' })
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

  const getStatusBadge = (status: string) => {
    const variants = {
      'booked': { variant: 'outline' as const, label: 'Booked' },
      'checked_in': { variant: 'default' as const, label: 'Checked In' },
      'in_progress': { variant: 'secondary' as const, label: 'In Progress' },
      'completed': { variant: 'secondary' as const, label: 'Completed' },
      'cancelled': { variant: 'destructive' as const, label: 'Cancelled' },
      'no_show': { variant: 'destructive' as const, label: 'No Show' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.booked;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
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
          <h2 className="text-xl font-semibold mb-2">Error Loading Appointments</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchAppointments} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Appointments</h1>
        </div>
        
        {(profile?.role === 'dentist' || profile?.role === 'clinic_admin') && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {appointments.length === 0 ? (
            <Card className="text-center p-8">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Appointments</h2>
              <p className="text-muted-foreground">
                {activeTab === 'today' && "No appointments scheduled for today."}
                {activeTab === 'upcoming' && "No upcoming appointments scheduled."}
                {activeTab === 'past' && "No past appointments found."}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => {
                const dateTime = formatDateTime(appointment.scheduled_time);
                return (
                  <Card key={appointment.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Appointment
                        </div>
                        {getStatusBadge(appointment.status)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {dateTime.date} at {dateTime.time}
                        </span>
                        {appointment.duration_minutes && (
                          <span className="text-sm text-muted-foreground">
                            {appointment.duration_minutes} min
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Participant Info */}
                        <div className="flex items-center gap-4">
                          {profile?.role !== 'patient' && appointment.patients?.full_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Patient: {appointment.patients.full_name}
                            </span>
                          )}
                          {appointment.profiles?.full_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Dr. {appointment.profiles.full_name}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {appointment.booking_type && (
                              <Badge variant="outline">{appointment.booking_type}</Badge>
                            )}
                          </div>
                          
                          {profile?.role === 'patient' && appointment.status === 'booked' && activeTab !== 'past' && (
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

                        {/* Notes */}
                        {appointment.notes && (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          </div>
                        )}

                        {/* QR Code */}
                        {showQR === appointment.id && (
                          <div className="flex flex-col items-center p-4 bg-background border rounded-md">
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
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}