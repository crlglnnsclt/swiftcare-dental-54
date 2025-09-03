import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  Search,
  User,
  Stethoscope,
  ClipboardList,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface QueueItem {
  id: string;
  patient_name: string;
  service_type: string;
  appointment_date: string;
  queue_position: number;
  priority: string;
  status: string;
  check_in_time?: string;
  is_checked_in: boolean;
  forms_completed: boolean;
  can_start_treatment: boolean;
}

interface TaskNotification {
  id: string;
  type: 'form_response' | 'incomplete_profile' | 'overdue_payment';
  title: string;
  description: string;
  patient_name?: string;
  created_at: string;
  priority: 'high' | 'medium' | 'low';
}

interface AppointmentFormData {
  patient_type: 'existing' | 'new';
  patient_id?: string;
  patient_name?: string;
  patient_email?: string;
  patient_password?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  service_type: string;
  dentist_id?: string;
  appointment_date: string;
}

export function StaffDashboard() {
  const { profile } = useAuth();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [taskNotifications, setTaskNotifications] = useState<TaskNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormData>({
    patient_type: 'existing',
    service_type: '',
    appointment_date: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchQueueItems(),
        fetchTaskNotifications(),
        fetchPatients(),
        fetchDentists()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueItems = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(full_name)
        `)
        .eq('is_checked_in', true)
        .gte('appointment_date', today)
        .lte('appointment_date', today + 'T23:59:59')
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('queue_position');

      if (error) throw error;

      const formattedQueue = (data || []).map(item => ({
        ...item,
        patient_name: item.patient?.full_name || 'Unknown Patient'
      }));

      setQueueItems(formattedQueue);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchTaskNotifications = async () => {
    try {
      // Fetch pending form responses
      const { data: formResponses, error: formError } = await supabase
        .from('patient_form_responses')
        .select(`
          *,
          patient:profiles!patient_form_responses_patient_id_fkey(full_name)
        `)
        .eq('verification_status', 'pending')
        .order('submitted_at', { ascending: false });

      if (formError) throw formError;

      const tasks: TaskNotification[] = [];

      // Add form response tasks
      formResponses?.forEach((response: any) => {
        tasks.push({
          id: `form-${response.id}`,
          type: 'form_response',
          title: 'Form Response Pending',
          description: `New form submission from ${response.patient?.full_name || 'Unknown Patient'}`,
          patient_name: response.patient?.full_name,
          created_at: response.submitted_at,
          priority: 'medium'
        });
      });

      setTaskNotifications(tasks);
    } catch (error) {
      console.error('Error fetching task notifications:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'patient')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDentists = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'dentist')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setDentists(data || []);
    } catch (error) {
      console.error('Error fetching dentists:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus,
          actual_start_time: newStatus === 'in_treatment' ? new Date().toISOString() : undefined,
          actual_end_time: newStatus === 'completed' ? new Date().toISOString() : undefined
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success(`Appointment status updated to ${newStatus}`);
      fetchQueueItems();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const createAppointment = async () => {
    try {
      let patientId = appointmentForm.patient_id;

      // If creating new patient, create user first
      if (appointmentForm.patient_type === 'new') {
        if (!appointmentForm.patient_email || !appointmentForm.patient_password) {
          toast.error('Email and password are required for new patients');
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: appointmentForm.patient_email,
          password: appointmentForm.patient_password,
          options: {
            data: {
              full_name: `${appointmentForm.first_name} ${appointmentForm.last_name}`,
              role: 'patient'
            }
          }
        });

        if (authError) throw authError;

        // The user profile will be created automatically via the trigger
        // We need to fetch the profile ID
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', appointmentForm.patient_email)
          .single();

        if (profileError) throw profileError;
        patientId = profileData.id;
      }

      // Create appointment
      const appointmentData = {
        patient_id: patientId,
        dentist_id: appointmentForm.dentist_id || null,
        service_type: appointmentForm.service_type,
        appointment_date: appointmentForm.appointment_date,
        status: 'scheduled',
        priority: 'normal',
        branch_id: profile?.branch_id
      };

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData);

      if (appointmentError) throw appointmentError;

      toast.success('Appointment created successfully');
      setIsAppointmentModalOpen(false);
      setAppointmentForm({
        patient_type: 'existing',
        service_type: '',
        appointment_date: ''
      });
      fetchQueueItems();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'checked_in': return 'secondary';
      case 'in_treatment': return 'default';
      case 'ready': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'vip': return 'destructive';
      case 'medium': return 'default';
      case 'low':
      case 'normal': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Loading staff dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
          <p className="text-muted-foreground">Queue management and patient operations</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsAppointmentModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Appointment
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Patient Portal
          </Button>
        </div>
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Queue Management</TabsTrigger>
          <TabsTrigger value="tasks">
            Task Notifications
            {taskNotifications.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                {taskNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Today's Queue ({queueItems.length})
              </CardTitle>
              <CardDescription>
                Manage patient check-ins and appointment flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {queueItems.map((item) => (
                <Card key={item.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                          <span className="text-sm font-bold text-primary">#{item.queue_position}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.patient_name}</p>
                          <p className="text-sm text-muted-foreground">{item.service_type}</p>
                          <p className="text-xs text-muted-foreground">
                            Check-in: {item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Badge variant={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!item.forms_completed && (
                            <div title="Forms incomplete">
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                            </div>
                          )}
                          {!item.can_start_treatment && (
                            <div title="Cannot start treatment">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            </div>
                          )}
                          {item.forms_completed && item.can_start_treatment && (
                            <div title="Ready for treatment">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant={item.status === 'in_treatment' ? 'outline' : 'default'}
                            onClick={() => updateAppointmentStatus(
                              item.id, 
                              item.status === 'in_treatment' ? 'completed' : 'in_treatment'
                            )}
                            disabled={!item.can_start_treatment}
                          >
                            {item.status === 'in_treatment' ? 'Complete' : 'Start Treatment'}
                          </Button>
                          
                          <Select onValueChange={(status) => updateAppointmentStatus(item.id, status)}>
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checked_in">Checked In</SelectItem>
                              <SelectItem value="in_treatment">In Treatment</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="no-show">No Show</SelectItem>
                              <SelectItem value="unable_to_proceed">Unable to Proceed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {queueItems.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No patients in queue today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Task Notifications
              </CardTitle>
              <CardDescription>
                Items requiring staff attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {taskNotifications.map((task) => (
                <Card key={task.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(task.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {taskNotifications.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">All tasks completed!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Appointment Modal */}
      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
            <DialogDescription>
              Schedule an appointment for existing or new patient
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Patient Type</Label>
              <Select 
                value={appointmentForm.patient_type} 
                onValueChange={(value: 'existing' | 'new') => 
                  setAppointmentForm(prev => ({ ...prev, patient_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">Existing Patient</SelectItem>
                  <SelectItem value="new">New Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {appointmentForm.patient_type === 'existing' ? (
              <div className="space-y-4">
                <Label>Search Patient</Label>
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => {
                        setAppointmentForm(prev => ({ ...prev, patient_id: patient.id }));
                        setSearchTerm(patient.full_name);
                      }}
                      className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    >
                      <p className="font-medium">{patient.full_name}</p>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={appointmentForm.first_name || ''}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={appointmentForm.last_name || ''}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={appointmentForm.patient_email || ''}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, patient_email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={appointmentForm.patient_password || ''}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, patient_password: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Input
                  id="serviceType"
                  value={appointmentForm.service_type}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, service_type: e.target.value }))}
                  placeholder="e.g., Cleaning, Consultation"
                />
              </div>
              <div>
                <Label htmlFor="dentist">Preferred Dentist</Label>
                <Select
                  value={appointmentForm.dentist_id}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, dentist_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dentist" />
                  </SelectTrigger>
                  <SelectContent>
                    {dentists.map((dentist) => (
                      <SelectItem key={dentist.id} value={dentist.id}>
                        {dentist.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="appointmentDate">Appointment Date & Time</Label>
              <Input
                id="appointmentDate"
                type="datetime-local"
                value={appointmentForm.appointment_date}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointment_date: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsAppointmentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={createAppointment}>
                Create Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}