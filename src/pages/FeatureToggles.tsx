import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Settings, Shield, Zap, Star, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FeatureToggles() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: "",
    description: "",
    category: "core",
    defaultEnabled: false
  });

  // Demo feature toggle data organized by categories
  const [features, setFeatures] = useState([
    // Core Features
    {
      id: 1,
      name: "Queue Management",
      description: "Patient queue system with priority handling and real-time updates",
      category: "core",
      enabled: true,
      tier: "all",
      dependencies: [],
      affectedUsers: 156,
      lastModified: "2025-01-02",
      modifiedBy: "Admin"
    },
    {
      id: 2,
      name: "Digital Forms",
      description: "Electronic signature and digital form collection",
      category: "core",
      enabled: true,
      tier: "all",
      dependencies: [],
      affectedUsers: 89,
      lastModified: "2025-01-01",
      modifiedBy: "Super Admin"
    },
    {
      id: 3,
      name: "Appointment Scheduling",
      description: "Online appointment booking and management system",
      category: "core",
      enabled: true,
      tier: "all",
      dependencies: [],
      affectedUsers: 234,
      lastModified: "2024-12-30",
      modifiedBy: "Admin"
    },

    // Premium Features
    {
      id: 4,
      name: "AI Queue Optimization",
      description: "AI-powered queue management with predictive analytics",
      category: "premium",
      enabled: false,
      tier: "premium",
      dependencies: ["Queue Management"],
      affectedUsers: 0,
      lastModified: "2025-01-01",
      modifiedBy: "Super Admin"
    },
    {
      id: 5,
      name: "Advanced Analytics",
      description: "Comprehensive business intelligence and reporting tools",
      category: "premium",
      enabled: true,
      tier: "premium",
      dependencies: [],
      affectedUsers: 45,
      lastModified: "2025-01-02",
      modifiedBy: "Super Admin"
    },
    {
      id: 6,
      name: "Teledentistry",
      description: "Virtual consultations and remote patient care",
      category: "premium",
      enabled: false,
      tier: "premium",
      dependencies: ["Appointment Scheduling"],
      affectedUsers: 0,
      lastModified: "2024-12-28",
      modifiedBy: "Super Admin"
    },

    // Integration Features
    {
      id: 7,
      name: "Insurance Integration",
      description: "Automated insurance claim processing and verification",
      category: "integration",
      enabled: true,
      tier: "core",
      dependencies: ["Digital Forms"],
      affectedUsers: 67,
      lastModified: "2025-01-01",
      modifiedBy: "Admin"
    },
    {
      id: 8,
      name: "Payment Gateway",
      description: "Secure online payment processing for bills and appointments",
      category: "integration",
      enabled: true,
      tier: "core",
      dependencies: [],
      affectedUsers: 123,
      lastModified: "2024-12-31",
      modifiedBy: "Admin"
    },
    {
      id: 9,
      name: "SMS Notifications",
      description: "Automated SMS reminders and notifications",
      category: "integration",
      enabled: false,
      tier: "premium",
      dependencies: [],
      affectedUsers: 0,
      lastModified: "2024-12-29",
      modifiedBy: "Super Admin"
    },

    // Experimental Features
    {
      id: 10,
      name: "Voice Commands",
      description: "Voice-activated navigation and commands",
      category: "experimental",
      enabled: false,
      tier: "experimental",
      dependencies: [],
      affectedUsers: 0,
      lastModified: "2024-12-25",
      modifiedBy: "Developer"
    },
    {
      id: 11,
      name: "AR Dental Visualization",
      description: "Augmented reality for treatment visualization",
      category: "experimental",
      enabled: false,
      tier: "experimental",
      dependencies: [],
      affectedUsers: 0,
      lastModified: "2024-12-20",
      modifiedBy: "Developer"
    }
  ]);

  const categories = [
    { id: "core", name: "Core Features", icon: Settings, color: "blue" },
    { id: "premium", name: "Premium Features", icon: Star, color: "purple" },
    { id: "integration", name: "Integrations", icon: Zap, color: "green" },
    { id: "experimental", name: "Experimental", icon: BarChart3, color: "orange" }
  ];

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleFeature = (featureId: number) => {
    setFeatures(features.map(feature => {
      if (feature.id === featureId) {
        const newEnabled = !feature.enabled;
        
        // Check dependencies
        if (newEnabled) {
          const missingDeps = feature.dependencies.filter(dep => 
            !features.find(f => f.name === dep && f.enabled)
          );
          
          if (missingDeps.length > 0) {
            toast({
              title: "Dependency Required",
              description: `Please enable ${missingDeps.join(", ")} first.`,
              variant: "destructive",
            });
            return feature;
          }
        }
        
        toast({
          title: `Feature ${newEnabled ? 'Enabled' : 'Disabled'}`,
          description: `${feature.name} has been ${newEnabled ? 'enabled' : 'disabled'}.`,
        });
        
        return {
          ...feature,
          enabled: newEnabled,
          lastModified: new Date().toISOString().split('T')[0],
          modifiedBy: "Current User"
        };
      }
      return feature;
    }));
  };

  const handleCreateFeature = () => {
    if (!newFeature.name || !newFeature.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const feature = {
      id: features.length + 1,
      name: newFeature.name,
      description: newFeature.description,
      category: newFeature.category,
      enabled: newFeature.defaultEnabled,
      tier: newFeature.category === 'experimental' ? 'experimental' : 'core',
      dependencies: [],
      affectedUsers: 0,
      lastModified: new Date().toISOString().split('T')[0],
      modifiedBy: "Current User"
    };

    setFeatures([...features, feature]);
    setNewFeature({
      name: "",
      description: "",
      category: "core",
      defaultEnabled: false
    });
    setShowCreateDialog(false);

    toast({
      title: "Feature Created",
      description: "New feature toggle has been created successfully.",
    });
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : Settings;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : "blue";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feature Toggles</h1>
          <p className="text-muted-foreground">Manage feature availability and access control</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Feature Toggle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Feature Toggle</DialogTitle>
              <DialogDescription>
                Add a new feature toggle to control feature availability
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featureName">Feature Name *</Label>
                <Input
                  id="featureName"
                  placeholder="Advanced Reporting"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featureDescription">Description *</Label>
                <Textarea
                  id="featureDescription"
                  placeholder="Comprehensive analytics and reporting dashboard..."
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featureCategory">Category</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newFeature.category}
                  onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
                >
                  <option value="core">Core Features</option>
                  <option value="premium">Premium Features</option>
                  <option value="integration">Integrations</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="defaultEnabled"
                  checked={newFeature.defaultEnabled}
                  onCheckedChange={(checked) => setNewFeature({ ...newFeature, defaultEnabled: checked })}
                />
                <Label htmlFor="defaultEnabled">Enable by default</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFeature}>
                  Create Feature Toggle
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {categories.map((category) => {
          const categoryFeatures = features.filter(f => f.category === category.id);
          const enabledCount = categoryFeatures.filter(f => f.enabled).length;
          const Icon = category.icon;
          
          return (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enabledCount}/{categoryFeatures.length}</div>
                <p className="text-xs text-muted-foreground">
                  {enabledCount} enabled features
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Toggles by Category */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Features</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {filteredFeatures.map((feature) => {
              const Icon = getCategoryIcon(feature.category);
              const colorClass = getCategoryColor(feature.category);
              
              return (
                <Card key={feature.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <Icon className={`w-8 h-8 text-${colorClass}-500`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{feature.name}</h3>
                            <Badge variant={feature.tier === 'premium' ? 'default' : 'secondary'}>
                              {feature.tier}
                            </Badge>
                            {feature.dependencies.length > 0 && (
                              <Badge variant="outline">
                                <Shield className="w-3 h-3 mr-1" />
                                Requires dependencies
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{feature.affectedUsers} users</span>
                            </span>
                            <span>Modified {feature.lastModified} by {feature.modifiedBy}</span>
                          </div>
                          {feature.dependencies.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Dependencies: {feature.dependencies.join(", ")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {feature.enabled ? 'Enabled' : 'Disabled'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {feature.enabled ? 'Active for users' : 'Hidden from users'}
                          </p>
                        </div>
                        <Switch
                          checked={feature.enabled}
                          onCheckedChange={() => handleToggleFeature(feature.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="space-y-4">
              {filteredFeatures
                .filter(feature => feature.category === category.id)
                .map((feature) => {
                  const Icon = category.icon;
                  
                  return (
                    <Card key={feature.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <Icon className={`w-8 h-8 text-${category.color}-500`} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold">{feature.name}</h3>
                                <Badge variant={feature.tier === 'premium' ? 'default' : 'secondary'}>
                                  {feature.tier}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <Users className="w-3 h-3" />
                                  <span>{feature.affectedUsers} users</span>
                                </span>
                                <span>Modified {feature.lastModified}</span>
                              </div>
                            </div>
                          </div>
                          <Switch
                            checked={feature.enabled}
                            onCheckedChange={() => handleToggleFeature(feature.id)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {filteredFeatures.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Settings className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Features Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No features match your search criteria." : "No feature toggles have been created yet."}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Feature Toggle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}