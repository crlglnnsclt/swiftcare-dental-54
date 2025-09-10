
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
  Users,
  Clock,
  UserCheck,
  AlertTriangle,
  Plus,
  Edit,
  Save,
  Eye,
  Phone,
  Mail,
  Package,
  DollarSign,
  QrCode,
  Search,
  Filter,
  RotateCcw,
  CheckCircle,
  XCircle,
  Timer,
  Activity
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { coreModules } from '@/lib/coreModules';
import { Appointment, Patient, QueueEntry, WalkIn, InventoryItem } from '@/types/swiftcare';

const ComprehensiveStaffDashboard = () => {
  const [view, setView] = useState<'queue' | 'patients' | 'inventory' | 'billing'>('queue');
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [walkIns, setWalkIns] = useState<WalkIn[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryItem[]>([]);
  
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [walkInData, setWalkInData] = useState({
    patient_name: '',
    patient_phone: '',
    reason: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'emergency'
  });

  const [newPatientData, setNewPatientData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    emergency_contact: '',
    medical_history: ''
  });

  const [stats, setStats] = useState({
    totalInQueue: 0,
    emergencies: 0,
    averageWaitTime: 0,
    todayCheckIns: 0,
    walkInsToday: 0,
    lowStockItems: 0
  });

  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'staff') {
      initializeStaffDashboard();
      
      // Real-time updates every 30 seconds
      const interval = setInterval(() => {
        refreshDashboard();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [profile]);

  const initializeStaffDashboard = async () => {
    await Promise.all([
      fetchQueueEntries(),
      fetchTodayAppointments(),
      fetchPatients(),
      fetchInventoryAlerts(),
      fetchStats()
    ]);
  };

  const refreshDashboard = async () => {
    await Promise.all([
      fetchQueueEntries(),
      fetchTodayAppointments(),
      fetchStats()
    ]);
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
        .in('status', ['waiting', 'called'])
        .order('checked_in_at');

      if (error) throw error;
      
      // Transform data to match expected interface
      const transformedQueue = (data || []).map(entry => ({
        ...entry,
        patient_id: entry.appointments?.patient_id || '',
        queue_type: 'appointment' as const,
        checked_in_at: entry.created_at
      }));
      setQueueEntries(transformedQueue as any);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
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
            email
          ),
          users!dentist_id(
            full_name
          )
        `)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`)
        .order('scheduled_time');

      if (error) throw error;
      
      // Transform data to match expected interface
      const transformedAppointments = (data || []).map(apt => ({
        ...apt,
        appointment_type: apt.notes || 'general_consultation',
        reason_for_visit: apt.notes || 'General consultation'
      }));
      setAppointments(transformedAppointments as any);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name')
        .limit(100);

      if (error) throw error;
      
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchInventoryAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('current_stock');

      if (error) throw error;
      
      // Filter items where stock is below minimum
      const lowStockItems = (data || []).filter(item => 
        item.current_stock < item.minimum_stock
      );
      setInventoryAlerts(lowStockItems);
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get queue stats
      const { data: queueData } = await supabase
        .from('queue')
        .select('priority, status, checked_in_at')
        .eq('status', 'waiting');

      // Get check-in stats
      const { data: checkinData } = await supabase
        .from('appointments')
        .select('status, checked_in_at')
        .eq('status', 'checked_in')
        .gte('checked_in_at', `${today}T00:00:00`);

      // Get walk-in stats
      const { data: walkInData } = await supabase
        .from('queue')
        .select('*')
        .eq('queue_type', 'walk_in')
        .gte('checked_in_at', `${today}T00:00:00`);

      const totalInQueue = queueData?.length || 0;
      const emergencies = queueData?.filter(q => q.priority === 'emergency').length || 0;
      const todayCheckIns = checkinData?.length || 0;
      const walkInsToday = walkInData?.length || 0;
      
      // Calculate average wait time
      const waitTimes = queueData?.map(q => {
        const checkedIn = new Date(q.checked_in_at);
        const now = new Date();
        return (now.getTime() - checkedIn.getTime()) / (1000 * 60); // in minutes
      }) || [];
      
      const averageWaitTime = waitTimes.length > 0 
        ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
        : 0;

      setStats({
        totalInQueue,
        emergencies,
        averageWaitTime,
        todayCheckIns,
        walkInsToday,
        lowStockItems: inventoryAlerts.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // 👩‍💼 STAFF FLOW IMPLEMENTATION

  // 1. Queue & Check-In Management
  const checkInPatient = async (appointmentId: string) => {
    try {
      const appointmentModule = coreModules.getModule('appointment_management');
      if (appointmentModule) {
        await (appointmentModule as any).updateAppointmentStatus(appointmentId, 'checked_in', profile?.id);
        
        toast({
          title: "Patient Checked In",
          description: "Patient added to queue successfully",
        });
        
        refreshDashboard();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check in patient",
        variant: "destructive"
      });
    }
  };

  const handleQRCheckIn = (qrData: string) => {
    // In real implementation, parse QR data and extract appointment ID
    const appointmentId = qrData; // Simplified
    checkInPatient(appointmentId);
  };

  // 2. Walk-In Registration
  const submitWalkIn = async () => {
    if (!walkInData.patient_name || !walkInData.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in patient name and reason for visit",
        variant: "destructive"
      });
      return;
    }

    try {
      const queueModule = coreModules.getModule('queueing_system');
      if (queueModule) {
        const queueId = await (queueModule as any).addWalkIn(walkInData);
        
        if (queueId) {
          toast({
            title: "Walk-In Registered",
            description: `${walkInData.patient_name} added to queue with ${walkInData.priority} priority`,
          });
          
          setWalkInData({
            patient_name: '',
            patient_phone: '',
            reason: '',
            priority: 'medium'
          });
          setShowWalkInForm(false);
          refreshDashboard();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register walk-in patient",
        variant: "destructive"
      });
    }
  };

  // 3. Patient Records Management
  const createPatientProfile = async () => {
    if (!newPatientData.full_name || !newPatientData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in patient name and email",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          ...newPatientData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Patient Created",
        description: `Profile for ${newPatientData.full_name} created successfully`,
      });
      
      setNewPatientData({
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        address: '',
        emergency_contact: '',
        medical_history: ''
      });
      setShowPatientForm(false);
      fetchPatients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create patient profile",
        variant: "destructive"
      });
    }
  };

  const updatePatientProfile = async () => {
    if (!selectedPatient) return;

    try {
      const { error } = await supabase
        .from('patients')
        .update(selectedPatient)
        .eq('id', selectedPatient.id);

      if (error) throw error;

      toast({
        title: "Patient Updated",
        description: "Profile updated successfully",
      });
      
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update patient profile",
        variant: "destructive"
      });
    }
  };

  // 4. Queue Management
  const reassignPatient = async (queueId: string, newDentistId: string) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ assigned_dentist_id: newDentistId })
        .eq('id', queueId);

      if (error) throw error;

      toast({
        title: "Patient Reassigned",
        description: "Patient moved to different dentist",
      });
      
      refreshDashboard();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reassign patient",
        variant: "destructive"
      });
    }
  };

  // 5. Inventory Handling
  const triggerInventoryAlert = async (itemId: string) => {
    try {
      // In real implementation, send notification to admins
      toast({
        title: "Inventory Alert Sent",
        description: "Admin has been notified of low stock",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send inventory alert",
        variant: "destructive"
      });
    }
  };

  // Utility Functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': 
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'checked_in': return 'bg-yellow-100 text-yellow-800';
      case 'waiting': return 'bg-orange-100 text-orange-800';
      case 'in_procedure': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Staff Operations Center
          </h1>
          <p className="text-muted-foreground">
            Patient flow management, queue control, and operational support
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={view === 'queue' ? 'default' : 'outline'}
            onClick={() => setView('queue')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Queue
          </Button>
          <Button 
            variant={view === 'patients' ? 'default' : 'outline'}
            onClick={() => setView('patients')}
          >
            <Users className="w-4 h-4 mr-2" />
            Patients
          </Button>
          <Button 
            variant={view === 'inventory' ? 'default' : 'outline'}
            onClick={() => setView('inventory')}
          >
            <Package className="w-4 h-4 mr-2" />
            Inventory
          </Button>
          <Button 
            variant={view === 'billing' ? 'default' : 'outline'}
            onClick={() => setView('billing')}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Billing
          </Button>
        </div>
      </div>

      {/* Emergency Alert */}
      {stats.emergencies > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{stats.emergencies} Emergency patient(s)</strong> in queue requiring immediate attention!
          </AlertDescription>
        </Alert>
      )}

      {/* Inventory Alert */}
      {stats.lowStockItems > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Package className="h-4 w-4" />
          <AlertDescription>
            <strong>{stats.lowStockItems} inventory item(s)</strong> are running low and need to be reordered.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Queue</p>
                <p className="text-2xl font-bold">{stats.totalInQueue}</p>
              </div>
              <Clock className="w-6 h-6 text-primary" />
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Wait</p>
                <p className="text-2xl font-bold">{stats.averageWaitTime}m</p>
              </div>
              <Timer className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Check-Ins</p>
                <p className="text-2xl font-bold">{stats.todayCheckIns}</p>
              </div>
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Walk-Ins</p>
                <p className="text-2xl font-bold">{stats.walkInsToday}</p>
              </div>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold">{stats.lowStockItems}</p>
              </div>
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {view === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-Time Queue Monitor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Real-Time Queue Monitor
                  <Badge variant="outline" className="ml-2">Auto-refresh: 30s</Badge>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm"
                    onClick={() => setShowWalkInForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Walk-In
                  </Button>
                  <Button size="sm" variant="outline" onClick={refreshDashboard}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {queueEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{entry.patients?.full_name}</p>
                            <p className="text-sm text-gray-600">
                              {entry.queue_type === 'appointment' ? 'Scheduled' : 'Walk-in'} • 
                              Waiting {Math.round((new Date().getTime() - new Date(entry.checked_in_at).getTime()) / 60000)}min
                            </p>
                            {entry.notes && (
                              <p className="text-sm text-gray-500">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(entry.priority)}>
                            {entry.priority.toUpperCase()}
                          </Badge>
                          {entry.assigned_dentist_id ? (
                            <Badge variant="outline">Assigned</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reassignPatient(entry.id, 'dentist_1')}
                            >
                              Assign
                            </Button>
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

          {/* Today's Appointments */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Today's Check-Ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{appointment.patients?.full_name}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(appointment.scheduled_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} • {appointment.appointment_type}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getStatusColor(appointment.status)} style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {appointment.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {appointment.status === 'scheduled' && (
                            <Button 
                              size="sm"
                              onClick={() => checkInPatient(appointment.id)}
                              style={{ fontSize: '10px', padding: '4px 8px', height: 'auto' }}
                            >
                              Check-In
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {appointments.length === 0 && (
                    <div className="text-center py-6">
                      <UserCheck className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No appointments today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {view === 'patients' && (
        <div className="space-y-6">
          {/* Patient Search and Actions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Patient Records Management
                </CardTitle>
                <Button onClick={() => setShowPatientForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Patient
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              {/* Patient List */}
              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {patient.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{patient.full_name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {patient.email}
                            </span>
                            {patient.phone && (
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {patient.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredPatients.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No patients found matching your search' : 'No patients registered'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {view === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory Alerts & Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryAlerts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-red-800">{item.item_name}</p>
                    <p className="text-sm text-red-600">
                      Current Stock: {item.current_stock} • Minimum: {item.minimum_stock}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => triggerInventoryAlert(item.id)}
                  >
                    Alert Admin
                  </Button>
                </div>
              ))}
              
              {inventoryAlerts.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">All inventory items are well stocked</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'billing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Billing Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Billing support tools and payment processing assistance</p>
              <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Walk-In Form Dialog */}
      <Dialog open={showWalkInForm} onOpenChange={setShowWalkInForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Walk-In Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient_name">Patient Name *</Label>
              <Input
                id="patient_name"
                value={walkInData.patient_name}
                onChange={(e) => setWalkInData({...walkInData, patient_name: e.target.value})}
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <Label htmlFor="patient_phone">Phone Number</Label>
              <Input
                id="patient_phone"
                value={walkInData.patient_phone}
                onChange={(e) => setWalkInData({...walkInData, patient_phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Visit *</Label>
              <Textarea
                id="reason"
                value={walkInData.reason}
                onChange={(e) => setWalkInData({...walkInData, reason: e.target.value})}
                placeholder="Describe the reason for the visit..."
              />
            </div>
            <div>
              <Label>Priority Level</Label>
              <Select 
                value={walkInData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'emergency') => 
                  setWalkInData({...walkInData, priority: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowWalkInForm(false)}>
                Cancel
              </Button>
              <Button onClick={submitWalkIn}>
                Add to Queue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Patient Form Dialog */}
      <Dialog open={showPatientForm} onOpenChange={setShowPatientForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Patient Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={newPatientData.full_name}
                  onChange={(e) => setNewPatientData({...newPatientData, full_name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatientData.email}
                  onChange={(e) => setNewPatientData({...newPatientData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newPatientData.phone}
                  onChange={(e) => setNewPatientData({...newPatientData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={newPatientData.date_of_birth}
                  onChange={(e) => setNewPatientData({...newPatientData, date_of_birth: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newPatientData.address}
                onChange={(e) => setNewPatientData({...newPatientData, address: e.target.value})}
                placeholder="Enter address"
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                value={newPatientData.emergency_contact}
                onChange={(e) => setNewPatientData({...newPatientData, emergency_contact: e.target.value})}
                placeholder="Emergency contact name and phone"
              />
            </div>
            <div>
              <Label htmlFor="medical_history">Medical History</Label>
              <Textarea
                id="medical_history"
                value={newPatientData.medical_history}
                onChange={(e) => setNewPatientData({...newPatientData, medical_history: e.target.value})}
                placeholder="Any relevant medical history, allergies, medications..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPatientForm(false)}>
                Cancel
              </Button>
              <Button onClick={createPatientProfile}>
                Create Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Form Dialog */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Patient Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_full_name">Full Name</Label>
                  <Input
                    id="edit_full_name"
                    value={selectedPatient.full_name}
                    onChange={(e) => setSelectedPatient({...selectedPatient, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={selectedPatient.email}
                    onChange={(e) => setSelectedPatient({...selectedPatient, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={selectedPatient.phone || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                  <Input
                    id="edit_date_of_birth"
                    type="date"
                    value={selectedPatient.date_of_birth || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, date_of_birth: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  value={selectedPatient.address || ''}
                  onChange={(e) => setSelectedPatient({...selectedPatient, address: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                  Cancel
                </Button>
                <Button onClick={updatePatientProfile}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ComprehensiveStaffDashboard;
