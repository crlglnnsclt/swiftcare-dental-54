import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface MultiClinicDashboardProps {
  data?: Array<{
    clinic: string;
    patients: number;
    revenue: number;
    satisfaction: number;
    efficiency: number;
  }>;
}

export const MultiClinicDashboard: React.FC<MultiClinicDashboardProps> = ({ data }) => {
  // Mock multi-clinic performance data
  const clinicsData = [
    {
      name: 'Main Clinic',
      patients: 245,
      revenue: 85000,
      satisfaction: 94,
      efficiency: 88,
      staff: 12,
      utilization: 82,
      growth: 15.2,
      status: 'excellent'
    },
    {
      name: 'Downtown Branch',
      patients: 198,
      revenue: 72000,
      satisfaction: 91,
      efficiency: 85,
      staff: 9,
      utilization: 78,
      growth: 12.8,
      status: 'good'
    },
    {
      name: 'Westside Clinic',
      patients: 156,
      revenue: 58000,
      satisfaction: 89,
      efficiency: 82,
      staff: 7,
      utilization: 75,
      growth: 8.5,
      status: 'good'
    },
    {
      name: 'North Branch',
      patients: 132,
      revenue: 48000,
      satisfaction: 86,
      efficiency: 79,
      staff: 6,
      utilization: 68,
      growth: 5.2,
      status: 'average'
    },
    {
      name: 'East Clinic',
      patients: 89,
      revenue: 32000,
      satisfaction: 83,
      efficiency: 75,
      staff: 4,
      utilization: 62,
      growth: -2.1,
      status: 'needs_attention'
    }
  ];

  // Comparative metrics
  const comparisonMetrics = [
    { metric: 'Patient Volume', mainClinic: 245, avgOthers: 144, unit: 'patients' },
    { metric: 'Monthly Revenue', mainClinic: 85000, avgOthers: 52500, unit: 'revenue' },
    { metric: 'Satisfaction Score', mainClinic: 94, avgOthers: 87, unit: 'percentage' },
    { metric: 'Staff Efficiency', mainClinic: 88, avgOthers: 80, unit: 'percentage' }
  ];

  // Monthly trend data
  const monthlyTrends = [
    { month: 'Jan', mainClinic: 78, downtown: 65, westside: 52, north: 45, east: 28 },
    { month: 'Feb', mainClinic: 82, downtown: 68, westside: 54, north: 46, east: 30 },
    { month: 'Mar', mainClinic: 85, downtown: 72, westside: 58, north: 48, east: 32 },
    { month: 'Apr', mainClinic: 85, downtown: 72, westside: 58, north: 48, east: 32 },
    { month: 'May', mainClinic: 85, downtown: 72, westside: 58, north: 48, east: 32 },
    { month: 'Jun', mainClinic: 85, downtown: 72, westside: 58, north: 48, east: 32 }
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      excellent: { variant: 'default' as const, color: 'text-green-600', label: 'Excellent' },
      good: { variant: 'secondary' as const, color: 'text-blue-600', label: 'Good' },
      average: { variant: 'outline' as const, color: 'text-yellow-600', label: 'Average' },
      needs_attention: { variant: 'destructive' as const, color: 'text-red-600', label: 'Needs Attention' }
    };
    
    const { variant, label } = config[status as keyof typeof config] || config.average;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'revenue':
        return `$${(value / 1000).toFixed(0)}k`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Clinic Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            Multi-Clinic Performance Overview
          </CardTitle>
          <CardDescription>
            Real-time performance comparison across all clinic locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {clinicsData.map((clinic) => (
              <div key={clinic.name} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{clinic.name}</h3>
                  {getStatusBadge(clinic.status)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patients</span>
                    <span className="font-medium">{clinic.patients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium">${(clinic.revenue / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Satisfaction</span>
                    <span className="font-medium">{clinic.satisfaction}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Growth</span>
                    <span className={`font-medium ${clinic.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {clinic.growth >= 0 ? '+' : ''}{clinic.growth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Revenue by Clinic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clinicsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: '#1f2937' }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Patient Volume Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Patient Volume Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="mainClinic" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Main Clinic"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="downtown" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Downtown"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="westside" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Westside"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="north" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="North"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="east" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="East"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            Performance Comparison Matrix
          </CardTitle>
          <CardDescription>
            Key metrics comparison between Main Clinic and branch averages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonMetrics.map((metric) => (
              <div key={metric.metric} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{metric.metric}</div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-muted-foreground">Main Clinic</span>
                      <span className="font-semibold">
                        {formatValue(metric.mainClinic, metric.unit)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span className="text-sm text-muted-foreground">Branch Avg</span>
                      <span className="font-semibold">
                        {formatValue(metric.avgOthers, metric.unit)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${
                    metric.mainClinic > metric.avgOthers ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.mainClinic > metric.avgOthers ? '+' : ''}
                    {metric.unit === 'revenue' 
                      ? `$${((metric.mainClinic - metric.avgOthers) / 1000).toFixed(0)}k`
                      : `${(metric.mainClinic - metric.avgOthers).toFixed(1)}${metric.unit === 'percentage' ? '%' : ''}`
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">Difference</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};