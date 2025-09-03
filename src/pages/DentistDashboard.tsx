import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock,
  User,
  FileText,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Phone,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function DentistDashboard() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    inProgress: 0,
    completed: 0,
    waitingPatients: 0
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dentalCharts, setDentalCharts] = useState<any[]>([]);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.enhanced_role === 'dentist') {
      fetchDentistStats();
      fetchTodayAppointments();
      fetchRecentDentalCharts();
    }
  }, [profile]);

  const fetchDentistStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's appointments for this dentist
      const { data: todayAppts } = await supabase
        .from('appointments')
        .select('*')
        .eq('dentist_id', profile?.id)
        .gte('appointment_date', today)
        .lt('appointment_date', `${today}T23:59:59`);

      const inProgress = todayAppts?.filter(apt => apt.status === 'in-treatment').length || 0;
      const completed = todayAppts?.filter(apt => apt.status === 'completed').length || 0;
      const waiting = todayAppts?.filter(apt => apt.is_checked_in && apt.status === 'scheduled').length || 0;

      setStats({
        todayAppointments: todayAppts?.length || 0,
        inProgress,
        completed,
        waitingPatients: waiting
      });
    } catch (error) {
      console.error('Error fetching dentist stats:', error);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_patient_id_fkey(full_name, phone, email)
        `)
        .eq('dentist_id', profile?.id)
        .gte('appointment_date', today)
        .lt('appointment_date', `${today}T23:59:59`)
        .order('appointment_date', { ascending: true });

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchRecentDentalCharts = async () => {
    try {
      const { data } = await supabase
        .from('dental_charts')
        .select(`
          *,
          profiles!dental_charts_patient_id_fkey(full_name)
        `)
        .eq('dentist_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setDentalCharts(data || []);
    } catch (error) {
      console.error('Error fetching dental charts:', error);
    }
  };

  const handleStartTreatment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'in-treatment',
          actual_start_time: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Treatment started successfully",
      });

      fetchDentistStats();
      fetchTodayAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start treatment",
        variant: "destructive"
      });
    }
  };

  const handleCompleteTreatment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          actual_end_time: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Treatment completed successfully",
      });

      fetchDentistStats();
      fetchTodayAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete treatment",
        variant: "destructive"
      });
    }
  };

  if (!profile || profile.enhanced_role !== 'dentist') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Dentist Access Required</h2>
            <p className="text-muted-foreground">
              This section is only accessible to dentists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 page-container">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dentist Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. {profile?.full_name}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="btn-3d">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </Button>
          <Button className="medical-gradient text-white btn-3d">
            <FileText className="w-4 h-4 mr-2" />
            Add Chart Entry
          </Button>
        </div>
      </div>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today's Schedule</TabsTrigger>
          <TabsTrigger value="patients">My Patients</TabsTrigger>
          <TabsTrigger value="charts">Dental Charts</TabsTrigger>
          <TabsTrigger value="notes">Treatment Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card card-3d card-stagger-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-medical-blue">{stats.todayAppointments}</div>
                <p className="text-xs text-muted-foreground">Scheduled for today</p>
              </CardContent>
            </Card>

            <Card className="glass-card card-3d card-stagger-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Treatment</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card className="glass-card card-3d card-stagger-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">Finished today</p>
              </CardContent>
            </Card>

            <Card className="glass-card card-3d card-stagger-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waiting Patients</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-professional-navy">{stats.waitingPatients}</div>
                <p className="text-xs text-muted-foreground">Ready for treatment</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Appointments */}
          <Card className="glass-card card-3d interactive-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 float-gentle" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No appointments scheduled for today</p>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 smooth-transition interactive-3d">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center text-white font-semibold float-gentle">
                          {appointment.profiles?.full_name ? 
                            appointment.profiles.full_name.split(' ').map((n: string) => n[0]).join('') : 
                            'P'
                          }
                        </div>
                        <div>
                          <p className="font-medium">{appointment.profiles?.full_name || 'Patient'}</p>
                          <p className="text-sm text-muted-foreground">{appointment.service_type}</p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(appointment.appointment_date).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={`${
                            appointment.status === 'completed' ? 'bg-success/10 text-success' :
                            appointment.status === 'in-treatment' ? 'bg-warning/10 text-warning' :
                            appointment.is_checked_in ? 'bg-medical-blue/10 text-medical-blue' :
                            'bg-muted/10 text-muted-foreground'
                          }`}
                        >
                          {appointment.status === 'completed' ? 'Completed' :
                           appointment.status === 'in-treatment' ? 'In Progress' :
                           appointment.is_checked_in ? 'Ready' : 'Scheduled'}
                        </Badge>
                        <div className="flex gap-2">
                          {appointment.is_checked_in && appointment.status === 'scheduled' && (
                            <Button 
                              size="sm" 
                              className="medical-gradient text-white btn-3d"
                              onClick={() => handleStartTreatment(appointment.id)}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Start
                            </Button>
                          )}
                          {appointment.status === 'in-treatment' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="btn-3d"
                              onClick={() => handleCompleteTreatment(appointment.id)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle>My Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Patient Management</h3>
                <p className="text-muted-foreground mb-6">
                  View and manage your assigned patients and their treatment history.
                </p>
                <Button className="medical-gradient text-white">
                  <User className="w-4 h-4 mr-2" />
                  View All Patients
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          {/* Recent Dental Charts */}
          <Card className="glass-card card-3d interactive-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 float-gentle" />
                Recent Dental Charts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dentalCharts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No recent dental chart entries</p>
                ) : (
                  dentalCharts.map((chart) => (
                    <div key={chart.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 smooth-transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-dental-mint/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-dental-mint" />
                        </div>
                        <div>
                          <p className="font-medium">{chart.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Tooth #{chart.tooth_number} - {chart.treatment_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(chart.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className={`${
                          chart.status === 'completed' ? 'bg-success/10 text-success' :
                          chart.status === 'in-progress' ? 'bg-warning/10 text-warning' :
                          'bg-muted/10 text-muted-foreground'
                        }`}
                      >
                        {chart.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle>Treatment Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Treatment Documentation</h3>
                <p className="text-muted-foreground mb-6">
                  Create and manage detailed treatment notes and patient records.
                </p>
                <Button className="medical-gradient text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Treatment Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}