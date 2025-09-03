import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, 
  Plus, 
  Settings, 
  Palette, 
  Users, 
  ToggleLeft,
  ToggleRight,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Upload,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BranchFeature {
  id?: string;
  branch_id: string;
  feature_name: string;
  is_enabled: boolean;
  config: any;
}

const AVAILABLE_FEATURES = [
  { key: 'queueing', name: 'Queue Management', description: 'Patient queue and check-in system' },
  { key: 'dental_charts', name: 'Dental Charts', description: 'Digital odontogram and treatment planning' },
  { key: 'digital_forms', name: 'Digital Forms', description: 'Paperless patient forms and signatures' },
  { key: 'telemedicine', name: 'Telemedicine', description: 'Remote consultations and video calls' },
  { key: 'inventory', name: 'Inventory Management', description: 'Supplies and equipment tracking' },
  { key: 'payroll', name: 'Payroll System', description: 'Staff time tracking and payroll' },
  { key: 'messaging', name: 'Internal Messaging', description: 'Staff and patient communication' },
  { key: 'analytics', name: 'Advanced Analytics', description: 'Detailed reports and insights' }
];

export default function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFeatures, setBranchFeatures] = useState<BranchFeature[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isNewBranchOpen, setIsNewBranchOpen] = useState(false);
  const [isEditBranchOpen, setIsEditBranchOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    primary_color: '#0ea5e9',
    secondary_color: '#06b6d4'
  });

  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Check if user has admin privileges (admin or super_admin)
  const hasAdminAccess = profile?.role === 'super_admin' || profile?.role === 'admin';

  useEffect(() => {
    if (hasAdminAccess) {
      fetchBranches();
      fetchBranchFeatures();
    }
  }, [hasAdminAccess]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBranches(data?.map(clinic => ({
        id: clinic.id,
        name: clinic.clinic_name,
        address: clinic.address || '',
        phone: clinic.phone_number || '',
        email: clinic.email || '',
        logo_url: clinic.logo_url || '',
        primary_color: clinic.primary_color || '#2563eb',
        secondary_color: clinic.secondary_color || '#10b981',
        is_active: true, // Default to active since clinics table doesn't have this field
        created_at: clinic.created_at,
        updated_at: clinic.updated_at
      })) || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch branches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_feature_toggles')
        .select('*');

      if (error) throw error;
      setBranchFeatures(data?.map(feature => ({
        id: feature.id,
        branch_id: feature.clinic_id,
        feature_name: feature.feature_name,
        is_enabled: feature.is_enabled,
        config: {}
      })) || []);
    } catch (error) {
      console.error('Error fetching branch features:', error);
    }
  };

  const createBranch = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .insert([{
          clinic_name: newBranch.name,
          address: newBranch.address || null,
          phone_number: newBranch.phone || null,
          email: newBranch.email || null,
          primary_color: newBranch.primary_color,
          secondary_color: newBranch.secondary_color
        }])
        .select()
        .single();

      if (error) throw error;

      // Initialize default features for new branch
      const defaultFeatures = AVAILABLE_FEATURES.map(feature => ({
        branch_id: data.id,
        feature_name: feature.key,
        is_enabled: ['queueing', 'digital_forms', 'messaging'].includes(feature.key), // Enable basic features by default
        config: {}
      }));

      await supabase
        .from('clinic_feature_toggles')
        .insert(defaultFeatures.map(f => ({
          clinic_id: data.id,
          feature_name: f.feature_name,
          is_enabled: f.is_enabled
        })));

      setBranches([{
        id: data.id,
        name: data.clinic_name,
        address: data.address,
        phone: data.phone_number,
        email: data.email,
        logo_url: data.logo_url,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        is_active: true,
        created_at: data.created_at,
        updated_at: data.updated_at
      }, ...branches]);
      setIsNewBranchOpen(false);
      setNewBranch({
        name: '',
        address: '',
        phone: '',
        email: '',
        primary_color: '#0ea5e9',
        secondary_color: '#06b6d4'
      });

      toast({
        title: "Success",
        description: "Branch created successfully",
      });

      fetchBranchFeatures();
    } catch (error) {
      console.error('Error creating branch:', error);
      toast({
        title: "Error",
        description: "Failed to create branch",
        variant: "destructive"
      });
    }
  };

  const toggleBranchFeature = async (branchId: string, featureName: string, currentStatus: boolean) => {
    try {
      const existingFeature = branchFeatures.find(
        f => f.branch_id === branchId && f.feature_name === featureName
      );

      if (existingFeature) {
        const { error } = await supabase
          .from('clinic_feature_toggles')
          .update({ is_enabled: !currentStatus })
          .eq('id', existingFeature.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clinic_feature_toggles')
          .insert([{
            clinic_id: branchId,
            feature_name: featureName,
            is_enabled: !currentStatus
          }]);

        if (error) throw error;
      }

      fetchBranchFeatures();
      toast({
        title: "Success",
        description: `Feature ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast({
        title: "Error",
        description: "Failed to update feature",
        variant: "destructive"
      });
    }
  };

  const getBranchFeature = (branchId: string, featureName: string) => {
    return branchFeatures.find(f => f.branch_id === branchId && f.feature_name === featureName);
  };

  const toggleExpandFeatures = (branchId: string) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [branchId]: !prev[branchId]
    }));
  };

  const openFeaturesModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsFeaturesOpen(true);
  };

  const openEditBranch = (branch: Branch) => {
    setEditBranch(branch);
    setLogoPreview(branch.logo_url);
    setIsEditBranchOpen(true);
  };

  const updateBranch = async () => {
    if (!editBranch) return;
    
    try {
      let logoUrl = editBranch.logo_url;
      
      // Upload logo if a new file is selected
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, editBranch.id);
      }

      const { error } = await supabase
        .from('clinics')
        .update({
          clinic_name: editBranch.name,
          address: editBranch.address || null,
          phone_number: editBranch.phone || null,
          email: editBranch.email || null,
          primary_color: editBranch.primary_color,
          secondary_color: editBranch.secondary_color,
          logo_url: logoUrl
        })
        .eq('id', editBranch.id);

      if (error) throw error;

      // Update local state
      setBranches(branches.map(b => 
        b.id === editBranch.id 
          ? { ...editBranch, logo_url: logoUrl }
          : b
      ));

      setIsEditBranchOpen(false);
      setEditBranch(null);
      setLogoFile(null);
      setLogoPreview(null);

      toast({
        title: "Success",
        description: "Branch updated successfully",
      });
    } catch (error) {
      console.error('Error updating branch:', error);
      toast({
        title: "Error", 
        description: "Failed to update branch",
        variant: "destructive"
      });
    }
  };

  const deleteBranch = async (branchId: string, branchName: string) => {
    if (!confirm(`Are you sure you want to delete "${branchName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clinics')
        .delete()
        .eq('id', branchId);

      if (error) throw error;

      setBranches(branches.filter(b => b.id !== branchId));
      
      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast({
        title: "Error",
        description: "Failed to delete branch",
        variant: "destructive"
      });
    }
  };

  const uploadLogo = async (file: File, branchId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${branchId}-logo.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('branch-logos')
      .upload(`${fileName}`, file, {
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('branch-logos')
      .getPublicUrl(`${fileName}`);

    return publicUrl;
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!hasAdminAccess) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need admin or super admin privileges to access branch management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading branches...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 page-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Branch Management</h1>
          <p className="text-muted-foreground">Manage clinic branches and their features</p>
        </div>
        
        <Dialog open={isNewBranchOpen} onOpenChange={setIsNewBranchOpen}>
          <DialogTrigger asChild>
            <Button className="medical-gradient text-white btn-3d">
              <Plus className="w-4 h-4 mr-2" />
              New Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Branch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="branch-name">Branch Name *</Label>
                <Input
                  id="branch-name"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                  placeholder="Main Clinic"
                />
              </div>
              <div>
                <Label htmlFor="branch-address">Address</Label>
                <Textarea
                  id="branch-address"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                  placeholder="123 Medical Ave, City, State 12345"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branch-phone">Phone</Label>
                  <Input
                    id="branch-phone"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="branch-email">Email</Label>
                  <Input
                    id="branch-email"
                    type="email"
                    value={newBranch.email}
                    onChange={(e) => setNewBranch({...newBranch, email: e.target.value})}
                    placeholder="clinic@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <Input
                    id="primary-color"
                    type="color"
                    value={newBranch.primary_color}
                    onChange={(e) => setNewBranch({...newBranch, primary_color: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <Input
                    id="secondary-color"
                    type="color"
                    value={newBranch.secondary_color}
                    onChange={(e) => setNewBranch({...newBranch, secondary_color: e.target.value})}
                  />
                </div>
              </div>
              <Button 
                onClick={createBranch} 
                className="w-full medical-gradient text-white btn-3d"
                disabled={!newBranch.name}
              >
                Create Branch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {branches.map((branch, index) => (
          <Card key={branch.id} className={`glass-card card-3d interactive-3d card-stagger-${(index % 4) + 1}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold float-gentle"
                    style={{ backgroundColor: branch.primary_color }}
                  >
                    {branch.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                    <Badge variant={branch.is_active ? "default" : "secondary"}>
                      {branch.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="btn-3d"
                    onClick={() => openEditBranch(branch)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {profile?.enhanced_role === 'super_admin' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="btn-3d text-destructive hover:text-destructive"
                      onClick={() => deleteBranch(branch.id, branch.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Branch Info */}
              <div className="space-y-2 text-sm">
                {branch.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{branch.address}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{branch.phone}</span>
                  </div>
                )}
                {branch.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{branch.email}</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 float-gentle" />
                  Features
                </h4>
                <div className="space-y-2">
                  {(expandedFeatures[branch.id] ? AVAILABLE_FEATURES : AVAILABLE_FEATURES.slice(0, 4)).map((feature) => {
                    const branchFeature = getBranchFeature(branch.id, feature.key);
                    const isEnabled = branchFeature?.is_enabled || false;
                    
                    return (
                      <div key={feature.key} className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-sm font-medium">{feature.name}</span>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => toggleBranchFeature(branch.id, feature.key, isEnabled)}
                        />
                      </div>
                    );
                  })}
                  <div className="flex gap-2">
                    {AVAILABLE_FEATURES.length > 4 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => toggleExpandFeatures(branch.id)}
                      >
                        {expandedFeatures[branch.id] ? 'Show Less' : `View All (${AVAILABLE_FEATURES.length})`}
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => openFeaturesModal(branch)}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              </div>

              {/* Color Scheme */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 float-gentle" />
                  Brand Colors
                </h4>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded border-2 border-border"
                    style={{ backgroundColor: branch.primary_color }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-8 h-8 rounded border-2 border-border"
                    style={{ backgroundColor: branch.secondary_color }}
                    title="Secondary Color"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {branches.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Branches Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first branch to start managing clinic locations.
            </p>
            <Button onClick={() => setIsNewBranchOpen(true)} className="medical-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create First Branch
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Features Management Modal */}
      <Dialog open={isFeaturesOpen} onOpenChange={setIsFeaturesOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Features - {selectedBranch?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              {AVAILABLE_FEATURES.map((feature) => {
                const branchFeature = selectedBranch ? getBranchFeature(selectedBranch.id, feature.key) : null;
                const isEnabled = branchFeature?.is_enabled || false;
                
                return (
                  <Card key={feature.key} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{feature.name}</h4>
                          <Badge variant={isEnabled ? "default" : "secondary"}>
                            {isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => selectedBranch && toggleBranchFeature(selectedBranch.id, feature.key, isEnabled)}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Modal */}
      <Dialog open={isEditBranchOpen} onOpenChange={setIsEditBranchOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Branch - {editBranch?.name}
            </DialogTitle>
          </DialogHeader>
          {editBranch && (
            <div className="space-y-6">
              {/* Logo Upload Section */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Branch Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                    {logoPreview || editBranch.logo_url ? (
                      <img 
                        src={logoPreview || editBranch.logo_url || ''} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload a logo image (PNG, JPG, SVG recommended)
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="edit-branch-name">Branch Name *</Label>
                  <Input
                    id="edit-branch-name"
                    value={editBranch.name}
                    onChange={(e) => setEditBranch({...editBranch, name: e.target.value})}
                    placeholder="Main Clinic"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="edit-branch-address">Address</Label>
                  <Textarea
                    id="edit-branch-address"
                    value={editBranch.address || ''}
                    onChange={(e) => setEditBranch({...editBranch, address: e.target.value})}
                    placeholder="123 Medical Ave, City, State 12345"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-branch-phone">Phone</Label>
                  <Input
                    id="edit-branch-phone"
                    value={editBranch.phone || ''}
                    onChange={(e) => setEditBranch({...editBranch, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-branch-email">Email</Label>
                  <Input
                    id="edit-branch-email"
                    type="email"
                    value={editBranch.email || ''}
                    onChange={(e) => setEditBranch({...editBranch, email: e.target.value})}
                    placeholder="clinic@example.com"
                  />
                </div>
              </div>

              {/* Brand Colors */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Brand Colors
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-primary-color">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="edit-primary-color"
                        type="color"
                        value={editBranch.primary_color}
                        onChange={(e) => setEditBranch({...editBranch, primary_color: e.target.value})}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={editBranch.primary_color}
                        onChange={(e) => setEditBranch({...editBranch, primary_color: e.target.value})}
                        placeholder="#0ea5e9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-secondary-color">Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="edit-secondary-color"
                        type="color"
                        value={editBranch.secondary_color}
                        onChange={(e) => setEditBranch({...editBranch, secondary_color: e.target.value})}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={editBranch.secondary_color}
                        onChange={(e) => setEditBranch({...editBranch, secondary_color: e.target.value})}
                        placeholder="#06b6d4"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Color Preview */}
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm font-medium mb-2">Color Preview:</p>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold shadow-md"
                      style={{ backgroundColor: editBranch.primary_color }}
                    >
                      {editBranch.name.charAt(0)}
                    </div>
                    <div 
                      className="w-20 h-8 rounded border"
                      style={{ backgroundColor: editBranch.secondary_color }}
                      title="Secondary Color Sample"
                    />
                  </div>
                </div>
              </div>

              {/* Branch Status */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div>
                  <Label className="text-base font-medium">Branch Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {editBranch.is_active ? 'Branch is currently active and available for operations' : 'Branch is inactive and not available for operations'}
                  </p>
                </div>
                <Switch
                  checked={editBranch.is_active}
                  onCheckedChange={(checked) => setEditBranch({...editBranch, is_active: checked})}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditBranchOpen(false);
                    setEditBranch(null);
                    setLogoFile(null);
                    setLogoPreview(null);
                  }}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={updateBranch} 
                  className="flex-1 medical-gradient text-white btn-3d"
                  disabled={!editBranch.name}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}