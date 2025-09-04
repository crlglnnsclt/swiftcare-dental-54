import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';

interface QueueItem {
  id: string;
  patient_name: string;
  appointment_time: string;
  estimated_wait_minutes: number;
  priority: 'emergency' | 'scheduled' | 'walk_in';
  status: 'waiting' | 'in_treatment' | 'completed';
  dentist_name?: string;
  position: number;
}

export default function QueueMonitor() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(() => {
      fetchQueueData();
      setCurrentTime(new Date());
    }, 30000); // Refresh every 30 seconds

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update time every second

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchQueueData = async () => {
    try {
      // Simulate queue data since we don't have a complete queue table yet
      const mockQueueData: QueueItem[] = [
        {
          id: '1',
          patient_name: 'Maria Santos',
          appointment_time: '10:00 AM',
          estimated_wait_minutes: 5,
          priority: 'scheduled',
          status: 'in_treatment',
          dentist_name: 'Dr. Rodriguez',
          position: 1
        },
        {
          id: '2',
          patient_name: 'Carlos Mendoza',
          appointment_time: '10:30 AM',
          estimated_wait_minutes: 15,
          priority: 'scheduled',
          status: 'waiting',
          position: 2
        },
        {
          id: '3',
          patient_name: 'Ana Lopez',
          appointment_time: 'Walk-in',
          estimated_wait_minutes: 25,
          priority: 'walk_in',
          status: 'waiting',
          position: 3
        },
        {
          id: '4',
          patient_name: 'Emergency Patient',
          appointment_time: 'Emergency',
          estimated_wait_minutes: 0,
          priority: 'emergency',
          status: 'waiting',
          position: 1
        }
      ];

      setQueueItems(mockQueueData);
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-600 text-white';
      case 'scheduled': return 'bg-blue-600 text-white';
      case 'walk_in': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'in_treatment': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <p className="text-lg text-gray-600">Real-time patient queue status</p>
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
                            {patient.dentist_name || 'Treatment Room'}
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
              <div className="space-y-4">
                {waitingPatients
                  .sort((a, b) => {
                    // Emergency first, then by position
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
                              {patient.priority.replace('_', ' ').toUpperCase()}
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
      <Card className="mt-6 shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                Emergency
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                Scheduled
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                Walk-in
              </span>
            </div>
            <div className="text-gray-600">
              Last updated: {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}