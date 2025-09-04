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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Settings, Shield, Zap, Star, Users, BarChart3, Loader2, Building2, Filter, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ClinicFeature {
  id: string;
  clinic_id: string;
  feature_name: string;
  is_enabled: boolean;
  description: string;
  created_at: string;
  updated_at: string;
  modified_by?: string;
  clinic_name?: string;
}

interface FeatureCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  features: string[];
}

export default function FeatureToggles() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [clinicFilter, setClinicFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<ClinicFeature[]>([]);
  const [clinics, setClinics] = useState<{id: string, clinic_name: string}[]>([]);
  const [newFeature, setNewFeature] = useState({
    name: "",
    description: "",
    category: "core",
    defaultEnabled: false
  });

  // Feature categories with their associated features
  const categories: FeatureCategory[] = [
    { 
      id: "core", 
      name: "Core Features", 
      icon: Settings, 
      color: "blue",
      features: [
        "queue_management",
        "appointment_reminders", 
        "digital_forms",
        "billing_integration",
        "inventory_management",
        "patient_portal"
      ]
    },
    { 
      id: "premium", 
      name: "Premium Features", 
      icon: Star, 
      color: "purple",
      features: [
        "ai_queueing",
        "teledentistry",
        "analytics_reporting",
        "multi_language"
      ]
    },
    { 
      id: "integration", 
      name: "Integrations", 
      icon: Zap, 
      color: "green",
      features: [
        "insurance_integration",
        "family_accounts",
        "payment_gateway",
        "sms_notifications"
      ]
    },
    { 
      id: "experimental", 
      name: "Experimental", 
      icon: BarChart3, 
      color: "orange",
      features: [
        "voice_commands",
        "ar_visualization",
        "automated_scheduling"
      ]
    }
  ];

  // Feature display names and descriptions
  const featureDefinitions: Record<string, { name: string; description: string; tier: string }> = {
    queue_management: {
      name: "Queue Management",
      description: "Patient queue system with priority handling and real-time updates",
      tier: "core"
    },
    ai_queueing: {
      name: "AI Queue Optimization",
      description: "AI-powered queue management with predictive analytics",
      tier: "premium"
    },
    teledentistry: {
      name: "Teledentistry",
      description: "Remote consultation and tele-dentistry features",
      tier: "premium"
    },
    billing_integration: {
      name: "Billing Integration",
      description: "Integrated billing and payment processing",
      tier: "core"
    },
    inventory_management: {
      name: "Inventory Management",
      description: "Track and manage clinic inventory",
      tier: "core"
    },
    patient_portal: {
      name: "Patient Portal",
      description: "Patient self-service portal",
      tier: "core"
    },
    appointment_reminders: {
      name: "Appointment Reminders",
      description: "Automated appointment reminders via email and SMS",
      tier: "core"
    },
    digital_forms: {
      name: "Digital Forms",
      description: "Electronic signature and digital forms",
      tier: "core"
    },
    analytics_reporting: {
      name: "Advanced Analytics",
      description: "Comprehensive business intelligence and reporting tools",
      tier: "premium"
    },
    multi_language: {
      name: "Multi-Language Support",
      description: "Support for multiple languages in patient interfaces",
      tier: "premium"
    },
    insurance_integration: {
      name: "Insurance Integration",
      description: "Insurance claim processing and verification",
      tier: "integration"
    },
    family_accounts: {
      name: "Family Account Management",
      description: "Manage family relationships and group appointments",
      tier: "core"
    }
  };

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      
      if (profile?.role === 'super_admin') {
        // Super admin sees all clinics' features
        const { data, error } = await supabase
          .from('clinic_feature_toggles')
          .select(`
            *,
            clinics!inner(clinic_name)
          `);
          
        if (error) throw error;
        
        const featuresWithClinicNames = data?.map(feature => ({
          ...feature,
          clinic_name: feature.clinics?.clinic_name || 'Unknown Clinic'
        })) || [];
        
        setFeatures(featuresWithClinicNames);
        
        // Fetch clinic list for filter
        const { data: clinicsData, error: clinicsError } = await supabase
          .from('clinics')
          .select('id, clinic_name')
          .order('clinic_name');
          
        if (clinicsError) throw clinicsError;
        setClinics(clinicsData || []);
      } else {
        // Clinic admins see only their clinic's features
        const { data, error } = await supabase
          .from('clinic_feature_toggles')
          .select('*')
          .eq('clinic_id', profile?.clinic_id);
          
        if (error) throw error;
        setFeatures(data || []);
      }
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
    if (profile?.clinic_id || profile?.role === 'super_admin') {
      fetchFeatures();
    }
  }, [profile]);

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = 
      feature.feature_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (featureDefinitions[feature.feature_name]?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "enabled" && feature.is_enabled) ||
      (statusFilter === "disabled" && !feature.is_enabled);
      
    const featureTier = featureDefinitions[feature.feature_name]?.tier || 'core';
    const matchesTier = tierFilter === "all" || tierFilter === featureTier;
    
    const matchesClinic = 
      clinicFilter === "all" || 
      feature.clinic_id === clinicFilter;
    
    return matchesSearch && matchesStatus && matchesTier && matchesClinic;
  });

  const handleToggleFeature = async (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (!feature) return;

    try {
      const newEnabled = !feature.is_enabled;
      
      const { data, error } = await supabase
        .from('clinic_feature_toggles')
        .update({
          is_enabled: newEnabled,
          modified_by: profile?.user_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', featureId)
        .select();

      if (error) throw error;
      
      toast({
        title: `Feature ${newEnabled ? 'Enabled' : 'Disabled'}`,
        description: `${getFeatureName(feature.feature_name)} has been ${newEnabled ? 'enabled' : 'disabled'}.`,
      });
      
      // Update local state
      setFeatures(features.map(f => 
        f.id === featureId 
          ? { ...f, is_enabled: newEnabled, updated_at: new Date().toISOString() }
          : f
      ));
      
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast({
        title: "Error",
        description: "Failed to update feature toggle.",
        variant: "destructive",
      });
    }
  };

  const handleCreateFeature = async () => {
    if (!newFeature.name || !newFeature.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.clinic_id) {
      toast({
        title: "Error",
        description: "Unable to determine clinic ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clinic_feature_toggles')
        .insert({
          clinic_id: profile.clinic_id,
          feature_name: newFeature.name.toLowerCase().replace(/\s+/g, '_'),
          description: newFeature.description,
          is_enabled: newFeature.defaultEnabled,
          modified_by: profile.user_id
        });

      if (error) throw error;

      toast({
        title: "Feature Created",
        description: "New feature toggle has been created successfully.",
      });

      setNewFeature({
        name: "",
        description: "",
        category: "core",
        defaultEnabled: false
      });
      setShowCreateDialog(false);
      
      // Refresh features
      fetchFeatures();
      
    } catch (error) {
      console.error('Error creating feature:', error);
      toast({
        title: "Error",
        description: "Failed to create feature toggle.",
        variant: "destructive",
      });
    }
  };

  const getFeatureName = (featureName: string) => {
    return featureDefinitions[featureName]?.name || featureName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFeatureDescription = (featureName: string, dbDescription?: string) => {
    return dbDescription || featureDefinitions[featureName]?.description || 'No description available';
  };

  const getFeatureCategory = (featureName: string) => {
    for (const category of categories) {
      if (category.features.includes(featureName)) {
        return category;
      }
    }
    return categories[0]; // Default to core
  };

  const getCategoryStats = (categoryId: string) => {
    const categoryFeatures = filteredFeatures.filter(f => 
      getFeatureCategory(f.feature_name).id === categoryId
    );
    const enabledCount = categoryFeatures.filter(f => f.is_enabled).length;
    return { total: categoryFeatures.length, enabled: enabledCount };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-medical-blue" />
          <span className="ml-2">Loading feature toggles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feature Toggles</h1>
          <p className="text-muted-foreground">
            Manage feature availability and access control
            {profile?.role === 'super_admin' ? ' across all clinics' : ' for your clinic'}
          </p>
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="enabled">
                <div className="flex items-center">
                  <ToggleRight className="w-4 h-4 mr-2 text-green-600" />
                  Enabled
                </div>
              </SelectItem>
              <SelectItem value="disabled">
                <div className="flex items-center">
                  <ToggleLeft className="w-4 h-4 mr-2 text-muted-foreground" />
                  Disabled
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[130px]">
              <Star className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="core">Core</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="integration">Integration</SelectItem>
            </SelectContent>
          </Select>
          
          {profile?.role === 'super_admin' && (
            <Select value={clinicFilter} onValueChange={setClinicFilter}>
              <SelectTrigger className="w-[160px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Clinic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clinics</SelectItem>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.clinic_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {categories.map((category) => {
          const stats = getCategoryStats(category.id);
          const Icon = category.icon;
          
          return (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.enabled}/{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.enabled} enabled features
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Toggles by Category */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Features ({filteredFeatures.length})</TabsTrigger>
          {categories.map((category) => {
            const stats = getCategoryStats(category.id);
            return (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name} ({stats.total})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {filteredFeatures.map((feature) => {
              const category = getFeatureCategory(feature.feature_name);
              const Icon = category.icon;
              const featureDef = featureDefinitions[feature.feature_name];
              
              return (
                <Card key={feature.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <Icon className={`w-8 h-8 text-${category.color}-500`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{getFeatureName(feature.feature_name)}</h3>
                            <Badge variant={featureDef?.tier === 'premium' ? 'default' : 'secondary'}>
                              {featureDef?.tier || 'core'}
                            </Badge>
                            {profile?.role === 'super_admin' && feature.clinic_name && (
                              <Badge variant="outline">
                                <Building2 className="w-3 h-3 mr-1" />
                                {feature.clinic_name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {getFeatureDescription(feature.feature_name, feature.description)}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Modified {new Date(feature.updated_at).toLocaleDateString()}</span>
                            {feature.modified_by && (
                              <span>by {feature.modified_by}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {feature.is_enabled ? 'Enabled' : 'Disabled'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {feature.is_enabled ? 'Active for users' : 'Hidden from users'}
                          </p>
                        </div>
                        <Switch
                          checked={feature.is_enabled}
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
                .filter(feature => getFeatureCategory(feature.feature_name).id === category.id)
                .map((feature) => {
                  const Icon = category.icon;
                  const featureDef = featureDefinitions[feature.feature_name];
                  
                  return (
                    <Card key={feature.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <Icon className={`w-8 h-8 text-${category.color}-500`} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold">{getFeatureName(feature.feature_name)}</h3>
                                <Badge variant={featureDef?.tier === 'premium' ? 'default' : 'secondary'}>
                                  {featureDef?.tier || 'core'}
                                </Badge>
                                {profile?.role === 'super_admin' && feature.clinic_name && (
                                  <Badge variant="outline">
                                    <Building2 className="w-3 h-3 mr-1" />
                                    {feature.clinic_name}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {getFeatureDescription(feature.feature_name, feature.description)}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>Modified {new Date(feature.updated_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Switch
                            checked={feature.is_enabled}
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

      {filteredFeatures.length === 0 && !loading && (
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