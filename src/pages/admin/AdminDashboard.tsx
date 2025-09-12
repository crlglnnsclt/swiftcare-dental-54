import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    activeStaff: 0,
    pendingTasks: 0,
    systemHealth: 'good'
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch basic stats
      const [patientsResult, appointmentsResult, staffResult] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact' }),
        supabase.from('appointments').select('id', { count: 'exact' }).gte('scheduled_time', new Date().toISOString().split('T')[0]),
        supabase.from('users').select('id', { count: 'exact' }).eq('is_active', true).neq('role', 'patient')
      ]);

      setStats({
        totalPatients: patientsResult.count || 0,
        todayAppointments: appointmentsResult.count || 0,
        monthlyRevenue: 25740, // Mock data for now
        activeStaff: staffResult.count || 0,
        pendingTasks: 3,
        systemHealth: 'good'
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Add New Patient', href: '/admin/patients', icon: Users },
    { label: 'Schedule Appointment', href: '/admin/appointments', icon: Calendar },
    { label: 'View Reports', href: '/admin/analytics', icon: TrendingUp },
    { label: 'Manage Staff', href: '/admin/staff', icon: UserCheck }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">SwiftCare Dental Clinic Management</p>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            System Operational
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Active patient records</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStaff}</div>
              <p className="text-xs text-muted-foreground">Online and working</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.href}>
                    <Button variant="ghost" className="w-full justify-start">
                      <action.icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* System Health & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Health */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Database</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Appointments</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Backup</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Security</p>
                    <p className="text-xs text-muted-foreground">Secure</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New patient registration</p>
                      <p className="text-xs text-muted-foreground">John Smith registered 5 minutes ago</p>
                    </div>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Appointment scheduled</p>
                      <p className="text-xs text-muted-foreground">Dr. Johnson - 2:00 PM today</p>
                    </div>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment received</p>
                      <p className="text-xs text-muted-foreground">$350 from Sarah Wilson</p>
                    </div>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}