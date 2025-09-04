import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Timer,
  Play,
  Pause,
  SkipForward,
  UserCheck,
  QrCode,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown,
  Phone,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QueueItem {
  id: string;
  appointment_id: string;
  position: number;
  priority: 'emergency' | 'scheduled' | 'walk_in';
  status: 'waiting' | 'called' | 'in_treatment' | 'completed' | 'no_show' | 'skipped';
  estimated_wait_minutes: number;
  manual_order?: number;
  predicted_completion_time?: string;
  treatment_duration_override?: number;
  appointment: {
    id: string;
    scheduled_time: string;
    duration_minutes: number;
    status: string;
    notes?: string;
    patient: {
      id: string;
      full_name: string;
      contact_number?: string;
    };
    dentist?: {
      id: string;
      full_name: string;
    };
  };
}

type QueueFilter = 'all' | 'waiting' | 'in_treatment' | 'completed' | 'emergency';

export function EnhancedQueueManagement() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [manualOrderInput, setManualOrderInput] = useState<string>('');
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchQueueData();
    
    // Set up real-time subscription for queue changes
    const channel = supabase
      .channel('queue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue'
        },
        () => {
          fetchQueueData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          fetchQueueData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueueData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('queue')
        .select(`
          *,
          appointment:appointments!inner(
            id,
            scheduled_time,
            duration_minutes,
            status,
            notes,
            patient:patients!inner(
              id,
              full_name,
              contact_number
            ),
            dentist:users!appointments_dentist_id_fkey(
              id,
              full_name
            )
          )
        `)
        .gte('appointment.scheduled_time', today + 'T00:00:00')
        .lte('appointment.scheduled_time', today + 'T23:59:59')
        .order('position', { ascending: true });

      if (error) throw error;
      // Type assertion to handle the enum mismatch from Supabase
      setQueueItems((data || []).map(item => ({
        ...item,
        status: item.status as QueueItem['status']
      })));
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

  const addToQueue = async (appointmentId: string, priority: 'emergency' | 'scheduled' | 'walk_in' = 'scheduled') => {
    try {
      // Get next position
      const { data: maxPos } = await supabase
        .from('queue')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);
      
      const nextPosition = (maxPos?.[0]?.position || 0) + 1;

      const { error } = await supabase
        .from('queue')
        .insert({
          appointment_id: appointmentId,
          position: nextPosition,
          priority,
          status: 'waiting'
        });

      if (error) throw error;

      // Update appointment status to checked_in
      await supabase
        .from('appointments')
        .update({ status: 'checked_in' })
        .eq('id', appointmentId);

      toast({
        title: "Success",
        description: "Patient added to queue successfully",
      });

      fetchQueueData();
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: "Error",
        description: "Failed to add patient to queue",
        variant: "destructive"
      });
    }
  };

  const updateQueueStatus = async (queueId: string, status: QueueItem['status']) => {
    try {
      const updateData: any = { status };
      
      if (status === 'in_treatment') {
        updateData.predicted_completion_time = new Date(Date.now() + 30 * 60000).toISOString();
      }

      const { error } = await supabase
        .from('queue')
        .update(updateData)
        .eq('id', queueId);

      if (error) throw error;

      // Also update appointment status
      const queueItem = queueItems.find(item => item.id === queueId);
      if (queueItem) {
        let appointmentStatus: 'booked' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' = 'checked_in';
        if (status === 'in_treatment') appointmentStatus = 'in_progress';
        else if (status === 'completed') appointmentStatus = 'completed';
        else if (status === 'no_show') appointmentStatus = 'no_show';

        await supabase
          .from('appointments')
          .update({ status: appointmentStatus })
          .eq('id', queueItem.appointment_id);
      }

      toast({
        title: "Success",
        description: `Queue status updated to ${status.replace('_', ' ')}`,
      });

      fetchQueueData();
    } catch (error) {
      console.error('Error updating queue status:', error);
      toast({
        title: "Error",
        description: "Failed to update queue status",
        variant: "destructive"
      });
    }
  };

  const prioritizeItem = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ 
          priority: 'emergency',
          manual_order: 1,
          override_reason: 'Emergency prioritization'
        })
        .eq('id', queueId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient prioritized as emergency",
      });

      fetchQueueData();
    } catch (error) {
      console.error('Error prioritizing:', error);
      toast({
        title: "Error",
        description: "Failed to prioritize patient",
        variant: "destructive"
      });
    }
  };

  const reorderQueue = async (queueId: string, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ manual_order: newPosition })
        .eq('id', queueId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Queue order updated",
      });

      fetchQueueData();
    } catch (error) {
      console.error('Error reordering queue:', error);
      toast({
        title: "Error",
        description: "Failed to reorder queue",
        variant: "destructive"
      });
    }
  };

  const notifyPatient = async (queueItem: QueueItem, method: 'sms' | 'call') => {
    // This would integrate with communication system
    toast({
      title: "Notification Sent",
      description: `${method.toUpperCase()} notification sent to ${queueItem.appointment.patient.full_name}`,
    });
  };

  const filteredItems = queueItems.filter(item => {
    switch (filter) {
      case 'waiting':
        return item.status === 'waiting';
      case 'in_treatment':
        return item.status === 'in_treatment';
      case 'completed':
        return item.status === 'completed';
      case 'emergency':
        return item.priority === 'emergency';
      default:
        return true;
    }
  });

  const queueStats = {
    total: queueItems.length,
    waiting: queueItems.filter(item => item.status === 'waiting').length,
    inTreatment: queueItems.filter(item => item.status === 'in_treatment').length,
    completed: queueItems.filter(item => item.status === 'completed').length,
    emergency: queueItems.filter(item => item.priority === 'emergency').length
  };

  const getStatusColor = (item: QueueItem) => {
    if (item.priority === 'emergency') return 'bg-red-600 text-white';
    if (item.status === 'in_treatment') return 'bg-blue-600 text-white';
    if (item.status === 'completed') return 'bg-green-600 text-white';
    if (item.status === 'waiting') return 'bg-yellow-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getPriorityIcon = (item: QueueItem) => {
    if (item.priority === 'emergency') return <AlertTriangle className="w-4 h-4" />;
    if (item.status === 'in_treatment') return <Play className="w-4 h-4" />;
    if (item.status === 'completed') return <CheckCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
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
          <h1 className="text-3xl font-bold">Enhanced Queue Management</h1>
          <p className="text-muted-foreground">Real-time patient queue with advanced controls</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchQueueData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
            <DialogTrigger asChild>
              <Button>
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
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-2xl font-bold text-yellow-600">{queueStats.waiting}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Treatment</p>
                <p className="text-2xl font-bold text-blue-600">{queueStats.inTreatment}</p>
              </div>
              <Play className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{queueStats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emergency</p>
                <p className="text-2xl font-bold text-red-600">{queueStats.emergency}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
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
              <SelectItem value="all">All Patients ({queueStats.total})</SelectItem>
              <SelectItem value="waiting">Waiting ({queueStats.waiting})</SelectItem>
              <SelectItem value="in_treatment">In Treatment ({queueStats.inTreatment})</SelectItem>
              <SelectItem value="completed">Completed ({queueStats.completed})</SelectItem>
              <SelectItem value="emergency">Emergency ({queueStats.emergency})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Queue List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patient Queue ({filteredItems.length})</span>
            <Badge variant="outline">Live Updates</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No patients in queue</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' ? 'No patients in queue today' : `No ${filter} patients`}
                </p>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    item.priority === 'emergency' 
                      ? 'border-red-500/50 bg-red-50/50' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Queue Position */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        item.priority === 'emergency' ? 'bg-red-600' : 'bg-blue-600'
                      }`}>
                        {item.manual_order || item.position}
                      </div>

                      {/* Patient Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {item.appointment.patient.full_name}
                          </p>
                          <Badge className={getStatusColor(item)} variant="secondary">
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(item)}
                              {item.priority === 'emergency' ? 'EMERGENCY' :
                               item.status === 'in_treatment' ? 'IN TREATMENT' :
                               item.status === 'completed' ? 'COMPLETED' :
                               item.status === 'waiting' ? 'WAITING' : item.status.toUpperCase()}
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(item.appointment.scheduled_time).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span>{item.appointment.duration_minutes || 30}min</span>
                          {item.appointment.dentist && (
                            <>
                              <span>•</span>
                              <span>Dr. {item.appointment.dentist.full_name}</span>
                            </>
                          )}
                          {item.estimated_wait_minutes > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-yellow-600">~{item.estimated_wait_minutes}min wait</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Reorder controls */}
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reorderQueue(item.id, Math.max(1, (item.manual_order || item.position) - 1))}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reorderQueue(item.id, (item.manual_order || item.position) + 1)}
                          disabled={index === filteredItems.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Communication */}
                      {item.appointment.patient.contact_number && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => notifyPatient(item, 'sms')}
                          >
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => notifyPatient(item, 'call')}
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                        </div>
                      )}

                      {/* Status Actions */}
                      <div className="flex gap-1">
                        {item.status === 'waiting' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateQueueStatus(item.id, 'in_treatment')}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </Button>
                            {item.priority !== 'emergency' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => prioritizeItem(item.id)}
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <AlertTriangle className="w-3 h-3" />
                              </Button>
                            )}
                          </>
                        )}
                        
                        {item.status === 'in_treatment' && (
                          <Button
                            size="sm"
                            onClick={() => updateQueueStatus(item.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}

                        {(item.status === 'waiting' || item.status === 'called') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateQueueStatus(item.id, 'no_show')}
                          >
                            No Show
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional info */}
                  {item.appointment.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        <strong>Notes:</strong> {item.appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}