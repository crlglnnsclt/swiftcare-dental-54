import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Workflow, 
  Play, 
  Pause, 
  Settings, 
  Activity, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  lastRun: string;
  executions: number;
  successRate: number;
}

interface N8nWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  category: string;
  nodes: WorkflowNode[];
  lastRun: string;
  totalExecutions: number;
  successRate: number;
  averageRuntime: string;
  triggers: string[];
  integrations: string[];
}

const N8nWorkflowDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const workflows: N8nWorkflow[] = [
    {
      id: "appointment-scheduling",
      name: "Intelligent Appointment Scheduling",
      description: "AI-powered scheduling with conflict resolution and patient preferences",
      status: "active",
      category: "Patient Management",
      lastRun: "2 minutes ago",
      totalExecutions: 1247,
      successRate: 98.7,
      averageRuntime: "1.2s",
      triggers: ["Webhook", "Schedule", "Form Submit"],
      integrations: ["SwiftCare DB", "OpenAI", "Calendar API", "SMS Service"],
      nodes: [
        { id: "trigger", name: "Appointment Request", type: "webhook", status: "active", lastRun: "2 min ago", executions: 1247, successRate: 100 },
        { id: "ai-analysis", name: "AI Preference Analysis", type: "openai", status: "active", lastRun: "2 min ago", executions: 1247, successRate: 99.2 },
        { id: "conflict-check", name: "Conflict Resolution", type: "supabase", status: "active", lastRun: "2 min ago", executions: 1247, successRate: 98.8 },
        { id: "booking", name: "Schedule Booking", type: "supabase", status: "active", lastRun: "2 min ago", executions: 1245, successRate: 98.7 },
        { id: "notification", name: "Send Confirmation", type: "email", status: "active", lastRun: "2 min ago", executions: 1245, successRate: 99.5 }
      ]
    },
    {
      id: "patient-communication",
      name: "Automated Patient Communication",
      description: "Smart messaging with personalized content and optimal timing",
      status: "active", 
      category: "Communication",
      lastRun: "5 minutes ago",
      totalExecutions: 2156,
      successRate: 97.3,
      averageRuntime: "0.8s",
      triggers: ["Schedule", "Event", "Manual"],
      integrations: ["SwiftCare DB", "OpenAI", "Email Service", "SMS Gateway"],
      nodes: [
        { id: "trigger", name: "Communication Trigger", type: "schedule", status: "active", lastRun: "5 min ago", executions: 2156, successRate: 100 },
        { id: "patient-data", name: "Fetch Patient Data", type: "supabase", status: "active", lastRun: "5 min ago", executions: 2156, successRate: 99.8 },
        { id: "ai-personalization", name: "AI Message Generation", type: "openai", status: "active", lastRun: "5 min ago", executions: 2156, successRate: 98.5 },
        { id: "send-message", name: "Send Message", type: "email", status: "active", lastRun: "5 min ago", executions: 2098, successRate: 97.3 }
      ]
    },
    {
      id: "insurance-verification",
      name: "Real-time Insurance Verification",
      description: "Instant verification with automated claim processing",
      status: "active",
      category: "Financial",
      lastRun: "1 minute ago",
      totalExecutions: 892,
      successRate: 99.1,
      averageRuntime: "2.1s",
      triggers: ["Patient Registration", "Appointment Booking"],
      integrations: ["Insurance APIs", "SwiftCare DB", "OpenAI"],
      nodes: [
        { id: "trigger", name: "Insurance Check Request", type: "webhook", status: "active", lastRun: "1 min ago", executions: 892, successRate: 100 },
        { id: "api-call", name: "Insurance API Call", type: "http", status: "active", lastRun: "1 min ago", executions: 892, successRate: 99.4 },
        { id: "ai-validation", name: "AI Data Validation", type: "openai", status: "active", lastRun: "1 min ago", executions: 887, successRate: 99.8 },
        { id: "update-db", name: "Update Patient Record", type: "supabase", status: "active", lastRun: "1 min ago", executions: 885, successRate: 99.1 }
      ]
    },
    {
      id: "treatment-planning",
      name: "AI Treatment Plan Generator", 
      description: "Evidence-based treatment recommendations with cost analysis",
      status: "active",
      category: "Clinical",
      lastRun: "10 minutes ago",
      totalExecutions: 456,
      successRate: 96.8,
      averageRuntime: "3.4s",
      triggers: ["Examination Complete", "Manual Request"],
      integrations: ["SwiftCare DB", "OpenAI", "Medical Knowledge Base"],
      nodes: [
        { id: "trigger", name: "Treatment Request", type: "webhook", status: "active", lastRun: "10 min ago", executions: 456, successRate: 100 },
        { id: "patient-history", name: "Fetch Medical History", type: "supabase", status: "active", lastRun: "10 min ago", executions: 456, successRate: 99.5 },
        { id: "ai-analysis", name: "AI Treatment Analysis", type: "openai", status: "active", lastRun: "10 min ago", executions: 454, successRate: 98.2 },
        { id: "cost-calc", name: "Cost Calculation", type: "function", status: "active", lastRun: "10 min ago", executions: 446, successRate: 97.5 },
        { id: "save-plan", name: "Save Treatment Plan", type: "supabase", status: "active", lastRun: "10 min ago", executions: 441, successRate: 96.8 }
      ]
    },
    {
      id: "emergency-response",
      name: "Emergency Response System",
      description: "Rapid triage and resource allocation for emergencies",
      status: "active",
      category: "Emergency",
      lastRun: "30 minutes ago",
      totalExecutions: 23,
      successRate: 100,
      averageRuntime: "0.5s",
      triggers: ["Emergency Alert", "Manual Trigger"],
      integrations: ["SwiftCare DB", "SMS Service", "Staff Directory"],
      nodes: [
        { id: "trigger", name: "Emergency Alert", type: "webhook", status: "active", lastRun: "30 min ago", executions: 23, successRate: 100 },
        { id: "triage", name: "AI Triage Assessment", type: "openai", status: "active", lastRun: "30 min ago", executions: 23, successRate: 100 },
        { id: "staff-alert", name: "Alert Available Staff", type: "sms", status: "active", lastRun: "30 min ago", executions: 23, successRate: 100 },
        { id: "log-emergency", name: "Log Emergency", type: "supabase", status: "active", lastRun: "30 min ago", executions: 23, successRate: 100 }
      ]
    }
  ];

  const workflowStats = {
    total: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    totalExecutions: workflows.reduce((sum, w) => sum + w.totalExecutions, 0),
    averageSuccessRate: workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length
  };

  const handleWorkflowAction = (workflowId: string, action: 'start' | 'stop' | 'edit' | 'test') => {
    const workflow = workflows.find(w => w.id === workflowId);
    toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)}ing workflow: ${workflow?.name}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <Pause className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-400" />;
    }
  };

  const getNodeTypeIcon = (type: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      webhook: <Zap className="h-4 w-4" />,
      openai: <Bot className="h-4 w-4" />,
      supabase: <Activity className="h-4 w-4" />,
      email: <Activity className="h-4 w-4" />,
      schedule: <Clock className="h-4 w-4" />,
      http: <Activity className="h-4 w-4" />,
      function: <Settings className="h-4 w-4" />,
      sms: <Activity className="h-4 w-4" />
    };
    return iconMap[type] || <Activity className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Workflow className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">n8n Workflow Dashboard</h1>
            <p className="text-muted-foreground">AI automation workflows for SwiftCare</p>
          </div>
        </div>
        <Button onClick={() => toast.success("Opening n8n workflow editor")}>
          <Settings className="h-4 w-4 mr-2" />
          Open n8n Editor
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {workflowStats.active} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowStats.totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowStats.averageSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all workflows
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Automation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Processes automated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Workflow className="h-5 w-5" />
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(workflow.status)}
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{workflow.totalExecutions}</div>
                        <div className="text-muted-foreground">Executions</div>
                      </div>
                      <div>
                        <div className="font-medium">{workflow.successRate}%</div>
                        <div className="text-muted-foreground">Success Rate</div>
                      </div>
                      <div>
                        <div className="font-medium">{workflow.averageRuntime}</div>
                        <div className="text-muted-foreground">Avg Runtime</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleWorkflowAction(workflow.id, 'edit')}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleWorkflowAction(workflow.id, 'test')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Test Run
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Workflow className="h-6 w-6" />
                      <div>
                        <CardTitle>{workflow.name}</CardTitle>
                        <CardDescription>
                          Category: {workflow.category} • Last run: {workflow.lastRun}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
                      >
                        {selectedWorkflow === workflow.id ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {selectedWorkflow === workflow.id && (
                  <CardContent>
                    <div className="space-y-6">
                      {/* Workflow Nodes */}
                      <div>
                        <h4 className="font-semibold mb-3">Workflow Nodes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {workflow.nodes.map((node, index) => (
                            <div key={node.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getNodeTypeIcon(node.type)}
                                  <span className="font-medium text-sm">{node.name}</span>
                                </div>
                                {getStatusIcon(node.status)}
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>Type: {node.type}</div>
                                <div>Executions: {node.executions}</div>
                                <div>Success: {node.successRate}%</div>
                                <div>Last run: {node.lastRun}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Integrations */}
                      <div>
                        <h4 className="font-semibold mb-3">Integrations</h4>
                        <div className="flex flex-wrap gap-2">
                          {workflow.integrations.map((integration, index) => (
                            <Badge key={index} variant="outline">
                              {integration}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Triggers */}
                      <div>
                        <h4 className="font-semibold mb-3">Triggers</h4>
                        <div className="flex flex-wrap gap-2">
                          {workflow.triggers.map((trigger, index) => (
                            <Badge key={index} variant="secondary">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button 
                          size="sm"
                          onClick={() => handleWorkflowAction(workflow.id, 'edit')}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Edit Workflow
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWorkflowAction(workflow.id, 'test')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Test Run
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toast.success(`Viewing execution history for ${workflow.name}`)}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          View History
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Execution Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{workflow.name}</span>
                        <span>{workflow.successRate}%</span>
                      </div>
                      <Progress value={workflow.successRate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(workflow.status)}
                        <span className="text-sm">{workflow.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{workflow.lastRun}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Executions
              </CardTitle>
              <CardDescription>
                Latest workflow execution logs and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflows.flatMap(workflow => 
                  workflow.nodes.slice(0, 2).map((node, index) => (
                    <div key={`${workflow.id}-${node.id}-${index}`} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(node.status)}
                        <div>
                          <div className="font-medium text-sm">{workflow.name}</div>
                          <div className="text-xs text-muted-foreground">{node.name}</div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{node.lastRun}</div>
                        <div>Success: {node.successRate}%</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default N8nWorkflowDashboard;