import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const mockUsageData = [
  { month: 'Jan', users: 120, appointments: 450, forms: 89 },
  { month: 'Feb', users: 135, appointments: 520, forms: 102 },
  { month: 'Mar', users: 148, appointments: 580, forms: 115 },
  { month: 'Apr', users: 162, appointments: 620, forms: 128 },
  { month: 'May', users: 178, appointments: 690, forms: 142 },
  { month: 'Jun', users: 195, appointments: 750, forms: 156 }
];

const mockBranchData = [
  { name: 'Main Clinic', value: 45, color: '#0ea5e9' },
  { name: 'Downtown', value: 30, color: '#06b6d4' },
  { name: 'Westside', value: 15, color: '#8b5cf6' },
  { name: 'Eastside', value: 10, color: '#f59e0b' }
];

export default function SystemAnalytics() {
  const [timeframe, setTimeframe] = useState('6months');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  if (profile?.enhanced_role !== 'super_admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              System analytics are only available to super administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Analytics</h1>
          <p className="text-muted-foreground">Comprehensive system usage and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="medical-gradient text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">195</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">750</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +8.7%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forms Completed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +9.8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">Excellent</Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={400} height={300} data={mockUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={2} />
              <Line type="monotone" dataKey="appointments" stroke="#06b6d4" strokeWidth={2} />
              <Line type="monotone" dataKey="forms" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Branch Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie
                data={mockBranchData}
                cx={200}
                cy={150}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {mockBranchData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Monthly Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart width={800} height={400} data={mockUsageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="appointments" fill="#0ea5e9" />
            <Bar dataKey="forms" fill="#06b6d4" />
          </BarChart>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">API Average</span>
                <span className="text-sm font-medium">145ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-medium">23ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Page Load</span>
                <span className="text-sm font-medium">1.2s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Error Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">4xx Errors</span>
                <span className="text-sm font-medium">0.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">5xx Errors</span>
                <span className="text-sm font-medium">0.01%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="text-sm font-medium text-green-600">99.79%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-medium">2.3 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">File Storage</span>
                <span className="text-sm font-medium">1.8 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Backups</span>
                <span className="text-sm font-medium">950 MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}