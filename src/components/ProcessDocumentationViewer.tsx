import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Users, 
  Clock, 
  TrendingUp,
  CheckCircle,
  BookOpen,
  BarChart3,
  Workflow,
  Target
} from "lucide-react";
import { toast } from "sonner";

interface DocumentSection {
  id: string;
  title: string;
  description: string;
  pageCount: number;
  status: 'complete' | 'in-progress' | 'draft';
  lastUpdated: string;
  category: string;
}

const ProcessDocumentationViewer = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const documentSections: DocumentSection[] = [
    {
      id: "core-flows",
      title: "Core Flow Documentation",
      description: "Detailed user journeys and process flows with AI integration points",
      pageCount: 52,
      status: "complete",
      lastUpdated: "2024-01-15",
      category: "flows"
    },
    {
      id: "detailed-processes",
      title: "Detailed Process Flows",
      description: "Step-by-step process flows for all 12 AI automation workflows",
      pageCount: 48,
      status: "complete", 
      lastUpdated: "2024-01-15",
      category: "flows"
    },
    {
      id: "executive-summary",
      title: "Executive Summary",
      description: "High-level overview and implementation roadmap for stakeholders",
      pageCount: 12,
      status: "complete",
      lastUpdated: "2024-01-15",
      category: "summary"
    },
    {
      id: "user-journeys",
      title: "User Journey Documentation",
      description: "Complete user experience flows for all 5 user roles",
      pageCount: 35,
      status: "complete",
      lastUpdated: "2024-01-15",
      category: "journeys"
    },
    {
      id: "technical-architecture",
      title: "Technical Architecture Guide",
      description: "System architecture, integration points, and technical specifications",
      pageCount: 28,
      status: "complete",
      lastUpdated: "2024-01-15",
      category: "technical"
    },
    {
      id: "implementation-guide",
      title: "Implementation Roadmap",
      description: "4-phase implementation plan with timelines and milestones",
      pageCount: 22,
      status: "complete",
      lastUpdated: "2024-01-15",
      category: "implementation"
    },
    {
      id: "workflow-specifications",
      title: "n8n Workflow Specifications",
      description: "Detailed specifications for each of the 12 AI automation workflows",
      pageCount: 45,
      status: "complete",
      lastUpdated: "2024-01-15",
      category: "technical"
    },
    {
      id: "metrics-analysis",
      title: "Metrics & Impact Analysis",
      description: "Before/after comparisons, ROI calculations, and success metrics",
      pageCount: 18,
      status: "complete",
      lastUpdated: "2024-01-15",
      category: "analytics"
    }
  ];

  const categories = [
    { id: "all", name: "All Documents", count: documentSections.length },
    { id: "flows", name: "Process Flows", count: documentSections.filter(d => d.category === "flows").length },
    { id: "journeys", name: "User Journeys", count: documentSections.filter(d => d.category === "journeys").length },
    { id: "technical", name: "Technical", count: documentSections.filter(d => d.category === "technical").length },
    { id: "implementation", name: "Implementation", count: documentSections.filter(d => d.category === "implementation").length },
    { id: "analytics", name: "Analytics", count: documentSections.filter(d => d.category === "analytics").length },
    { id: "summary", name: "Summary", count: documentSections.filter(d => d.category === "summary").length }
  ];

  const filteredDocuments = activeCategory === "all" 
    ? documentSections 
    : documentSections.filter(doc => doc.category === activeCategory);

  const totalPages = documentSections.reduce((sum, doc) => sum + doc.pageCount, 0);
  const completedDocs = documentSections.filter(doc => doc.status === "complete").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-orange-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      flows: <Workflow className="h-4 w-4" />,
      journeys: <Users className="h-4 w-4" />,
      technical: <BarChart3 className="h-4 w-4" />,
      implementation: <Target className="h-4 w-4" />,
      analytics: <TrendingUp className="h-4 w-4" />,
      summary: <BookOpen className="h-4 w-4" />
    };
    return iconMap[category] || <FileText className="h-4 w-4" />;
  };

  const handleViewDocument = (docId: string) => {
    toast.success(`Opening ${documentSections.find(d => d.id === docId)?.title}...`);
  };

  const handleDownloadDocument = (docId: string) => {
    toast.success(`Downloading ${documentSections.find(d => d.id === docId)?.title}...`);
  };

  const handleDownloadAll = () => {
    toast.success("Preparing complete documentation package for download...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            SwiftCare AI Documentation Library
          </CardTitle>
          <CardDescription>
            Complete documentation suite for AI automation implementation (150+ pages)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalPages}</div>
              <div className="text-sm text-muted-foreground">Total Pages</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedDocs}</div>
              <div className="text-sm text-muted-foreground">Completed Docs</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-muted-foreground">AI Workflows</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">5</div>
              <div className="text-sm text-muted-foreground">User Roles</div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button onClick={handleDownloadAll} className="gap-2">
              <Download className="h-4 w-4" />
              Download Complete Package
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Document Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="justify-start gap-2"
              >
                {getCategoryIcon(category.id)}
                {category.name}
                <Badge variant="secondary" className="ml-auto">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(doc.category)}
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(doc.status)}
                  <Badge variant={doc.status === "complete" ? "default" : "secondary"}>
                    {doc.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>{doc.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pages:</span>
                  <span className="font-medium">{doc.pageCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">{new Date(doc.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="outline" className="capitalize">
                    {doc.category}
                  </Badge>
                </div>
                
                {doc.status === "complete" && (
                  <Progress value={100} className="h-2" />
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDocument(doc.id)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadDocument(doc.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access Documentation</CardTitle>
          <CardDescription>
            Essential documents for immediate implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="getting-started" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="workflows">AI Workflows</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
              <TabsTrigger value="technical">Technical Setup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="getting-started" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      High-level overview and business case for AI automation
                    </p>
                    <Button size="sm" onClick={() => handleViewDocument("executive-summary")}>
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Core Flow Documentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Essential process flows and user journeys
                    </p>
                    <Button size="sm" onClick={() => handleViewDocument("core-flows")}>
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="workflows" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Workflow Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Detailed n8n workflow configurations and setup guides
                    </p>
                    <Button size="sm" onClick={() => handleViewDocument("workflow-specifications")}>
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Process Flows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Step-by-step automation process documentation
                    </p>
                    <Button size="sm" onClick={() => handleViewDocument("detailed-processes")}>
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="implementation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Implementation Roadmap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      4-phase implementation plan with timelines
                    </p>
                    <Button size="sm" onClick={() => handleViewDocument("implementation-guide")}>
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">User Journey Maps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Detailed user experience flows for all roles
                    </p>
                    <Button size="sm" onClick={() => handleViewDocument("user-journeys")}>
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Technical Architecture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      System architecture and integration specifications
                    </p>
                    <Button size="sm" onClick={() => handleViewDocument("technical-architecture")}>
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Metrics Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Performance metrics and ROI calculations
                    </p>
                    <Button size="sm" onClick={() => handleViewDocument("metrics-analysis")}>
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessDocumentationViewer;