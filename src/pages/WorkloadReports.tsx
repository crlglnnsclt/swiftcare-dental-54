import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Clock, TrendingUp, Activity, Download, Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWorkloadData } from "@/hooks/useWorkloadData";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WorkloadReports() {
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = useState(false);
  const { dentistData, overallStats, loading, error, refetch } = useWorkloadData();

  const handleExportReport = async (type: string) => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let data;
      let filename;
      
      if (type === 'dentist-performance') {
        data = dentistData.map(d => ({
          name: d.name,
          weeklyHours: d.weeklyHours,
          appointments: d.thisWeekStats.appointments,
          completionRate: ((d.thisWeekStats.completed / d.thisWeekStats.appointments) * 100).toFixed(1),
          avgTreatmentTime: d.avgTreatmentTime,
          revenue: d.thisWeekStats.revenue,
          satisfaction: d.patientSatisfaction
        }));
        filename = 'dentist_performance_report';
      } else {
        data = dentistData.flatMap(d => d.dailySchedule.map(day => ({
          dentist: d.name,
          day: day.day,
          hours: day.hours,
          patients: day.patients,
          utilization: day.utilization
        })));
        filename = 'daily_schedule_report';
      }
      
      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(data[0]).join(",") + "\n" +
        data.map(row => Object.values(row).join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report Exported",
        description: `Workload report downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading workload data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error} 
            <Button variant="outline" size="sm" onClick={refetch} className="ml-2">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dentist Workload Reports</h1>
          <p className="text-muted-foreground">Monitor dentist performance and workload distribution</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExportReport('dentist-performance')}
            disabled={exportLoading || loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Performance
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExportReport('schedule')}
            disabled={exportLoading || loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Schedule
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dentists</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalDentists}</div>
            <p className="text-xs text-muted-foreground">Available today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ 3.2%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalPatientsToday}</div>
            <p className="text-xs text-muted-foreground">Across all dentists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalWeeklyHours}</div>
            <p className="text-xs text-muted-foreground">Total scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.avgSatisfaction} ⭐</div>
            <p className="text-xs text-muted-foreground">Patient satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Performance</TabsTrigger>
          <TabsTrigger value="scheduling">Schedule Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {dentistData.map((dentist) => (
              <Card key={dentist.id}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={dentist.avatar} />
                      <AvatarFallback>{dentist.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{dentist.name}</CardTitle>
                      <CardDescription>{dentist.specialties.join(", ")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Patients</p>
                      <p className="text-xl font-bold">{dentist.todayPatients}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Weekly Hours</p>
                      <p className="text-xl font-bold">{dentist.weeklyHours}h</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg Treatment Time</span>
                      <span>{dentist.avgTreatmentTime} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Patient Rating</span>
                      <span>{dentist.patientSatisfaction} ⭐</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>This Week Revenue</span>
                      <span>${dentist.thisWeekStats.revenue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Week Completion Rate</span>
                      <span>{Math.round((dentist.thisWeekStats.completed / dentist.thisWeekStats.appointments) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(dentist.thisWeekStats.completed / dentist.thisWeekStats.appointments) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          {dentistData.map((dentist) => (
            <Card key={dentist.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={dentist.avatar} />
                      <AvatarFallback>{dentist.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{dentist.name}</CardTitle>
                      <CardDescription>Performance metrics for this week</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {dentist.specialties.join(" • ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{dentist.thisWeekStats.appointments}</p>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{dentist.thisWeekStats.completed}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{dentist.thisWeekStats.noShows}</p>
                    <p className="text-sm text-muted-foreground">No-Shows</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">${dentist.thisWeekStats.revenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule Analysis</CardTitle>
              <CardDescription>Daily utilization rates for all dentists</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dentistData.map((dentist) => (
                  <div key={dentist.id} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">{dentist.initials}</AvatarFallback>
                      </Avatar>
                      <h4 className="font-medium">{dentist.name}</h4>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      {dentist.dailySchedule.map((day, index) => (
                        <div key={index} className="text-center p-3 border rounded-lg">
                          <p className="font-medium text-sm">{day.day}</p>
                          <p className="text-xs text-muted-foreground">{day.hours}h • {day.patients}p</p>
                          <Progress value={day.utilization} className="h-1 mt-2" />
                          <p className="text-xs mt-1">{day.utilization}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workload Balance</CardTitle>
                <CardDescription>Optimize dentist schedules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <p className="text-sm font-medium text-amber-800">High Utilization Alert</p>
                  <p className="text-xs text-amber-600">Dr. Rodriguez at 96% capacity - consider redistributing</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm font-medium text-blue-800">Scheduling Opportunity</p>
                  <p className="text-xs text-blue-600">Dr. Chen has availability on Thursday afternoons</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="text-sm font-medium text-green-800">Optimal Performance</p>
                  <p className="text-xs text-green-600">Dr. Johnson maintains excellent work-life balance</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>AI-powered recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average utilization target</span>
                    <Badge variant="outline">85-90%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recommended break time</span>
                    <Badge variant="outline">15 min/4h</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Max consecutive appointments</span>
                    <Badge variant="outline">8 patients</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h5 className="font-medium mb-2">Efficiency Metrics</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Best performing time slot</span>
                      <span>10:00-11:00 AM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average treatment duration</span>
                      <span>45 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak productivity day</span>
                      <span>Wednesday</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}