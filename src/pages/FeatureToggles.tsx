import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Plus, Settings, Shield, Zap, Star, Users, BarChart3, Loader2, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FeatureToggle {
  id: string;
  feature_name: string;
  is_enabled: boolean;
  description: string;
  created_at: string;
  updated_at: string;
  modified_by?: string;
}

interface FeatureGroup {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  parentFeature?: string; // If this group depends on another feature
  features: FeatureDefinition[];
}

interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  dependencies?: string[]; // Features this depends on
  dependents?: string[]; // Features that depend on this
}

export default function FeatureToggles() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [newFeature, setNewFeature] = useState({
    name: "",
    description: "",
    defaultEnabled: false
  });

  // Organized feature groups with dependencies
  const featureGroups: FeatureGroup[] = [
    {
      id: "core_system",
      name: "Core System",
      description: "Essential clinic management features",
      icon: Settings,
      color: "blue",
      features: [
        {
          key: "user_management",
          name: "User Management",
          description: "Manage staff and patient accounts",
        },
        {
          key: "appointment_system",
          name: "Appointment System",
          description: "Basic appointment scheduling and management",
        },
        {
          key: "patient_records",
          name: "Patient Records",
          description: "Basic patient information and medical history",
        }
      ]
    },
    {
      id: "queue_management",
      name: "Queue Management",
      description: "Patient queue and waiting system",
      icon: Users,
      color: "green",
      parentFeature: "appointment_system",
      features: [
        {
          key: "basic_queue",
          name: "Basic Queue System",
          description: "Patient check-in and basic queue management",
          dependencies: ["appointment_system"]
        },
        {
          key: "queue_analytics",
          name: "Queue Analytics",
          description: "Queue performance metrics and reporting",
          dependencies: ["basic_queue"]
        },
        {
          key: "smart_queue",
          name: "Smart Queue Optimization",
          description: "AI-powered queue optimization and predictions",
          dependencies: ["basic_queue", "queue_analytics"]
        }
      ]
    },
    {
      id: "digital_forms",
      name: "Digital Forms & Documents",
      description: "Paperless documentation system",
      icon: Shield,
      color: "purple",
      parentFeature: "patient_records",
      features: [
        {
          key: "basic_forms",
          name: "Digital Forms",
          description: "Electronic forms and basic e-signatures",
          dependencies: ["patient_records"]
        },
        {
          key: "advanced_signatures",
          name: "Advanced E-Signatures",
          description: "Advanced digital signatures with verification",
          dependencies: ["basic_forms"]
        },
        {
          key: "document_automation",
          name: "Document Automation",
          description: "Automated form filling and document generation",
          dependencies: ["basic_forms", "advanced_signatures"]
        }
      ]
    },
    {
      id: "billing_payment",
      name: "Billing & Payments",
      description: "Financial management system",
      icon: BarChart3,
      color: "orange",
      parentFeature: "appointment_system",
      features: [
        {
          key: "basic_billing",
          name: "Basic Billing",
          description: "Invoice generation and payment tracking",
          dependencies: ["appointment_system"]
        },
        {
          key: "payment_integration",
          name: "Payment Gateway Integration",
          description: "Online payment processing",
          dependencies: ["basic_billing"]
        },
        {
          key: "insurance_claims",
          name: "Insurance Claims",
          description: "Insurance verification and claim processing",
          dependencies: ["basic_billing"]
        },
        {
          key: "financial_reporting",
          name: "Financial Reporting",
          description: "Revenue analytics and financial reports",
          dependencies: ["basic_billing"]
        }
      ]
    },
    {
      id: "patient_engagement",
      name: "Patient Engagement",
      description: "Patient communication and portal",
      icon: Zap,
      color: "teal",
      parentFeature: "patient_records",
      features: [
        {
          key: "patient_portal",
          name: "Patient Portal",
          description: "Patient self-service portal",
          dependencies: ["patient_records"]
        },
        {
          key: "appointment_reminders",
          name: "Appointment Reminders",
          description: "Automated email and SMS reminders",
          dependencies: ["appointment_system"]
        },
        {
          key: "telemedicine",
          name: "Telemedicine",
          description: "Virtual consultations and remote care",
          dependencies: ["patient_portal", "appointment_system"]
        }
      ]
    },
    {
      id: "analytics_reporting",
      name: "Analytics & Reporting",
      description: "Business intelligence and insights",
      icon: Star,
      color: "indigo",
      features: [
        {
          key: "basic_analytics",
          name: "Basic Analytics",
          description: "Essential clinic performance metrics",
          dependencies: ["appointment_system"]
        },
        {
          key: "advanced_analytics",
          name: "Advanced Analytics",
          description: "Comprehensive business intelligence",
          dependencies: ["basic_analytics", "basic_billing"]
        },
        {
          key: "predictive_analytics",
          name: "Predictive Analytics",
          description: "AI-powered insights and forecasting",
          dependencies: ["advanced_analytics"]
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
            toast({
              title: "Dependencies Required",
              description: `Please enable these features first: ${missingDeps.join(', ')}`,
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
        description: `Feature ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
      
      fetchFeatures();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feature toggle",
        variant: "destructive",
      });
    }
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
      const { error } = await supabase
        .from('clinic_feature_toggles')
        .insert({
          feature_name: featureName,
          is_enabled: enabled,
          description: getAllFeatures().find(f => f.key === featureName)?.description || '',
          modified_by: profile?.user_id
        });
        
      if (error) throw error;
    }
  };

  const handleCreateFeature = async () => {
    try {
      const { error } = await supabase
        .from('clinic_feature_toggles')
        .insert({
          feature_name: newFeature.name,
          description: newFeature.description,
          is_enabled: newFeature.defaultEnabled,
          modified_by: profile?.user_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feature created successfully",
      });

      setNewFeature({ name: "", description: "", defaultEnabled: false });
      setShowCreateDialog(false);
      fetchFeatures();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create feature",
        variant: "destructive",
      });
    }
  };

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

  const filteredGroups = featureGroups.filter(group => {
    if (!searchTerm) return true;
    return group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           group.features.some(f => 
             f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             f.description.toLowerCase().includes(searchTerm.toLowerCase())
           );
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6 page-container">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 page-container">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feature Management</h1>
          <p className="text-muted-foreground">Control system-wide features and their dependencies</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Feature
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Feature Toggle</DialogTitle>
              <DialogDescription>
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
                  placeholder="feature_name"
                />
              </div>
              <div>
                <Label htmlFor="feature-description">Description</Label>
                <Textarea
                  id="feature-description"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this feature does..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newFeature.defaultEnabled}
                  onCheckedChange={(checked) => setNewFeature(prev => ({ ...prev, defaultEnabled: checked }))}
                />
                <Label>Enable by default</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFeature}>Create Feature</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Features are organized by dependencies. Disabling a feature will automatically disable dependent features. 
          Enable parent features before enabling their dependencies.
        </AlertDescription>
      </Alert>

      {/* Feature Groups */}
      <div className="space-y-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${group.color}-100 dark:bg-${group.color}-900/20`}>
                    <group.icon className={`w-5 h-5 text-${group.color}-600 dark:text-${group.color}-400`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                </div>
                
                {group.parentFeature && (
                  <Badge variant={isFeatureEnabled(group.parentFeature) ? "default" : "secondary"}>
                    Requires: {group.parentFeature}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {group.features.map((feature) => {
                  const status = getFeatureStatus(feature);
                  const isUnavailable = status === 'unavailable';
                  
                  return (
                    <div
                      key={feature.key}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        isUnavailable ? 'opacity-50 bg-muted/20' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{feature.name}</h4>
                          {status === 'enabled' && (
                            <Badge variant="default" className="text-xs">Enabled</Badge>
                          )}
                          {status === 'unavailable' && (
                            <Badge variant="destructive" className="text-xs">Dependencies Missing</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                        
                        {feature.dependencies && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs text-muted-foreground">Requires:</span>
                            {feature.dependencies.map(dep => (
                              <Badge 
                                key={dep} 
                                variant={isFeatureEnabled(dep) ? "outline" : "destructive"}
                                className="text-xs"
                              >
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isUnavailable && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                        <Switch
                          checked={status === 'enabled'}
                          onCheckedChange={(checked) => handleToggleFeature(feature.key, checked)}
                          disabled={isUnavailable}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Features */}
      {features.filter(f => !getAllFeatures().some(def => def.key === f.feature_name)).length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Custom Features</CardTitle>
            <CardDescription>Additional features not part of standard groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features
                .filter(f => !getAllFeatures().some(def => def.key === f.feature_name))
                .map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{feature.feature_name}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                    <Switch
                      checked={feature.is_enabled}
                      onCheckedChange={(checked) => handleToggleFeature(feature.feature_name, checked)}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}