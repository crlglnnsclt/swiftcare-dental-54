
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
  Phone,
  CreditCard,
  Stethoscope,
  AlertCircle,
  Info,
  Signature,
  History,
  Receipt
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { coreModules } from '@/lib/coreModules';
import { Appointment, PatientNotification, SignedDocument, TreatmentHistory } from '@/types/swiftcare';

const ComprehensivePatientPortal = () => {
  const [view, setView] = useState('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentHistory[]>([]);
  const [billingRecords, setBillingRecords] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [signedDocuments, setSignedDocuments] = useState<SignedDocument[]>([]);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<SignedDocument | null>(null);

  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    treatmentRecords: 0,
    outstandingBalance: 0,
    unreadNotifications: 0
  });

  const { profile, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.role === 'patient') {
      initializePatientPortal();
      
      // Real-time updates every 30 seconds for queue status
      const interval = setInterval(() => {
        fetchQueueStatus();
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, profile]);

  const initializePatientPortal = async () => {
    try {
      await Promise.all([
        fetchAppointments(),
        fetchPastAppointments(),
        fetchTreatmentHistory(),
        fetchBillingRecords(),
        fetchNotifications(),
        fetchSignedDocuments(),
        fetchQueueStatus(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error initializing patient portal:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          users!dentist_id(
            full_name
          )
        `)
        .eq('patient_id', user?.id)
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time')
        .limit(5);

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

  const fetchPastAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          users!dentist_id(
            full_name
          )
        `)
        .eq('patient_id', user?.id)
        .lt('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform data to match expected interface
      const transformedPastAppointments = (data || []).map(apt => ({
        ...apt,
        appointment_type: apt.notes || 'general_consultation',
        reason_for_visit: apt.notes || 'General consultation'
      }));
      setPastAppointments(transformedPastAppointments as any);
    } catch (error) {
      console.error('Error fetching past appointments:', error);
    }
  };

  const fetchTreatmentHistory = async () => {
    try {
      // Use mock data since treatment_history table doesn't exist
      console.log('Using mock treatment history data');
      const mockHistory: TreatmentHistory[] = [
        {
          id: '1',
          appointment_id: 'apt1',
          patient_id: user?.id || '',
          dentist_id: 'dentist1',
          procedures: [
            {
              id: '1',
              name: 'Dental Cleaning',
              description: 'Professional cleaning and polishing',
              patient_friendly_description: 'Deep cleaning to remove plaque and tartar',
              cost: 180,
              duration: 60,
              category: 'preventive'
            }
          ],
          items_used: [],
          total_cost: 180,
          amount_paid: 180,
          balance_due: 0,
          payment_mode: 'insurance',
          treatment_date: '2024-08-15T00:00:00',
          notes: 'Routine cleaning completed. Good oral hygiene maintained.',
          patient_signature: true,
          dentist_signature: true,
          created_at: '2024-08-15T00:00:00'
        },
        {
          id: '2',
          appointment_id: 'apt2',
          patient_id: user?.id || '',
          dentist_id: 'dentist1',
          procedures: [
            {
              id: '2',
              name: 'Root Canal Treatment',
              description: 'Endodontic therapy for infected tooth',
              patient_friendly_description: 'Treatment to save your tooth by removing infection',
              cost: 850,
              duration: 90,
              tooth_number: '14',
              category: 'endodontic'
            }
          ],
          items_used: [],
          total_cost: 850,
          amount_paid: 0,
          balance_due: 850,
          payment_mode: 'pending',
          treatment_date: '2024-07-20T00:00:00',
          notes: 'Root canal completed successfully. Follow-up in 2 weeks.',
          patient_signature: true,
          dentist_signature: true,
          created_at: '2024-07-20T00:00:00'
        }
      ];
      setTreatmentHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching treatment history:', error);
    }
  };

  const fetchBillingRecords = async () => {
    try {
      // Use mock data since billing table doesn't exist
      console.log('Using mock billing data');
      // Mock billing data for demonstration
      const mockBilling = [
        {
          id: '1',
          patient_id: user?.id,
          invoice_number: 'INV-2024-001',
          total_amount: 850,
          paid_amount: 0,
          balance_due: 850,
          status: 'pending',
          due_date: '2024-09-20',
          payment_method: 'pending',
          invoice_date: '2024-07-20',
          created_at: '2024-07-20'
        },
        {
          id: '2',
          patient_id: user?.id,
          invoice_number: 'INV-2024-002',
          total_amount: 180,
          paid_amount: 180,
          balance_due: 0,
          status: 'paid',
          due_date: '2024-08-30',
          payment_method: 'insurance',
          invoice_date: '2024-08-15',
          created_at: '2024-08-15'
        }
      ];
      setBillingRecords(mockBilling);
    } catch (error) {
      console.error('Error fetching billing records:', error);
    }
  };

  const fetchNotifications = async () => {
    // Mock notifications - dashboard only as specified
    const mockNotifications: PatientNotification[] = [
      {
        id: '1',
        patient_id: user?.id || '',
        type: 'queue_update',
        title: 'Queue Position Update',
        message: isCheckedIn && queuePosition 
          ? `You are #${queuePosition} in queue. Estimated wait: ${queuePosition * 15} minutes.`
          : 'Your appointment with Dr. Johnson is tomorrow at 2:30 PM.',
        read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        patient_id: user?.id || '',
        type: 'treatment_update',
        title: 'Treatment Completed',
        message: 'Your root canal treatment has been completed successfully. Please review your post-procedure instructions.',
        read: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        patient_id: user?.id || '',
        type: 'follow_up',
        title: 'Follow-Up Scheduled',
        message: 'Your follow-up appointment has been scheduled for September 20th at 3:00 PM.',
        read: false,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const fetchSignedDocuments = async () => {
    try {
      // Use mock data since signed_documents table doesn't exist
      console.log('Using mock signed documents data');
        // Mock documents for demonstration
        const mockDocuments: SignedDocument[] = [
          {
            id: '1',
            patient_id: user?.id || '',
            form_id: 'consent_1',
            form_data: {
              form_type: 'consent',
              procedure: 'Root Canal Treatment',
              date_signed: '2024-07-20'
            },
            patient_signature: 'digital_signature_patient',
            dentist_signature: 'digital_signature_dentist',
            signed_at: '2024-07-20T10:30:00',
            is_patient_visible: true,
            document_version: 1,
            audit_log: []
          },
          {
            id: '2',
            patient_id: user?.id || '',
            form_id: 'post_procedure_1',
            form_data: {
              form_type: 'post_procedure',
              procedure: 'Dental Cleaning',
              instructions: 'Brush twice daily, floss regularly'
            },
            patient_signature: 'digital_signature_patient',
            dentist_signature: 'digital_signature_dentist',
            signed_at: '2024-08-15T14:00:00',
            is_patient_visible: true,
            document_version: 1,
            audit_log: []
          }
        ];
        setSignedDocuments(mockDocuments);
    } catch (error) {
      console.error('Error fetching signed documents:', error);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('queue')
        .select('*, appointments(*)')
        .eq('status', 'waiting')
        .gte('created_at', `${today}T00:00:00`)
        .maybeSingle();

      if (error || !data) {
        setIsCheckedIn(false);
        setQueuePosition(null);
        return;
      }

      setIsCheckedIn(true);
      setQueuePosition(data.position || 1);
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const upcomingAppointments = appointments.length;
      const treatmentRecords = treatmentHistory.length;
      const outstandingBalance = billingRecords.reduce((sum, record) => sum + (record.balance_due || 0), 0);
      const unreadNotifications = notifications.filter(n => !n.read).length;

      setStats({
        upcomingAppointments,
        treatmentRecords,
        outstandingBalance,
        unreadNotifications
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // 🧑‍🤝‍🧑 PATIENT FLOW IMPLEMENTATION

  // 1. QR Check-In System
  const handleQRCheckIn = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Find today's appointment
      const todayAppointment = appointments.find(apt => 
        new Date(apt.scheduled_time).toISOString().split('T')[0] === today
      );

      if (!todayAppointment) {
        toast({
          title: "No Appointment Found",
          description: "You don't have an appointment scheduled for today.",
          variant: "destructive"
        });
        return;
      }

      // Update appointment status to checked_in
      const appointmentModule = coreModules.getModule('appointment_management');
      if (appointmentModule) {
        await (appointmentModule as any).updateAppointmentStatus(todayAppointment.id, 'checked_in', user?.id);
      }

      setIsCheckedIn(true);
      setQueuePosition(3); // Mock position
      
      // Add notification
      const newNotification: PatientNotification = {
        id: Date.now().toString(),
        patient_id: user?.id || '',
        type: 'queue_update',
        title: 'Successfully Checked In',
        message: 'You have been added to the queue. You are #3 in line. Estimated wait time: 45 minutes.',
        read: false,
        created_at: new Date().toISOString()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: "Successfully Checked In",
        description: "You have been added to the queue. You are #3 in line.",
      });
      
      setShowQRDialog(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Check-In Failed",
        description: "Unable to check in at this time. Please see reception.",
        variant: "destructive"
      });
    }
  };

  // 2. Mark Notification as Read
  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // 3. View Document
  const viewDocument = (document: SignedDocument) => {
    setSelectedDocument(document);
    setShowDocumentDialog(true);
  };

  // 4. Download Document
  const downloadDocument = (document: SignedDocument) => {
    // In real implementation, generate and download PDF
    toast({
      title: "Download Started",
      description: `Downloading ${document.form_data.form_type} document...`,
    });
  };

  // Utility Functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': 
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checked_in': return 'bg-yellow-100 text-yellow-800';
      case 'in_procedure': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'queue_update': return Clock;
      case 'appointment_change': return Calendar;
      case 'treatment_update': return Stethoscope;
      case 'follow_up': return Bell;
      default: return Info;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  // Interactive Dental Chart for Patients
  const PatientDentalChart = ({ treatments }: { treatments: TreatmentHistory[] }) => (
    <Card>
      <CardHeader>
        <CardTitle>My Dental Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-1 mb-4">
          {Array.from({ length: 32 }, (_, i) => {
            const toothNumber = i + 1;
            const hasWork = treatments.some(t => 
              t.procedures.some(p => p.tooth_number === toothNumber.toString())
            );
            
            return (
              <div
                key={i}
                className={`w-8 h-8 border-2 rounded cursor-pointer hover:bg-blue-100 flex items-center justify-center text-xs font-medium ${
                  hasWork ? 'bg-blue-200 border-blue-400' : 'border-gray-300'
                }`}
                title={hasWork ? `Tooth ${toothNumber} - Previous work done` : `Tooth ${toothNumber}`}
                onClick={() => {
                  const workDone = treatments.filter(t => 
                    t.procedures.some(p => p.tooth_number === toothNumber.toString())
                  );
                  if (workDone.length > 0) {
                    toast({
                      title: `Tooth ${toothNumber}`,
                      description: `${workDone.length} treatment(s) performed`,
                    });
                  }
                }}
              >
                {toothNumber}
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
              <span>Treated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
              <span>Healthy</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Click on teeth to view treatment history
          </p>
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
            Welcome, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Your comprehensive dental health portal
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <QrCode className="w-4 h-4 mr-2" />
                QR Check-In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Check-In for Today's Appointment
                </DialogTitle>
              </DialogHeader>
              <div className="text-center space-y-4">
                <div className="mx-auto w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-inner">
                  <QrCode className="w-24 h-24 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Quick Check-In</p>
                  <p className="text-muted-foreground text-sm">
                    Scan this QR code at the clinic reception or click the button below to check in for your appointment.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You'll be added to the queue and receive real-time updates about your position.
                  </p>
                </div>
                <Button onClick={handleQRCheckIn} className="w-full" size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check In Now
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="relative">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {unreadNotifications.length > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1 min-w-[20px] h-5 text-xs">
                {unreadNotifications.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Queue Status Alert */}
      {isCheckedIn && queuePosition && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>You are checked in!</strong> You are #{queuePosition} in the queue. 
                Estimated wait time: {queuePosition * 15} minutes.
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Updates
                </Badge>
              </div>
            </div>
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
                <p className="text-2xl font-bold">{stats.upcomingAppointments}</p>
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
                <p className="text-2xl font-bold">{stats.treatmentRecords}</p>
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
                <p className="text-2xl font-bold">${stats.outstandingBalance.toFixed(2)}</p>
              </div>
              <DollarSign className={`w-8 h-8 ${stats.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="treatment">Treatment History</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notifications */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Dashboard Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => markNotificationRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <IconComponent className="w-5 h-5 text-gray-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {notifications.length === 0 && (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">No notifications</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Next Appointment */}
              {appointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Next Appointment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {new Date(appointments[0].scheduled_time).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointments[0].scheduled_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} with Dr. {appointments[0].dentist?.full_name || 'Unknown'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(appointments[0].status)}>
                          {appointments[0].status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm">{appointments[0].reason_for_visit}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Pay */}
              {stats.outstandingBalance > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Outstanding Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          ${stats.outstandingBalance.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">Total due</p>
                      </div>
                      <Button className="w-full">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Phone</p>
                        <p className="text-sm text-gray-600">(555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Address</p>
                        <p className="text-sm text-gray-600">123 Dental Street<br />San Francisco, CA 94102</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
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
                          {appointment.appointment_type} with Dr. {appointment.dentist?.full_name || 'Unknown'}
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
                      <Button className="mt-4">
                        Book New Appointment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Past Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastAppointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(appointment.scheduled_time).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.appointment_type} with Dr. {appointment.dentist?.full_name || 'TBA'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                  
                  {pastAppointments.length === 0 && (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No past appointments</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="treatment">
          <div className="space-y-6">
            <PatientDentalChart treatments={treatmentHistory} />
            
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
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            {treatment.procedures.map(p => p.name).join(', ')}
                          </p>
                          <span className="font-medium text-lg">
                            ${treatment.total_cost.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {new Date(treatment.treatment_date).toLocaleDateString()}
                        </p>
                        {treatment.procedures.some(p => p.tooth_number) && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Teeth: {treatment.procedures
                              .filter(p => p.tooth_number)
                              .map(p => `#${p.tooth_number}`)
                              .join(', ')}
                          </p>
                        )}
                        <p className="text-sm">{treatment.notes}</p>
                        
                        {/* Payment Status */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-sm">
                            <span>Paid: ${treatment.amount_paid.toFixed(2)}</span>
                            {treatment.balance_due > 0 && (
                              <span className="text-red-600">
                                Balance: ${treatment.balance_due.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {treatment.patient_signature && treatment.dentist_signature && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Signed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {treatmentHistory.length === 0 && (
                    <div className="text-center py-8">
                      <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No treatment history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Payment History</CardTitle>
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
                        Date: {new Date(record.invoice_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(record.due_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Payment: {record.payment_method || 'Pending'}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Total: ${record.total_amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Paid: ${record.paid_amount.toFixed(2)}</p>
                        <p className="font-medium">Balance: ${record.balance_due.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getBillingStatusColor(record.status)}>
                          {record.status.toUpperCase()}
                        </Badge>
                        {record.balance_due > 0 && (
                          <Button size="sm">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {billingRecords.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No billing records available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Signed Documents & Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signedDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium capitalize">
                        {document.form_data.form_type?.replace('_', ' ')} Form
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {document.form_data.procedure && `Procedure: ${document.form_data.procedure}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Signed: {new Date(document.signed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {document.patient_signature && (
                          <Badge variant="outline" className="text-xs">
                            <User className="w-3 h-3 mr-1" />
                            Patient
                          </Badge>
                        )}
                        {document.dentist_signature && (
                          <Badge variant="outline" className="text-xs">
                            <Stethoscope className="w-3 h-3 mr-1" />
                            Dentist
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewDocument(document)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadDocument(document)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {signedDocuments.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No signed documents available</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Documents will appear here after treatment
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDocument && `${selectedDocument.form_data.form_type?.replace('_', ' ')} Document`}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Document Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 capitalize">{selectedDocument.form_data.form_type?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Signed:</span>
                    <span className="ml-2">{new Date(selectedDocument.signed_at).toLocaleDateString()}</span>
                  </div>
                  {selectedDocument.form_data.procedure && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Procedure:</span>
                      <span className="ml-2">{selectedDocument.form_data.procedure}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Document Content</p>
                <p className="text-sm text-muted-foreground mt-2">
                  In a real implementation, the actual document content would be displayed here
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  {selectedDocument.patient_signature && (
                    <Badge variant="outline">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Patient Signed
                    </Badge>
                  )}
                  {selectedDocument.dentist_signature && (
                    <Badge variant="outline">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Dentist Signed
                    </Badge>
                  )}
                </div>
                <Button onClick={() => downloadDocument(selectedDocument)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensivePatientPortal;
