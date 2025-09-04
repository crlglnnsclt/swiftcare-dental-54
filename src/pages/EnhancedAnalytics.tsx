import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { QueueHeatmap } from '@/components/enhanced-analytics/QueueHeatmap';
import { RevenueTrendChart } from '@/components/enhanced-analytics/RevenueTrendChart';
import { DentistWorkloadRadar } from '@/components/enhanced-analytics/DentistWorkloadRadar';
import { MultiClinicDashboard } from '@/components/enhanced-analytics/MultiClinicDashboard';
import { BarChart3, Download, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EnhancedAnalytics: React.FC = () => {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastUpdated(new Date().toISOString());
      toast({
        title: "Analytics Updated",
        description: "All charts and reports have been refreshed with latest data.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to refresh analytics data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportAllReports = () => {
    // Mock export functionality
    toast({
      title: "Export Started",
      description: "Generating comprehensive analytics report...",
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Analytics report has been downloaded successfully.",
      });
    }, 2000);
  };

  useEffect(() => {
    setLastUpdated(new Date().toISOString());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                Enhanced Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Advanced insights and comprehensive reporting for SwiftCare Dental
              </p>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={exportAllReports}
                variant="outline"
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Reports
              </Button>
              <Button
                onClick={refreshData}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="queue">Queue Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="workload">Staff Performance</TabsTrigger>
            <TabsTrigger value="multiclinic">Multi-Clinic</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$85,240</div>
                  <p className="text-xs text-muted-foreground">
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18 min</div>
                  <p className="text-xs text-muted-foreground">
                    -2.3 min from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">
                    +1.8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>
                  Real-time overview of your clinic's most important metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Operational Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Queue Efficiency</span>
                          <span className="font-medium">87.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Appointment Utilization</span>
                          <span className="font-medium">92.1%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">No-Show Rate</span>
                          <span className="font-medium">4.2%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Financial Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Revenue per Patient</span>
                          <span className="font-medium">$185</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Collection Rate</span>
                          <span className="font-medium">96.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Profit Margin</span>
                          <span className="font-medium">34.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Queue Analytics Tab */}
          <TabsContent value="queue" className="space-y-6">
            <QueueHeatmap data={[]} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours Analysis</CardTitle>
                  <CardDescription>
                    Busiest times throughout the week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Monday 9:00 AM - 11:00 AM</div>
                        <div className="text-sm text-muted-foreground">Peak Queue Time</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">23 patients</div>
                        <div className="text-sm text-muted-foreground">Avg wait: 35 min</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Friday 2:00 PM - 4:00 PM</div>
                        <div className="text-sm text-muted-foreground">Secondary Peak</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">18 patients</div>
                        <div className="text-sm text-muted-foreground">Avg wait: 28 min</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Queue Optimization Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-blue-900">Schedule Adjustment</div>
                      <div className="text-sm text-blue-700">
                        Consider adding staff during Monday morning peak hours
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-medium text-green-900">Efficiency Opportunity</div>
                      <div className="text-sm text-green-700">
                        Implement pre-check-in for faster processing
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Analysis Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <RevenueTrendChart data={[]} />
          </TabsContent>

          {/* Staff Performance Tab */}
          <TabsContent value="workload" className="space-y-6">
            <DentistWorkloadRadar data={[]} />
          </TabsContent>

          {/* Multi-Clinic Tab */}
          <TabsContent value="multiclinic" className="space-y-6">
            {profile?.role === 'super_admin' ? (
              <MultiClinicDashboard data={[]} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Clinic Analytics</CardTitle>
                  <CardDescription>
                    Super admin access required for multi-clinic analytics
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    This feature is only available for super administrators
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;