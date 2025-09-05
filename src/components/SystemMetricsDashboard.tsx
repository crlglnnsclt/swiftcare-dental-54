import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  Zap,
  Bot,
  BarChart3,
  Target,
  Award
} from "lucide-react";

interface Metric {
  id: string;
  name: string;
  current: number;
  previous: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'efficiency' | 'satisfaction' | 'financial' | 'operational';
}

const SystemMetricsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const metrics: Metric[] = [
    {
      id: "appointment-booking-time",
      name: "Appointment Booking Time",
      current: 2,
      previous: 15,
      target: 1.5,
      unit: "minutes",
      trend: "down",
      category: "efficiency"
    },
    {
      id: "patient-satisfaction",
      name: "Patient Satisfaction Score",
      current: 92,
      previous: 65,
      target: 95,
      unit: "%",
      trend: "up",
      category: "satisfaction"
    },
    {
      id: "insurance-verification-time",
      name: "Insurance Verification",
      current: 30,
      previous: 4320,
      target: 15,
      unit: "seconds",
      trend: "down",
      category: "efficiency"
    },
    {
      id: "revenue-growth",
      name: "Monthly Revenue Growth",
      current: 18,
      previous: 3,
      target: 20,
      unit: "%",
      trend: "up",
      category: "financial"
    },
    {
      id: "staff-productivity",
      name: "Staff Productivity",
      current: 125,
      previous: 100,
      target: 130,
      unit: "index",
      trend: "up",
      category: "operational"
    },
    {
      id: "no-show-rate",
      name: "Appointment No-Show Rate",
      current: 8,
      previous: 22,
      target: 5,
      unit: "%",
      trend: "down",
      category: "operational"
    },
    {
      id: "treatment-accuracy",
      name: "Treatment Plan Accuracy",
      current: 94,
      previous: 78,
      target: 96,
      unit: "%",
      trend: "up",
      category: "satisfaction"
    },
    {
      id: "cost-reduction",
      name: "Operational Cost Reduction",
      current: 23,
      previous: 0,
      target: 25,
      unit: "%",
      trend: "up",
      category: "financial"
    }
  ];

  const getImprovementPercentage = (current: number, previous: number, isReverse = false) => {
    if (previous === 0) return 0;
    const improvement = ((current - previous) / previous) * 100;
    return isReverse ? -improvement : improvement;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      efficiency: <Zap className="h-5 w-5 text-blue-600" />,
      satisfaction: <Award className="h-5 w-5 text-purple-600" />,
      financial: <BarChart3 className="h-5 w-5 text-green-600" />,
      operational: <Target className="h-5 w-5 text-orange-600" />
    };
    return iconMap[category as keyof typeof iconMap] || <Activity className="h-5 w-5" />;
  };

  const getCategoryMetrics = (category: string) => 
    metrics.filter(metric => metric.category === category);

  const overallImprovementScore = Math.round(
    metrics.reduce((sum, metric) => {
      const isReverse = metric.name.toLowerCase().includes('time') || metric.name.toLowerCase().includes('rate');
      return sum + getImprovementPercentage(metric.current, metric.previous, isReverse);
    }, 0) / metrics.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            AI Automation Impact Metrics
          </CardTitle>
          <CardDescription>
            Real-time performance metrics showing the impact of AI automation on clinic operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{overallImprovementScore}%</div>
              <div className="text-sm text-muted-foreground">Overall Improvement</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-muted-foreground">Automation Rate</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">12</div>
              <div className="text-sm text-muted-foreground">Active AI Workflows</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">300%</div>
              <div className="text-sm text-muted-foreground">ROI (12 months)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Selector */}
      <div className="flex justify-center">
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {["week", "month", "quarter", "year"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics by Category */}
      <Tabs defaultValue="efficiency" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="efficiency" className="gap-2">
            <Zap className="h-4 w-4" />
            Efficiency
          </TabsTrigger>
          <TabsTrigger value="satisfaction" className="gap-2">
            <Award className="h-4 w-4" />
            Satisfaction
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="operational" className="gap-2">
            <Target className="h-4 w-4" />
            Operational
          </TabsTrigger>
        </TabsList>

        {["efficiency", "satisfaction", "financial", "operational"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getCategoryMetrics(category).map((metric) => {
                const isReverse = metric.name.toLowerCase().includes('time') || 
                                 metric.name.toLowerCase().includes('rate');
                const improvement = getImprovementPercentage(
                  metric.current, 
                  metric.previous, 
                  isReverse
                );
                const progressValue = (metric.current / metric.target) * 100;

                return (
                  <Card key={metric.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(metric.category)}
                          <CardTitle className="text-lg">{metric.name}</CardTitle>
                        </div>
                        {getTrendIcon(metric.trend)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Current Value */}
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-primary">
                            {metric.current}{metric.unit}
                          </span>
                          <Badge 
                            variant={improvement > 0 ? "default" : "destructive"}
                            className="gap-1"
                          >
                            {improvement > 0 ? "+" : ""}{improvement.toFixed(1)}%
                          </Badge>
                        </div>

                        {/* Progress to Target */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress to Target</span>
                            <span className="font-medium">
                              {metric.target}{metric.unit}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(progressValue, 100)} 
                            className="h-2"
                          />
                        </div>

                        {/* Before/After Comparison */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Before AI</div>
                            <div className="font-medium">
                              {metric.previous}{metric.unit}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">After AI</div>
                            <div className="font-medium text-green-600">
                              {metric.current}{metric.unit}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Key Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Key Achievements with AI Automation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-semibold">87% Faster Scheduling</div>
                <div className="text-sm text-muted-foreground">15 min → 2 min average</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Bot className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-semibold">99% Faster Verification</div>
                <div className="text-sm text-muted-foreground">2-3 days → real-time</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <div className="font-semibold">40% Higher Satisfaction</div>
                <div className="text-sm text-muted-foreground">Patient experience improvement</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <div className="font-semibold">25% Productivity Boost</div>
                <div className="text-sm text-muted-foreground">Staff efficiency gains</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
              <BarChart3 className="h-8 w-8 text-emerald-600" />
              <div>
                <div className="font-semibold">18% Revenue Growth</div>
                <div className="text-sm text-muted-foreground">Monthly improvement</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <Clock className="h-8 w-8 text-red-600" />
              <div>
                <div className="font-semibold">64% Reduced No-Shows</div>
                <div className="text-sm text-muted-foreground">22% → 8% rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMetricsDashboard;