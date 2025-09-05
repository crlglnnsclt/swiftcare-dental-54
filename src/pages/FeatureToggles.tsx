import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Plus, 
  Settings, 
  Zap, 
  Star, 
  Users, 
  BarChart3, 
  Loader2, 
  AlertTriangle, 
  Info,
  Calendar,
  FileText,
  CreditCard,
  Package,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FeatureToggle {
  id: string;
  feature_name: string;
  is_enabled: boolean;
  description: string;
  created_at: string;
  updated_at: string;
  modified_by?: string;
}

interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  dependencies?: string[];
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface FeatureGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  features: FeatureDefinition[];
}

export default function FeatureToggles() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['core']));
  const [newFeature, setNewFeature] = useState({
    name: "",
    description: "",
    defaultEnabled: false
  });

  // Consolidated feature definitions without duplicates
  const featureGroups: FeatureGroup[] = [
    {
      id: "core",
      name: "Core System",
      description: "Essential clinic management features",
      icon: Settings,
      color: "blue",
      features: [
        {
          key: "user_management",
          name: "User Management",
          description: "Manage staff accounts, roles, and permissions",
          category: "core",
          priority: "high"
        },
        {
          key: "patient_records",
          name: "Patient Records",
          description: "Patient information management and medical history",
          category: "core",
          priority: "high"
        },
        {
          key: "clinic_branding",
          name: "Clinic Branding",
          description: "Custom clinic branding and theming",
          category: "core",
          priority: "medium"
        }
      ]
    },
    {
      id: "appointments",
      name: "Appointments",
      description: "Scheduling and queue management",
      icon: Calendar,
      color: "green",
      features: [
        {
          key: "appointment_booking",
          name: "Appointment Booking",
          description: "Basic appointment scheduling and management",
          dependencies: ["user_management", "patient_records"],
          category: "appointments",
          priority: "high"
        },
        {
          key: "queue_management",
          name: "Queue Management",
          description: "Patient check-in and queue tracking",
          dependencies: ["appointment_booking"],
          category: "appointments",
          priority: "high"
        },
        {
          key: "appointment_reminders",
          name: "Reminders",
          description: "Automated email and SMS reminders",
          dependencies: ["appointment_booking"],
          category: "appointments",
          priority: "medium"
        }
      ]
    },
    {
      id: "digital_health",
      name: "Digital Records",
      description: "Paperless documentation",
      icon: FileText,
      color: "purple",
      features: [
        {
          key: "digital_forms",
          name: "Digital Forms",
          description: "Electronic forms and e-signatures",
          dependencies: ["patient_records"],
          category: "digital_health",
          priority: "high"
        },
        {
          key: "document_management",
          name: "Document Management",
          description: "Upload and manage patient documents",
          dependencies: ["digital_forms"],
          category: "digital_health",
          priority: "high"
        },
        {
          key: "dental_charts",
          name: "Dental Charts",
          description: "Interactive dental charting",
          dependencies: ["patient_records"],
          category: "digital_health",
          priority: "medium"
        }
      ]
    },
    {
      id: "financial",
      name: "Billing & Payments",
      description: "Financial management",
      icon: CreditCard,
      color: "orange",
      features: [
        {
          key: "billing_system",
          name: "Billing System",
          description: "Invoice generation and payment tracking",
          dependencies: ["patient_records"],
          category: "financial",
          priority: "high"
        },
        {
          key: "payment_processing",
          name: "Payment Processing",
          description: "Online payment gateway integration",
          dependencies: ["billing_system"],
          category: "financial",
          priority: "medium"
        },
        {
          key: "insurance_management",
          name: "Insurance Management",
          description: "Insurance verification and claims",
          dependencies: ["billing_system"],
          category: "financial",
          priority: "medium"
        }
      ]
    },
    {
      id: "operations",
      name: "Operations",
      description: "Inventory and staff management",
      icon: Package,
      color: "teal",
      features: [
        {
          key: "inventory_management",
          name: "Inventory Management",
          description: "Track supplies and equipment",
          category: "operations",
          priority: "medium"
        },
        {
          key: "staff_scheduling",
          name: "Staff Scheduling",
          description: "Staff work schedules and shifts",
          dependencies: ["user_management"],
          category: "operations",
          priority: "medium"
        }
      ]
    },
    {
      id: "patient_engagement",
      name: "Patient Portal",
      description: "Patient self-service",
      icon: Users,
      color: "indigo",
      features: [
        {
          key: "patient_portal",
          name: "Patient Portal",
          description: "Patient self-service portal",
          dependencies: ["patient_records"],
          category: "patient_engagement",
          priority: "medium"
        },
        {
          key: "online_booking",
          name: "Online Booking",
          description: "Patient self-scheduling",
          dependencies: ["appointment_booking", "patient_portal"],
          category: "patient_engagement",
          priority: "medium"
        }
      ]
    },
    {
      id: "analytics",
      name: "Analytics",
      description: "Business intelligence",
      icon: BarChart3,
      color: "pink",
      features: [
        {
          key: "basic_analytics",
          name: "Basic Analytics",
          description: "Essential clinic metrics",
          dependencies: ["appointment_booking"],
          category: "analytics",
          priority: "medium"
        },
        {
          key: "advanced_analytics",
          name: "Advanced Analytics",
          description: "Comprehensive business intelligence",
          dependencies: ["basic_analytics", "billing_system"],
          category: "analytics",
          priority: "low"
        }
      ]
    }
  ];

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('clinic_feature_toggles')
        .select('*')
        .order('feature_name');
        
      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast({
        title: "Error",
        description: "Failed to load feature toggles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      fetchFeatures();
    }
  }, [profile]);

  const getAllFeatures = (): FeatureDefinition[] => {
    return featureGroups.flatMap(group => group.features);
  };

  const isFeatureEnabled = (featureName: string): boolean => {
    const feature = features.find(f => f.feature_name === featureName);
    return feature?.is_enabled || false;
  };

  const getFeatureStatus = (feature: FeatureDefinition): 'enabled' | 'disabled' | 'unavailable' => {
    if (feature.dependencies) {
      const missingDeps = feature.dependencies.filter(dep => !isFeatureEnabled(dep));
      if (missingDeps.length > 0) return 'unavailable';
    }
    return isFeatureEnabled(feature.key) ? 'enabled' : 'disabled';
  };

  const updateFeatureInDatabase = async (featureName: string, enabled: boolean) => {
    const existingFeature = features.find(f => f.feature_name === featureName);
    
    if (existingFeature) {
      const { error } = await supabase
        .from('clinic_feature_toggles')
        .update({ 
          is_enabled: enabled,
          updated_at: new Date().toISOString(),
          modified_by: profile?.user_id
        })
        .eq('feature_name', featureName);
        
      if (error) throw error;
    } else {
      // Create new feature toggle
      const featureDefinition = getAllFeatures().find(f => f.key === featureName);
      const { error } = await supabase
        .from('clinic_feature_toggles')
        .insert({
          feature_name: featureName,
          is_enabled: enabled,
          description: featureDefinition?.description || '',
          modified_by: profile?.user_id
        });
        
      if (error) throw error;
    }
  };

  const handleToggleFeature = async (featureName: string, enabled: boolean) => {
    try {
      // Check dependencies before enabling
      if (enabled) {
        const feature = getAllFeatures().find(f => f.key === featureName);
        if (feature?.dependencies) {
          const missingDeps = feature.dependencies.filter(dep => 
            !isFeatureEnabled(dep)
          );
          
          if (missingDeps.length > 0) {
            const missingNames = missingDeps.map(dep => 
              getAllFeatures().find(f => f.key === dep)?.name || dep
            );
            toast({
              title: "Dependencies Required",
              description: `Enable first: ${missingNames.join(', ')}`,
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Check dependents before disabling
      if (!enabled) {
        const dependents = getAllFeatures().filter(f => 
          f.dependencies?.includes(featureName) && isFeatureEnabled(f.key)
        );
        
        if (dependents.length > 0) {
          // Auto-disable dependents
          for (const dependent of dependents) {
            await updateFeatureInDatabase(dependent.key, false);
          }
          
          toast({
            title: "Dependent Features Disabled",
            description: `Also disabled: ${dependents.map(d => d.name).join(', ')}`,
          });
        }
      }

      await updateFeatureInDatabase(featureName, enabled);
      
      toast({
        title: "Success",
        description: `${getAllFeatures().find(f => f.key === featureName)?.name} ${enabled ? 'enabled' : 'disabled'}`,
      });
      
      fetchFeatures();
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast({
        title: "Error",
        description: "Failed to update feature toggle",
        variant: "destructive",
      });
    }
  };

  const handleCreateFeature = async () => {
    if (!newFeature.name.trim() || !newFeature.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both name and description",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clinic_feature_toggles')
        .insert({
          feature_name: newFeature.name.toLowerCase().replace(/\s+/g, '_'),
          description: newFeature.description,
          is_enabled: newFeature.defaultEnabled,
          modified_by: profile?.user_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Custom feature created successfully",
      });

      setNewFeature({ name: "", description: "", defaultEnabled: false });
      setShowCreateDialog(false);
      fetchFeatures();
    } catch (error) {
      console.error('Error creating feature:', error);
      toast({
        title: "Error",
        description: "Failed to create feature",
        variant: "destructive",
      });
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const filteredGroups = featureGroups.filter(group => {
    if (!searchTerm) return true;
    return group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           group.features.some(f => 
             f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             f.description.toLowerCase().includes(searchTerm.toLowerCase())
           );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled':
        return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
      case 'disabled':
        return <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />;
      case 'unavailable':
        return <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Get only truly custom features (not in predefined groups) and remove duplicates
  const predefinedFeatureKeys = getAllFeatures().map(f => f.key);
  const customFeatures = features.filter((f, index, self) => 
    !predefinedFeatureKeys.includes(f.feature_name) &&
    self.findIndex(item => item.feature_name === f.feature_name) === index
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 page-container">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 page-container">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Feature Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Control system-wide features and dependencies</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="sm:inline">Add Custom Feature</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>Create Custom Feature</DialogTitle>
                <DialogDescription className="text-sm">
                  Add a custom feature toggle for specialized functionality
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feature-name">Feature Name</Label>
                  <Input
                    id="feature-name"
                    value={newFeature.name}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Feature"
                  />
                </div>
                <div>
                  <Label htmlFor="feature-description">Description</Label>
                  <Textarea
                    id="feature-description"
                    value={newFeature.description}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this feature does..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newFeature.defaultEnabled}
                    onCheckedChange={(checked) => setNewFeature(prev => ({ ...prev, defaultEnabled: checked }))}
                  />
                  <Label>Enable by default</Label>
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFeature} className="w-full sm:w-auto">Create Feature</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Features have dependencies. Disabling a feature auto-disables dependent features.
          </AlertDescription>
        </Alert>
      </div>

      {/* Feature Groups */}
      <div className="space-y-4">
        {filteredGroups.map((group) => {
          const IconComponent = group.icon;
          const isExpanded = expandedGroups.has(group.id);
          const enabledCount = group.features.filter(f => isFeatureEnabled(f.key)).length;
          
          return (
            <Card key={group.id} className="glass-card">
              <Collapsible open={isExpanded} onOpenChange={() => toggleGroupExpansion(group.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate">{group.name}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm hidden sm:block">{group.description}</CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {enabledCount}/{group.features.length}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {group.features.map((feature) => {
                        const status = getFeatureStatus(feature);
                        const isUnavailable = status === 'unavailable';
                        
                        return (
                          <div
                            key={feature.key}
                            className={`p-3 border rounded-lg transition-all ${
                              isUnavailable ? 'opacity-50 bg-muted/20' : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  {getStatusIcon(status)}
                                  <h4 className="font-medium text-sm sm:text-base truncate">{feature.name}</h4>
                                  <Badge className={`text-xs ${getPriorityColor(feature.priority)}`}>
                                    {feature.priority}
                                  </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2">{feature.description}</p>
                                
                                {feature.dependencies && (
                                  <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Dependencies:</span>
                                    <div className="flex gap-1 flex-wrap">
                                      {feature.dependencies.map(dep => {
                                        const depFeature = getAllFeatures().find(f => f.key === dep);
                                        return (
                                          <Badge 
                                            key={dep} 
                                            variant={isFeatureEnabled(dep) ? "default" : "destructive"}
                                            className="text-xs"
                                          >
                                            {depFeature?.name || dep}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                
                                {status === 'unavailable' && (
                                  <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                    <span>Enable dependencies first</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-shrink-0">
                                <Switch
                                  checked={status === 'enabled'}
                                  onCheckedChange={(checked) => handleToggleFeature(feature.key, checked)}
                                  disabled={isUnavailable}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Custom Features - Only show if there are truly custom features */}
      {customFeatures.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Custom Features
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Additional features not part of standard groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-all gap-3"
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {feature.is_enabled ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm sm:text-base truncate">{feature.feature_name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Switch
                      checked={feature.is_enabled}
                      onCheckedChange={(checked) => handleToggleFeature(feature.feature_name, checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}