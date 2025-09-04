import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { 
  Settings, 
  Calendar, 
  Clock, 
  Bell, 
  Users, 
  AlertTriangle,
  Tv,
  QrCode,
  Save,
  RotateCcw,
  Volume2
} from 'lucide-react';

interface AppointmentSettings {
  // Appointment Configuration
  slot_duration_minutes: number;
  max_appointments_per_dentist: number;
  allow_overbooking: boolean;
  overbooking_percentage: number;
  advance_booking_days: number;
  
  // Queue Management
  enable_walk_ins: boolean;
  walk_in_buffer_time: number;
  emergency_priority_enabled: boolean;
  auto_no_show_minutes: number;
  enable_auto_no_show_cancel: boolean;
  
  // Reminders
  enable_reminders: boolean;
  reminder_24h_enabled: boolean;
  reminder_1h_enabled: boolean;
  reminder_channels: string[];
  custom_reminder_text: string;
  
  // Queue Monitor
  monitor_announcement_voice: string;
  monitor_auto_announcements: boolean;
  monitor_logo_url: string;
  monitor_welcome_message: string;
  monitor_ticker_text: string;
  monitor_theme_color: string;
  
  // QR Code Settings
  qr_check_in_enabled: boolean;
  qr_expiry_hours: number;
  qr_staff_scanning_enabled: boolean;
}

const defaultSettings: AppointmentSettings = {
  slot_duration_minutes: 30,
  max_appointments_per_dentist: 8,
  allow_overbooking: false,
  overbooking_percentage: 10,
  advance_booking_days: 90,
  
  enable_walk_ins: true,
  walk_in_buffer_time: 15,
  emergency_priority_enabled: true,
  auto_no_show_minutes: 15,
  enable_auto_no_show_cancel: true,
  
  enable_reminders: true,
  reminder_24h_enabled: true,
  reminder_1h_enabled: true,
  reminder_channels: ['email', 'sms'],
  custom_reminder_text: 'Your dental appointment is scheduled for {date} at {time}. Please arrive 15 minutes early.',
  
  monitor_announcement_voice: 'alloy',
  monitor_auto_announcements: true,
  monitor_logo_url: '',
  monitor_welcome_message: 'Welcome to our dental clinic',
  monitor_ticker_text: 'Please maintain social distancing • Masks required • Hand sanitizer available',
  monitor_theme_color: '#2563eb',
  
  qr_check_in_enabled: true,
  qr_expiry_hours: 24,
  qr_staff_scanning_enabled: true
};

export default function AppointmentSettings() {
  const [settings, setSettings] = useState<AppointmentSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_feature_toggles')
        .select('*')
        .eq('feature_name', 'appointment_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.description) {
        try {
          const savedSettings = JSON.parse(data.description);
          setSettings({ ...defaultSettings, ...savedSettings });
        } catch (parseError) {
          console.error('Error parsing settings:', parseError);
          setSettings(defaultSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clinic_feature_toggles')
        .upsert({
          feature_name: 'appointment_settings',
          clinic_id: profile?.clinic_id,
          is_enabled: true,
          description: JSON.stringify(settings),
          modified_by: profile?.id
        });

      if (error) throw error;

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast.info('Settings reset to defaults');
  };

  const updateSetting = (key: keyof AppointmentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'echo', label: 'Echo (Male)' },
    { value: 'fable', label: 'Fable (British)' },
    { value: 'onyx', label: 'Onyx (Deep Male)' },
    { value: 'nova', label: 'Nova (Young Female)' },
    { value: 'shimmer', label: 'Shimmer (Soft Female)' }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments & Queueing Settings</h1>
          <p className="text-muted-foreground">Configure appointment scheduling, queue management, and automation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Tv className="w-4 h-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            QR Codes
          </TabsTrigger>
        </TabsList>

        {/* Appointment Settings */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Appointment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="slot_duration">Default Slot Duration (minutes)</Label>
                  <Input
                    id="slot_duration"
                    type="number"
                    value={settings.slot_duration_minutes}
                    onChange={(e) => updateSetting('slot_duration_minutes', parseInt(e.target.value))}
                    min="15"
                    max="120"
                    step="15"
                  />
                </div>

                <div>
                  <Label htmlFor="max_appointments">Max Appointments per Dentist (daily)</Label>
                  <Input
                    id="max_appointments"
                    type="number"
                    value={settings.max_appointments_per_dentist}
                    onChange={(e) => updateSetting('max_appointments_per_dentist', parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <Label htmlFor="advance_booking">Advance Booking Limit (days)</Label>
                  <Input
                    id="advance_booking"
                    type="number"
                    value={settings.advance_booking_days}
                    onChange={(e) => updateSetting('advance_booking_days', parseInt(e.target.value))}
                    min="7"
                    max="365"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Allow Overbooking</Label>
                    <p className="text-xs text-muted-foreground">Allow scheduling beyond normal capacity</p>
                  </div>
                  <Switch
                    checked={settings.allow_overbooking}
                    onCheckedChange={(checked) => updateSetting('allow_overbooking', checked)}
                  />
                </div>

                {settings.allow_overbooking && (
                  <div>
                    <Label htmlFor="overbooking_percentage">Overbooking Percentage</Label>
                    <Input
                      id="overbooking_percentage"
                      type="number"
                      value={settings.overbooking_percentage}
                      onChange={(e) => updateSetting('overbooking_percentage', parseInt(e.target.value))}
                      min="5"
                      max="50"
                      step="5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Allow {settings.overbooking_percentage}% more appointments than normal capacity
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue Management */}
        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Queue Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Walk-ins</Label>
                    <p className="text-xs text-muted-foreground">Allow patients to check-in without appointments</p>
                  </div>
                  <Switch
                    checked={settings.enable_walk_ins}
                    onCheckedChange={(checked) => updateSetting('enable_walk_ins', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Emergency Priority</Label>
                    <p className="text-xs text-muted-foreground">Automatically prioritize emergency cases</p>
                  </div>
                  <Switch
                    checked={settings.emergency_priority_enabled}
                    onCheckedChange={(checked) => updateSetting('emergency_priority_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto No-show Cancellation</Label>
                    <p className="text-xs text-muted-foreground">Automatically cancel appointments for no-shows</p>
                  </div>
                  <Switch
                    checked={settings.enable_auto_no_show_cancel}
                    onCheckedChange={(checked) => updateSetting('enable_auto_no_show_cancel', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="buffer_time">Walk-in Buffer Time (minutes)</Label>
                  <Input
                    id="buffer_time"
                    type="number"
                    value={settings.walk_in_buffer_time}
                    onChange={(e) => updateSetting('walk_in_buffer_time', parseInt(e.target.value))}
                    min="5"
                    max="60"
                    step="5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum time between walk-in registrations
                  </p>
                </div>

                <div>
                  <Label htmlFor="no_show_minutes">No-show Grace Period (minutes)</Label>
                  <Input
                    id="no_show_minutes"
                    type="number"
                    value={settings.auto_no_show_minutes}
                    onChange={(e) => updateSetting('auto_no_show_minutes', parseInt(e.target.value))}
                    min="5"
                    max="60"
                    step="5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Mark as no-show after this many minutes late
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reminder Settings */}
        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Automated Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Enable Reminders</Label>
                  <p className="text-xs text-muted-foreground">Send automated appointment reminders</p>
                </div>
                <Switch
                  checked={settings.enable_reminders}
                  onCheckedChange={(checked) => updateSetting('enable_reminders', checked)}
                />
              </div>

              {settings.enable_reminders && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">24-hour Reminder</Label>
                        <p className="text-xs text-muted-foreground">Send reminder 24 hours before appointment</p>
                      </div>
                      <Switch
                        checked={settings.reminder_24h_enabled}
                        onCheckedChange={(checked) => updateSetting('reminder_24h_enabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">1-hour Reminder</Label>
                        <p className="text-xs text-muted-foreground">Send reminder 1 hour before appointment</p>
                      </div>
                      <Switch
                        checked={settings.reminder_1h_enabled}
                        onCheckedChange={(checked) => updateSetting('reminder_1h_enabled', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="reminder_channels">Reminder Channels</Label>
                    <div className="flex gap-2 mt-2">
                      {['email', 'sms', 'push'].map((channel) => (
                        <Badge
                          key={channel}
                          variant={settings.reminder_channels.includes(channel) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const channels = settings.reminder_channels.includes(channel)
                              ? settings.reminder_channels.filter(c => c !== channel)
                              : [...settings.reminder_channels, channel];
                            updateSetting('reminder_channels', channels);
                          }}
                        >
                          {channel.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reminder_text">Custom Reminder Message</Label>
                    <Input
                      id="reminder_text"
                      value={settings.custom_reminder_text}
                      onChange={(e) => updateSetting('custom_reminder_text', e.target.value)}
                      placeholder="Your appointment is scheduled for {date} at {time}"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use {'{date}'} and {'{time}'} placeholders for dynamic content
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitor Settings */}
        <TabsContent value="monitor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-primary" />
                Queue Monitor Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto Announcements</Label>
                    <p className="text-xs text-muted-foreground">Automatically announce patient calls</p>
                  </div>
                  <Switch
                    checked={settings.monitor_auto_announcements}
                    onCheckedChange={(checked) => updateSetting('monitor_auto_announcements', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="announcement_voice">Announcement Voice</Label>
                  <Select
                    value={settings.monitor_announcement_voice}
                    onValueChange={(value) => updateSetting('monitor_announcement_voice', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map((voice) => (
                        <SelectItem key={voice.value} value={voice.value}>
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-3 h-3" />
                            {voice.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme_color">Theme Color</Label>
                  <Input
                    id="theme_color"
                    type="color"
                    value={settings.monitor_theme_color}
                    onChange={(e) => updateSetting('monitor_theme_color', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Input
                  id="welcome_message"
                  value={settings.monitor_welcome_message}
                  onChange={(e) => updateSetting('monitor_welcome_message', e.target.value)}
                  placeholder="Welcome to our dental clinic"
                />
              </div>

              <div>
                <Label htmlFor="ticker_text">Ticker Text</Label>
                <Input
                  id="ticker_text"
                  value={settings.monitor_ticker_text}
                  onChange={(e) => updateSetting('monitor_ticker_text', e.target.value)}
                  placeholder="Important announcements and information"
                />
              </div>

              <div>
                <Label htmlFor="logo_url">Custom Logo URL</Label>
                <Input
                  id="logo_url"
                  value={settings.monitor_logo_url}
                  onChange={(e) => updateSetting('monitor_logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Code Settings */}
        <TabsContent value="qr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                QR Code Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable QR Check-in</Label>
                    <p className="text-xs text-muted-foreground">Allow patients to check-in using QR codes</p>
                  </div>
                  <Switch
                    checked={settings.qr_check_in_enabled}
                    onCheckedChange={(checked) => updateSetting('qr_check_in_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Staff QR Scanning</Label>
                    <p className="text-xs text-muted-foreground">Enable staff time-in/time-out via QR scanning</p>
                  </div>
                  <Switch
                    checked={settings.qr_staff_scanning_enabled}
                    onCheckedChange={(checked) => updateSetting('qr_staff_scanning_enabled', checked)}
                  />
                </div>
              </div>

              {settings.qr_check_in_enabled && (
                <>
                  <Separator />

                  <div>
                    <Label htmlFor="qr_expiry">QR Code Expiry (hours)</Label>
                    <Input
                      id="qr_expiry"
                      type="number"
                      value={settings.qr_expiry_hours}
                      onChange={(e) => updateSetting('qr_expiry_hours', parseInt(e.target.value))}
                      min="1"
                      max="168"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      QR codes will expire after this many hours (1-168 hours)
                    </p>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Security Note</p>
                        <p className="text-xs text-muted-foreground">
                          QR codes automatically expire and regenerate for security. 
                          Daily codes are recommended for patient check-in systems.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}