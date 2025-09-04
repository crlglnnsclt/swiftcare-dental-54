import { useAuth } from '@/components/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import QRCheckIn from '@/components/QRCheckIn';
import { PatientCheckIn } from './PatientCheckIn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  UserCheck, 
  Clock, 
  Users, 
  Shield, 
  Smartphone,
  Building2,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QueueItem {
  id: string;
  patient_name: string;
  status: string;
  appointment_time: string;
  position: number;
}

interface StaffCheckInProps {
  profile: any;
}

// Staff Check-In Interface
function StaffCheckIn({ profile }: StaffCheckInProps) {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select(`
          *,
          appointments!inner(
            scheduled_time,
            patients!inner(full_name)
          )
        `)
        .eq('appointments.clinic_id', profile.clinic_id)
        .eq('status', 'waiting')
        .order('position');

      if (error) throw error;

      const formattedQueue = (data || []).map((item, index) => ({
        id: item.id,
        patient_name: item.appointments.patients.full_name,
        status: item.status,
        appointment_time: item.appointments.scheduled_time,
        position: index + 1
      }));

      setQueueItems(formattedQueue);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    if (queueItems.length === 0) return;

    try {
      const nextPatient = queueItems[0];
      const { error } = await supabase
        .from('queue')
        .update({ status: 'called' })
        .eq('id', nextPatient.id);

      if (error) throw error;

      toast.success(`Called ${nextPatient.patient_name} to Room ${profile.room_number || '1'}`);
      fetchQueue();
    } catch (error) {
      console.error('Error calling next patient:', error);
      toast.error('Failed to call next patient');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center">
          <UserCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Staff Check-In Dashboard</h1>
        <p className="text-muted-foreground">
          Manage patient queue and check-ins
        </p>
      </div>

      {/* Staff Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <User className="w-5 h-5" />
            Staff Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700 font-medium">Name</p>
              <p className="text-blue-900">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Role</p>
              <Badge variant="outline" className="text-blue-800 border-blue-300">
                {profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Clinic</p>
              <p className="text-blue-900">{profile.clinic_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Management */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Queue ({queueItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading queue...</p>
            ) : queueItems.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No patients in queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queueItems.slice(0, 5).map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-lg border ${index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.appointment_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{item.position}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCallNext}
              disabled={queueItems.length === 0}
              className="w-full medical-gradient text-white"
              size="lg"
            >
              <UserCheck className="w-5 h-5 mr-2" />
              Call Next Patient
            </Button>
            
            <Button variant="outline" className="w-full" size="lg">
              <QrCode className="w-5 h-5 mr-2" />
              Generate QR Code
            </Button>
            
            <Button variant="outline" className="w-full" size="lg">
              <Calendar className="w-5 h-5 mr-2" />
              View Today's Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions for Staff */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Staff Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-yellow-800">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center text-xs font-bold">1</div>
              <p>Monitor the current queue and call the next patient when ready</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center text-xs font-bold">2</div>
              <p>Generate QR codes for patients to check-in independently</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center text-xs font-bold">3</div>
              <p>View and manage today's appointment schedule</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Check-In Interface
function AdminCheckIn({ profile }: { profile: any }) {
  const [stats, setStats] = useState({
    totalCheckedIn: 0,
    totalWaiting: 0,
    averageWaitTime: 0,
    activeStaff: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch check-in statistics
      const today = new Date().toISOString().split('T')[0];
      
      const { count: checkedInCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'checked_in')
        .gte('scheduled_time', `${today}T00:00:00`);

      const { count: waitingCount } = await supabase
        .from('queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting');

      setStats({
        totalCheckedIn: checkedInCount || 0,
        totalWaiting: waitingCount || 0,
        averageWaitTime: 15, // This would be calculated from actual data
        activeStaff: 8 // This would be calculated from actual data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Check-In Overview</h1>
        <p className="text-muted-foreground">
          Monitor clinic-wide check-in activities and queue management
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalCheckedIn}</div>
            <p className="text-xs text-muted-foreground">Patients processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Waiting</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalWaiting}</div>
            <p className="text-xs text-muted-foreground">In queue now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.averageWaitTime}m</div>
            <p className="text-xs text-muted-foreground">Minutes average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.activeStaff}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Queue Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              View Full Queue
            </Button>
            <Button className="w-full" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Manage Wait Times
            </Button>
            <Button className="w-full" variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              QR Code Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports & Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Branch Performance
            </Button>
            <Button className="w-full" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Daily Summary
            </Button>
            <Button className="w-full" variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Issue Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Smart Check-In Component
export default function SmartCheckIn() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">
              Unable to load your profile. Please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Route to appropriate check-in interface based on user role
  switch (profile.role) {
    case 'patient':
      return <QRCheckIn />;
    
    case 'staff':
    case 'receptionist':
    case 'dentist':
      return <StaffCheckIn profile={profile} />;
    
    case 'clinic_admin':
      return <AdminCheckIn profile={profile} />;
    
    case 'super_admin':
      return <AdminCheckIn profile={profile} />;
    
    default:
      return <QRCheckIn />;
  }
}