import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Timer,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  MoreVertical,
  Calendar,
  User,
  Phone,
  Activity,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';

interface QueueItem {
  id: string;
  appointment_id: string;
  patient_name: string;
  dentist_name: string;
  treatment_type: string;
  priority: 'emergency' | 'scheduled' | 'walk_in';
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  position: number;
  estimated_wait_minutes: number;
  predicted_completion_time: string;
  created_at: string;
  scheduled_time?: string;
  contact_number?: string;
  notes?: string;
}

interface WaitTimeStats {
  average_wait: number;
  current_queue_length: number;
  estimated_processing_time: number;
  next_available_slot: string;
}

export function RealTimeQueueManagement() {
  const { user, profile } = useAuth();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [waitTimeStats, setWaitTimeStats] = useState<WaitTimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLive, setIsLive] = useState(true);

  // Real-time subscription for queue updates
  useEffect(() => {
    const queueChannel = supabase
      .channel('queue-management')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Queue appointment change:', payload);
          fetchQueueData();
          calculateWaitTimes();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue'
        },
        (payload) => {
          console.log('Queue change:', payload);
          fetchQueueData();
          calculateWaitTimes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
    };
  }, []);

  useEffect(() => {
    fetchQueueData();
    calculateWaitTimes();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      if (isLive) {
        fetchQueueData();
        calculateWaitTimes();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLive]);

  const fetchQueueData = async () => {
    try {
      // Fetch queue items with appointment and patient details
      const { data: queueData, error: queueError } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          dentist_id,
          scheduled_time,
          status,
          notes,
          duration_minutes,
          booking_type,
          patients!inner(full_name, contact_number),
          users!dentist_id(full_name)
        `)
        .in('status', ['checked_in', 'in_progress'])
        .order('scheduled_time');

      if (queueError) throw queueError;

      // Transform data into queue items
      const transformedQueue: QueueItem[] = (queueData || []).map((item, index) => ({
        id: item.id,
        appointment_id: item.id,
        patient_name: item.patients?.full_name || 'Unknown Patient',
        dentist_name: item.users?.full_name || 'Any Available',
        treatment_type: item.booking_type || 'General Care',
        priority: item.booking_type === 'emergency' ? 'emergency' : 
                  item.booking_type === 'walk_in' ? 'walk_in' : 'scheduled',
        status: item.status === 'checked_in' ? 'waiting' : 
                item.status === 'in_progress' ? 'in_progress' : 'waiting',
        position: index + 1,
        estimated_wait_minutes: (index * 30), // Rough estimate: 30 min per patient ahead
        predicted_completion_time: new Date(Date.now() + (index * 30 * 60000)).toISOString(),
        created_at: item.scheduled_time,
        scheduled_time: item.scheduled_time,
        contact_number: item.patients?.contact_number,
        notes: item.notes
      }));

      // Sort by priority: emergency > scheduled > walk_in
      transformedQueue.sort((a, b) => {
        const priorityOrder = { emergency: 1, scheduled: 2, walk_in: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setQueueItems(transformedQueue);
    } catch (error) {
      console.error('Error fetching queue data:', error);
      toast.error('Failed to load queue data');
    } finally {
      setLoading(false);
    }
  };

  const calculateWaitTimes = async () => {
    try {
      const totalWaiting = queueItems.filter(item => item.status === 'waiting').length;
      const averageServiceTime = 30; // Average 30 minutes per patient
      const totalInProgress = queueItems.filter(item => item.status === 'in_progress').length;
      
      const stats: WaitTimeStats = {
        average_wait: averageServiceTime * (totalWaiting / Math.max(totalInProgress || 1, 1)),
        current_queue_length: totalWaiting,
        estimated_processing_time: averageServiceTime,
        next_available_slot: new Date(Date.now() + (totalWaiting * averageServiceTime * 60000)).toISOString()
      };

      setWaitTimeStats(stats);
    } catch (error) {
      console.error('Error calculating wait times:', error);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: 'checked_in' | 'in_progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success(`Appointment status updated to ${newStatus}`);
      fetchQueueData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handlePriorityChange = async (appointmentId: string, priority: 'emergency' | 'scheduled' | 'walk_in') => {
    try {
      // Update booking type to reflect priority
      const bookingType = priority === 'emergency' ? 'emergency' : priority === 'walk_in' ? 'walk_in' : 'online';
      
      const { error } = await supabase
        .from('appointments')
        .update({ 
          booking_type: bookingType,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success(`Priority changed to ${priority}`);
      fetchQueueData();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
    }
  };

  const addWalkInPatient = async () => {
    try {
      // For now, we'll create a placeholder appointment
      // In a real app, you'd have a form to collect patient details
      const { data: tempPatient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .limit(1)
        .single();

      if (patientError) throw patientError;

      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: tempPatient.id,
          scheduled_time: new Date().toISOString(),
          status: 'checked_in',
          booking_type: 'walk_in',
          duration_minutes: 30,
          notes: 'Walk-in patient'
        });

      if (error) throw error;

      toast.success('Walk-in patient added to queue');
      fetchQueueData();
    } catch (error) {
      console.error('Error adding walk-in patient:', error);
      toast.error('Failed to add walk-in patient');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Emergency</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700"><Calendar className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case 'walk_in':
        return <Badge className="bg-yellow-100 text-yellow-700"><User className="w-3 h-3 mr-1" />Walk-in</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge className="bg-orange-100 text-orange-700"><Clock className="w-3 h-3 mr-1" />Waiting</Badge>;
      case 'in_progress':
        return <Badge className="bg-green-100 text-green-700"><Activity className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredQueue = queueItems.filter(item => {
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;
    const matchesSearch = searchTerm === '' || 
      item.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dentist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.treatment_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Queue Management</h1>
            <p className="text-gray-600">Real-time patient queue and wait time management</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={isLive ? "default" : "outline"}
              onClick={() => setIsLive(!isLive)}
              className="flex items-center gap-2"
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isLive ? 'Pause' : 'Resume'} Live Updates
            </Button>
            <Button onClick={addWalkInPatient} className="bg-green-600 hover:bg-green-700">
              Add Walk-in
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{waitTimeStats?.current_queue_length || 0}</p>
                  <p className="text-sm text-gray-600">Patients Waiting</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{Math.round(waitTimeStats?.average_wait || 0)}m</p>
                  <p className="text-sm text-gray-600">Average Wait</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Timer className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{waitTimeStats?.estimated_processing_time || 30}m</p>
                  <p className="text-sm text-gray-600">Processing Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {queueItems.filter(item => item.status === 'in_progress').length}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search patients, dentists, or treatments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Queue List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading queue data...</p>
              </CardContent>
            </Card>
          ) : filteredQueue.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Patients in Queue</h3>
                <p className="text-gray-600">The queue is currently empty.</p>
              </CardContent>
            </Card>
          ) : (
            filteredQueue.map((item, index) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">#{item.position}</div>
                        <div className="text-xs text-gray-500">Position</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{item.patient_name}</h3>
                          {getPriorityBadge(item.priority)}
                          {getStatusBadge(item.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium">Treatment</p>
                            <p>{item.treatment_type}</p>
                          </div>
                          <div>
                            <p className="font-medium">Dentist</p>
                            <p>Dr. {item.dentist_name}</p>
                          </div>
                          <div>
                            <p className="font-medium">Estimated Wait</p>
                            <p className="text-orange-600 font-medium">{item.estimated_wait_minutes}m</p>
                          </div>
                          <div>
                            <p className="font-medium">Expected Completion</p>
                            <p>{format(new Date(item.predicted_completion_time), 'HH:mm')}</p>
                          </div>
                        </div>

                        {item.contact_number && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{item.contact_number}</span>
                          </div>
                        )}

                        {item.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Notes:</strong> {item.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {item.status === 'waiting' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(item.appointment_id, 'in_progress')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Start Treatment
                        </Button>
                      )}
                      
                      {item.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(item.appointment_id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Complete
                        </Button>
                      )}

                      {item.priority !== 'emergency' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePriorityChange(item.appointment_id, 'emergency')}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <ArrowUp className="w-4 h-4 mr-1" />
                          Priority
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Next Available Slot */}
        {waitTimeStats?.next_available_slot && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Next Available Slot</p>
                  <p className="text-green-700">
                    {format(new Date(waitTimeStats.next_available_slot), 'MMM dd, yyyy at HH:mm')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}