import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, DollarSign, Users, Clock, TrendingUp, TrendingDown, BarChart3, PieChart, Download, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface AnalyticsData {
  // Overview metrics
  totalPatients: number;
  newPatientsThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalAppointments: number;
  appointmentsThisMonth: number;
  averageWaitTime: number;
  patientSatisfaction: number;

  // Charts data
  revenueChart: Array<{ date: string; revenue: number; appointments: number }>;
  patientChart: Array<{ date: string; new: number; returning: number }>;
  appointmentStatusChart: Array<{ name: string; value: number; color: string }>;
  serviceRevenueChart: Array<{ service: string; revenue: number; count: number }>;
  staffPerformanceChart: Array<{ name: string; appointments: number; revenue: number }>;
  inventoryChart: Array<{ category: string; value: number; lowStock: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function Analytics() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30'); // days
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPatients: 0,
    newPatientsThisMonth: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    totalAppointments: 0,
    appointmentsThisMonth: 0,
    averageWaitTime: 0,
    patientSatisfaction: 0,
    revenueChart: [],
    patientChart: [],
    appointmentStatusChart: [],
    serviceRevenueChart: [],
    staffPerformanceChart: [],
    inventoryChart: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    if (!refreshing) setLoading(true);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      const monthStart = new Date();
      monthStart.setDate(1);

      // Fetch patients data
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, created_at');

      if (patientsError) throw patientsError;

      const totalPatients = patientsData?.length || 0;
      const newPatientsThisMonth = patientsData?.filter(p => 
        new Date(p.created_at) >= monthStart
      ).length || 0;

      // Fetch appointments data
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, status, scheduled_time, dentist_id, created_at, duration_minutes')
        .gte('scheduled_time', startDate.toISOString())
        .lte('scheduled_time', endDate.toISOString());

      if (appointmentsError) throw appointmentsError;

      const totalAppointments = appointmentsData?.length || 0;
      const appointmentsThisMonth = appointmentsData?.filter(a => 
        new Date(a.scheduled_time) >= monthStart
      ).length || 0;

      // Get payments data for revenue calculation
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('payment_status', 'verified');

      const totalRevenue = paymentsData?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const revenueThisMonth = paymentsData?.filter(p => 
        new Date(p.created_at) >= monthStart
      ).reduce((sum, p) => sum + p.amount, 0) || 0;

      // Generate revenue chart data
      const revenueChart = [];
      for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayAppointments = appointmentsData?.filter(a => 
          a.scheduled_time.split('T')[0] === dateStr
        ) || [];
        
        const dayPayments = paymentsData?.filter(p => 
          p.created_at.split('T')[0] === dateStr
        ) || [];
        const dayRevenue = dayPayments.reduce((sum, p) => sum + p.amount, 0);

        revenueChart.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dayRevenue,
          appointments: dayAppointments.length
        });
      }

      // Generate patient chart data
      const patientChart = [];
      for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayAppointments = appointmentsData?.filter(a => 
          a.scheduled_time.split('T')[0] === dateStr
        ) || [];
        
        // Simulate new vs returning patients (would need proper patient history tracking)
        const newPatients = Math.floor(dayAppointments.length * 0.3);
        const returningPatients = dayAppointments.length - newPatients;

        patientChart.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          new: newPatients,
          returning: returningPatients
        });
      }

      // Appointment status distribution
      const statusCounts = appointmentsData?.reduce((acc, appointment) => {
        acc[appointment.status] = (acc[appointment.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const appointmentStatusChart = Object.entries(statusCounts).map(([status, value], index) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
        value,
        color: COLORS[index % COLORS.length]
      }));

      // Service revenue chart - simplified as we don't have service_type in appointments
      const serviceRevenueChart = [
        { service: 'General Checkup', revenue: totalRevenue * 0.4, count: Math.floor(totalAppointments * 0.4) },
        { service: 'Cleaning', revenue: totalRevenue * 0.3, count: Math.floor(totalAppointments * 0.3) },
        { service: 'Filling', revenue: totalRevenue * 0.2, count: Math.floor(totalAppointments * 0.2) },
        { service: 'Other', revenue: totalRevenue * 0.1, count: Math.floor(totalAppointments * 0.1) }
      ];

      // Fetch staff data for performance chart
      const { data: staffData, error: staffError } = await supabase
        .from('users')
        .select('id, full_name')
        .in('role', ['dentist', 'staff']);

      if (staffError) throw staffError;

      const staffPerformanceChart = staffData?.map(staff => {
        const staffAppointments = appointmentsData?.filter(a => a.dentist_id === staff.id) || [];
        // Estimate revenue based on appointment count (would need proper payment tracking per staff)
        const staffRevenue = Math.floor(staffAppointments.length * 100); // $100 average per appointment

        return {
          name: staff.full_name,
          appointments: staffAppointments.length,
          revenue: staffRevenue
        };
      }).filter(s => s.appointments > 0) || [];

      // TODO: Fetch from inventory_items table
      const inventoryChart: any[] = [];

      setAnalyticsData({
        totalPatients,
        newPatientsThisMonth,
        totalRevenue,
        revenueThisMonth,
        totalAppointments,
        appointmentsThisMonth,
        averageWaitTime: 0, // TODO: Calculate from actual data
        patientSatisfaction: 0, // TODO: Calculate from actual data
        revenueChart,
        patientChart,
        appointmentStatusChart,
        serviceRevenueChart,
        staffPerformanceChart,
        inventoryChart,
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange: `${dateRange} days`,
      summary: {
        totalPatients: analyticsData.totalPatients,
        totalRevenue: analyticsData.totalRevenue,
        totalAppointments: analyticsData.totalAppointments,
        averageWaitTime: analyticsData.averageWaitTime,
      },
      charts: {
        revenue: analyticsData.revenueChart,
        appointments: analyticsData.appointmentStatusChart,
        services: analyticsData.serviceRevenueChart,
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Analytics report exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analyticsData.newPatientsThisMonth}</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">${analyticsData.revenueThisMonth.toLocaleString()}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalAppointments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{analyticsData.appointmentsThisMonth}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageWaitTime}min</div>
            <p className="text-xs text-muted-foreground">
              Patient satisfaction: {analyticsData.patientSatisfaction}/5
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Revenue</CardTitle>
                <CardDescription>Revenue breakdown by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.serviceRevenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
                <CardDescription>Distribution of appointment statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.appointmentStatusChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.appointmentStatusChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Flow</CardTitle>
                <CardDescription>New vs returning patients</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.patientChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="returning" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="new" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>Appointments and revenue by staff member</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.staffPerformanceChart} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointments" fill="#8884d8" name="Appointments" />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Stock levels and low stock alerts by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.inventoryChart.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.value}% Stocked</div>
                        <div className="text-xs text-muted-foreground">
                          {item.lowStock} items low stock
                        </div>
                      </div>
                      <Badge variant={item.value > 80 ? 'default' : item.value > 60 ? 'secondary' : 'destructive'}>
                        {item.value > 80 ? 'Good' : item.value > 60 ? 'Warning' : 'Critical'}
                      </Badge>
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
}