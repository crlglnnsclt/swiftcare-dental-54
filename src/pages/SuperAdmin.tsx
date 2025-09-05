import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  Shield, 
  Settings,
  UserCheck,
  Palette,
  ToggleLeft,
  Database,
  Activity,
  AlertTriangle,
  Key,
  Globe,
  Monitor,
  Server,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SystemStats {
  totalUsers: number;
  totalPatients: number;
  totalStaff: number;
  totalAdmins: number;
  activeFeatures: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status?: string;
  created_at: string;
  last_sign_in_at?: string;
}

export default function SuperAdmin() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalPatients: 0,
    totalStaff: 0,
    totalAdmins: 0,
    activeFeatures: 0,
    systemHealth: 'healthy'
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      fetchSystemData();
    }
  }, [profile]);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Fetch user statistics
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // Calculate role-based statistics
      const totalUsers = userData?.length || 0;
      const totalPatients = userData?.filter(u => u.role === 'patient').length || 0;
      const totalStaff = userData?.filter(u => ['dentist', 'staff', 'receptionist'].includes(u.role)).length || 0;
      const totalAdmins = userData?.filter(u => ['super_admin', 'clinic_admin'].includes(u.role)).length || 0;

      // Fetch feature toggles
      const { data: featureData, error: featureError } = await supabase
        .from('clinic_feature_toggles')
        .select('*');

      if (featureError) throw featureError;

      const activeFeatures = featureData?.filter(f => f.is_enabled).length || 0;

      setStats({
        totalUsers,
        totalPatients,
        totalStaff,
        totalAdmins,
        activeFeatures,
        systemHealth: 'healthy'
      });

      setUsers(userData || []);
      setFeatures(featureData || []);
    } catch (error) {
      console.error('Error fetching system data:', error);
      toast({
        title: "Error",
        description: "Failed to load system data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });

      fetchSystemData();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500';
      case 'clinic_admin':
        return 'bg-orange-500';
      case 'dentist':
        return 'bg-blue-500';
      case 'staff':
        return 'bg-green-500';
      case 'receptionist':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 page-container">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Administration</h1>
        <p className="text-muted-foreground">Manage users, access controls, and system-wide settings</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="features">Feature Management</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">All system users</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patients</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                <p className="text-xs text-muted-foreground">Patient accounts</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStaff}</div>
                <p className="text-xs text-muted-foreground">Staff members</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAdmins}</div>
                <p className="text-xs text-muted-foreground">Admin accounts</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Features</CardTitle>
                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeFeatures}</div>
                <p className="text-xs text-muted-foreground">Enabled features</p>
              </CardContent>
            </Card>
          </div>

          {/* System Health & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Database</span>
                    </div>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Server</span>
                    </div>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Security</span>
                    </div>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/users-staff')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users & Staff
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/feature-toggles')}
                >
                  <ToggleLeft className="w-4 h-4 mr-2" />
                  Feature Management
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/clinic-branding')}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Clinic Branding
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/system-health')}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  System Health
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">User Management</h3>
              <p className="text-sm text-muted-foreground">View and manage all system users</p>
            </div>
            <Button onClick={() => navigate('/users-staff')}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card className="glass-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Last Active</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 10).map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{user.full_name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getRoleColor(user.role)}`}></div>
                            <span className="capitalize">{user.role}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status || 'active')}`}></div>
                            <span className="capitalize">{user.status || 'active'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleUserStatus(user.id, user.status || 'active')}
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Access Control</h3>
            <p className="text-sm text-muted-foreground">Manage user permissions and access levels</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/user-roles')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Manage User Roles
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  Permission Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Access Logs
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Password Policies
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Monitor className="w-4 h-4 mr-2" />
                  Session Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Feature Management</h3>
              <p className="text-sm text-muted-foreground">Control system-wide feature availability</p>
            </div>
            <Button onClick={() => navigate('/feature-toggles')}>
              <Settings className="w-4 h-4 mr-2" />
              Manage Features
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.slice(0, 6).map((feature) => (
              <Card key={feature.id} className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">{feature.feature_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {feature.description}
                    </span>
                    <Badge variant={feature.is_enabled ? 'default' : 'secondary'}>
                      {feature.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">System Settings</h3>
            <p className="text-sm text-muted-foreground">Configure system-wide settings and maintenance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/clinic-branding')}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Clinic Branding
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Global Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Database Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Maintenance & Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/system-health')}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  System Health
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Server className="w-4 h-4 mr-2" />
                  Performance Monitoring
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  System Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}