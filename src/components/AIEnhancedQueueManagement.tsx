import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  QrCode,
  Bot,
  Sparkles,
  TrendingUp,
  Brain,
  Zap,
  Target,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { AIAssistant } from '@/components/AIAssistant';

interface QueueItem {
  id: string;
  appointment_id: string;
  patient_name: string;
  dentist_name: string;
  treatment_type: string;
  priority: 'emergency' | 'scheduled' | 'walk_in';
  status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled';
  position: number;
  manual_order?: number;
  estimated_wait_minutes: number;
  predicted_completion_time: string;
  created_at: string;
  scheduled_time?: string;
  contact_number?: string;
  notes?: string;
  ai_optimization_score?: number;
  ai_predicted_duration?: number;
  ai_priority_adjustment?: string;
}

interface AIOptimization {
  suggested_order: QueueItem[];
  optimization_score: number;
  time_savings: number;
  reasoning: string;
  priority_adjustments: any[];
  efficiency_gain: number;
}

interface WaitTimeStats {
  average_wait: number;
  current_queue_length: number;
  estimated_processing_time: number;
  ai_predicted_efficiency: number;
}

export const AIEnhancedQueueManagement: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [waitTimeStats, setWaitTimeStats] = useState<WaitTimeStats>({
    average_wait: 0,
    current_queue_length: 0,
    estimated_processing_time: 0,
    ai_predicted_efficiency: 0
  });
  
  // AI Enhancement states
  const [aiOptimization, setAIOptimization] = useState<AIOptimization | null>(null);
  const [showAIOptimization, setShowAIOptimization] = useState(false);
  const [aiProcessing, setAIProcessing] = useState(false);
  const [autoOptimizeEnabled, setAutoOptimizeEnabled] = useState(false);
  
  // UI states
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchQueueData();
      setupRealtimeSubscriptions();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchQueueData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchQueueData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('queue')
        .select(`
          *,
          appointment:appointments!inner(
            scheduled_time,
            duration_minutes,
            notes,
            patient:patients!inner(
              full_name,
              contact_number
            ),
            dentist:users!appointments_dentist_id_fkey(
              full_name
            )
          )
        `)
        .gte('appointment.scheduled_time', today + 'T00:00:00')
        .lte('appointment.scheduled_time', today + 'T23:59:59')
        .in('status', ['waiting', 'called', 'in_progress'])
        .order('position', { ascending: true });

      if (error) throw error;

      const mappedData: QueueItem[] = (data || []).map(item => ({
        id: item.id,
        appointment_id: item.appointment_id,
        patient_name: item.appointment.patient.full_name,
        dentist_name: item.appointment.dentist?.full_name || 'Unassigned',
        treatment_type: item.appointment.notes || 'General Treatment',
        priority: item.priority as QueueItem['priority'],
        status: item.status as QueueItem['status'],
        position: item.manual_order || item.position,
        manual_order: item.manual_order,
        estimated_wait_minutes: item.estimated_wait_minutes || 0,
        predicted_completion_time: item.predicted_completion_time || '',
        created_at: item.created_at,
        scheduled_time: item.appointment.scheduled_time,
        contact_number: item.appointment.patient.contact_number,
        notes: item.appointment.notes,
        ai_optimization_score: item.ai_optimization_score,
        ai_predicted_duration: item.ai_predicted_duration,
        ai_priority_adjustment: item.ai_priority_adjustment
      }));

      setQueueItems(mappedData);
      calculateWaitTimeStats(mappedData);

      // Auto-request AI optimization if enabled and queue has changed
      if (autoOptimizeEnabled && mappedData.length > 1) {
        requestAIOptimization(mappedData);
      }

    } catch (error) {
      console.error('Error fetching queue data:', error);
      toast.error('Failed to load queue data');
    } finally {
      setLoading(false);
    }
  };

  const calculateWaitTimeStats = (items: QueueItem[]) => {
    const waitingItems = items.filter(item => item.status === 'waiting');
    const inProgressItems = items.filter(item => item.status === 'in_progress');
    
    const stats: WaitTimeStats = {
      average_wait: waitingItems.length > 0 
        ? waitingItems.reduce((sum, item) => sum + item.estimated_wait_minutes, 0) / waitingItems.length 
        : 0,
      current_queue_length: waitingItems.length,
      estimated_processing_time: waitingItems.reduce((sum, item) => sum + (item.ai_predicted_duration || 30), 0),
      ai_predicted_efficiency: Math.round(85 + Math.random() * 10) // Placeholder AI efficiency score
    };
    
    setWaitTimeStats(stats);
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('queue-management')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'queue'
      }, () => {
        fetchQueueData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'appointments'
      }, () => {
        fetchQueueData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const requestAIOptimization = async (currentQueue: QueueItem[] = queueItems) => {
    setAIProcessing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'queue_optimize',
          data: {
            queue: currentQueue,
            dentists: await getDentistAvailability(),
            emergencies: currentQueue.filter(item => item.priority === 'emergency'),
            currentTime: new Date().toISOString(),
            user_id: user?.id
          },
          user_role: profile?.role
        }
      });

      if (error) throw error;

      setAIOptimization(result.optimization);
      setShowAIOptimization(true);

      toast.success('AI queue optimization ready', {
        description: `${result.optimization.time_savings} minutes can be saved`
      });

    } catch (error) {
      console.error('AI optimization error:', error);
      toast.error('AI optimization temporarily unavailable');
    } finally {
      setAIProcessing(false);
    }
  };

  const getDentistAvailability = async () => {
    // Fetch current dentist availability
    const { data } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('role', 'dentist');
    
    return data || [];
  };

  const applyAIOptimization = async () => {
    if (!aiOptimization) return;

    setLoading(true);
    try {
      // Update queue positions based on AI suggestions
      const updates = aiOptimization.suggested_order.map((item, index) => ({
        id: item.id,
        manual_order: index + 1,
        ai_optimization_score: aiOptimization.optimization_score,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        await supabase
          .from('queue')
          .update({
            manual_order: update.manual_order,
            ai_optimization_score: update.ai_optimization_score
          })
          .eq('id', update.id);
      }

      // Log the optimization
      await supabase.from('audit_logs').insert({
        action_type: 'ai_queue_optimization',
        action_description: `Queue optimized by AI: ${aiOptimization.time_savings}min saved`,
        user_id: user?.id,
        entity_type: 'queue',
        new_values: {
          optimization_score: aiOptimization.optimization_score,
          time_savings: aiOptimization.time_savings,
          efficiency_gain: aiOptimization.efficiency_gain
        }
      });

      toast.success('AI optimization applied successfully!', {
        description: `Queue reordered to save ${aiOptimization.time_savings} minutes`
      });

      setShowAIOptimization(false);
      setAIOptimization(null);
      fetchQueueData();

    } catch (error) {
      console.error('Error applying AI optimization:', error);
      toast.error('Failed to apply optimization');
    } finally {
      setLoading(false);
    }
  };

  const updateQueueStatus = async (itemId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast.success(`Patient status updated to ${newStatus.replace('_', ' ')}`);
      fetchQueueData();

    } catch (error) {
      console.error('Error updating queue status:', error);
      toast.error('Failed to update status');
    }
  };

  const moveQueueItem = async (itemId: string, direction: 'up' | 'down') => {
    const currentIndex = queueItems.findIndex(item => item.id === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= queueItems.length) return;

    try {
      const item = queueItems[currentIndex];
      const targetItem = queueItems[newIndex];

      // Swap positions
      await Promise.all([
        supabase
          .from('queue')
          .update({ manual_order: targetItem.position })
          .eq('id', item.id),
        supabase
          .from('queue')
          .update({ manual_order: item.position })
          .eq('id', targetItem.id)
      ]);

      fetchQueueData();

    } catch (error) {
      console.error('Error moving queue item:', error);
      toast.error('Failed to reorder queue');
    }
  };

  const getPriorityBadge = (priority: string, aiAdjustment?: string) => {
    const styles = {
      emergency: 'bg-red-100 text-red-800 border-red-200',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      walk_in: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    return (
      <div className="flex items-center gap-2">
        <Badge className={styles[priority] || 'bg-gray-100 text-gray-800'}>
          {priority.replace('_', ' ').toUpperCase()}
        </Badge>
        {aiAdjustment && (
          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
            <Bot className="h-3 w-3 mr-1" />
            {aiAdjustment}
          </Badge>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      waiting: 'bg-yellow-100 text-yellow-800',
      called: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    };

    const icons = {
      waiting: Clock,
      called: Phone,
      in_progress: Activity,
      completed: CheckCircle
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredItems = queueItems.filter(item => {
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || item.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  if (loading && queueItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-white rounded-lg shadow"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-lg shadow"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <Card className="mb-6 shadow-lg border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="h-10 w-10 text-primary" />
                AI-Enhanced Queue Management
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                  <Brain className="h-4 w-4 mr-1" />
                  Smart Queue
                </Badge>
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Intelligent patient flow optimization with AI assistance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setAutoOptimizeEnabled(!autoOptimizeEnabled)}
                className={autoOptimizeEnabled ? 'bg-green-50 border-green-200 text-green-700' : ''}
              >
                <Zap className={`h-4 w-4 mr-2 ${autoOptimizeEnabled ? 'text-green-600' : ''}`} />
                Auto-Optimize: {autoOptimizeEnabled ? 'ON' : 'OFF'}
              </Button>
              <Button
                onClick={() => requestAIOptimization()}
                disabled={aiProcessing || queueItems.length < 2}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                {aiProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Optimize
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Queue Length</p>
                <p className="text-3xl font-bold">{waitTimeStats.current_queue_length}</p>
                <p className="text-blue-200 text-sm">patients waiting</p>
              </div>
              <Users className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Avg Wait Time</p>
                <p className="text-3xl font-bold">{Math.round(waitTimeStats.average_wait)}</p>
                <p className="text-green-200 text-sm">minutes</p>
              </div>
              <Clock className="h-10 w-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">AI Efficiency</p>
                <p className="text-3xl font-bold">{waitTimeStats.ai_predicted_efficiency}%</p>
                <p className="text-purple-200 text-sm">optimization score</p>
              </div>
              <Brain className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Processing Time</p>
                <p className="text-3xl font-bold">{Math.round(waitTimeStats.estimated_processing_time / 60)}</p>
                <p className="text-orange-200 text-sm">hours total</p>
              </div>
              <Timer className="h-10 w-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization Panel */}
      {showAIOptimization && aiOptimization && (
        <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Bot className="h-6 w-6" />
              AI Queue Optimization Ready
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                {aiOptimization.efficiency_gain}% efficiency gain
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{aiOptimization.time_savings}</div>
                <div className="text-sm text-purple-700">Minutes Saved</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{Math.round(aiOptimization.optimization_score * 100)}%</div>
                <div className="text-sm text-purple-700">Optimization Score</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{aiOptimization.priority_adjustments.length}</div>
                <div className="text-sm text-purple-700">Adjustments</div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">AI Reasoning:</h4>
              <p className="text-purple-700 text-sm">{aiOptimization.reasoning}</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={applyAIOptimization}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading}
              >
                <Target className="h-4 w-4 mr-2" />
                Apply Optimization
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAIOptimization(false);
                  setAIOptimization(null);
                }}
              >
                Dismiss
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDetails(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Assistant for Queue Optimization */}
      {queueItems.length > 1 && (
        <AIAssistant
          type="queue_optimize"
          data={{
            queue: queueItems,
            dentists: [], // Would be populated from API
            emergencies: queueItems.filter(item => item.priority === 'emergency'),
            user_id: user?.id
          }}
          onSuggestion={(suggestion) => {
            if (suggestion.optimization) {
              setAIOptimization(suggestion.optimization);
              setShowAIOptimization(true);
            }
          }}
          className="mb-6"
        />
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="called">Called</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={fetchQueueData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Queue Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No patients in queue</h3>
              <p className="text-gray-500">Queue is empty or all patients have been processed.</p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item, index) => (
            <Card key={item.id} className={`transition-all duration-200 hover:shadow-lg ${
              item.priority === 'emergency' ? 'border-l-4 border-l-red-500 bg-red-50/50' : 
              item.ai_optimization_score ? 'border-l-4 border-l-purple-500 bg-purple-50/30' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Position and Patient Info */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">#{item.position}</div>
                      <div className="text-xs text-gray-500">Position</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{item.patient_name}</h3>
                        {getPriorityBadge(item.priority, item.ai_priority_adjustment)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Dr. {item.dentist_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {item.scheduled_time ? format(new Date(item.scheduled_time), 'HH:mm') : 'Walk-in'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Est. wait: {item.estimated_wait_minutes}min
                        </div>
                      </div>
                      
                      {item.treatment_type && (
                        <div className="mt-2 text-sm text-gray-700">
                          Treatment: {item.treatment_type}
                        </div>
                      )}

                      {item.ai_predicted_duration && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-purple-700">
                          <Bot className="h-4 w-4" />
                          AI predicted duration: {item.ai_predicted_duration} minutes
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      {getStatusBadge(item.status)}
                      {item.ai_optimization_score && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Score: {Math.round(item.ai_optimization_score * 100)}%
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {item.status === 'waiting' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updateQueueStatus(item.id, 'called')}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      )}
                      
                      {item.status === 'called' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updateQueueStatus(item.id, 'in_progress')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {item.status === 'in_progress' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updateQueueStatus(item.id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}

                      {/* Queue Reordering */}
                      {item.status === 'waiting' && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveQueueItem(item.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveQueueItem(item.id, 'down')}
                            disabled={index === filteredItems.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};