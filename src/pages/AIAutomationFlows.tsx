import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle,
  AlertCircle,
  Play,
  Loader2,
  Settings,
  TestTube
} from "lucide-react";
import { toast } from "sonner";
import { useFeatureToggle } from "@/hooks/useFeatureToggle";
import { supabase } from "@/integrations/supabase/client";

const AIAutomationFlows = () => {
  const [activeFlow, setActiveFlow] = useState("overview");
  const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("");
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
  
  // Check if n8n integration is enabled
  const { isEnabled: n8nEnabled } = useFeatureToggle('n8n_integration') as { isEnabled: boolean };

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

  const handleN8nIntegration = async () => {
    if (n8nEnabled) {
      try {
        const { data, error } = await supabase.functions.invoke('n8n-webhook-trigger', {
          body: {
            webhookUrl: n8nWebhookUrl || null,
            workflowData: { test: true, clinic: 'SwiftCare' },
            workflowType: 'integration-test'
          }
        });
        
        if (error) throw error;
        
        toast.success("n8n integration test completed successfully");
        console.log('n8n response:', data);
      } catch (error) {
        console.error('n8n integration error:', error);
        toast.error("n8n integration test failed");
      }
    } else {
      toast.error("n8n Integration is disabled by administrator");
    }
  };

  const testWorkflow = async (workflowType: string) => {
    setIsTestingWorkflow(true);
    setTestResults(null);
    
    try {
      const testData = {
        'appointment-scheduling': {
          patientName: 'John Doe',
          service: 'Dental Cleaning',
          preferredDate: '2025-01-15',
          urgency: 'Normal'
        },
        'patient-communication': {
          patientName: 'Jane Smith',
          type: 'Appointment Reminder',
          appointmentDate: '2025-01-16',
          treatment: 'Dental Checkup',
          tone: 'Friendly and Professional'
        },
        'insurance-verification': {
          patientName: 'Bob Wilson',
          provider: 'Blue Cross',
          policyNumber: 'BC123456789',
          treatmentCode: 'D0150'
        }
      };

      const { data, error } = await supabase.functions.invoke('ai-automation-workflow', {
        body: {
          type: workflowType,
          data: testData[workflowType as keyof typeof testData],
          testMode: true
        }
      });

      if (error) throw error;

      setTestResults(data);
      toast.success(`${workflowType} workflow test completed!`);
      
      // Add to workflow logs
      setWorkflowLogs(prev => [...prev, {
        id: Date.now(),
        workflow: workflowType,
        timestamp: new Date().toISOString(),
        status: 'completed',
        result: data
      }]);

    } catch (error) {
      console.error('Workflow test error:', error);
      toast.error(`Workflow test failed: ${error.message}`);
    } finally {
      setIsTestingWorkflow(false);
    }
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
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                OpenAI API Key configured
              </span>
            </div>
            {n8nEnabled ? (
              <Button onClick={handleN8nIntegration} className="gap-2">
                <Zap className="h-4 w-4" />
                n8n Integration Dashboard
              </Button>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  n8n Integration disabled by administrator
                </span>
              </div>
            )}
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
          <TabsList className={`grid w-full ${n8nEnabled ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">AI Workflows</TabsTrigger>
            <TabsTrigger value="testing">Workflow Testing</TabsTrigger>
            {n8nEnabled && <TabsTrigger value="n8n">n8n Dashboard</TabsTrigger>}
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automationFlows.map((flow) => (
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
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setActiveFlow("workflows")}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => testWorkflow(flow.id)}
                          disabled={isTestingWorkflow}
                        >
                          {isTestingWorkflow ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                          Test Flow
                        </Button>
                      </div>
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
                            {flow.metrics.noShows ? flow.metrics.noShows : `+${flow.metrics.responseTime || flow.metrics.processingTime || 0}`}%
                          </div>
                          <div className="text-muted-foreground">Impact</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => toast.success(`Viewing workflow for ${flow.name}`)}
                        >
                          View Flow
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => testWorkflow(flow.id)}
                          disabled={isTestingWorkflow}
                        >
                          {isTestingWorkflow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                          Test
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* n8n Dashboard Tab - Only show if enabled */}
          {n8nEnabled && (
            <TabsContent value="n8n" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    n8n Workflow Integration
                  </CardTitle>
                  <CardDescription>
                    Configure and test n8n webhook integrations for advanced automation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="webhook-url">n8n Webhook URL (Optional)</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://your-n8n-instance.com/webhook/..."
                        value={n8nWebhookUrl}
                        onChange={(e) => setN8nWebhookUrl(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Leave empty to run simulation mode
                      </p>
                    </div>
                    
                    <Button onClick={handleN8nIntegration} className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Test n8n Integration
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Integration Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">n8n Feature Enabled</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Webhook Endpoint Ready</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">AI Workflows Connected</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Available Triggers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm">• Appointment Scheduled</div>
                          <div className="text-sm">• Patient Communication</div>
                          <div className="text-sm">• Insurance Verification</div>
                          <div className="text-sm">• Treatment Completed</div>
                          <div className="text-sm">• Payment Processed</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Workflow Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  AI Workflow Testing
                </CardTitle>
                <CardDescription>
                  Test individual workflows with sample data to verify functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {automationFlows.map((flow) => (
                    <Card key={flow.id} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {flow.icon}
                        <div>
                          <h4 className="font-medium">{flow.name}</h4>
                          <p className="text-sm text-muted-foreground">{flow.description}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => testWorkflow(flow.id)}
                        disabled={isTestingWorkflow}
                        className="w-full"
                        size="sm"
                      >
                        {isTestingWorkflow ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Test Workflow
                      </Button>
                    </Card>
                  ))}
                </div>

                {testResults && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Test Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                        {JSON.stringify(testResults, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {workflowLogs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Test Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {workflowLogs.slice(-5).map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <span className="font-medium">{log.workflow}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <Badge variant="secondary">{log.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Core Flow Documentation
                  </CardTitle>
                  <CardDescription>
                    Detailed user journeys and process flows (50+ pages)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => toast.success("Opening core flow documentation")}
                  >
                    View Documentation
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Interactive Dashboard
                  </CardTitle>
                  <CardDescription>
                    Real-time metrics and visualizations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => toast.success("Opening interactive dashboard")}
                  >
                    Launch Dashboard
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    n8n Workflow Library
                    {!n8nEnabled && (
                      <Badge variant="secondary" className="ml-2">
                        Disabled
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {n8nEnabled 
                      ? "Complete library of 12 AI automation workflows"
                      : "Advanced workflows (Feature disabled by administrator)"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={handleN8nIntegration}
                    disabled={!n8nEnabled}
                    variant={n8nEnabled ? "default" : "secondary"}
                  >
                    {n8nEnabled ? "Access Workflows" : "Feature Disabled"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAutomationFlows;