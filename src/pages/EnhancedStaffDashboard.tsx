
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
import { 
  UserCheck,
  Users,
  Clock,
  Search,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Package,
  DollarSign,
  Phone,
  Calendar,
  Activity
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  dentist: {
    full_name: string;
  };
}

interface WalkIn {
  id?: string;
  patient_name: string;
  phone?: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  arrived_at: string;
}

interface InventoryItem {
  id: string;
  item_name: string;
  current_stock: number;
  minimum_stock: number;
  unit_cost: number;
  category: string;
}

const EnhancedStaffDashboard = () => {
  const [view, setView] = useState('queue');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [walkIns, setWalkIns] = useState<WalkIn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newWalkIn, setNewWalkIn] = useState<WalkIn>({
    patient_name: '',
    phone: '',
    reason: '',
    priority: 'medium',
    arrived_at: new Date().toISOString()
  });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showWalkInDialog, setShowWalkInDialog] = useState(false);
  const [stats, setStats] = useState({
    waitingPatients: 0,
    checkedInToday: 0,
    walkInsToday: 0,
    lowStockItems: 0
  });

  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayAppointments();
    fetchStats();
    fetchInventoryAlerts();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchTodayAppointments();
      fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
          ),
          users!dentist_id(
            full_name
          )
        `)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`)
        .order('scheduled_time');

      if (error) throw error;
      
      const formattedAppointments = (data || []).map(apt => ({
        ...apt,
        patient: apt.patients,
        dentist: apt.users
      }));
      
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('appointments')
        .select('status')
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`);

      const waiting = data?.filter(apt => apt.status === 'checked_in').length || 0;
      const checkedIn = data?.filter(apt => ['checked_in', 'in_progress', 'completed'].includes(apt.status)).length || 0;

      setStats(prev => ({
        ...prev,
        waitingPatients: waiting,
        checkedInToday: checkedIn,
        walkInsToday: walkIns.length
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchInventoryAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .lte('current_stock', supabase.raw('minimum_stock'));

      if (error) throw error;
      
      setInventoryItems(data || []);
      setStats(prev => ({
        ...prev,
        lowStockItems: data?.length || 0
      }));
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
    }
  };

  const handleCheckIn = async (appointmentId: string, patientName: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'checked_in',
          checked_in_at: new Date().toISOString()
        })
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      toast({
        title: "Patient Checked In",
        description: `${patientName} has been successfully checked in`,
      });
      
      fetchTodayAppointments();
      fetchStats();
    } catch (error) {
      console.error('Error checking in patient:', error);
      toast({
        title: "Error",
        description: "Failed to check in patient",
        variant: "destructive"
      });
    }
  };

  const handleWalkInRegistration = () => {
    if (!newWalkIn.patient_name || !newWalkIn.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in patient name and reason for visit",
        variant: "destructive"
      });
      return;
    }

    const walkInWithId = {
      ...newWalkIn,
      id: Date.now().toString(),
      arrived_at: new Date().toISOString()
    };

    setWalkIns(prev => [...prev, walkInWithId]);
    setShowWalkInDialog(false);
    setNewWalkIn({
      patient_name: '',
      phone: '',
      reason: '',
      priority: 'medium',
      arrived_at: new Date().toISOString()
    });

    toast({
      title: "Walk-In Registered",
      description: `${walkInWithId.patient_name} added to the queue`,
    });

    fetchStats();
  };

  const reassignPatient = async (appointmentId: string, newDentistId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ dentist_id: newDentistId })
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      toast({
        title: "Patient Reassigned",
        description: "Patient has been reassigned to another dentist",
      });
      
      fetchTodayAppointments();
    } catch (error) {
      console.error('Error reassigning patient:', error);
      toast({
        title: "Error",
        description: "Failed to reassign patient",
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason_for_visit.toLowerCase().includes(searchTerm.toLowerCase())
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
            Manage patient flow, check-ins, and clinic operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={view === 'queue' ? 'default' : 'outline'}
            onClick={() => setView('queue')}
          >
            <Users className="w-4 h-4 mr-2" />
            Queue
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
            Billing Support
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-sm font-medium text-gray-600">Checked In Today</p>
                <p className="text-2xl font-bold">{stats.checkedInToday}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Walk-Ins Today</p>
                <p className="text-2xl font-bold">{stats.walkInsToday}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold">{stats.lowStockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {view === 'queue' && (
        <div className="space-y-6">
          {/* Search and Actions */}
          <div className="flex justify-between items-center">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Dialog open={showWalkInDialog} onOpenChange={setShowWalkInDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Register Walk-In
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register Walk-In Patient</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patient_name">Patient Name *</Label>
                    <Input
                      id="patient_name"
                      value={newWalkIn.patient_name}
                      onChange={(e) => setNewWalkIn({...newWalkIn, patient_name: e.target.value})}
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newWalkIn.phone}
                      onChange={(e) => setNewWalkIn({...newWalkIn, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Visit *</Label>
                    <Textarea
                      id="reason"
                      value={newWalkIn.reason}
                      onChange={(e) => setNewWalkIn({...newWalkIn, reason: e.target.value})}
                      placeholder="Describe the reason for visit..."
                    />
                  </div>
                  <div>
                    <Label>Priority Level</Label>
                    <Select 
                      value={newWalkIn.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high' | 'emergency') => 
                        setNewWalkIn({...newWalkIn, priority: value})
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
                    <Button variant="outline" onClick={() => setShowWalkInDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleWalkInRegistration}>
                      Register Patient
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="appointments">
            <TabsList>
              <TabsTrigger value="appointments">Scheduled Appointments</TabsTrigger>
              <TabsTrigger value="walk-ins">Walk-Ins ({walkIns.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
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
                              {appointment.reason_for_visit}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Dr. {appointment.dentist?.full_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(appointment.id, appointment.patient.full_name)}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Check In
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast({title: "Reassignment", description: "Reassignment feature available"})}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="walk-ins">
              <Card>
                <CardHeader>
                  <CardTitle>Walk-In Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {walkIns.map((walkIn) => (
                      <div
                        key={walkIn.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{walkIn.patient_name}</p>
                          <p className="text-sm text-muted-foreground">{walkIn.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            Arrived: {new Date(walkIn.arrived_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(walkIn.priority)}>
                            {walkIn.priority.toUpperCase()}
                          </Badge>
                          <Button size="sm">
                            Assign to Dentist
                          </Button>
                        </div>
                      </div>
                    ))}
                    {walkIns.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No walk-in patients today
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {view === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {item.current_stock} | Minimum: {item.minimum_stock}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">Low Stock</Badge>
                    <Button size="sm" variant="outline">
                      Order More
                    </Button>
                  </div>
                </div>
              ))}
              {inventoryItems.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
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
            <CardTitle>Billing Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center">
                  <DollarSign className="w-6 h-6 mb-2" />
                  Process Payment
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <FileText className="w-6 h-6 mb-2" />
                  Generate Invoice
                </Button>
              </div>
              
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Billing support tools help staff assist with payment processing and invoicing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedStaffDashboard;
