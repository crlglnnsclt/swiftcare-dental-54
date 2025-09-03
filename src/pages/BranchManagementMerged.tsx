import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, 
  Plus, 
  Settings, 
  Palette, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Edit,
  Trash2,
  Upload,
  Save,
  X,
  Users,
  ToggleLeft,
  ToggleRight,
  Bell,
  Shield
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
  id: string;
  branch_id: string;
  feature_name: string;
  is_enabled: boolean;
  config: any;
}

interface BranchSettings {
  operating_hours: {
    [key: string]: { open: string; close: string; enabled: boolean };
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    appointment_reminders: boolean;
  };
  security: {
    require_staff_pin: boolean;
    session_timeout: number;
    auto_logout: boolean;
  };
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

const DEFAULT_OPERATING_HOURS = {
  monday: { open: '08:00', close: '17:00', enabled: true },
  tuesday: { open: '08:00', close: '17:00', enabled: true },
  wednesday: { open: '08:00', close: '17:00', enabled: true },
  thursday: { open: '08:00', close: '17:00', enabled: true },
  friday: { open: '08:00', close: '17:00', enabled: true },
  saturday: { open: '09:00', close: '14:00', enabled: true },
  sunday: { open: '10:00', close: '14:00', enabled: false }
};

export default function BranchManagementMerged() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFeatures, setBranchFeatures] = useState<BranchFeature[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchSettings, setBranchSettings] = useState<BranchSettings>({
    operating_hours: DEFAULT_OPERATING_HOURS,
    notifications: {
      email_notifications: true,
      sms_notifications: false,
      appointment_reminders: true
    },
    security: {
      require_staff_pin: true,
      session_timeout: 30,
      auto_logout: true
    }
  });
  
  const [isNewBranchOpen, setIsNewBranchOpen] = useState(false);
  const [isEditBranchOpen, setIsEditBranchOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  useEffect(() => {
    if (profile?.enhanced_role === 'super_admin') {
      fetchBranches();
      fetchBranchFeatures();
    }
  }, [profile]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBranches(data || []);
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
        .from('branch_features')
        .select('*');

      if (error) throw error;
      setBranchFeatures(data || []);
    } catch (error) {
      console.error('Error fetching branch features:', error);
    }
  };

  const createBranch = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .insert([{
          name: newBranch.name,
          address: newBranch.address || null,
          phone: newBranch.phone || null,
          email: newBranch.email || null,
          primary_color: newBranch.primary_color,
          secondary_color: newBranch.secondary_color,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Initialize default features for new branch
      const defaultFeatures = AVAILABLE_FEATURES.map(feature => ({
        branch_id: data.id,
        feature_name: feature.key,
        is_enabled: ['queueing', 'digital_forms', 'messaging'].includes(feature.key),
        config: {}
      }));

      await supabase
        .from('branch_features')
        .insert(defaultFeatures);

      setBranches([data, ...branches]);
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

  const updateBranch = async () => {
    if (!editBranch) return;
    
    try {
      let logoUrl = editBranch.logo_url;
      
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, editBranch.id);
      }

      const { error } = await supabase
        .from('branches')
        .update({
          name: editBranch.name,
          address: editBranch.address || null,
          phone: editBranch.phone || null,
          email: editBranch.email || null,
          primary_color: editBranch.primary_color,
          secondary_color: editBranch.secondary_color,
          logo_url: logoUrl,
          is_active: editBranch.is_active
        })
        .eq('id', editBranch.id);

      if (error) throw error;

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
        .from('branches')
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

  const toggleBranchFeature = async (branchId: string, featureName: string, currentStatus: boolean) => {
    try {
      const existingFeature = branchFeatures.find(
        f => f.branch_id === branchId && f.feature_name === featureName
      );

      if (existingFeature) {
        const { error } = await supabase
          .from('branch_features')
          .update({ is_enabled: !currentStatus })
          .eq('id', existingFeature.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('branch_features')
          .insert([{
            branch_id: branchId,
            feature_name: featureName,
            is_enabled: !currentStatus,
            config: {}
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

  const updateOperatingHours = (day: string, field: string, value: string | boolean) => {
    setBranchSettings(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day],
          [field]: value
        }
      }
    }));
  };

  const saveBranchSettings = async () => {
    if (!selectedBranch) return;
    
    try {
      // In a real implementation, save settings to branch_features table with config
      const settingsFeature = {
        branch_id: selectedBranch.id,
        feature_name: 'branch_settings',
        is_enabled: true,
        config: branchSettings
      };

      const existingSettings = branchFeatures.find(
        f => f.branch_id === selectedBranch.id && f.feature_name === 'branch_settings'
      );

      if (existingSettings) {
        await supabase
          .from('branch_features')
          .update({ config: branchSettings as any })
          .eq('id', existingSettings.id);
      } else {
        await supabase
          .from('branch_features')
          .insert([{
            branch_id: selectedBranch.id,
            feature_name: 'branch_settings',
            is_enabled: true,
            config: branchSettings as any
          }]);
      }

      toast({
        title: "Success",
        description: "Branch settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  const openEditBranch = (branch: Branch) => {
    setEditBranch(branch);
    setLogoPreview(branch.logo_url);
    setIsEditBranchOpen(true);
  };

  const openFeaturesModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsFeaturesOpen(true);
  };

  const openSettingsModal = (branch: Branch) => {
    setSelectedBranch(branch);
    
    // Load existing settings from branch_features
    const existingSettings = branchFeatures.find(
      f => f.branch_id === branch.id && f.feature_name === 'branch_settings'
    );
    
    if (existingSettings?.config) {
      setBranchSettings(existingSettings.config);
    } else {
      setBranchSettings({
        operating_hours: DEFAULT_OPERATING_HOURS,
        notifications: {
          email_notifications: true,
          sms_notifications: false,
          appointment_reminders: true
        },
        security: {
          require_staff_pin: true,
          session_timeout: 30,
          auto_logout: true
        }
      });
    }
    
    setIsSettingsOpen(true);
  };

  if (profile?.enhanced_role !== 'super_admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need super admin privileges to access branch management.
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
          <p className="text-muted-foreground">Manage clinic branches, features, and settings</p>
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
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditBranch(branch)} title="Edit Branch">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteBranch(branch.id, branch.name)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete Branch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Branch Info */}
              <div className="space-y-2 text-sm">
                {branch.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{branch.address}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.phone}</span>
                  </div>
                )}
                {branch.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{branch.email}</span>
                  </div>
                )}
              </div>

              {/* Color Preview */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border-2 border-border"
                  style={{ backgroundColor: branch.primary_color }}
                />
                <div 
                  className="w-6 h-6 rounded border-2 border-border"
                  style={{ backgroundColor: branch.secondary_color }}
                />
                <span className="text-xs text-muted-foreground">Brand Colors</span>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openFeaturesModal(branch)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Features
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openSettingsModal(branch)}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Branches */}
      {branches.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Branches Found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first clinic branch to get started.
            </p>
            <Button onClick={() => setIsNewBranchOpen(true)} className="medical-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create First Branch
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Branch Modal */}
      <Dialog open={isEditBranchOpen} onOpenChange={setIsEditBranchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          {editBranch && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Branch Name *</Label>
                <Input
                  id="edit-name"
                  value={editBranch.name}
                  onChange={(e) => setEditBranch({...editBranch, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={editBranch.address || ''}
                  onChange={(e) => setEditBranch({...editBranch, address: e.target.value})}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editBranch.phone || ''}
                    onChange={(e) => setEditBranch({...editBranch, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editBranch.email || ''}
                    onChange={(e) => setEditBranch({...editBranch, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-logo">Logo</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </label>
                  </Button>
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-contain rounded" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-primary">Primary Color</Label>
                  <Input
                    id="edit-primary"
                    type="color"
                    value={editBranch.primary_color}
                    onChange={(e) => setEditBranch({...editBranch, primary_color: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-secondary">Secondary Color</Label>
                  <Input
                    id="edit-secondary"
                    type="color"
                    value={editBranch.secondary_color}
                    onChange={(e) => setEditBranch({...editBranch, secondary_color: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editBranch.is_active}
                  onCheckedChange={(checked) => setEditBranch({...editBranch, is_active: checked})}
                />
                <Label htmlFor="edit-active">Active Branch</Label>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={updateBranch} 
                  className="flex-1 medical-gradient text-white"
                  disabled={!editBranch.name}
                >
                  Update Branch
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditBranchOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Features Modal */}
      <Dialog open={isFeaturesOpen} onOpenChange={setIsFeaturesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Features - {selectedBranch?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {AVAILABLE_FEATURES.map((feature) => {
              const branchFeature = selectedBranch ? getBranchFeature(selectedBranch.id, feature.key) : null;
              const isEnabled = branchFeature?.is_enabled || false;
              
              return (
                <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => selectedBranch && toggleBranchFeature(selectedBranch.id, feature.key, isEnabled)}
                  />
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Branch Settings - {selectedBranch?.name}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="hours" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hours">Operating Hours</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hours" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(branchSettings.operating_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 py-2">
                      <div className="w-24 capitalize font-medium">{day}</div>
                      <Switch
                        checked={hours.enabled}
                        onCheckedChange={(checked) => updateOperatingHours(day, 'enabled', checked)}
                      />
                      {hours.enabled ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => updateOperatingHours(day, 'open', e.target.value)}
                            className="w-32"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => updateOperatingHours(day, 'close', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      ) : (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={branchSettings.notifications.email_notifications}
                      onCheckedChange={(checked) => setBranchSettings({
                        ...branchSettings,
                        notifications: { ...branchSettings.notifications, email_notifications: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={branchSettings.notifications.sms_notifications}
                      onCheckedChange={(checked) => setBranchSettings({
                        ...branchSettings,
                        notifications: { ...branchSettings.notifications, sms_notifications: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Automatic appointment reminders</p>
                    </div>
                    <Switch
                      checked={branchSettings.notifications.appointment_reminders}
                      onCheckedChange={(checked) => setBranchSettings({
                        ...branchSettings,
                        notifications: { ...branchSettings.notifications, appointment_reminders: checked }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Require Staff PIN</Label>
                      <p className="text-sm text-muted-foreground">Staff must enter PIN for access</p>
                    </div>
                    <Switch
                      checked={branchSettings.security.require_staff_pin}
                      onCheckedChange={(checked) => setBranchSettings({
                        ...branchSettings,
                        security: { ...branchSettings.security, require_staff_pin: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Auto Logout</Label>
                      <p className="text-sm text-muted-foreground">Automatic session timeout</p>
                    </div>
                    <Switch
                      checked={branchSettings.security.auto_logout}
                      onCheckedChange={(checked) => setBranchSettings({
                        ...branchSettings,
                        security: { ...branchSettings.security, auto_logout: checked }
                      })}
                    />
                  </div>
                  {branchSettings.security.auto_logout && (
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        value={branchSettings.security.session_timeout}
                        onChange={(e) => setBranchSettings({
                          ...branchSettings,
                          security: { ...branchSettings.security, session_timeout: parseInt(e.target.value) || 30 }
                        })}
                        className="w-32 mt-2"
                        min="5"
                        max="120"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveBranchSettings} className="medical-gradient text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}