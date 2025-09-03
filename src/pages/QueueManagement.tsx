import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Timer,
  Play,
  Pause,
  SkipForward,
  UserCheck,
  QrCode,
  Bell,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QueueAppointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  service_type: string;
  status: string;
  priority: string;
  appointment_type: string;
  is_checked_in: boolean;
  queue_position: number | null;
  queue_join_time: string | null;
  grace_period_end: string | null;
  estimated_duration: number;
  actual_start_time: string | null;
  actual_end_time: string | null;
  is_no_show: boolean;
  profiles?: {
    full_name: string;
    phone?: string;
  };
}

type QueueFilter = 'all' | 'waiting' | 'in-progress' | 'completed' | 'emergency';
type StatusUpdate = 'booked' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export default function QueueManagement() {
  const [appointments, setAppointments] = useState<QueueAppointment[]>([]);
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<QueueAppointment | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  // Real-time subscription
  useEffect(() => {
    fetchQueueAppointments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          fetchQueueAppointments();
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQueueAppointments, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchQueueAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(full_name)
        `)
        .gte('scheduled_time', today + 'T00:00:00')
        .lte('scheduled_time', today + 'T23:59:59')
        .in('status', ['booked', 'checked_in', 'in_progress', 'completed'])
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      const mappedData = (data || []).map(item => ({
        id: item.id,
        patient_id: item.patient_id,
        appointment_date: item.scheduled_time,
        service_type: 'General Consultation',
        status: item.status,
        priority: 'normal',
        appointment_type: item.booking_type,
        is_checked_in: item.status === 'checked_in',
        queue_position: null,
        queue_join_time: null,
        grace_period_end: null,
        estimated_duration: item.duration_minutes || 30,
        actual_start_time: null,
        actual_end_time: null,
        is_no_show: false,
        profiles: item.patients ? { full_name: item.patients.full_name } : undefined
      }));
      setAppointments(mappedData);
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast({
        title: "Error",
        description: "Failed to fetch queue data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: StatusUpdate) => {
    try {
      const updateData: any = { status };
      
      if (status === 'in_progress') {
        updateData.scheduled_time = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.updated_at = new Date().toISOString();
      } else if (status === 'no_show') {
        // Handle no show status
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Appointment ${status.replace('-', ' ')} successfully`,
      });

      fetchQueueAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive"
      });
    }
  };

  const checkInPatient = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'checked_in',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient checked in successfully",
      });

      fetchQueueAppointments();
    } catch (error) {
      console.error('Error checking in patient:', error);
      toast({
        title: "Error",
        description: "Failed to check in patient",
        variant: "destructive"
      });
    }
  };

  const prioritizeEmergency = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          booking_type: 'emergency',
          notes: 'Emergency priority'
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment prioritized as emergency",
      });

      fetchQueueAppointments();
    } catch (error) {
      console.error('Error prioritizing appointment:', error);
      toast({
        title: "Error",
        description: "Failed to prioritize appointment",
        variant: "destructive"
      });
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    switch (filter) {
      case 'waiting':
        return apt.status === 'checked_in';
      case 'in-progress':
        return apt.status === 'in_progress';
      case 'completed':
        return apt.status === 'completed';
      case 'emergency':
        return apt.appointment_type === 'emergency';
      default:
        return true;
    }
  });

  const queueStats = {
    total: appointments.length,
    waiting: appointments.filter(a => a.status === 'checked_in').length,
    inProgress: appointments.filter(a => a.status === 'in_progress').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    emergency: appointments.filter(a => a.appointment_type === 'emergency').length
  };

  const getStatusColor = (appointment: QueueAppointment) => {
    if (appointment.appointment_type === 'emergency') return 'bg-destructive text-destructive-foreground';
    if (appointment.status === 'in_progress') return 'bg-medical-blue text-white';
    if (appointment.status === 'completed') return 'bg-success text-success-foreground';
    if (appointment.is_checked_in) return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getPriorityIcon = (appointment: QueueAppointment) => {
    if (appointment.appointment_type === 'emergency') return <AlertTriangle className="w-4 h-4" />;
    if (appointment.status === 'in_progress') return <Play className="w-4 h-4" />;
    if (appointment.status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (appointment.is_checked_in) return <Clock className="w-4 h-4" />;
    return <Timer className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading queue...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Queue Management</h1>
          <p className="text-muted-foreground">Real-time patient queue monitoring and control</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchQueueAppointments}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
            <DialogTrigger asChild>
              <Button className="medical-gradient text-white">
                <QrCode className="w-4 h-4 mr-2" />
                QR Check-in
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR Code Check-in</DialogTitle>
              </DialogHeader>
              <div className="text-center p-8">
                <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-32 h-32 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Patients can scan this QR code to check-in automatically
                </p>
                <div className="mt-4 p-3 bg-muted rounded text-xs text-muted-foreground">
                  QR URL: {window.location.origin}/checkin?token=clinic_checkin
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{queueStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-2xl font-bold text-warning">{queueStats.waiting}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-medical-blue">{queueStats.inProgress}</p>
              </div>
              <Play className="w-8 h-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">{queueStats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emergency</p>
                <p className="text-2xl font-bold text-destructive">{queueStats.emergency}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(value: QueueFilter) => setFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="waiting">Waiting ({queueStats.waiting})</SelectItem>
              <SelectItem value="in-progress">In Progress ({queueStats.inProgress})</SelectItem>
              <SelectItem value="completed">Completed ({queueStats.completed})</SelectItem>
              <SelectItem value="emergency">Emergency ({queueStats.emergency})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Queue List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patient Queue ({filteredAppointments.length})</span>
            <Badge variant="outline">Live Updates</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No patients in queue</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' ? 'No appointments today' : `No ${filter} patients`}
                </p>
              </div>
            ) : (
              filteredAppointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    appointment.appointment_type === 'emergency' 
                      ? 'border-destructive/50 bg-destructive/5' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Queue Position */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center text-white font-bold">
                        {appointment.queue_position || index + 1}
                      </div>

                      {/* Patient Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {appointment.profiles?.full_name || 'Patient'}
                          </p>
                          <Badge 
                            className={getStatusColor(appointment)}
                            variant="secondary"
                          >
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(appointment)}
                              {appointment.appointment_type === 'emergency' ? 'EMERGENCY' :
                               appointment.status === 'in_progress' ? 'IN PROGRESS' :
                               appointment.status === 'completed' ? 'COMPLETED' :
                               appointment.is_checked_in ? 'WAITING' : 'NOT CHECKED IN'}
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{appointment.service_type}</span>
                          <span>•</span>
                          <span>{new Date(appointment.appointment_date).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span>{appointment.estimated_duration}min</span>
                          {appointment.profiles?.phone && (
                            <>
                              <span>•</span>
                              <span>{appointment.profiles.phone}</span>
                            </>
                          )}
                        </div>

                        {/* Grace Period Warning */}
                        {appointment.grace_period_end && !appointment.is_checked_in && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-warning">
                            <Timer className="w-3 h-3" />
                            Grace period ends at {new Date(appointment.grace_period_end).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {!appointment.is_checked_in && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkInPatient(appointment.id)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Check In
                        </Button>
                      )}

                      {appointment.appointment_type !== 'emergency' && appointment.is_checked_in && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => prioritizeEmergency(appointment.id)}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Emergency
                        </Button>
                      )}

                      {appointment.is_checked_in && appointment.status === 'checked_in' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}

                      {appointment.status === 'in_progress' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}

                      {appointment.status === 'booked' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'no_show')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          No Show
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
    </div>
  );
}