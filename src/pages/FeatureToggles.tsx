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
  Shield, 
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
  Clock
} from "lucide-react";
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
      name: "Appointments & Scheduling",
      description: "Appointment management and scheduling system",
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
          name: "Appointment Reminders",
          description: "Automated email and SMS appointment reminders",
          dependencies: ["appointment_booking"],
          category: "appointments",
          priority: "medium"
        },
        {
          key: "smart_scheduling",
          name: "Smart Scheduling",
          description: "AI-powered appointment optimization",
          dependencies: ["appointment_booking", "queue_management"],
          category: "appointments",
          priority: "low"
        }
      ]
    },
    {
      id: "digital_health",
      name: "Digital Health Records",
      description: "Paperless documentation and forms",
      icon: FileText,
      color: "purple",
      features: [
        {
          key: "digital_forms",
          name: "Digital Forms",
          description: "Electronic forms and basic e-signatures",
          dependencies: ["patient_records"],
          category: "digital_health",
          priority: "high"
        },
        {
          key: "document_management",
          name: "Document Management",
          description: "Upload, store, and manage patient documents",
          dependencies: ["digital_forms"],
          category: "digital_health",
          priority: "high"
        },
        {
          key: "dental_charts",
          name: "Digital Dental Charts",
          description: "Interactive dental charting and treatment planning",
          dependencies: ["patient_records"],
          category: "digital_health",
          priority: "medium"
        },
        {
          key: "treatment_notes",
          name: "Treatment Notes",
          description: "Digital treatment notes and progress tracking",
          dependencies: ["patient_records"],
          category: "digital_health",
          priority: "medium"
        }
      ]
    },
    {
      id: "financial",
      name: "Financial Management",
      description: "Billing, payments, and financial tracking",
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
          description: "Insurance verification and claims processing",
          dependencies: ["billing_system"],
          category: "financial",
          priority: "medium"
        },
        {
          key: "financial_reporting",
          name: "Financial Reporting",
          description: "Revenue analytics and financial reports",
          dependencies: ["billing_system"],
          category: "financial",
          priority: "low"
        }
      ]
    },
    {
      id: "operations",
      name: "Clinical Operations",
      description: "Inventory and operational management",
      icon: Package,
      color: "teal",
      features: [
        {
          key: "inventory_management",
          name: "Inventory Management",
          description: "Track supplies, equipment, and consumables",
          category: "operations",
          priority: "medium"
        },
        {
          key: "staff_scheduling",
          name: "Staff Scheduling",
          description: "Staff work schedules and shift management",
          dependencies: ["user_management"],
          category: "operations",
          priority: "medium"
        }
      ]
    },
    {
      id: "patient_engagement",
      name: "Patient Engagement",
      description: "Patient communication and self-service",
      icon: Users,
      color: "indigo",
      features: [
        {
          key: "patient_portal",
          name: "Patient Portal",
          description: "Patient self-service portal and account access",
          dependencies: ["patient_records"],
          category: "patient_engagement",
          priority: "medium"
        },
        {
          key: "online_booking",
          name: "Online Booking",
          description: "Patient self-scheduling through website",
          dependencies: ["appointment_booking", "patient_portal"],
          category: "patient_engagement",
          priority: "medium"
        },
        {
          key: "telemedicine",
          name: "Telemedicine",
          description: "Virtual consultations and remote care",
          dependencies: ["patient_portal", "appointment_booking"],
          category: "patient_engagement",
          priority: "low"
        }
      ]
    },
    {
      id: "analytics",
      name: "Analytics & Reporting",
      description: "Business intelligence and insights",
      icon: BarChart3,
      color: "pink",
      features: [
        {
          key: "basic_analytics",
          name: "Basic Analytics",
          description: "Essential clinic performance metrics",
          dependencies: ["appointment_booking"],
          category: "analytics",
          priority: "medium"
        },
        {
          key: "advanced_analytics",
          name: "Advanced Analytics",
          description: "Comprehensive business intelligence and custom reports",
          dependencies: ["basic_analytics", "billing_system"],
          category: "analytics",
          priority: "low"
        },
        {
          key: "predictive_analytics",
          name: "Predictive Analytics",
          description: "AI-powered insights and forecasting",
          dependencies: ["advanced_analytics"],
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
              description: `Please enable these features first: ${missingNames.join(', ')}`,
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
        description: `${getAllFeatures().find(f => f.key === featureName)?.name} ${enabled ? 'enabled' : 'disabled'} successfully`,
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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disabled':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'unavailable':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
    };
    
    return (
      <Badge className={variants[priority as keyof typeof variants] || variants.medium}>
        {priority}
      </Badge>
    );
  };

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
              <DialogTitle>Create Custom Feature</DialogTitle>
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
            placeholder="Search features and groups..."
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
        {filteredGroups.map((group) => {
          const IconComponent = group.icon;
          
          return (
            <Card key={group.id} className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </div>
                  </div>
                  
                  <Badge variant="outline">
                    {group.features.filter(f => isFeatureEnabled(f.key)).length} / {group.features.length} enabled
                  </Badge>
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
                        className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                          isUnavailable ? 'opacity-50 bg-muted/20' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(status)}
                            <h4 className="font-medium">{feature.name}</h4>
                            {getPriorityBadge(feature.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                          
                          {feature.dependencies && (
                            <div className="flex items-center gap-1 mb-2">
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
                            <div className="flex items-center gap-1 text-xs text-orange-600">
                              <AlertTriangle className="w-3 h-3" />
                              Enable dependencies first
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
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
          );
        })}
      </div>

      {/* Custom Features */}
      {features.filter(f => !getAllFeatures().some(def => def.key === f.feature_name)).length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Custom Features
            </CardTitle>
            <CardDescription>Additional features not part of standard groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features
                .filter(f => !getAllFeatures().some(def => def.key === f.feature_name))
                .map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {feature.is_enabled ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <div>
                        <h4 className="font-medium">{feature.feature_name}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
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