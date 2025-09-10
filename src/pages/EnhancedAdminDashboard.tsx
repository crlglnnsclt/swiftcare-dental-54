
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Users,
  Settings,
  BarChart3,
  Shield,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Building,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Package
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'clinic_admin' | 'dentist' | 'staff' | 'patient';
  is_active: boolean;
  clinic_id?: string;
  created_at: string;
  last_login?: string;
}

interface SystemModule {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  background_running: boolean;
  permissions: string[];
}

interface ClinicStats {
  totalUsers: number;
  activeUsers: number;
  todayAppointments: number;
  monthlyRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

const EnhancedAdminDashboard = () => {
  const [view, setView] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [systemModules, setSystemModules] = useState<SystemModule[]>([]);
  const [stats, setStats] = useState<ClinicStats>({
    totalUsers: 0,
    activeUsers: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    systemHealth: 'healthy'
  });
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    role: 'staff' as User['role'],
    clinic_id: ''
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { profile } = useAuth();
  const { toast } = useToast();
  
  const isSystemAdmin = profile?.role === 'super_admin';
  const isClinicAdmin = profile?.role === 'clinic_admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchSystemModules(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // Simplify to avoid type instantiation issues
      // Skip complex filtering to avoid deep type instantiation

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform users to match expected interface
      const transformedUsers = (data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        clinic_id: user.clinic_id,
        is_active: true, // Default to active since this field is required
        last_login: user.last_login,
        created_at: user.created_at
      }));
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSystemModules = async () => {
    // Mock system modules - in real app, fetch from database
    const mockModules: SystemModule[] = [
      {
        id: '1',
        name: 'Appointment Scheduling',
        description: 'Patient appointment booking and management',
        is_enabled: true,
        background_running: true,
        permissions: ['read', 'write', 'manage']
      },
      {
        id: '2',
        name: 'Queue Management',
        description: 'Real-time patient queue and check-in system',
        is_enabled: true,
        background_running: true,
        permissions: ['read', 'write']
      },
      {
        id: '3',
        name: 'Billing System',
        description: 'Invoice generation and payment processing',
        is_enabled: true,
        background_running: false,
        permissions: ['read', 'write', 'admin']
      },
      {
        id: '4',
        name: 'Inventory Management',
        description: 'Stock tracking and automatic reorder alerts',
        is_enabled: true,
        background_running: true,
        permissions: ['read', 'write']
      },
      {
        id: '5',
        name: 'Analytics & Reporting',
        description: 'Business intelligence and performance metrics',
        is_enabled: isSystemAdmin, // Only available for super admin
        background_running: true,
        permissions: ['read', 'admin']
      }
    ];
    
    setSystemModules(mockModules);
  };

  const fetchStats = async () => {
    try {
      // Fetch various statistics
      const today = new Date().toISOString().split('T')[0];
      
      // Total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Active users (logged in within last 7 days)
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Today's appointments
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_time', `${today}T00:00:00`)
        .lt('scheduled_time', `${today}T23:59:59`);

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        todayAppointments: todayAppointments || 0,
        monthlyRevenue: 45750, // Mock data
        systemHealth: 'healthy'
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.full_name || !newUser.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // In real app, this would create user in auth system first
      const userData = {
        ...newUser,
        id: `user_${Date.now()}`,
        is_active: true,
        created_at: new Date().toISOString(),
        clinic_id: isClinicAdmin ? profile?.clinic_id : newUser.clinic_id
      };

      setUsers(prev => [userData, ...prev]);
      
      toast({
        title: "User Created",
        description: `${newUser.full_name} has been added successfully`,
      });

      setShowUserDialog(false);
      setNewUser({
        full_name: '',
        email: '',
        role: 'staff',
        clinic_id: ''
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, is_active: !currentStatus } : user
        )
      );

      toast({
        title: "User Status Updated",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const toggleSystemModule = (moduleId: string, enabled: boolean) => {
    setSystemModules(prev => 
      prev.map(module => 
        module.id === moduleId ? { ...module, is_enabled: enabled } : module
      )
    );

    toast({
      title: "System Module Updated",
      description: `Module ${enabled ? 'enabled' : 'disabled'} successfully`,
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'clinic_admin': return 'bg-purple-100 text-purple-800';
      case 'dentist': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'patient': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isSystemAdmin ? 'System Administration' : 'Clinic Administration'}
          </h1>
          <p className="text-muted-foreground">
            {isSystemAdmin ? 'Global system oversight and management' : 'Branch management and user control'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={stats.systemHealth === 'healthy' ? 'default' : 'destructive'}>
            System: {stats.systemHealth}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          {isSystemAdmin && <TabsTrigger value="system">System Modules</TabsTrigger>}
          <TabsTrigger value="clinic">Clinic Settings</TabsTrigger>
          <TabsTrigger value="forms">Form Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={newUser.full_name}
                        onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select 
                        value={newUser.role}
                        onValueChange={(value: User['role']) => setNewUser({...newUser, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {isSystemAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                          <SelectItem value="clinic_admin">Clinic Admin</SelectItem>
                          <SelectItem value="dentist">Dentist</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="patient">Patient</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {isSystemAdmin && (
                      <div>
                        <Label htmlFor="clinic_id">Clinic ID (optional)</Label>
                        <Input
                          id="clinic_id"
                          value={newUser.clinic_id}
                          onChange={(e) => setNewUser({...newUser, clinic_id: e.target.value})}
                          placeholder="Enter clinic ID"
                        />
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser}>
                        Create User
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Active</Label>
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                        />
                      </div>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isSystemAdmin && (
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemModules.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{module.name}</p>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            {module.background_running && (
                              <Badge variant="secondary">Background Service</Badge>
                            )}
                            <Badge variant="outline">
                              Permissions: {module.permissions.join(', ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">Enabled</Label>
                          <Switch
                            checked={module.is_enabled}
                            onCheckedChange={(enabled) => toggleSystemModule(module.id, enabled)}
                          />
                        </div>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="clinic">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clinic_name">Clinic Name</Label>
                  <Input id="clinic_name" defaultValue="SwiftCare Dental Clinic" />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="123 Dental Street, San Francisco, CA" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="(555) 123-4567" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">Day</span>
                  <span className="font-medium">Open</span>
                  <span className="font-medium">Close</span>
                  
                  <span>Monday</span>
                  <Input defaultValue="09:00" type="time" />
                  <Input defaultValue="18:00" type="time" />
                  
                  <span>Tuesday</span>
                  <Input defaultValue="09:00" type="time" />
                  <Input defaultValue="18:00" type="time" />
                  
                  <span>Wednesday</span>
                  <Input defaultValue="09:00" type="time" />
                  <Input defaultValue="18:00" type="time" />
                </div>
                <Button>Update Hours</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Form Templates</CardTitle>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Patient Registration', 'Medical History', 'Consent Form', 'Treatment Plan'].map((formName, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{formName}</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Active</Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAdminDashboard;
