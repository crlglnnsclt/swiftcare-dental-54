
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock,
  User,
  FileText,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Save,
  Eye,
  Users,
  Activity,
  GripHorizontal,
  AlertTriangle,
  Timer,
  Signature,
  Package,
  DollarSign,
  PlayCircle,
  PauseCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { coreModules } from '@/lib/coreModules';
import PostProcedureForm from '@/components/PostProcedureForm';
import { Appointment, Patient, TreatmentPlan, AppointmentStatus, QueueEntry } from '@/types/swiftcare';

const ComprehensiveDentistDashboard = () => {
  const [view, setView] = useState<'schedule' | 'patient' | 'treatment'>('schedule');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [showPostProcedureForm, setShowPostProcedureForm] = useState(false);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [timeBlocks, setTimeBlocks] = useState<string[]>([]);
  
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waitingInQueue: 0,
    inProcedure: 0,
    completed: 0,
    emergencies: 0
  });

  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'dentist') {
      initializeDentistDashboard();
      
      // Real-time updates every 30 seconds
      const interval = setInterval(() => {
        refreshDashboard();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [profile]);

  const initializeDentistDashboard = async () => {
    await Promise.all([
      fetchTodayAppointments(),
      fetchQueueEntries(),
      fetchStats(),
      generateTimeBlocks()
    ]);
  };

  const refreshDashboard = async () => {
    await Promise.all([
      fetchTodayAppointments(),
      fetchQueueEntries(),
      fetchStats()
    ]);
  };

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(
            id,
            full_name,
            phone,
            email,
            medical_history
          )
        `)
        .eq('dentist_id', profile?.id)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`)
        .order('scheduled_time');

      if (error) throw error;
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    }
  };

  const fetchQueueEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select(`
          *,
          patients(
            id,
            full_name,
            phone,
            email
          ),
          appointments(
            id,
            scheduled_time,
            appointment_type,
            reason_for_visit
          )
        `)
        .or(`assigned_dentist_id.eq.${profile?.id},assigned_dentist_id.is.null`)
        .eq('status', 'waiting')
        .order('checked_in_at');

      if (error) throw error;
      
      setQueueEntries(data || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('status, appointment_type')
        .eq('dentist_id', profile?.id)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`);

      const { data: queueData } = await supabase
        .from('queue')
        .select('priority, status')
        .or(`assigned_dentist_id.eq.${profile?.id},assigned_dentist_id.is.null`)
        .eq('status', 'waiting');

      const todayAppointments = appointmentData?.length || 0;
      const inProcedure = appointmentData?.filter(apt => apt.status === 'in_procedure').length || 0;
      const completed = appointmentData?.filter(apt => apt.status === 'completed').length || 0;
      const waitingInQueue = queueData?.length || 0;
      const emergencies = queueData?.filter(q => q.priority === 'emergency').length || 0;

      setStats({
        todayAppointments,
        waitingInQueue,
        inProcedure,
        completed,
        emergencies
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateTimeBlocks = () => {
    const blocks: string[] = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        blocks.push(time);
      }
    }
    setTimeBlocks(blocks);
  };

  // 🦷 DENTIST FLOW IMPLEMENTATION

  // 1. Dashboard / Schedule View with Drag & Drop
  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'booked');
      toast({
        title: "Appointment Confirmed",
        description: "Patient has been notified",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm appointment",
        variant: "destructive"
      });
    }
  };

  const handleDragStart = (appointment: Appointment) => {
    setDraggedAppointment(appointment);
  };

  const handleDrop = async (newTimeSlot: string) => {
    if (!draggedAppointment) return;
    
    try {
      const [hours, minutes] = newTimeSlot.split(':');
      const today = new Date().toISOString().split('T')[0];
      const newDateTime = `${today}T${hours}:${minutes}:00`;

      const { error } = await supabase
        .from('appointments')
        .update({ scheduled_time: newDateTime })
        .eq('id', draggedAppointment.id);

      if (error) throw error;

      toast({
        title: "Appointment Rescheduled",
        description: `Moved to ${newTimeSlot}`,
      });
      
      fetchTodayAppointments();
      setDraggedAppointment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive"
      });
    }
  };

  const blockTimeSlot = async (timeSlot: string) => {
    try {
      const [hours, minutes] = timeSlot.split(':');
      const today = new Date().toISOString().split('T')[0];
      const blockDateTime = `${today}T${hours}:${minutes}:00`;

      await supabase
        .from('appointments')
        .insert({
          dentist_id: profile?.id,
          scheduled_time: blockDateTime,
          status: 'blocked',
          appointment_type: 'blocked_time',
          reason_for_visit: 'Time blocked by dentist'
        });

      toast({
        title: "Time Blocked",
        description: `${timeSlot} is now blocked`,
      });
      
      fetchTodayAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block time slot",
        variant: "destructive"
      });
    }
  };

  // 2. Patient Selection & Intake
  const selectPatientFromQueue = async (queueEntry: QueueEntry) => {
    try {
      // Get full patient record
      const { data: patientData, error } = await supabase
        .from('patients')
        .select(`
          *,
          dental_charts(*),
          treatment_plans(*),
          treatment_history(*),
          appointments(*)
        `)
        .eq('id', queueEntry.patient_id)
        .single();

      if (error) throw error;

      setSelectedPatient(patientData);
      
      // Update queue status
      await supabase
        .from('queue')
        .update({
          status: 'in_progress',
          assigned_dentist_id: profile?.id
        })
        .eq('id', queueEntry.id);

      // Update appointment status if linked
      if (queueEntry.appointment_id) {
        await updateAppointmentStatus(queueEntry.appointment_id, 'in_procedure');
        
        const appointment = appointments.find(apt => apt.id === queueEntry.appointment_id);
        if (appointment) {
          setCurrentAppointment(appointment);
        }
      }

      toast({
        title: "Patient Selected",
        description: `${patientData.full_name} loaded with complete medical record`,
      });
      
      setView('patient');
      refreshDashboard();
    } catch (error) {
      console.error('Error selecting patient:', error);
      toast({
        title: "Error",
        description: "Failed to load patient record",
        variant: "destructive"
      });
    }
  };

  // 3. Treatment Planning
  const createTreatmentPlan = () => {
    if (!selectedPatient) return;
    
    setTreatmentPlan({
      id: '',
      patient_id: selectedPatient.id,
      dentist_id: profile?.id || '',
      procedures: [],
      total_cost: 0,
      description: '',
      patient_friendly_description: '',
      risk_level: 'low',
      consent_signed: false,
      created_at: new Date().toISOString()
    });
  };

  const addProcedureToTreatmentPlan = (procedure: any) => {
    if (!treatmentPlan) return;
    
    setTreatmentPlan({
      ...treatmentPlan,
      procedures: [...treatmentPlan.procedures, procedure],
      total_cost: treatmentPlan.total_cost + procedure.cost
    });
  };

  const saveTreatmentPlan = async () => {
    if (!treatmentPlan) return;

    try {
      const { data, error } = await supabase
        .from('treatment_plans')
        .insert(treatmentPlan)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Treatment Plan Created",
        description: "Ready for patient consent",
      });
      
      setTreatmentPlan({ ...data, consent_signed: false });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save treatment plan",
        variant: "destructive"
      });
    }
  };

  const signTreatmentConsent = async () => {
    if (!treatmentPlan) return;

    try {
      const { error } = await supabase
        .from('treatment_plans')
        .update({
          consent_signed: true,
          signed_at: new Date().toISOString(),
          patient_signature: 'digital_signature_patient',
          dentist_signature: 'digital_signature_dentist'
        })
        .eq('id', treatmentPlan.id);

      if (error) throw error;

      setTreatmentPlan({ ...treatmentPlan, consent_signed: true });
      
      toast({
        title: "Consent Signed",
        description: "Treatment can now begin",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign consent",
        variant: "destructive"
      });
    }
  };

  // 4. Start Procedure
  const startProcedure = async () => {
    if (!currentAppointment || !selectedPatient) return;

    try {
      await updateAppointmentStatus(currentAppointment.id, 'in_procedure');
      
      toast({
        title: "Procedure Started",
        description: "Patient is now in treatment",
      });
      
      setView('treatment');
      refreshDashboard();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start procedure",
        variant: "destructive"
      });
    }
  };

  // 5. Complete Procedure
  const completeProcedure = () => {
    if (!currentAppointment || !selectedPatient) return;
    
    setShowPostProcedureForm(true);
  };

  const handlePostProcedureComplete = async () => {
    if (!currentAppointment) return;
    
    try {
      await updateAppointmentStatus(currentAppointment.id, 'completed');
      
      toast({
        title: "Procedure Completed",
        description: "All systems updated successfully",
      });
      
      // Reset states
      setSelectedPatient(null);
      setCurrentAppointment(null);
      setTreatmentPlan(null);
      setShowPostProcedureForm(false);
      setView('schedule');
      
      refreshDashboard();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete procedure",
        variant: "destructive"
      });
    }
  };

  // Utility Functions
  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
    const appointmentModule = coreModules.getModule('appointment_management');
    if (appointmentModule) {
      await (appointmentModule as any).updateAppointmentStatus(appointmentId, status, profile?.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': 
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'checked_in': return 'bg-yellow-100 text-yellow-800';
      case 'waiting': return 'bg-orange-100 text-orange-800';
      case 'in_procedure': return 'bg-purple-100 text-purple-800';
      case 'billing': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Interactive Dental Chart Component
  const InteractiveDentalChart = ({ patient }: { patient: Patient }) => (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Dental Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-1 mb-4">
          {Array.from({ length: 32 }, (_, i) => (
            <div
              key={i}
              className="w-8 h-8 border-2 border-gray-300 rounded cursor-pointer hover:bg-blue-100 flex items-center justify-center text-xs font-medium"
              title={`Tooth ${i + 1}`}
              onClick={() => toast({ 
                title: "Tooth Selected", 
                description: `Tooth ${i + 1} - Add procedures, notes, or view history` 
              })}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Click on teeth to add procedures, view history, or update status during treatment.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View History
            </Button>
            <Button size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Update Chart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dr. {profile?.full_name?.split(' ').pop()}'s Practice
          </h1>
          <p className="text-muted-foreground">
            Comprehensive patient care and treatment management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={view === 'schedule' ? 'default' : 'outline'}
            onClick={() => setView('schedule')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button 
            variant={view === 'patient' ? 'default' : 'outline'}
            onClick={() => setView('patient')}
            disabled={!selectedPatient}
          >
            <User className="w-4 h-4 mr-2" />
            Patient
          </Button>
          <Button 
            variant={view === 'treatment' ? 'default' : 'outline'}
            onClick={() => setView('treatment')}
            disabled={!currentAppointment}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Treatment
          </Button>
        </div>
      </div>

      {/* Emergency Alert */}
      {stats.emergencies > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{stats.emergencies} Emergency patient(s)</strong> waiting in queue. Immediate attention required.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Schedule</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Queue</p>
                <p className="text-2xl font-bold">{stats.waitingInQueue}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Procedure</p>
                <p className="text-2xl font-bold">{stats.inProcedure}</p>
              </div>
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emergencies</p>
                <p className="text-2xl font-bold text-red-600">{stats.emergencies}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {view === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Schedule - Drag & Drop Enabled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timeBlocks.map((timeSlot) => {
                    const appointment = appointments.find(apt => 
                      new Date(apt.scheduled_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }) === timeSlot
                    );

                    return (
                      <div
                        key={timeSlot}
                        className="flex items-center p-2 border rounded-lg hover:bg-gray-50 min-h-[60px]"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(timeSlot)}
                      >
                        <div className="w-16 text-sm font-medium text-gray-500">
                          {timeSlot}
                        </div>
                        
                        {appointment ? (
                          <div
                            className="flex-1 flex items-center justify-between p-2 bg-blue-50 rounded cursor-move"
                            draggable
                            onDragStart={() => handleDragStart(appointment)}
                          >
                            <div className="flex items-center space-x-3">
                              <GripHorizontal className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium">{appointment.patient?.full_name}</p>
                                <p className="text-sm text-gray-600">{appointment.appointment_type}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {appointment.status === 'scheduled' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleConfirmAppointment(appointment.id)}
                                >
                                  Confirm
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Available</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => blockTimeSlot(timeSlot)}
                            >
                              Block Time
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Queue */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Patient Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {queueEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => selectPatientFromQueue(entry)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{entry.patients?.full_name}</p>
                            <p className="text-sm text-gray-600">
                              {entry.queue_type === 'appointment' ? 'Scheduled' : 'Walk-in'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getPriorityColor(entry.priority)}>
                            {entry.priority.toUpperCase()}
                          </Badge>
                          {entry.estimated_wait_time && (
                            <span className="text-xs text-gray-500">
                              ~{entry.estimated_wait_time}min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {queueEntries.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No patients in queue</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {view === 'patient' && selectedPatient && (
        <div className="space-y-6">
          {/* Patient Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {selectedPatient.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedPatient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedPatient.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="bg-purple-100 text-purple-800">Selected for Treatment</Badge>
                </div>
                <div className="flex items-end">
                  <Button onClick={startProcedure} className="ml-auto">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Procedure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Details Tabs */}
          <Tabs defaultValue="chart" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chart">Dental Chart</TabsTrigger>
              <TabsTrigger value="treatment-plan">Treatment Planning</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="notes">Progress Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <InteractiveDentalChart patient={selectedPatient} />
            </TabsContent>

            <TabsContent value="treatment-plan" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Treatment Planning</CardTitle>
                  {!treatmentPlan && (
                    <Button onClick={createTreatmentPlan}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Treatment Plan
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {treatmentPlan ? (
                    <div className="space-y-6">
                      {/* Treatment Plan Form */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={treatmentPlan.description}
                            onChange={(e) => setTreatmentPlan({
                              ...treatmentPlan,
                              description: e.target.value
                            })}
                            placeholder="Technical description..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="patient-description">Patient-Friendly Description</Label>
                          <Textarea
                            id="patient-description"
                            value={treatmentPlan.patient_friendly_description}
                            onChange={(e) => setTreatmentPlan({
                              ...treatmentPlan,
                              patient_friendly_description: e.target.value
                            })}
                            placeholder="Easy-to-understand explanation for patient..."
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Risk Level</Label>
                        <Select 
                          value={treatmentPlan.risk_level}
                          onValueChange={(value: 'low' | 'medium' | 'high') => 
                            setTreatmentPlan({
                              ...treatmentPlan,
                              risk_level: value
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Risk</SelectItem>
                            <SelectItem value="medium">Medium Risk</SelectItem>
                            <SelectItem value="high">High Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Procedures */}
                      <div className="space-y-4">
                        <Label>Treatment Procedures</Label>
                        <div className="space-y-2">
                          {treatmentPlan.procedures.map((procedure, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{procedure.name}</span>
                                <p className="text-sm text-gray-600">{procedure.patient_friendly_description}</p>
                                {procedure.tooth_number && (
                                  <p className="text-xs text-gray-500">Tooth #{procedure.tooth_number}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${procedure.cost.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">{procedure.duration}min</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => addProcedureToTreatmentPlan({
                            id: Date.now().toString(),
                            name: 'Root Canal Treatment',
                            description: 'Endodontic treatment of infected tooth',
                            patient_friendly_description: 'Treatment to save your tooth by cleaning out infection',
                            cost: 850,
                            duration: 90,
                            category: 'endodontic'
                          })}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Root Canal Treatment
                        </Button>
                      </div>

                      {/* Total Cost */}
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <span className="font-semibold text-lg">Total Cost:</span>
                        <span className="font-bold text-xl text-blue-600">
                          ${treatmentPlan.total_cost.toFixed(2)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        {!treatmentPlan.consent_signed ? (
                          <div className="flex space-x-2">
                            <Button onClick={saveTreatmentPlan}>
                              <Save className="w-4 h-4 mr-2" />
                              Save Plan
                            </Button>
                            <Button onClick={signTreatmentConsent}>
                              <Signature className="w-4 h-4 mr-2" />
                              Get Patient Consent
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Consent Signed - Ready for Treatment</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No treatment plan created</p>
                      <p className="text-sm text-muted-foreground">Click "New Treatment Plan" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPatient.treatment_history && selectedPatient.treatment_history.length > 0 ? (
                      selectedPatient.treatment_history.map((treatment: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{treatment.procedure_name || 'General Treatment'}</p>
                              <p className="text-sm text-gray-600 mt-1">{treatment.notes || 'No notes available'}</p>
                              {treatment.items_used && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Items used: {treatment.items_used.map((item: any) => item.item_name).join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">${treatment.total_cost?.toFixed(2) || '0.00'}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(treatment.treatment_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">No previous treatments recorded</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add progress notes for this patient visit..."
                      rows={6}
                    />
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {view === 'treatment' && currentAppointment && selectedPatient && (
        <div className="space-y-6">
          {/* Treatment Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Treatment in Progress - {selectedPatient.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-purple-100 text-purple-800">
                    <Activity className="w-4 h-4 mr-2" />
                    IN PROCEDURE
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Started at: {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <Button onClick={completeProcedure} size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Procedure
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dental Chart */}
            <InteractiveDentalChart patient={selectedPatient} />

            {/* Treatment Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Procedure Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Document procedure steps, observations, complications, etc..."
                    rows={8}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline">
                      <Timer className="w-4 h-4 mr-2" />
                      Add Timestamp
                    </Button>
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Notes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Post-Procedure Form Dialog */}
      {showPostProcedureForm && currentAppointment && selectedPatient && (
        <PostProcedureForm
          appointmentId={currentAppointment.id}
          patientId={selectedPatient.id}
          patientName={selectedPatient.full_name}
          isOpen={showPostProcedureForm}
          onClose={() => setShowPostProcedureForm(false)}
          onSave={handlePostProcedureComplete}
        />
      )}
    </div>
  );
};

export default ComprehensiveDentistDashboard;
