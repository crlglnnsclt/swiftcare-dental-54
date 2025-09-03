import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  User,
  Bell,
  MapPin,
  Phone
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
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
}

export function PatientDashboard() {
  const { profile } = useAuth();
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData();
    }
  }, [profile?.id]);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchPendingTasks(),
        fetchUpcomingAppointments(),
        fetchNotifications(),
        checkProfileCompleteness()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTasks = async () => {
    try {
      // Check for incomplete forms
      const { data: incompleteForms, error: formsError } = await supabase
        .from('appointments')
        .select(`
          id,
          forms_completed,
        appointment_date,
        form_procedures!inner(
          digital_forms!inner(name, id)
        )
        `)
        .eq('patient_id', profile?.id)
        .eq('forms_completed', false)
        .gte('appointment_date', new Date().toISOString());

      if (formsError) throw formsError;

      // Check for overdue payments
      const { data: overduePayments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, created_at')
        .eq('patient_id', profile?.id)
        .eq('payment_status', 'pending');

      if (paymentsError) throw paymentsError;

      const tasks: PendingTask[] = [];

      // Add form completion tasks
      incompleteForms?.forEach((appointment: any) => {
        tasks.push({
          id: `form-${appointment.id}`,
          type: 'form',
          title: 'Complete Required Forms',
          description: `Complete forms for your ${new Date(appointment.appointment_date).toLocaleDateString()} appointment`,
          priority: 'high',
          due_date: appointment.appointment_date
        });
      });

      // Add payment tasks
      overduePayments?.forEach((result: any) => {
        tasks.push({
          id: `payment-${result.id}`,
          type: 'payment',
          title: 'Payment Required',
          description: `Payment required to view results: ${result.title}`,
          priority: 'medium'
        });
      });

      setPendingTasks(tasks);
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const { data, error }: { data: any, error: any } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', profile?.id)
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time')
        .limit(3);

      if (error) throw error;

      const formattedAppointments = (data || []).map(apt => ({
        ...apt,
        dentist_name: 'Dr. Smith' // Mock dentist name
      }));

      setUpcomingAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock notifications since table doesn't exist
      const mockNotifications = [
        {
          id: '1',
          title: 'Appointment Reminder',
          message: 'Your appointment is tomorrow at 2:00 PM',
          type: 'reminder',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const checkProfileCompleteness = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', profile?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // Check if essential fields are filled
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

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'form': return <FileText className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'profile': return <User className="w-4 h-4" />;
      case 'appointment': return <Calendar className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        return 'default';
      case 'checked_in':
        return 'secondary';
      case 'in_treatment':
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
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Patient'}!
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
        {/* Pending Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Pending Tasks
            </CardTitle>
            <CardDescription>
              {pendingTasks.length} tasks require your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTaskIcon(task.type)}
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      {task.due_date && (
                        <p className="text-xs text-orange-600">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Action
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">All tasks completed!</p>
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
                    Appointment
                  </p>
                  <p className="text-sm text-muted-foreground">
                    with {upcomingAppointments[0].dentist_name || 'Dr. TBD'}
                  </p>
                  <Badge variant={getStatusColor(upcomingAppointments[0].status)}>
                    {upcomingAppointments[0].status}
                  </Badge>
                  {upcomingAppointments[0].queue_position && (
                    <p className="text-sm font-medium text-primary">
                      Queue Position: #{upcomingAppointments[0].queue_position}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming appointments</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="space-y-1">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-muted-foreground">No new notifications</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Appointments */}
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
                        {appointment.dentist_name || 'Dr. TBD'}
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
                    {appointment.status === 'checked_in' && appointment.queue_position && (
                      <p className="flex items-center gap-2 text-primary font-medium">
                        <MapPin className="w-4 h-4" />
                        Queue Position: #{appointment.queue_position}
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
    </div>
  );
}