import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Clock, 
  TrendingUp, 
  Users, 
  Calendar, 
  Shield, 
  Zap,
  BarChart3,
  FileText,
  Heart,
  DollarSign,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import InteractiveFlowDiagram from "@/components/InteractiveFlowDiagram";
import N8nWorkflowDashboard from "@/components/N8nWorkflowDashboard";
import ProcessDocumentationViewer from "@/components/ProcessDocumentationViewer";
import SystemMetricsDashboard from "@/components/SystemMetricsDashboard";

const AIAutomationFlows = () => {
  const [activeFlow, setActiveFlow] = useState("overview");

  const automationFlows = [
    {
      id: "appointment-scheduling",
      name: "Intelligent Appointment Scheduling",
      description: "AI-powered scheduling with conflict resolution and optimization",
      improvement: "87%",
      timeReduction: "15 min → 2 min",
      status: "active",
      icon: <Calendar className="h-5 w-5" />,
      metrics: {
        efficiency: 87,
        satisfaction: 92,
        noShows: -40
      }
    },
    {
      id: "patient-communication",
      name: "Automated Patient Communication",
      description: "Smart messaging with personalized content and timing",
      improvement: "75%",
      timeReduction: "24-48h → Real-time",
      status: "active",
      icon: <Bot className="h-5 w-5" />,
      metrics: {
        efficiency: 75,
        satisfaction: 88,
        responseTime: -95
      }
    },
    {
      id: "insurance-verification",
      name: "Real-time Insurance Verification",
      description: "Instant verification with automated claim processing",
      improvement: "99%",
      timeReduction: "2-3 days → Real-time",
      status: "active",
      icon: <Shield className="h-5 w-5" />,
      metrics: {
        efficiency: 99,
        accuracy: 98,
        processingTime: -99
      }
    },
    {
      id: "treatment-planning",
      name: "AI Treatment Plan Generator",
      description: "Evidence-based treatment recommendations with cost analysis",
      improvement: "65%",
      timeReduction: "45 min → 15 min",
      status: "active",
      icon: <Heart className="h-5 w-5" />,
      metrics: {
        efficiency: 65,
        accuracy: 94,
        patientSatisfaction: 89
      }
    },
    {
      id: "risk-assessment",
      name: "Patient Risk Assessment",
      description: "Predictive analytics for health risks and treatment outcomes",
      improvement: "82%",
      timeReduction: "30 min → 5 min",
      status: "active",
      icon: <TrendingUp className="h-5 w-5" />,
      metrics: {
        efficiency: 82,
        accuracy: 96,
        earlyDetection: 78
      }
    },
    {
      id: "inventory-management",
      name: "Smart Inventory Management",
      description: "Predictive restocking with automated ordering",
      improvement: "73%",
      timeReduction: "Daily → Automated",
      status: "active",
      icon: <BarChart3 className="h-5 w-5" />,
      metrics: {
        efficiency: 73,
        costReduction: 23,
        stockouts: -85
      }
    },
    {
      id: "revenue-optimization",
      name: "Revenue Optimization",
      description: "Dynamic pricing and treatment upselling recommendations",
      improvement: "45%",
      timeReduction: "Weekly → Real-time",
      status: "active",
      icon: <DollarSign className="h-5 w-5" />,
      metrics: {
        efficiency: 45,
        revenue: 20,
        conversionRate: 32
      }
    },
    {
      id: "quality-assurance",
      name: "Quality Assurance Automation",
      description: "Automated quality checks and compliance monitoring",
      improvement: "91%",
      timeReduction: "Manual → Automated",
      status: "active",
      icon: <CheckCircle className="h-5 w-5" />,
      metrics: {
        efficiency: 91,
        compliance: 99,
        errorReduction: 87
      }
    },
    {
      id: "emergency-response",
      name: "Emergency Response System",
      description: "Rapid triage and resource allocation for emergencies",
      improvement: "83%",
      timeReduction: "30+ min → 5 min",
      status: "active",
      icon: <Zap className="h-5 w-5" />,
      metrics: {
        efficiency: 83,
        responseTime: -83,
        patientOutcomes: 67
      }
    },
    {
      id: "staff-analytics",
      name: "Staff Performance Analytics",
      description: "Real-time performance insights and optimization suggestions",
      improvement: "56%",
      timeReduction: "Monthly → Real-time",
      status: "active",
      icon: <Users className="h-5 w-5" />,
      metrics: {
        efficiency: 56,
        productivity: 25,
        satisfaction: 78
      }
    },
    {
      id: "patient-retention",
      name: "Patient Retention AI",
      description: "Predictive churn analysis with retention strategies",
      improvement: "68%",
      timeReduction: "Reactive → Proactive",
      status: "active",
      icon: <Heart className="h-5 w-5" />,
      metrics: {
        efficiency: 68,
        retention: 34,
        lifetime_value: 28
      }
    },
    {
      id: "compliance",
      name: "Regulatory Compliance Automation",
      description: "Automated compliance monitoring and reporting",
      improvement: "94%",
      timeReduction: "Weekly → Real-time",
      status: "active",
      icon: <FileText className="h-5 w-5" />,
      metrics: {
        efficiency: 94,
        compliance: 100,
        auditReadiness: 95
      }
    }
  ];

  const overallMetrics = {
    systemImprovement: 67,
    automationRate: 85,
    staffProductivity: 25,
    revenueGrowth: 18,
    patientSatisfaction: 40,
    roi: 300
  };

  const userJourneys = [
    {
      role: "Patient",
      description: "Self-service portal with AI chatbot assistance",
      keyFeatures: [
        "AI-powered appointment booking",
        "Smart health questionnaires", 
        "Predictive treatment recommendations",
        "Automated insurance verification",
        "Real-time communication"
      ],
      improvement: "92% satisfaction increase"
    },
    {
      role: "Dentist", 
      description: "AI-enhanced clinical decision support",
      keyFeatures: [
        "Evidence-based treatment plans",
        "Risk assessment analytics",
        "Automated documentation", 
        "Smart scheduling optimization",
        "Quality assurance alerts"
      ],
      improvement: "35% time savings"
    },
    {
      role: "Staff",
      description: "Streamlined operations with 85% automation",
      keyFeatures: [
        "Automated patient check-in",
        "Smart inventory management",
        "Intelligent task prioritization",
        "Real-time performance insights",
        "Automated compliance monitoring"
      ],
      improvement: "25% productivity boost"
    },
    {
      role: "Clinic Admin",
      description: "Real-time insights and management dashboards", 
      keyFeatures: [
        "Predictive analytics dashboard",
        "Revenue optimization insights",
        "Staff performance monitoring",
        "Automated reporting",
        "Resource allocation optimization"
      ],
      improvement: "60% faster decision making"
    },
    {
      role: "Super Admin",
      description: "Enterprise-level orchestration and oversight",
      keyFeatures: [
        "Multi-clinic performance analytics",
        "Cross-clinic resource optimization",
        "Compliance monitoring dashboard",
        "Advanced forecasting models",
        "System-wide automation control"
      ],
      improvement: "45% operational efficiency"
    }
  ];

  const implementationPhases = [
    {
      phase: "Phase 1: Foundation",
      timeline: "Weeks 1-8",
      description: "Essential automations and core infrastructure",
      deliverables: [
        "Intelligent appointment scheduling",
        "Automated patient communication", 
        "Basic insurance verification",
        "Core AI infrastructure setup"
      ],
      progress: 100
    },
    {
      phase: "Phase 2: Enhancement", 
      timeline: "Weeks 9-16",
      description: "Operational optimization and workflow automation",
      deliverables: [
        "Treatment plan generator",
        "Smart inventory management",
        "Quality assurance automation",
        "Staff performance analytics"
      ],
      progress: 75
    },
    {
      phase: "Phase 3: Intelligence",
      timeline: "Weeks 17-24", 
      description: "Advanced AI capabilities and predictive analytics",
      deliverables: [
        "Patient risk assessment",
        "Revenue optimization",
        "Emergency response system",
        "Predictive analytics dashboard"
      ],
      progress: 45
    },
    {
      phase: "Phase 4: Optimization",
      timeline: "Weeks 25-32",
      description: "System optimization and scaling",
      deliverables: [
        "Patient retention AI",
        "Regulatory compliance automation", 
        "Cross-clinic optimization",
        "Advanced forecasting"
      ],
      progress: 20
    }
  ];

  const handleViewFlowDetails = (flowId: string) => {
    toast.success(`Opening detailed flow documentation for ${flowId}`);
    // This would navigate to detailed flow documentation
  };

  const handleN8nIntegration = () => {
    toast.success("Opening n8n workflow integration panel");
    // This would open the n8n integration interface
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SwiftCare AI Automation Flows
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete AI automation documentation with interactive flows, user journeys, and implementation roadmaps
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleN8nIntegration} className="gap-2">
              <Zap className="h-4 w-4" />
              n8n Integration Dashboard
            </Button>
            <Button variant="outline" onClick={() => toast.success("Opening interactive dashboard")}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Interactive Dashboard
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transformation Impact Metrics
            </CardTitle>
            <CardDescription>
              Overall system improvements achieved through AI automation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{overallMetrics.systemImprovement}%</div>
                <div className="text-sm text-muted-foreground">System Improvement</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-600">{overallMetrics.automationRate}%</div>
                <div className="text-sm text-muted-foreground">Automation Rate</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-blue-600">+{overallMetrics.staffProductivity}%</div>
                <div className="text-sm text-muted-foreground">Staff Productivity</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-emerald-600">+{overallMetrics.revenueGrowth}%</div>
                <div className="text-sm text-muted-foreground">Revenue Growth</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-orange-600">+{overallMetrics.patientSatisfaction}%</div>
                <div className="text-sm text-muted-foreground">Patient Satisfaction</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-purple-600">{overallMetrics.roi}%</div>
                <div className="text-sm text-muted-foreground">ROI (12 months)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeFlow} onValueChange={setActiveFlow} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">AI Workflows</TabsTrigger>
            <TabsTrigger value="journeys">User Journeys</TabsTrigger>
            <TabsTrigger value="metrics">Impact Metrics</TabsTrigger>
            <TabsTrigger value="n8n">n8n Dashboard</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automationFlows.slice(0, 6).map((flow) => (
                <Card key={flow.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {flow.icon}
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">+{flow.improvement}</div>
                        <div className="text-xs text-muted-foreground">Improvement</div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{flow.name}</CardTitle>
                    <CardDescription>{flow.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Time Reduction:</span>
                        <span className="text-green-600">{flow.timeReduction}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleViewFlowDetails(flow.id)}
                      >
                        View Flow Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {automationFlows.map((flow) => (
                <Card key={flow.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {flow.icon}
                        <div>
                          <CardTitle className="text-lg">{flow.name}</CardTitle>
                          <CardDescription>{flow.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{flow.metrics.efficiency}%</div>
                          <div className="text-muted-foreground">Efficiency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{flow.metrics.satisfaction || flow.metrics.accuracy}%</div>
                          <div className="text-muted-foreground">{flow.metrics.satisfaction ? 'Satisfaction' : 'Accuracy'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {flow.metrics.noShows ? flow.metrics.noShows : `+${flow.metrics.responseTime || flow.metrics.processingTime || flow.metrics.earlyDetection || 0}`}%
                          </div>
                          <div className="text-muted-foreground">Impact</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewFlowDetails(flow.id)}
                        >
                          View Flow
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => toast.success(`Opening n8n workflow for ${flow.name}`)}
                        >
                          n8n Setup
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Journeys Tab */}
          <TabsContent value="journeys" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userJourneys.map((journey, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {journey.role}
                      </CardTitle>
                      <Badge variant="outline">{journey.improvement}</Badge>
                    </div>
                    <CardDescription>{journey.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Key AI Features:</h4>
                      <ul className="space-y-2">
                        {journey.keyFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={() => toast.success(`Opening detailed ${journey.role} journey flow`)}
                      >
                        View Detailed Journey
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Impact Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <SystemMetricsDashboard />
          </TabsContent>

          {/* n8n Dashboard Tab */}
          <TabsContent value="n8n" className="space-y-6">
            <N8nWorkflowDashboard />
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            <div className="space-y-6">
              {/* Patient Journey Example */}
              <InteractiveFlowDiagram
                title="Patient Appointment Journey"
                description="Complete patient experience from booking to follow-up"
                type="patient-journey"
                beforeSteps={[
                  { id: "1", title: "Call Clinic", description: "Patient calls during business hours", duration: "5 min", status: "completed", type: "manual" },
                  { id: "2", title: "Wait on Hold", description: "Average wait time for receptionist", duration: "8 min", status: "completed", type: "manual" },
                  { id: "3", title: "Schedule Manually", description: "Receptionist checks calendar manually", duration: "12 min", status: "completed", type: "manual" },
                  { id: "4", title: "Paper Confirmation", description: "Manual confirmation process", duration: "3 min", status: "completed", type: "manual" },
                  { id: "5", title: "Follow-up Call", description: "Staff calls to confirm 24h before", duration: "5 min", status: "completed", type: "manual" }
                ]}
                afterSteps={[
                  { id: "1", title: "AI Chat Assistant", description: "24/7 intelligent booking assistant", duration: "30 sec", status: "completed", type: "ai", improvement: "+400% faster" },
                  { id: "2", title: "Smart Scheduling", description: "AI optimizes appointment slots", duration: "45 sec", status: "completed", type: "ai", improvement: "Conflict-free" },
                  { id: "3", title: "Instant Confirmation", description: "Automated confirmation with details", duration: "15 sec", status: "completed", type: "automated", improvement: "Real-time" },
                  { id: "4", title: "Smart Reminders", description: "Personalized automated reminders", duration: "0 sec", status: "completed", type: "ai", improvement: "Predictive timing" }
                ]}
                metrics={{
                  timeReduction: "87% faster",
                  efficiencyGain: "5x improvement",
                  satisfactionIncrease: "+40% patient satisfaction"
                }}
              />

              {/* System Architecture Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Technical Architecture
                  </CardTitle>
                  <CardDescription>
                    AI-enhanced system architecture with integration points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">Frontend</div>
                      <div className="text-sm space-y-1">
                        <div>React/TypeScript</div>
                        <div>Tailwind CSS</div>
                        <div>Real-time UI</div>
                        <div>PWA Capabilities</div>
                      </div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">Backend</div>
                      <div className="text-sm space-y-1">
                        <div>Supabase</div>
                        <div>PostgreSQL</div>
                        <div>Row Level Security</div>
                        <div>Edge Functions</div>
                      </div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-2">AI Layer</div>
                      <div className="text-sm space-y-1">
                        <div>n8n Workflows</div>
                        <div>OpenAI GPT-4</div>
                        <div>Machine Learning</div>
                        <div>Predictive Analytics</div>
                      </div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-2">Security</div>
                      <div className="text-sm space-y-1">
                        <div>HIPAA Compliant</div>
                        <div>End-to-End Encryption</div>
                        <div>Audit Logging</div>
                        <div>Role-Based Access</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-6">
            <ProcessDocumentationViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAutomationFlows;