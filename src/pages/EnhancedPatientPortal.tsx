
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  QrCode,
  Calendar,
  FileText,
  DollarSign,
  Bell,
  User,
  Clock,
  CheckCircle,
  Activity,
  Download,
  Eye,
  MapPin,
  Phone
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
  queue_position?: number;
  estimated_wait?: number;
  dentist: {
    full_name: string;
  };
}

interface TreatmentHistory {
  id: string;
  procedure_name: string;
  treatment_date: string;
  dentist_name: string;
  notes?: string;
  cost: number;
  tooth_number?: string;
}

interface BillingRecord {
  id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: string;
  due_date: string;
  created_at: string;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const EnhancedPatientPortal = () => {
  const [view, setView] = useState('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentHistory[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);

  const { profile, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.role === 'patient') {
      fetchPatientData();
      
      // Set up real-time updates for queue position
      const interval = setInterval(fetchQueueStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [user, profile]);

  const fetchPatientData = async () => {
    try {
      await Promise.all([
        fetchAppointments(),
        fetchTreatmentHistory(),
        fetchBillingRecords(),
        fetchNotifications(),
        fetchQueueStatus()
      ]);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_time,
          status,
          appointment_type,
          reason_for_visit,
          users!dentist_id(
            full_name
          )
        `)
        .eq('patient_id', user?.id)
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time')
        .limit(5);

      if (error) throw error;
      
      const formattedAppointments = (data || []).map(apt => ({
        ...apt,
        dentist: apt.users
      }));
      
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchTreatmentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('treatment_history')
        .select('*')
        .eq('patient_id', user?.id)
        .order('treatment_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTreatmentHistory(data || []);
    } catch (error) {
      console.error('Error fetching treatment history:', error);
      // Mock data for demo
      setTreatmentHistory([
        {
          id: '1',
          procedure_name: 'Dental Cleaning',
          treatment_date: '2024-01-15',
          dentist_name: 'Dr. Sarah Johnson',
          notes: 'Routine cleaning completed. Good oral hygiene.',
          cost: 180,
          tooth_number: 'All'
        },
        {
          id: '2',
          procedure_name: 'Root Canal',
          treatment_date: '2023-11-20',
          dentist_name: 'Dr. Michael Chen',
          notes: 'Root canal treatment on molar. Follow-up in 2 weeks.',
          cost: 850,
          tooth_number: '14'
        }
      ]);
    }
  };

  const fetchBillingRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('billing')
        .select('*')
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setBillingRecords(data || []);
    } catch (error) {
      console.error('Error fetching billing records:', error);
      // Mock data for demo
      setBillingRecords([
        {
          id: '1',
          invoice_number: 'INV-2024-001',
          total_amount: 850,
          paid_amount: 0,
          balance_due: 850,
          status: 'pending',
          due_date: '2024-02-15',
          created_at: '2024-01-15'
        }
      ]);
    }
  };

  const fetchNotifications = async () => {
    // Mock notifications - in real app, fetch from database
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'Appointment Reminder',
        message: 'Your appointment with Dr. Johnson is tomorrow at 2:30 PM.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'success',
        title: 'Treatment Completed',
        message: 'Your root canal treatment has been completed successfully.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const fetchQueueStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('status, scheduled_time')
        .eq('patient_id', user?.id)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`)
        .single();

      if (error || !data) return;

      if (data.status === 'checked_in') {
        // Mock queue position calculation
        const position = Math.floor(Math.random() * 5) + 1;
        setQueuePosition(position);
        setIsCheckedIn(true);
      } else {
        setIsCheckedIn(false);
        setQueuePosition(null);
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const handleQRCheckIn = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayAppointment, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('patient_id', user?.id)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`)
        .single();

      if (error || !todayAppointment) {
        toast({
          title: "No Appointment Found",
          description: "You don't have an appointment scheduled for today.",
          variant: "destructive"
        });
        return;
      }

      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'checked_in',
          checked_in_at: new Date().toISOString()
        })
        .eq('id', todayAppointment.id);

      if (updateError) throw updateError;

      setIsCheckedIn(true);
      setQueuePosition(3); // Mock position
      
      toast({
        title: "Successfully Checked In",
        description: "You have been added to the queue. You are #3 in line.",
      });
      
      setShowQRDialog(false);
      fetchPatientData();
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Check-In Failed",
        description: "Unable to check in at this time. Please see reception.",
        variant: "destructive"
      });
    }
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checked_in': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBillingStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Your dental health portal and appointment manager
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
            <DialogTrigger asChild>
              <Button>
                <QrCode className="w-4 h-4 mr-2" />
                QR Check-In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR Check-In</DialogTitle>
              </DialogHeader>
              <div className="text-center space-y-4">
                <div className="mx-auto w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
                <p className="text-muted-foreground">
                  Scan this QR code at the clinic or click the button below to check in for your appointment.
                </p>
                <Button onClick={handleQRCheckIn} className="w-full">
                  Check In Now
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Notifications {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
          </Button>
        </div>
      </div>

      {/* Queue Status Alert */}
      {isCheckedIn && queuePosition && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>You are checked in!</strong> You are #{queuePosition} in the queue. 
            Estimated wait time: {queuePosition * 15} minutes.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Treatment Records</p>
                <p className="text-2xl font-bold">{treatmentHistory.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold">
                  ${billingRecords.reduce((sum, record) => sum + record.balance_due, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
                <p className="text-2xl font-bold">{unreadNotifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="history">Treatment History</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(appointment.scheduled_time).toLocaleDateString()} at{' '}
                        {new Date(appointment.scheduled_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.appointment_type} with Dr. {appointment.dentist?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.reason_for_visit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {appointment.status === 'scheduled' && (
                        <Button size="sm" variant="outline">
                          <Calendar className="w-4 h-4 mr-2" />
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {appointments.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                    <Button className="mt-2">
                      Book New Appointment
                    </Button>
                  </div>
                )}
              </div>
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
                {treatmentHistory.map((treatment) => (
                  <div
                    key={treatment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{treatment.procedure_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(treatment.treatment_date).toLocaleDateString()} - {treatment.dentist_name}
                      </p>
                      {treatment.tooth_number && (
                        <p className="text-xs text-muted-foreground">
                          Tooth #{treatment.tooth_number}
                        </p>
                      )}
                      {treatment.notes && (
                        <p className="text-sm mt-2">{treatment.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${treatment.cost.toFixed(2)}</p>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Invoice #{record.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(record.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(record.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Total: ${record.total_amount.toFixed(2)}</p>
                        <p className="font-medium">Balance: ${record.balance_due.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getBillingStatusColor(record.status)}>
                          {record.status.toUpperCase()}
                        </Badge>
                        {record.balance_due > 0 && (
                          <Button size="sm">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6 mb-2" />
                    Treatment Consents
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Download className="w-6 h-6 mb-2" />
                    Care Instructions
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6 mb-2" />
                    Insurance Forms
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6 mb-2" />
                    Medical History
                  </Button>
                </div>
                
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    All your signed documents and forms are stored securely here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
                
                {notifications.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-gray-600">(555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-gray-600">123 Dental Street, San Francisco, CA 94102</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPatientPortal;
