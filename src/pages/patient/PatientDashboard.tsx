import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  FileText, 
  CreditCard,
  Bell,
  Heart,
  Activity,
  Plus,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [healthSummary, setHealthSummary] = useState({
    lastVisit: null,
    nextAppointment: null,
    treatmentPlan: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPatientData();
    }
  }, [user]);

  const fetchPatientData = async () => {
    try {
      // Get patient record first
      const { data: patientData } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientData) {
        // Fetch upcoming appointments
        const { data: appointmentData } = await supabase
          .from('appointments')
          .select(`
            *,
            users!dentist_id(full_name)
          `)
          .eq('patient_id', patientData.id)
          .gte('scheduled_time', new Date().toISOString())
          .order('scheduled_time')
          .limit(3);

        setAppointments(appointmentData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Book Appointment', href: '/patient/appointments', icon: Calendar, color: 'bg-blue-500' },
    { label: 'View Records', href: '/patient/records', icon: FileText, color: 'bg-emerald-500' },
    { label: 'Pay Bills', href: '/patient/billing', icon: CreditCard, color: 'bg-purple-500' },
    { label: 'Queue Status', href: '/patient/queue', icon: Clock, color: 'bg-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-muted-foreground mt-2">Your dental health dashboard</p>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-200">
            <Heart className="w-4 h-4 mr-1" />
            Healthy
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="glass-card hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Appointments
                </CardTitle>
                <Link to="/patient/appointments">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading appointments...</div>
                ) : appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-medical-gradient rounded-full flex items-center justify-center text-white">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {appointment.users?.full_name || 'Dr. Smith'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.scheduled_time).toLocaleDateString()} at{' '}
                              {new Date(appointment.scheduled_time).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                    <Link to="/patient/appointments">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Health Summary & Reminders */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Health Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Last Visit</p>
                  <p className="text-sm text-muted-foreground">March 15, 2024</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Next Cleaning Due</p>
                  <p className="text-sm text-muted-foreground">June 15, 2024</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Treatment Status</p>
                  <Badge variant="outline" className="text-emerald-600">
                    On Track
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm font-medium">Cleaning Reminder</p>
                  <p className="text-xs text-muted-foreground">Due in 2 weeks</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <p className="text-sm font-medium">Outstanding Balance</p>
                  <p className="text-xs text-muted-foreground">$125.00 pending</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}