import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Clock, TrendingUp, Users, Download, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QueueReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Demo data for queue metrics
  const queueMetrics = {
    avgWaitTime: 18.5,
    totalPatientsToday: 47,
    noShowRate: 12.3,
    avgServiceTime: 22.4,
    peakHour: "10:00 AM",
    dailyTrend: [
      { hour: "8:00", patients: 8, avgWait: 15 },
      { hour: "9:00", patients: 12, avgWait: 22 },
      { hour: "10:00", patients: 15, avgWait: 28 },
      { hour: "11:00", patients: 13, avgWait: 19 },
      { hour: "12:00", patients: 8, avgWait: 12 },
      { hour: "1:00", patients: 11, avgWait: 16 },
      { hour: "2:00", patients: 14, avgWait: 21 },
      { hour: "3:00", patients: 12, avgWait: 18 },
      { hour: "4:00", patients: 9, avgWait: 14 },
    ]
  };

  const weeklyData = [
    { day: "Monday", patients: 52, avgWait: 19.2, noShows: 6 },
    { day: "Tuesday", patients: 48, avgWait: 17.8, noShows: 4 },
    { day: "Wednesday", patients: 55, avgWait: 21.3, noShows: 7 },
    { day: "Thursday", patients: 47, avgWait: 18.5, noShows: 5 },
    { day: "Friday", patients: 51, avgWait: 20.1, noShows: 8 },
    { day: "Saturday", patients: 43, avgWait: 16.2, noShows: 3 },
  ];

  const handleExportReport = async (type: string) => {
    setLoading(true);
    try {
      // Simulate export generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = type === 'daily' ? queueMetrics.dailyTrend : weeklyData;
      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(data[0]).join(",") + "\n" +
        data.map(row => Object.values(row).join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `queue_report_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report Exported",
        description: `${type === 'daily' ? 'Daily' : 'Weekly'} queue report downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Queue Reports</h1>
          <p className="text-muted-foreground">Monitor queue performance and patient flow</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExportReport('daily')}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Daily
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExportReport('weekly')}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Weekly
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueMetrics.avgWaitTime} min</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↓ 12%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueMetrics.totalPatientsToday}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ 8%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueMetrics.noShowRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">↑ 2%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueMetrics.peakHour}</div>
            <p className="text-xs text-muted-foreground">
              15 patients served
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Hourly Breakdown</CardTitle>
              <CardDescription>Patient flow and wait times throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueMetrics.dailyTrend.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{item.hour}</Badge>
                      <div>
                        <p className="font-medium">{item.patients} patients</p>
                        <p className="text-sm text-muted-foreground">Avg wait: {item.avgWait} min</p>
                      </div>
                    </div>
                    <Progress value={item.avgWait * 2} className="w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Summary</CardTitle>
              <CardDescription>Key metrics for the current week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-6">
                      <div className="w-20">
                        <Badge variant="secondary">{day.day}</Badge>
                      </div>
                      <div className="flex space-x-8">
                        <div>
                          <p className="text-sm text-muted-foreground">Patients</p>
                          <p className="font-semibold">{day.patients}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Wait</p>
                          <p className="font-semibold">{day.avgWait} min</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">No-Shows</p>
                          <p className="font-semibold text-red-600">{day.noShows}</p>
                        </div>
                      </div>
                    </div>
                    <Progress value={(day.patients / 60) * 100} className="w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
                <CardDescription>Queue management effectiveness</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Service Time</span>
                  <Badge>{queueMetrics.avgServiceTime} min</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Queue Turnover Rate</span>
                  <Badge variant="secondary">2.7 patients/hour</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Patient Satisfaction</span>
                  <Badge variant="outline">4.2/5 ⭐</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>AI-powered insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm font-medium text-blue-800">Peak Hour Optimization</p>
                  <p className="text-xs text-blue-600">Consider adding staff during 10-11 AM peak hours</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="text-sm font-medium text-green-800">Appointment Spacing</p>
                  <p className="text-xs text-green-600">Current 15-min intervals are optimal</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <p className="text-sm font-medium text-amber-800">No-Show Prevention</p>
                  <p className="text-xs text-amber-600">Implement 2-hour reminder calls</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}