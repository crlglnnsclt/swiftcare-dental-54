import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign } from 'lucide-react';

interface RevenueTrendChartProps {
  data: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data }) => {
  // Generate mock revenue data
  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 30000, profit: 15000 },
    { month: 'Feb', revenue: 52000, expenses: 32000, profit: 20000 },
    { month: 'Mar', revenue: 48000, expenses: 31000, profit: 17000 },
    { month: 'Apr', revenue: 61000, expenses: 35000, profit: 26000 },
    { month: 'May', revenue: 58000, expenses: 34000, profit: 24000 },
    { month: 'Jun', revenue: 67000, expenses: 38000, profit: 29000 },
    { month: 'Jul', revenue: 71000, expenses: 40000, profit: 31000 },
    { month: 'Aug', revenue: 69000, expenses: 39000, profit: 30000 },
    { month: 'Sep', revenue: 74000, expenses: 42000, profit: 32000 },
    { month: 'Oct', revenue: 78000, expenses: 43000, profit: 35000 },
    { month: 'Nov', revenue: 82000, expenses: 45000, profit: 37000 },
    { month: 'Dec', revenue: 85000, expenses: 47000, profit: 38000 }
  ];

  // Revenue breakdown by service type
  const revenueBreakdown = [
    { name: 'General Dentistry', value: 35, fill: '#3b82f6' },
    { name: 'Orthodontics', value: 25, fill: '#10b981' },
    { name: 'Oral Surgery', value: 20, fill: '#f59e0b' },
    { name: 'Cosmetic', value: 15, fill: '#ef4444' },
    { name: 'Other', value: 5, fill: '#8b5cf6' }
  ];

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = revenueData.reduce((sum, item) => sum + item.profit, 0);
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend Line Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Revenue Trend Analysis
          </CardTitle>
          <CardDescription>
            Monthly revenue, expenses, and profit tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                  labelStyle={{ color: '#1f2937' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${(totalRevenue / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${(totalProfit / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-muted-foreground">Total Profit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {profitMargin}%
              </div>
              <div className="text-sm text-muted-foreground">Profit Margin</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Revenue by Service Type
          </CardTitle>
          <CardDescription>
            Distribution of revenue across different dental services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Financial Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Average Monthly Revenue</span>
            <span className="font-semibold">${(totalRevenue / 12 / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Growth Rate (YoY)</span>
            <span className="font-semibold text-green-600">+12.5%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Best Month</span>
            <span className="font-semibold">December</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Revenue per Patient</span>
            <span className="font-semibold">$185</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};