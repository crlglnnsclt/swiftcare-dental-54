import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useFeatureToggle } from '@/hooks/useFeatureToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  User,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingTask {
  id: string;
  type: 'form' | 'payment' | 'profile' | 'appointment';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
}

interface Appointment {
  id: string;
  scheduled_time: string;
  status: string;
  queue_position?: number;
  dentist_name?: string;
  notes?: string;
}

export function PatientDashboard() {
  const { user, profile } = useAuth();
  const featureToggle = useFeatureToggle();
  const isFeatureEnabled = 'isFeatureEnabled' in featureToggle ? featureToggle.isFeatureEnabled : () => false;
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchPatientData(),
        fetchUpcomingAppointments(),
        checkProfileCompleteness()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientData = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setPatientData(data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      if (!patientData && !user?.id) return;

      let patientId = patientData?.id;
      
      if (!patientId) {
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user?.id)
          .maybeSingle();
        
        patientId = patient?.id;
      }

      if (!patientId) {
        console.log('No patient record found');
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          users!dentist_id(full_name)
        `)
        .eq('patient_id', patientId)
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time')
        .limit(3);

      if (error) throw error;

      const formattedAppointments = (data || []).map(apt => ({
        ...apt,
        dentist_name: apt.users?.full_name || 'Dr. TBD'
      }));

      setUpcomingAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const checkProfileCompleteness = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      const hasEssentialInfo = data && 
        data.full_name && 
        data.date_of_birth && 
        data.contact_number && 
        data.emergency_contact;

      setProfileComplete(!!hasEssentialInfo);
    } catch (error) {
      console.error('Error checking profile completeness:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'booked':
        return 'default';
      case 'checked_in':
        return 'secondary';
      case 'in_progress':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {patientData?.full_name?.split(' ')[0] || profile?.full_name?.split(' ')[0] || 'Patient'}!
          </h1>
          <p className="text-muted-foreground">Here's your health overview</p>
        </div>
        <Badge variant={profileComplete ? 'default' : 'destructive'} className="px-3 py-1">
          Profile {profileComplete ? 'Complete' : 'Incomplete'}
        </Badge>
      </div>

      {/* Profile Completion Alert */}
      {!profileComplete && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800">Complete Your Profile</h4>
                <p className="text-sm text-orange-700">
                  Please complete your profile to ensure the best care and appointment experience.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Complete Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Patient Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patientData ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Full Name</p>
                  <p className="text-muted-foreground">{patientData.full_name}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{patientData.email}</p>
                </div>
                <div>
                  <p className="font-medium">Contact Number</p>
                  <p className="text-muted-foreground">{patientData.contact_number}</p>
                </div>
                <div>
                  <p className="font-medium">Date of Birth</p>
                  <p className="text-muted-foreground">
                    {patientData.date_of_birth ? new Date(patientData.date_of_birth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No patient profile found. Please complete your registration.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-2">
                  <p className="font-semibold">
                    {new Date(upcomingAppointments[0].scheduled_time).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(upcomingAppointments[0].scheduled_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    with {upcomingAppointments[0].dentist_name}
                  </p>
                  <Badge variant={getStatusColor(upcomingAppointments[0].status)}>
                    {upcomingAppointments[0].status}
                  </Badge>
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming appointments</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {isFeatureEnabled('appointment_booking') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Appointment</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.dentist_name}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(appointment.scheduled_time).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(appointment.scheduled_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                      {appointment.notes && (
                        <p className="text-xs text-muted-foreground">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                    <div className="pt-2">
                      {appointment.status !== 'checked_in' && (
                        <Button size="sm" className="w-full">
                          Check In
                        </Button>
                      )}
                      {appointment.status === 'checked_in' && (
                        <Button size="sm" variant="outline" className="w-full" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Checked In
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {upcomingAppointments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming appointments scheduled</p>
                <Button className="mt-4" variant="outline">
                  Schedule Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}