
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
  DragHandleHorizontal,
  AlertTriangle,
  Timer,
  Signature,
  Package,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { coreModules } from '@/lib/coreModules';
import PostProcedureForm from '@/components/PostProcedureForm';
import { Appointment, Patient, TreatmentPlan, AppointmentStatus } from '@/types/swiftcare';

interface Appointment {
  id: string;
  scheduled_time: string;
  status: string;
  appointment_type: string;
  reason_for_visit: string;
  patient: {
    full_name: string;
    phone?: string;
    email?: string;
  };
}

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  dental_chart?: any;
  treatment_history?: any[];
  pending_treatments?: any[];
}

interface TreatmentPlan {
  id?: string;
  patient_id: string;
  procedures: TreatmentProcedure[];
  total_cost: number;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  consent_signed: boolean;
}

interface TreatmentProcedure {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: number;
  tooth_number?: string;
}

const EnhancedDentistDashboard = () => {
  const [view, setView] = useState('schedule');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentTreatmentPlan, setCurrentTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [procedureInProgress, setProcedureInProgress] = useState(false);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    inProgress: 0,
    completed: 0,
    waitingPatients: 0
  });

  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'dentist') {
      fetchTodayAppointments();
      fetchStats();
    }
  }, [profile]);

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_time,
          status,
          appointment_type,
          reason_for_visit,
          patients!inner(
            full_name,
            phone,
            email
          )
        `)
        .eq('dentist_id', profile?.id)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`)
        .order('scheduled_time');

      if (error) throw error;
      
      const formattedAppointments = (data || []).map(apt => ({
        ...apt,
        patient: apt.patients
      }));
      
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('appointments')
        .select('status')
        .eq('dentist_id', profile?.id)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`);

      const inProgress = data?.filter(apt => apt.status === 'in_progress').length || 0;
      const completed = data?.filter(apt => apt.status === 'completed').length || 0;
      const waiting = data?.filter(apt => apt.status === 'checked_in').length || 0;

      setStats({
        todayAppointments: data?.length || 0,
        inProgress,
        completed,
        waitingPatients: waiting
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const selectPatientFromQueue = async (appointmentId: string) => {
    try {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) return;

      // Fetch full patient record
      const { data: patientData, error } = await supabase
        .from('patients')
        .select(`
          *,
          dental_charts(*),
          treatment_plans(*),
          treatment_history(*)
        `)
        .eq('full_name', appointment.patient.full_name)
        .single();

      if (error) throw error;

      setSelectedPatient({
        ...patientData,
        dental_chart: patientData.dental_charts?.[0] || null,
        treatment_history: patientData.treatment_history || [],
        pending_treatments: patientData.treatment_plans?.filter(tp => !tp.completed) || []
      });

      // Update appointment status to in_progress
      await supabase
        .from('appointments')
        .update({ status: 'in_progress' })
        .eq('id', appointmentId);

      toast({
        title: "Patient Selected",
        description: `${appointment.patient.full_name} loaded with full medical record`,
      });
      
      setView('treatment');
      fetchTodayAppointments();
      fetchStats();
    } catch (error) {
      console.error('Error selecting patient:', error);
      toast({
        title: "Error",
        description: "Failed to load patient record",
        variant: "destructive"
      });
    }
  };

  const createTreatmentPlan = () => {
    setCurrentTreatmentPlan({
      patient_id: selectedPatient?.id || '',
      procedures: [],
      total_cost: 0,
      description: '',
      risk_level: 'low',
      consent_signed: false
    });
  };

  const addProcedureToTreatmentPlan = (procedure: TreatmentProcedure) => {
    if (!currentTreatmentPlan) return;
    
    const updatedPlan = {
      ...currentTreatmentPlan,
      procedures: [...currentTreatmentPlan.procedures, procedure],
      total_cost: currentTreatmentPlan.total_cost + procedure.cost
    };
    
    setCurrentTreatmentPlan(updatedPlan);
  };

  const saveTreatmentPlan = async () => {
    if (!currentTreatmentPlan || !selectedPatient) return;

    try {
      const { error } = await supabase
        .from('treatment_plans')
        .insert({
          patient_id: selectedPatient.id,
          procedures: currentTreatmentPlan.procedures,
          total_cost: currentTreatmentPlan.total_cost,
          description: currentTreatmentPlan.description,
          risk_level: currentTreatmentPlan.risk_level,
          dentist_id: profile?.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Treatment Plan Saved",
        description: "Treatment plan created successfully",
      });

      setCurrentTreatmentPlan(null);
    } catch (error) {
      console.error('Error saving treatment plan:', error);
      toast({
        title: "Error",
        description: "Failed to save treatment plan",
        variant: "destructive"
      });
    }
  };

  const completeAppointment = async (appointmentId: string) => {
    try {
      // Update appointment status
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Appointment Completed",
        description: "Patient appointment marked as completed",
      });

      fetchTodayAppointments();
      fetchStats();
      setSelectedPatient(null);
      setView('schedule');
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast({
        title: "Error",
        description: "Failed to complete appointment",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checked_in': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock dental chart component
  const InteractiveDentalChart = ({ patient }: { patient: Patient }) => (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Dental Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-2 mb-4">
          {Array.from({ length: 32 }, (_, i) => (
            <div
              key={i}
              className="w-8 h-8 border-2 border-gray-300 rounded cursor-pointer hover:bg-blue-100"
              title={`Tooth ${i + 1}`}
            >
              <span className="text-xs">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Click on teeth to add procedures, view history, or update status.
          </p>
          <Button size="sm" onClick={() => toast({ title: "Chart Updated", description: "Dental chart changes saved" })}>
            Update Chart
          </Button>
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
            variant={view === 'treatment' ? 'default' : 'outline'}
            onClick={() => setView('treatment')}
            disabled={!selectedPatient}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Treatment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Waiting Patients</p>
                <p className="text-2xl font-bold">{stats.waitingPatients}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {view === 'schedule' && (
        <div className="space-y-6">
          {/* Schedule & Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Schedule & Patient Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium">
                        {new Date(appointment.scheduled_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patient.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.appointment_type} - {appointment.reason_for_visit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {appointment.status === 'checked_in' && (
                        <Button
                          size="sm"
                          onClick={() => selectPatientFromQueue(appointment.id)}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Select Patient
                        </Button>
                      )}
                      {appointment.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeAppointment(appointment.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {appointments.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {view === 'treatment' && selectedPatient && (
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {selectedPatient.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
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
                  <Badge className="bg-purple-100 text-purple-800">In Treatment</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="chart" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chart">Dental Chart</TabsTrigger>
              <TabsTrigger value="treatment-plan">Treatment Planning</TabsTrigger>
              <TabsTrigger value="history">Treatment History</TabsTrigger>
              <TabsTrigger value="notes">Progress Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <InteractiveDentalChart patient={selectedPatient} />
            </TabsContent>

            <TabsContent value="treatment-plan" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Treatment Planning</CardTitle>
                  <Button onClick={createTreatmentPlan}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Treatment Plan
                  </Button>
                </CardHeader>
                <CardContent>
                  {currentTreatmentPlan ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description">Treatment Description</Label>
                        <Textarea
                          id="description"
                          value={currentTreatmentPlan.description}
                          onChange={(e) => setCurrentTreatmentPlan({
                            ...currentTreatmentPlan,
                            description: e.target.value
                          })}
                          placeholder="Describe the overall treatment plan..."
                        />
                      </div>
                      
                      <div>
                        <Label>Risk Level</Label>
                        <Select 
                          value={currentTreatmentPlan.risk_level}
                          onValueChange={(value: 'low' | 'medium' | 'high') => 
                            setCurrentTreatmentPlan({
                              ...currentTreatmentPlan,
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

                      <div className="space-y-2">
                        <Label>Procedures</Label>
                        {currentTreatmentPlan.procedures.map((procedure, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span>{procedure.name}</span>
                            <span>${procedure.cost.toFixed(2)}</span>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => addProcedureToTreatmentPlan({
                            id: Date.now().toString(),
                            name: 'Root Canal',
                            description: 'Root canal treatment',
                            cost: 850,
                            duration: 90
                          })}
                        >
                          Add Root Canal ($850)
                        </Button>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-semibold">Total Cost: ${currentTreatmentPlan.total_cost.toFixed(2)}</span>
                        <div className="space-x-2">
                          <Button variant="outline" onClick={() => setCurrentTreatmentPlan(null)}>
                            Cancel
                          </Button>
                          <Button onClick={saveTreatmentPlan}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Plan
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No active treatment plan</p>
                      <p className="text-sm text-muted-foreground">Click "New Treatment Plan" to create one</p>
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
                    {selectedPatient.treatment_history?.length > 0 ? (
                      selectedPatient.treatment_history.map((treatment, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{treatment.procedure_name || 'General Treatment'}</p>
                              <p className="text-sm text-muted-foreground">{treatment.notes || 'No notes available'}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(treatment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No previous treatments recorded</p>
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
                      placeholder="Add progress notes for this patient..."
                      rows={4}
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
    </div>
  );
};

export default EnhancedDentistDashboard;
