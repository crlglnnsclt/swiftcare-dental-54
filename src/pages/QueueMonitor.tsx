import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, User, AlertTriangle, CheckCircle, Volume2, VolumeX, Maximize } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QueueDisplayItem {
  id: string;
  position: number;
  patient_name: string;
  appointment_time: string;
  estimated_wait_minutes: number;
  priority: 'emergency' | 'online' | 'walk_in';
  status: 'waiting' | 'called' | 'in_treatment' | 'completed';
  dentist_name?: string;
}

export default function QueueMonitor() {
  const [queueItems, setQueueItems] = useState<QueueDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchQueueData();
    
    const interval = setInterval(() => {
      fetchQueueData();
    }, 60000); // Refresh every minute

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchQueueData = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      
      // Fetch directly from appointments table
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_time,
          status,
          booking_type,
          duration_minutes,
          notes,
          patients!inner(full_name, contact_number),
          users!dentist_id(full_name)
        `)
        .in('status', ['checked_in', 'in_progress'])
        .gte('scheduled_time', startOfDay)
        .lt('scheduled_time', endOfDay)
        .order('scheduled_time')
        .limit(20);

      if (error) throw error;

      const mappedData: QueueDisplayItem[] = (data || []).map((item, index) => ({
        id: item.id,
        position: index + 1,
        patient_name: item.patients?.full_name || 'Unknown Patient',
        appointment_time: new Date(item.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        estimated_wait_minutes: index * 30,
        priority: item.booking_type === 'emergency' ? 'emergency' : 
                  item.booking_type === 'walk_in' ? 'walk_in' : 'online',
        status: item.status === 'in_progress' ? 'in_treatment' : 'waiting',
        dentist_name: item.users?.full_name
      }));

      setQueueItems(mappedData);
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-600 text-white';
      case 'online': return 'bg-blue-600 text-white';
      case 'walk_in': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const waitingPatients = queueItems.filter(item => item.status === 'waiting');
  const inTreatment = queueItems.filter(item => item.status === 'in_treatment');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-white rounded-lg shadow"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-white rounded-lg shadow"></div>
            <div className="h-64 bg-white rounded-lg shadow"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Queue Monitor</h1>
              <p className="text-lg text-gray-600">Real-time patient queue display</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-gray-600">
                  {currentTime.toLocaleDateString([], { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currently Being Served */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              Currently Being Served
            </h2>
            {inTreatment.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No patients currently in treatment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inTreatment.map((patient) => (
                  <Card key={patient.id} className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold text-green-800">
                            {patient.patient_name}
                          </h3>
                          <p className="text-green-600">
                            {patient.dentist_name ? `Dr. ${patient.dentist_name}` : 'Treatment Room'}
                          </p>
                        </div>
                        <Badge className="bg-green-600 text-white">
                          In Treatment
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waiting Queue */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              Waiting Queue ({waitingPatients.length})
            </h2>
            {waitingPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No patients waiting</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {waitingPatients
                  .sort((a, b) => {
                    if (a.priority === 'emergency' && b.priority !== 'emergency') return -1;
                    if (b.priority === 'emergency' && a.priority !== 'emergency') return 1;
                    return a.position - b.position;
                  })
                  .map((patient, index) => (
                    <Card 
                      key={patient.id} 
                      className={`${
                        patient.priority === 'emergency' 
                          ? 'bg-red-50 border-red-200 shadow-md' 
                          : 'bg-white'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl font-bold text-gray-600">
                                #{index + 1}
                              </span>
                              <h3 className="text-xl font-semibold">
                                {patient.patient_name}
                              </h3>
                              {patient.priority === 'emergency' && (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-gray-600">
                                Appointment: {patient.appointment_time}
                              </p>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600">
                                  Est. wait: {patient.estimated_wait_minutes} minutes
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Badge className={getPriorityColor(patient.priority)}>
                              {patient.priority.toUpperCase()}
                            </Badge>
                            <div className="w-full">
                              <Progress 
                                value={Math.max(0, 100 - (patient.estimated_wait_minutes * 2))} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Bar */}
      <div className="mt-6">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  Emergency
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  Online Booking
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  Walk-in
                </span>
                <span className="flex items-center gap-2">
                  {audioEnabled ? (
                    <Volume2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  )}
                  {audioEnabled ? "Audio On" : "Audio Off"}
                </span>
              </div>
              <div className="text-gray-600">
                Last updated: {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}