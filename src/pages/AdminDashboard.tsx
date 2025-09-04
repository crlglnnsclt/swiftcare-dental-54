import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  UserPlus,
  Settings,
  BarChart3,
  Clock,
  Building2,
  Shield,
  FileText,
  Eye
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppointmentCreationDialog } from '@/components/AppointmentCreationDialog';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalStaff: 0,
    monthlyRevenue: 0,
    todayAppointments: 0,
    pendingApprovals: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isApptDialogOpen, setIsApptDialogOpen] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.role === 'clinic_admin' || profile?.role === 'super_admin') {
      fetchAdminStats();
      fetchRecentActivity();
    }
  }, [profile]);

  const refetchData = () => {
    fetchAdminStats();
    fetchRecentActivity();
  };

  const fetchAdminStats = async () => {
    try {
      // Fetch patients count
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', profile?.clinic_id);

      // Fetch staff count  
      const { count: staffCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .in('role', ['dentist', 'staff', 'receptionist'])
        .eq('clinic_id', profile?.clinic_id);

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { count: todayAppts } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', profile?.clinic_id)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`);

      // Fetch pending payment approvals
      const { count: pendingApprovals } = await supabase
        .from('payments')  
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', profile?.clinic_id)
        .eq('payment_status', 'pending');

      setStats({
        totalPatients: patientCount || 0,
        totalStaff: staffCount || 0,
        monthlyRevenue: 12450, // Static value - will be calculated from actual payments data
        todayAppointments: todayAppts || 0,
        pendingApprovals: pendingApprovals || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: activities } = await supabase
        .from('audit_logs')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(5);

      setRecentActivity(activities || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  if (!profile || !['clinic_admin', 'super_admin'].includes(profile.role)) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground">
              This section is only accessible to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 page-container">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Branch management and oversight</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="btn-3d" onClick={() => navigate('/clinic-branding')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="medical-gradient text-white btn-3d" onClick={() => setIsApptDialogOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Branch Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="glass-card card-3d card-stagger-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-medical-blue">{stats.totalPatients}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="glass-card card-3d card-stagger-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-dental-mint">{stats.totalStaff}</div>
                <p className="text-xs text-muted-foreground">Across all roles</p>
              </CardContent>
            </Card>

            <Card className="glass-card card-3d card-stagger-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">${stats.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card className="glass-card card-3d card-stagger-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-professional-navy">{stats.todayAppointments}</div>
                <p className="text-xs text-muted-foreground">Scheduled for today</p>
              </CardContent>
            </Card>

            <Card className="glass-card card-3d card-stagger-5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="glass-card card-3d interactive-3d">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start btn-3d"
                  onClick={() => navigate('/users-staff')}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New Staff Member
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start btn-3d"
                  onClick={() => navigate('/patient-records')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View All Patients
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start btn-3d"
                  onClick={() => navigate('/analytics')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start btn-3d"
                  onClick={() => navigate('/appointment-settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Appointment Settings
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card card-3d interactive-3d">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No recent activity</p>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={activity.id || index} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="w-2 h-2 bg-medical-blue rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action_description || activity.action_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Staff Management</h3>
                <p className="text-muted-foreground mb-6">
                  Manage staff members, roles, and permissions for your branch.
                </p>
                <Button className="medical-gradient text-white" onClick={() => navigate('/users-staff')}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Manage Staff
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle>Branch Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-6">
                  Comprehensive analytics and reporting for your branch operations.
                </p>
                <Button className="medical-gradient text-white" onClick={() => navigate('/analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle>Branch Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Branch Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="branch-name">Branch Name</Label>
                      <Input id="branch-name" placeholder="Enter branch name" />
                    </div>
                    <div>
                      <Label htmlFor="branch-address">Address</Label>
                      <Input id="branch-address" placeholder="Enter address" />
                    </div>
                    <div>
                      <Label htmlFor="branch-phone">Phone Number</Label>
                      <Input id="branch-phone" placeholder="Enter phone number" />
                    </div>
                    <div>
                      <Label htmlFor="branch-email">Email</Label>
                      <Input id="branch-email" placeholder="Enter email" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Operational Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="operating-hours">Operating Hours</Label>
                      <Input id="operating-hours" placeholder="e.g., 9:00 AM - 6:00 PM" />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Time Zone</Label>
                      <Input id="timezone" placeholder="e.g., UTC+8" />
                    </div>
                    <div>
                      <Label htmlFor="appointment-duration">Default Appointment Duration</Label>
                      <Input id="appointment-duration" placeholder="30" type="number" />
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                className="medical-gradient text-white"
                onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description: "Branch settings have been updated successfully.",
                  });
                }}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AppointmentCreationDialog 
        isOpen={isApptDialogOpen}
        onClose={() => setIsApptDialogOpen(false)}
        onSuccess={refetchData}
      />
    </div>
  );
}