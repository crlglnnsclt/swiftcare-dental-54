import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Building2, 
  Palette, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Save,
  Upload,
  Bell,
  Shield,
  Users
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function BranchSettings() {
  const [settings, setSettings] = useState({
    // Basic Info
    branchName: 'Main Clinic',
    address: '123 Medical Ave, City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@mainclinic.com',
    
    // Branding
    primaryColor: '#0ea5e9',
    secondaryColor: '#06b6d4',
    logoUrl: '',
    
    // Operating Hours
    operatingHours: {
      monday: { open: '08:00', close: '17:00', enabled: true },
      tuesday: { open: '08:00', close: '17:00', enabled: true },
      wednesday: { open: '08:00', close: '17:00', enabled: true },
      thursday: { open: '08:00', close: '17:00', enabled: true },
      friday: { open: '08:00', close: '17:00', enabled: true },
      saturday: { open: '09:00', close: '14:00', enabled: true },
      sunday: { open: '10:00', close: '14:00', enabled: false }
    },
    
    // Features
    enableOnlineBooking: true,
    enableNotifications: true,
    enableQueue: true,
    enableDigitalForms: true,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    
    // Security
    requireStaffPin: true,
    sessionTimeout: 30,
    autoLogout: true
  });

  const { profile } = useAuth();
  const { toast } = useToast();

  const saveSettings = async () => {
    try {
      // In a real implementation, this would save to the database
      toast({
        title: "Success",
        description: "Branch settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  const updateOperatingHours = (day: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value
        }
      }
    }));
  };

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need admin privileges to access branch settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Branch Settings</h1>
          <p className="text-muted-foreground">Configure your clinic branch settings and preferences</p>
        </div>
        <Button onClick={saveSettings} className="medical-gradient text-white">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Basic Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                value={settings.branchName}
                onChange={(e) => setSettings({...settings, branchName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({...settings, address: e.target.value})}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logo">Logo</Label>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              <span className="text-sm text-muted-foreground">
                Recommended size: 200x60px, PNG format
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  className="w-20 h-10"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                  className="w-20 h-10"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings.operatingHours).map(([day, hours]) => (
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

      {/* Features */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Online Booking</Label>
                <p className="text-sm text-muted-foreground">Allow patients to book online</p>
              </div>
              <Switch
                checked={settings.enableOnlineBooking}
                onCheckedChange={(checked) => setSettings({...settings, enableOnlineBooking: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Queue Management</Label>
                <p className="text-sm text-muted-foreground">Enable digital queue system</p>
              </div>
              <Switch
                checked={settings.enableQueue}
                onCheckedChange={(checked) => setSettings({...settings, enableQueue: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Digital Forms</Label>
                <p className="text-sm text-muted-foreground">Paperless patient forms</p>
              </div>
              <Switch
                checked={settings.enableDigitalForms}
                onCheckedChange={(checked) => setSettings({...settings, enableDigitalForms: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Notifications</Label>
                <p className="text-sm text-muted-foreground">System notifications</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => setSettings({...settings, enableNotifications: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send notifications via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">Automatic appointment reminders</p>
              </div>
              <Switch
                checked={settings.appointmentReminders}
                onCheckedChange={(checked) => setSettings({...settings, appointmentReminders: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Require Staff PIN</Label>
                <p className="text-sm text-muted-foreground">Staff must enter PIN for access</p>
              </div>
              <Switch
                checked={settings.requireStaffPin}
                onCheckedChange={(checked) => setSettings({...settings, requireStaffPin: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Auto Logout</Label>
                <p className="text-sm text-muted-foreground">Automatic session timeout</p>
              </div>
              <Switch
                checked={settings.autoLogout}
                onCheckedChange={(checked) => setSettings({...settings, autoLogout: checked})}
              />
            </div>
          </div>
          {settings.autoLogout && (
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value) || 30})}
                className="w-32"
                min="5"
                max="120"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}