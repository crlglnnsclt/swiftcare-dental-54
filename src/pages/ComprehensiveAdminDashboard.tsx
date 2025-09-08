
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Shield,
  Users,
  Settings,
  BarChart3,
  Activity,
  Database,
  FileText,
  Package,
  DollarSign,
  Clock,
  Plus,
  Edit,
  Save,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Building2,
  Palette,
  Globe,
  Lock,
  Unlock,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { coreModules } from '@/lib/coreModules';
import { SystemModule, Analytics } from '@/types/swiftcare';

const ComprehensiveAdminDashboard = () => {
  const [view, setView] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [systemModules, setSystemModules] = useState<SystemModule[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [clinicSettings, setClinicSettings] = useState<any>({});
  const [formTemplates, setFormTemplates] = useState<any[]>([]);
  
  const [showUserForm, setShowUserForm] = useState(false);
  const [showModuleSettings, setShowModuleSettings] = useState(false);
  const [showFormTemplateDialog, setShowFormTemplateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [newUserData, setNewUserData] = useState({
    full_name: '',
    email: '',
    role: 'staff' as 'dentist' | 'staff' | 'clinic_admin',
    phone: '',
    is_active: true
  });

  const [clinicBranding, setClinicBranding] = useState({
    clinic_name: 'SwiftCare Dental Clinic',
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    welcome_message: 'Welcome to your dental health portal',
    operating_hours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 6:00 PM',
      friday: '8:00 AM - 5:00 PM',
      saturday: '9:00 AM - 2:00 PM',
      sunday: 'Closed'
    }
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPatients: 0,
    systemHealth: 100,
    moduleStatus: 4,
    todayRevenue: 0,
    monthlyRevenue: 0,
    activeSessions: 0
  });

  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile && (profile.role === 'clinic_admin' || profile.role === 'super_admin')) {
      initializeAdminDashboard();
      
      // Periodic updates every 2 minutes
      const interval = setInterval(() => {
        fetchStats();
        fetchSystemHealth();
      }, 120000);
      
      return () => clearInterval(interval);
    }
  }, [profile]);

  const initializeAdminDashboard = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchSystemModules(),
        fetchAnalytics(),
        fetchAuditLogs(),
        fetchClinicSettings(),
        fetchFormTemplates(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error initializing admin dashboard:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'patient')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Users table not found, using mock data');
        const mockUsers = [
          {
            id: '1',
            full_name: 'Dr. Sarah Johnson',
            email: 'dr.johnson@swiftcare.com',
            role: 'dentist',
            phone: '(555) 123-4567',
            is_active: true,
            last_login: '2024-09-08T10:30:00',
            created_at: '2024-01-15T00:00:00'
          },
          {
            id: '2',
            full_name: 'Maria Rodriguez',
            email: 'maria@swiftcare.com',
            role: 'staff',
            phone: '(555) 234-5678',
            is_active: true,
            last_login: '2024-09-08T09:15:00',
            created_at: '2024-02-10T00:00:00'
          },
          {
            id: '3',
            full_name: 'Dr. Michael Chen',
            email: 'dr.chen@swiftcare.com',
            role: 'dentist',
            phone: '(555) 345-6789',
            is_active: false,
            last_login: '2024-09-05T16:45:00',
            created_at: '2024-03-01T00:00:00'
          }
        ];
        setUsers(mockUsers);
        return;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSystemModules = async () => {
    // Mock system modules data
    const mockModules: SystemModule[] = [
      {
        id: '1',
        name: 'Appointment Management',
        description: 'Schedule, reschedule, cancel appointments',
        is_ui_visible: true,
        is_background_running: true,
        permissions: ['view_appointments', 'create_appointments', 'edit_appointments'],
        created_at: '2024-01-01T00:00:00'
      },
      {
        id: '2',
        name: 'Queueing System',
        description: 'Patient order, waiting times, walk-ins',
        is_ui_visible: true,
        is_background_running: true,
        permissions: ['manage_queue', 'view_queue'],
        created_at: '2024-01-01T00:00:00'
      },
      {
        id: '3',
        name: 'Paperless Workflow',
        description: 'Forms, digital signatures, post-procedure logging',
        is_ui_visible: true,
        is_background_running: true,
        permissions: ['create_forms', 'sign_documents', 'view_documents'],
        created_at: '2024-01-01T00:00:00'
      },
      {
        id: '4',
        name: 'Analytics',
        description: 'Revenue, procedure utilization, inventory consumption',
        is_ui_visible: profile?.role === 'super_admin',
        is_background_running: true,
        permissions: ['view_analytics', 'export_reports'],
        created_at: '2024-01-01T00:00:00'
      },
      {
        id: '5',
        name: 'Payroll Management',
        description: 'Staff payroll and time tracking',
        is_ui_visible: false,
        is_background_running: false,
        permissions: ['manage_payroll'],
        created_at: '2024-01-01T00:00:00'
      },
      {
        id: '6',
        name: 'Messaging System',
        description: 'Internal communication between staff',
        is_ui_visible: true,
        is_background_running: false,
        permissions: ['send_messages', 'view_messages'],
        created_at: '2024-01-01T00:00:00'
      }
    ];
    
    setSystemModules(mockModules);
  };

  const fetchAnalytics = async () => {
    // Mock analytics data
    const mockAnalytics: Analytics = {
      revenue: {
        total_revenue: 25680.50,
        revenue_by_dentist: {
          'dentist1': 15420.30,
          'dentist2': 10260.20
        },
        revenue_by_procedure: {
          'Dental Cleaning': 4680.00,
          'Root Canal': 8950.00,
          'Crown Placement': 12050.50
        },
        revenue_by_payment_mode: {
          'Insurance': 15680.30,
          'Cash': 5200.00,
          'Credit Card': 4800.20
        },
        outstanding_balances: {
          'patient1': 850.00,
          'patient2': 1200.00
        },
        discounts_applied: 1250.75,
        period: 'September 2024'
      },
      inventory: {
        items_used: {
          'Dental Composite': 45,
          'Anesthetic': 120,
          'Dental Floss': 200
        },
        usage_by_dentist: {
          'dentist1': { 'Dental Composite': 25, 'Anesthetic': 70 },
          'dentist2': { 'Dental Composite': 20, 'Anesthetic': 50 }
        },
        low_stock_alerts: ['Dental Composite', 'X-Ray Film'],
        usage_forecast: {
          'Dental Composite': 60,
          'Anesthetic': 150
        },
        cost_per_procedure: {
          'Root Canal': 85.50,
          'Crown Placement': 125.00
        }
      },
      performance: {
        profitability: {
          'Root Canal': { revenue: 8950.00, cost: 512.50, profit: 8437.50 },
          'Crown Placement': { revenue: 12050.50, cost: 1875.00, profit: 10175.50 }
        },
        dentist_performance: {
          'dentist1': { revenue: 15420.30, items_cost: 850.25, net_profit: 14570.05, patient_count: 45 },
          'dentist2': { revenue: 10260.20, items_cost: 625.75, net_profit: 9634.45, patient_count: 32 }
        },
        clinic_utilization: {
          patients_per_day: 12.5,
          average_spend: 285.50,
          appointment_completion_rate: 94.5,
          no_show_rate: 5.5
        }
      }
    };
    
    setAnalytics(mockAnalytics);
  };

  const fetchAuditLogs = async () => {
    // Mock audit logs
    const mockAuditLogs = [
      {
        id: '1',
        action: 'User Login',
        user_name: 'Dr. Sarah Johnson',
        timestamp: '2024-09-08T10:30:00',
        details: 'Successful login from 192.168.1.100',
        severity: 'info'
      },
      {
        id: '2',
        action: 'Patient Record Updated',
        user_name: 'Maria Rodriguez',
        timestamp: '2024-09-08T09:15:00',
        details: 'Updated contact information for John Smith',
        severity: 'info'
      },
      {
        id: '3',
        action: 'Failed Login Attempt',
        user_name: 'Unknown',
        timestamp: '2024-09-08T08:45:00',
        details: 'Multiple failed login attempts for dr.johnson@swiftcare.com',
        severity: 'warning'
      }
    ];
    
    setAuditLogs(mockAuditLogs);
  };

  const fetchClinicSettings = async () => {
    // Mock clinic settings
    const mockSettings = {
      clinic_name: 'SwiftCare Dental Clinic',
      address: '123 Dental Street, San Francisco, CA 94102',
      phone: '(555) 123-4567',
      email: 'info@swiftcare.com',
      website: 'www.swiftcare.com',
      tax_id: '12-3456789'
    };
    
    setClinicSettings(mockSettings);
  };

  const fetchFormTemplates = async () => {
    // Mock form templates
    const mockTemplates = [
      {
        id: '1',
        template_name: 'Treatment Consent Form',
        form_type: 'consent',
        is_patient_visible: true,
        auto_attach_procedures: ['Root Canal', 'Crown Placement'],
        created_at: '2024-01-01T00:00:00',
        fields: [
          { label: 'Patient Name', type: 'text', required: true },
          { label: 'Procedure', type: 'text', required: true },
          { label: 'Risks Understood', type: 'checkbox', required: true }
        ]
      },
      {
        id: '2',
        template_name: 'Post-Procedure Instructions',
        form_type: 'care_instructions',
        is_patient_visible: true,
        auto_attach_procedures: ['Dental Cleaning', 'Filling'],
        created_at: '2024-01-01T00:00:00',
        fields: [
          { label: 'Care Instructions', type: 'textarea', required: true },
          { label: 'Follow-up Date', type: 'date', required: false }
        ]
      }
    ];
    
    setFormTemplates(mockTemplates);
  };

  const fetchStats = async () => {
    try {
      // In a real implementation, these would be actual database queries
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.is_active).length;
      const totalPatients = 1250; // Mock number
      const systemHealth = 98.5; // Mock percentage
      const moduleStatus = systemModules.filter(m => m.is_background_running).length;
      const todayRevenue = 2450.50; // Mock amount
      const monthlyRevenue = analytics?.revenue.total_revenue || 0;
      const activeSessions = 8; // Mock number

      setStats({
        totalUsers,
        activeUsers,
        totalPatients,
        systemHealth,
        moduleStatus,
        todayRevenue,
        monthlyRevenue,
        activeSessions
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSystemHealth = async () => {
    // Mock system health check
    console.log('Checking system health...');
  };

  // 👨‍💼 ADMIN FLOW IMPLEMENTATION

  // 1. User Management
  const createUser = async () => {
    if (!newUserData.full_name || !newUserData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in name and email",
        variant: "destructive"
      });
      return;
    }

    try {
      // In real implementation, this would create user in auth system
      const newUser = {
        id: Date.now().toString(),
        ...newUserData,
        created_at: new Date().toISOString(),
        last_login: null
      };

      setUsers(prev => [newUser, ...prev]);
      
      toast({
        title: "User Created",
        description: `${newUserData.full_name} has been added to the system`,
      });

      setNewUserData({
        full_name: '',
        email: '',
        role: 'staff',
        phone: '',
        is_active: true
      });
      setShowUserForm(false);
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: !user.is_active } : user
      ));
      
      toast({
        title: "User Status Updated",
        description: "User access has been modified",
      });
      
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  // 2. System Module Management
  const toggleModuleUI = async (moduleId: string) => {
    try {
      setSystemModules(prev => prev.map(module => 
        module.id === moduleId 
          ? { ...module, is_ui_visible: !module.is_ui_visible }
          : module
      ));

      const module = systemModules.find(m => m.id === moduleId);
      
      toast({
        title: "Module UI Updated",
        description: `${module?.name} UI visibility changed. Module continues running in background.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update module settings",
        variant: "destructive"
      });
    }
  };

  // 3. Clinic Branding
  const saveClinicBranding = async () => {
    try {
      // In real implementation, save to database
      toast({
        title: "Branding Updated",
        description: "Clinic branding settings have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save branding settings",
        variant: "destructive"
      });
    }
  };

  // 4. Form Template Management
  const createFormTemplate = () => {
    setSelectedTemplate(null);
    setShowFormTemplateDialog(true);
  };

  const editFormTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowFormTemplateDialog(true);
  };

  const saveFormTemplate = async () => {
    try {
      toast({
        title: "Template Saved",
        description: "Form template has been updated",
      });
      
      setShowFormTemplateDialog(false);
      fetchFormTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form template",
        variant: "destructive"
      });
    }
  };

  // Utility Functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'clinic_admin': return 'bg-purple-100 text-purple-800';
      case 'dentist': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModuleStatusColor = (module: SystemModule) => {
    if (module.is_background_running) {
      return module.is_ui_visible ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {profile?.role === 'super_admin' ? 'System Administration' : 'Clinic Administration'}
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'super_admin' 
              ? 'Global system oversight and management'
              : 'Clinic management, user roles, and settings'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            <Activity className="w-3 h-3 mr-1" />
            System Online
          </Badge>
          <Button variant="outline" onClick={fetchSystemHealth}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {stats.systemHealth < 95 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>System Performance Notice:</strong> System health at {stats.systemHealth}%. 
            Some services may be experiencing delays.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">{stats.activeUsers} active</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold">{stats.totalPatients}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(0)}</p>
                <p className="text-xs text-green-600">+${stats.todayRevenue} today</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold">{stats.systemHealth}%</p>
                <p className="text-xs text-gray-600">{stats.activeSessions} active sessions</p>
              </div>
              <Activity className={`w-8 h-8 ${stats.systemHealth > 95 ? 'text-green-600' : 'text-orange-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={view} onValueChange={setView} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="modules">System Modules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="clinic">Clinic Settings</TabsTrigger>
          <TabsTrigger value="forms">Form Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity & Audit Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 8).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            log.severity === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-sm">{log.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.user_name} • {new Date(log.timestamp).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">{log.details}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(log.severity)}>
                          {log.severity.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Core Modules</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {stats.moduleStatus}/4 Running
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backup Status</span>
                      <Badge variant="outline" className="text-blue-600">
                        Last: 2h ago
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security</span>
                      <Badge variant="outline" className="text-green-600">
                        <Lock className="w-3 h-3 mr-1" />
                        Secure
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setShowUserForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New User
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setView('modules')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Modules
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={createFormTemplate}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create Form Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User & Role Management
              </CardTitle>
              <Button onClick={() => setShowUserForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {user.phone}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Last login: {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => toggleUserStatus(user.id)}
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

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Module Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Core modules (Appointments, Queue, Paperless, Analytics) 
                  always run in background regardless of UI visibility. Hiding UI does not disable functionality.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {systemModules.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium">{module.name}</h3>
                        <Badge className={getModuleStatusColor(module)}>
                          {module.is_background_running 
                            ? (module.is_ui_visible ? 'UI Visible & Running' : 'Running (UI Hidden)')
                            : 'Stopped'
                          }
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Permissions:</span>
                        {module.permissions.slice(0, 3).map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">UI Visible</span>
                        <Switch
                          checked={module.is_ui_visible}
                          onCheckedChange={() => toggleModuleUI(module.id)}
                          disabled={!module.is_background_running}
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        {module.is_ui_visible ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          {analytics && (
            <div className="space-y-6">
              {/* Revenue Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Revenue Analytics - {analytics.revenue.period}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Revenue by Dentist</h4>
                      {Object.entries(analytics.revenue.revenue_by_dentist).map(([dentist, revenue]) => (
                        <div key={dentist} className="flex justify-between">
                          <span className="text-sm text-gray-600">Dr. {dentist.split('dentist')[1]}</span>
                          <span className="font-medium">${revenue.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Revenue by Procedure</h4>
                      {Object.entries(analytics.revenue.revenue_by_procedure).map(([procedure, revenue]) => (
                        <div key={procedure} className="flex justify-between">
                          <span className="text-sm text-gray-600">{procedure}</span>
                          <span className="font-medium">${revenue.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Payment Methods</h4>
                      {Object.entries(analytics.revenue.revenue_by_payment_mode).map(([method, revenue]) => (
                        <div key={method} className="flex justify-between">
                          <span className="text-sm text-gray-600">{method}</span>
                          <span className="font-medium">${revenue.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          ${analytics.revenue.total_revenue.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          ${Object.values(analytics.revenue.outstanding_balances).reduce((a, b) => a + b, 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Outstanding</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          ${analytics.revenue.discounts_applied.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Discounts Applied</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {analytics.performance.clinic_utilization.patients_per_day}
                        </p>
                        <p className="text-sm text-gray-600">Avg Patients/Day</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance & Profitability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-4">Procedure Profitability</h4>
                      <div className="space-y-3">
                        {Object.entries(analytics.performance.profitability).map(([procedure, data]) => (
                          <div key={procedure} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-sm">{procedure}</p>
                            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                              <div>
                                <span className="text-gray-600">Revenue:</span>
                                <span className="ml-1 font-medium">${data.revenue.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Cost:</span>
                                <span className="ml-1 font-medium">${data.cost.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Profit:</span>
                                <span className="ml-1 font-medium text-green-600">${data.profit.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-4">Dentist Performance</h4>
                      <div className="space-y-3">
                        {Object.entries(analytics.performance.dentist_performance).map(([dentist, data]) => (
                          <div key={dentist} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-sm">Dr. {dentist.split('dentist')[1]}</p>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                              <div>
                                <span className="text-gray-600">Revenue:</span>
                                <span className="ml-1 font-medium">${data.revenue.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Net Profit:</span>
                                <span className="ml-1 font-medium text-green-600">${data.net_profit.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Patients:</span>
                                <span className="ml-1 font-medium">{data.patient_count}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Avg/Patient:</span>
                                <span className="ml-1 font-medium">${(data.revenue / data.patient_count).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Inventory Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-4">Usage by Item</h4>
                      <div className="space-y-2">
                        {Object.entries(analytics.inventory.items_used).map(([item, quantity]) => (
                          <div key={item} className="flex justify-between">
                            <span className="text-sm text-gray-600">{item}</span>
                            <span className="font-medium">{quantity} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-4">Low Stock Alerts</h4>
                      <div className="space-y-2">
                        {analytics.inventory.low_stock_alerts.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <span className="text-sm font-medium text-red-800">{item}</span>
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              Low Stock
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="clinic">
          <div className="space-y-6">
            {/* Clinic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Clinic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Clinic Name</Label>
                      <Input 
                        value={clinicSettings.clinic_name || ''} 
                        onChange={(e) => setClinicSettings({...clinicSettings, clinic_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Textarea 
                        value={clinicSettings.address || ''} 
                        onChange={(e) => setClinicSettings({...clinicSettings, address: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input 
                        value={clinicSettings.phone || ''} 
                        onChange={(e) => setClinicSettings({...clinicSettings, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <Input 
                        value={clinicSettings.email || ''} 
                        onChange={(e) => setClinicSettings({...clinicSettings, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input 
                        value={clinicSettings.website || ''} 
                        onChange={(e) => setClinicSettings({...clinicSettings, website: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Tax ID</Label>
                      <Input 
                        value={clinicSettings.tax_id || ''} 
                        onChange={(e) => setClinicSettings({...clinicSettings, tax_id: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={saveClinicBranding}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Clinic Information
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Clinic Branding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Primary Color</Label>
                      <Input 
                        type="color"
                        value={clinicBranding.primary_color} 
                        onChange={(e) => setClinicBranding({...clinicBranding, primary_color: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <Input 
                        type="color"
                        value={clinicBranding.secondary_color} 
                        onChange={(e) => setClinicBranding({...clinicBranding, secondary_color: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Welcome Message</Label>
                      <Textarea 
                        value={clinicBranding.welcome_message} 
                        onChange={(e) => setClinicBranding({...clinicBranding, welcome_message: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Logo URL</Label>
                      <Input 
                        value={clinicBranding.logo_url} 
                        onChange={(e) => setClinicBranding({...clinicBranding, logo_url: e.target.value})}
                        placeholder="https://www.designmantic.com/logo-images/172155.png?company=Company%20Name&keyword=clinic&slogan=&verify=1"
                      />
                    </div>
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      {clinicBranding.logo_url ? (
                        <img 
                          src={clinicBranding.logo_url} 
                          alt="Clinic Logo" 
                          className="max-h-20 mx-auto"
                          onError={() => setClinicBranding({...clinicBranding, logo_url: ''})}
                        />
                      ) : (
                        <div className="py-8">
                          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Logo Preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={saveClinicBranding}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Branding Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(clinicBranding.operating_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between">
                      <Label className="capitalize">{day}</Label>
                      <Input 
                        className="w-40"
                        value={hours}
                        onChange={(e) => setClinicBranding({
                          ...clinicBranding,
                          operating_hours: {
                            ...clinicBranding.operating_hours,
                            [day]: e.target.value
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button onClick={saveClinicBranding}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Operating Hours
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Digital Form Templates
              </CardTitle>
              <Button onClick={createFormTemplate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{template.template_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {template.form_type.replace('_', ' ')} • 
                        {template.is_patient_visible ? ' Patient Visible' : ' Internal Only'}
                      </p>
                      {template.auto_attach_procedures?.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-attach: {template.auto_attach_procedures.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {template.fields?.length || 0} fields
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editFormTemplate(template)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
                
                {formTemplates.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No form templates created</p>
                    <Button className="mt-4" onClick={createFormTemplate}>
                      Create Your First Template
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({...newUserData, full_name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Select 
                  value={newUserData.role}
                  onValueChange={(value: 'dentist' | 'staff' | 'clinic_admin') => 
                    setNewUserData({...newUserData, role: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dentist">Dentist</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    {profile?.role === 'super_admin' && (
                      <SelectItem value="clinic_admin">Clinic Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={newUserData.is_active}
                onCheckedChange={(checked) => setNewUserData({...newUserData, is_active: checked})}
              />
              <Label htmlFor="is_active">Account Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowUserForm(false)}>
                Cancel
              </Button>
              <Button onClick={createUser}>
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Template Dialog */}
      <Dialog open={showFormTemplateDialog} onOpenChange={setShowFormTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Form Template' : 'Create Form Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name</Label>
                <Input placeholder="Enter template name" />
              </div>
              <div>
                <Label>Form Type</Label>
                <Select defaultValue="consent">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consent">Consent Form</SelectItem>
                    <SelectItem value="intake">Intake Form</SelectItem>
                    <SelectItem value="post_procedure">Post-Procedure Form</SelectItem>
                    <SelectItem value="care_instructions">Care Instructions</SelectItem>
                    <SelectItem value="terms_conditions">Terms & Conditions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="patient_visible" defaultChecked />
              <Label htmlFor="patient_visible">Patient Visible</Label>
            </div>
            <div>
              <Label>Auto-attach to Procedures (optional)</Label>
              <Input placeholder="Root Canal, Crown Placement, etc." />
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Form Builder</p>
              <p className="text-sm text-muted-foreground mt-2">
                Drag and drop form fields, add custom questions, and configure validation rules.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowFormTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveFormTemplate}>
                {selectedTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveAdminDashboard;
