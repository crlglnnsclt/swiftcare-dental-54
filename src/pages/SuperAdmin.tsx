import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  Database,
  Globe,
  Settings
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BranchAssignment } from '@/components/BranchAssignment';

export default function SuperAdmin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBranches: 0,
    activeAppointments: 0,
    systemAlerts: 0
  });
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    storage: 'healthy',
    auth: 'healthy',
    functions: 'healthy'
  });
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.enhanced_role === 'super_admin') {
      fetchSystemStats();
    }
  }, [profile]);

  const fetchSystemStats = async () => {
    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch branch count
      const { count: branchCount } = await supabase
        .from('branches')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: userCount || 0,
        totalBranches: branchCount || 0,
        activeAppointments: 0, // TODO: Fetch from appointments table
        systemAlerts: 2
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  if (profile?.enhanced_role !== 'super_admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Super Admin Access Required</h2>
            <p className="text-muted-foreground">
              This section is only accessible to super administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 page-container">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Super Admin Overview</h1>
        <p className="text-muted-foreground">System-wide monitoring and management</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="assignments">Branch Assignments</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card card-3d card-stagger-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Across all branches
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card card-3d card-stagger-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBranches}</div>
                <p className="text-xs text-muted-foreground">
                  Online locations
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card card-3d card-stagger-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Active sessions today
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card card-3d card-stagger-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground float-gentle" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{stats.systemAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card className="glass-card card-3d interactive-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 float-gentle" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-muted-foreground" />
                    <span>Database</span>
                  </div>
                  <Badge variant={systemHealth.database === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.database === 'healthy' ? 'Healthy' : 'Issues'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <span>Storage</span>
                  </div>
                  <Badge variant={systemHealth.storage === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.storage === 'healthy' ? 'Healthy' : 'Issues'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <span>Authentication</span>
                  </div>
                  <Badge variant={systemHealth.auth === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.auth === 'healthy' ? 'Healthy' : 'Issues'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    <span>Functions</span>
                  </div>
                  <Badge variant={systemHealth.functions === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.functions === 'healthy' ? 'Healthy' : 'Issues'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>System Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage Branches
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Database Maintenance
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">New branch created: Downtown Clinic</span>
                    <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-muted-foreground">System backup completed</span>
                    <span className="text-xs text-muted-foreground ml-auto">4h ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-muted-foreground">Storage optimization needed</span>
                    <span className="text-xs text-muted-foreground ml-auto">6h ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <BranchAssignment />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="glass-card card-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Backup Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatic system backups are performed daily at 3:00 AM UTC
                  </p>
                  <Button variant="outline" size="sm">Configure Backup</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Security Settings</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manage system-wide security policies and access controls
                  </p>
                  <Button variant="outline" size="sm">Security Settings</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">System Maintenance</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Schedule maintenance windows and system updates
                  </p>
                  <Button variant="outline" size="sm">Schedule Maintenance</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}