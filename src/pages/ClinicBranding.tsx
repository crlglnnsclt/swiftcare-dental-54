import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Palette, Eye, Save, RotateCcw, Download, Volume2, RotateCcw as Reset } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

export default function ClinicBranding() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [previewMode, setPreviewMode] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brandingData, setBrandingData] = useState({
    clinicName: "SwiftCare Dental Center",
    logo: "",
    primaryColor: "#2563eb",
    secondaryColor: "#10b981",
    accentColor: "#8b5cf6",
    welcomeMessage: "Welcome to SwiftCare Dental - Your Smile is Our Priority",
    buttonLabels: {
      bookAppointment: "Book Appointment",
      checkIn: "Check In",
      viewRecords: "View Records",
      payBill: "Pay Bill"
    },
    template: "modern", // modern, classic, minimal, futuristic
    animations: true,
    fontStyle: "sans-serif",
    voiceAnnouncements: {
      selectedVoice: "default",
      patientCallout: "Now serving [First Name] [Last Initial], please proceed to Room [Room #].",
      familyCallout: "Now serving [First Name] [Last Initial] and family, please proceed to Room [Room #].",
      queueMessages: {
        queueOpen: "The queue is now open. Please check in using the QR code.",
        queueReminder: "Please ensure you have checked in. If you need assistance, please speak to reception.",
        queueEmpty: "No patients currently waiting. Walk-ins are welcome.",
        errorMessage: "System temporarily unavailable. Please speak to reception for assistance."
      },
      checkinMessages: {
        success: "Thank you [First Name], you have been successfully checked in.",
        duplicate: "You are already checked in. Please wait to be called.",
        invalid: "Invalid QR code or appointment not found. Please speak to reception.",
        staffTimeIn: "Welcome [Staff Name], you are now clocked in.",
        staffTimeOut: "Thank you [Staff Name], you are now clocked out.",
        staffDuplicate: "You are already clocked in.",
        staffExpired: "Your session has expired. Please scan the current QR code."
      }
    }
  });

  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Clean, contemporary design with smooth animations",
      preview: "🏥 Modern medical interface with soft curves and gradients"
    },
    {
      id: "classic",
      name: "Classic", 
      description: "Traditional professional design with conservative colors",
      preview: "🏛️ Professional medical styling with structured layouts"
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Simple, focused design with lots of white space", 
      preview: "⚪ Clean minimal interface with essential elements only"
    },
    {
      id: "futuristic",
      name: "Futuristic",
      description: "Advanced tech-style with 3D elements and glowing effects",
      preview: "🚀 High-tech interface with 3D animations and neon accents"
    }
  ];

  // Load branding data from database
  const loadBrandingData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinic_branding')
        .select('*')
        .single();
        
      if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
        throw error;
      }
      
      if (data) {
        setBrandingData({
          clinicName: data.welcome_message?.split(' - ')[0]?.replace('Welcome to ', '') || brandingData.clinicName,
          logo: data.logo_url || "",
          primaryColor: data.primary_color || brandingData.primaryColor,
          secondaryColor: data.secondary_color || brandingData.secondaryColor,
          accentColor: brandingData.accentColor, // Not stored in current schema
          welcomeMessage: data.welcome_message || brandingData.welcomeMessage,
          buttonLabels: (typeof data.custom_button_labels === 'object' && data.custom_button_labels !== null) 
            ? data.custom_button_labels as any || brandingData.buttonLabels
            : brandingData.buttonLabels,
          template: brandingData.template, // Not stored in current schema
          animations: brandingData.animations, // Not stored in current schema
          fontStyle: brandingData.fontStyle, // Not stored in current schema
          voiceAnnouncements: (typeof data.patient_portal_theme === 'object' && 
                             data.patient_portal_theme !== null &&
                             'voiceAnnouncements' in (data.patient_portal_theme as any))
            ? (data.patient_portal_theme as any).voiceAnnouncements || brandingData.voiceAnnouncements
            : brandingData.voiceAnnouncements
        });
      }
    } catch (error) {
      console.error('Error loading branding data:', error);
      toast({
        title: "Error",
        description: "Failed to load branding data. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadBrandingData();
  }, []);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    
    // Voices may load asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleColorChange = (colorType: string, value: string) => {
    setBrandingData({
      ...brandingData,
      [colorType]: value
    });
  };

  const handleButtonLabelChange = (buttonType: string, value: string) => {
    setBrandingData({
      ...brandingData,
      buttonLabels: {
        ...brandingData.buttonLabels,
        [buttonType]: value
      }
    });
  };

  const handleLogoUpload = () => {
    // In a real app, this would handle file upload
    toast({
      title: "Logo Upload",
      description: "Logo upload functionality would be implemented here.",
    });
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Prepare data for database
      const dbData = {
        primary_color: brandingData.primaryColor,
        secondary_color: brandingData.secondaryColor,
        welcome_message: brandingData.welcomeMessage,
        custom_button_labels: brandingData.buttonLabels,
        patient_portal_theme: {
          template: brandingData.template,
          animations: brandingData.animations,
          fontStyle: brandingData.fontStyle,
          voiceAnnouncements: brandingData.voiceAnnouncements,
          accentColor: brandingData.accentColor
        },
        logo_url: brandingData.logo,
        modified_by: profile?.id
      };

      // Try to update first, if no record exists, insert new one
      const { data: existingData } = await supabase
        .from('clinic_branding')
        .select('id')
        .single();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('clinic_branding')
          .update(dbData)
          .eq('id', existingData.id);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('clinic_branding')
          .insert(dbData);
          
        if (error) throw error;
      }

      toast({
        title: "Branding Saved",
        description: "Your clinic branding has been updated successfully.",
      });
      
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: "Error",
        description: "Failed to save branding changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setBrandingData({
      clinicName: "SwiftCare Dental Center",
      logo: "",
      primaryColor: "#2563eb",
      secondaryColor: "#10b981",
      accentColor: "#8b5cf6",
      welcomeMessage: "Welcome to SwiftCare Dental - Your Smile is Our Priority",
      buttonLabels: {
        bookAppointment: "Book Appointment",
        checkIn: "Check In",
        viewRecords: "View Records",
        payBill: "Pay Bill"
      },
      template: "modern",
      animations: true,
      fontStyle: "sans-serif",
      voiceAnnouncements: {
        selectedVoice: "default",
        patientCallout: "Now serving [First Name] [Last Initial], please proceed to Room [Room #].",
        familyCallout: "Now serving [First Name] [Last Initial] and family, please proceed to Room [Room #].",
        queueMessages: {
          queueOpen: "The queue is now open. Please check in using the QR code.",
          queueReminder: "Please ensure you have checked in. If you need assistance, please speak to reception.",
          queueEmpty: "No patients currently waiting. Walk-ins are welcome.",
          errorMessage: "System temporarily unavailable. Please speak to reception for assistance."
        },
        checkinMessages: {
          success: "Thank you [First Name], you have been successfully checked in.",
          duplicate: "You are already checked in. Please wait to be called.",
          invalid: "Invalid QR code or appointment not found. Please speak to reception.",
          staffTimeIn: "Welcome [Staff Name], you are now clocked in.",
          staffTimeOut: "Thank you [Staff Name], you are now clocked out.",
          staffDuplicate: "You are already clocked in.",
          staffExpired: "Your session has expired. Please scan the current QR code."
        }
      }
    });
    toast({
      title: "Reset Complete",
      description: "Branding has been reset to default values.",
    });
  };

  const handleExportBranding = () => {
    const dataStr = JSON.stringify(brandingData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'clinic-branding-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Export Complete",
      description: "Branding configuration exported successfully.",
    });
  };

  const handleVoicePreview = (message: string) => {
    // Replace variables with example data for preview
    const previewMessage = message
      .replace(/\[First Name\]/g, "Maria")
      .replace(/\[Last Initial\]/g, "S")
      .replace(/\[Room #\]/g, "3")
      .replace(/\[Staff Name\]/g, "Dr. Rodriguez")
      .replace(/\[Clinic Name\]/g, brandingData.clinicName);

    // Use Web Speech API for preview
    if ('speechSynthesis' in window) {
      // Stop any currently playing speech
      speechSynthesis.cancel();
      
      // Ensure voices are loaded
      const ensureVoicesLoaded = () => {
        return new Promise<void>((resolve) => {
          const voices = speechSynthesis.getVoices();
          if (voices.length > 0) {
            resolve();
          } else {
            speechSynthesis.onvoiceschanged = () => {
              resolve();
            };
          }
        });
      };

      ensureVoicesLoaded().then(() => {
        // Add a longer delay and prepend a small pause to prevent cutoff
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(`. ${previewMessage}`);
          
          // Find the selected voice or default to a female voice
          let selectedVoice = null;
          const voices = speechSynthesis.getVoices();
          
          if (brandingData.voiceAnnouncements.selectedVoice !== 'default') {
            selectedVoice = voices.find(voice => 
              voice.name === brandingData.voiceAnnouncements.selectedVoice
            );
          }
          
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => 
              voice.name.toLowerCase().includes('female') || 
              voice.name.toLowerCase().includes('samantha') ||
              voice.name.toLowerCase().includes('victoria') ||
              voice.name.toLowerCase().includes('zira') ||
              voice.name.toLowerCase().includes('karen') ||
              voice.name.toLowerCase().includes('susan')
            ) || voices[0];
          }
          
          utterance.voice = selectedVoice;
          utterance.rate = 0.75;
          utterance.pitch = 1;
          utterance.volume = 0.9;
          
          // Add event listeners for debugging
          utterance.onstart = () => console.log('Speech started');
          utterance.onend = () => console.log('Speech ended');
          utterance.onerror = (error) => console.error('Speech error:', error);
          
          speechSynthesis.speak(utterance);
        }, 1300);
      });
    }

    toast({
      title: "Voice Preview",
      description: `Playing: "${previewMessage}"`,
    });
  };

  const handleVoiceAnnouncementChange = (category: string, field: string, value: string) => {
    setBrandingData({
      ...brandingData,
      voiceAnnouncements: {
        ...brandingData.voiceAnnouncements,
        [category]: typeof brandingData.voiceAnnouncements[category] === 'object' 
          ? {
              ...brandingData.voiceAnnouncements[category],
              [field]: value
            }
          : value
      }
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clinic Customization</h1>
          <p className="text-muted-foreground">Customize your clinic's branding and appearance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Exit Preview" : "Preview"}
          </Button>
          <Button variant="outline" onClick={handleExportBranding}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline" onClick={handleResetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveChanges} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Configure your clinic's basic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic Name</Label>
                    <Input
                      id="clinicName"
                      value={brandingData.clinicName}
                      onChange={(e) => setBrandingData({ ...brandingData, clinicName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Clinic Logo</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload your clinic logo</p>
                      <Button variant="outline" onClick={handleLogoUpload}>
                        Choose File
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 2MB. Recommended: 200x80px</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontStyle">Font Style</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={brandingData.fontStyle}
                      onChange={(e) => setBrandingData({ ...brandingData, fontStyle: e.target.value })}
                    >
                      <option value="sans-serif">Sans Serif (Modern)</option>
                      <option value="serif">Serif (Traditional)</option>
                      <option value="monospace">Monospace (Technical)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Color Scheme</CardTitle>
                  <CardDescription>Choose up to 3 accent colors for your clinic</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="primaryColor"
                          value={brandingData.primaryColor}
                          onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={brandingData.primaryColor}
                          onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                          placeholder="#2563eb"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Main brand color for buttons and headers</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="secondaryColor"
                          value={brandingData.secondaryColor}
                          onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={brandingData.secondaryColor}
                          onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                          placeholder="#10b981"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Success states and confirmations</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="accentColor"
                          value={brandingData.accentColor}
                          onChange={(e) => handleColorChange('accentColor', e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={brandingData.accentColor}
                          onChange={(e) => handleColorChange('accentColor', e.target.value)}
                          placeholder="#8b5cf6"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Highlights and special elements</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Color Preview</h4>
                    <div className="flex space-x-2">
                      <div 
                        className="w-16 h-16 rounded-lg shadow-sm border"
                        style={{ backgroundColor: brandingData.primaryColor }}
                        title="Primary Color"
                      />
                      <div 
                        className="w-16 h-16 rounded-lg shadow-sm border"
                        style={{ backgroundColor: brandingData.secondaryColor }}
                        title="Secondary Color"
                      />
                      <div 
                        className="w-16 h-16 rounded-lg shadow-sm border"
                        style={{ backgroundColor: brandingData.accentColor }}
                        title="Accent Color"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Customization</CardTitle>
                  <CardDescription>Customize text content and button labels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">Welcome Message</Label>
                    <Textarea
                      id="welcomeMessage"
                      value={brandingData.welcomeMessage}
                      onChange={(e) => setBrandingData({ ...brandingData, welcomeMessage: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Button Labels</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bookButton">Book Appointment Button</Label>
                        <Input
                          id="bookButton"
                          value={brandingData.buttonLabels.bookAppointment}
                          onChange={(e) => handleButtonLabelChange('bookAppointment', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkinButton">Check-In Button</Label>
                        <Input
                          id="checkinButton"
                          value={brandingData.buttonLabels.checkIn}
                          onChange={(e) => handleButtonLabelChange('checkIn', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recordsButton">View Records Button</Label>
                        <Input
                          id="recordsButton"
                          value={brandingData.buttonLabels.viewRecords}
                          onChange={(e) => handleButtonLabelChange('viewRecords', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payButton">Pay Bill Button</Label>
                        <Input
                          id="payButton"
                          value={brandingData.buttonLabels.payBill}
                          onChange={(e) => handleButtonLabelChange('payBill', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Volume2 className="w-5 h-5" />
                    <span>Voice Announcements</span>
                  </CardTitle>
                  <CardDescription>Customize audio announcements for queue and check-in systems</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Voice Selection */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Voice Settings</h4>
                    <div className="space-y-2">
                      <Label htmlFor="voiceSelect">Select Voice</Label>
                      <div className="flex space-x-2">
                        <select 
                          id="voiceSelect"
                          className="flex-1 p-2 border rounded-md"
                          value={brandingData.voiceAnnouncements.selectedVoice}
                          onChange={(e) => handleVoiceAnnouncementChange('selectedVoice', '', e.target.value)}
                        >
                          <option value="default">Default (Auto-select Female)</option>
                          {availableVoices
                            .filter(voice => voice.lang.startsWith('en'))
                            .map((voice, index) => (
                              <option key={index} value={voice.name}>
                                {voice.name} ({voice.lang})
                              </option>
                            ))}
                        </select>
                        <Button 
                          variant="outline"
                          onClick={() => handleVoicePreview("This is a voice preview test.")}
                        >
                          <Volume2 className="w-4 h-4 mr-2" />
                          Test
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Choose the voice that will be used for all announcements
                      </p>
                    </div>
                  </div>

                  {/* Patient Callouts */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Patient Callouts</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="patientCallout">Individual Patient</Label>
                        <div className="flex space-x-2">
                          <Textarea
                            id="patientCallout"
                            value={brandingData.voiceAnnouncements.patientCallout}
                            onChange={(e) => handleVoiceAnnouncementChange('patientCallout', '', e.target.value)}
                            rows={2}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline"
                            onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.patientCallout)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Variables: [First Name], [Last Initial], [Room #]
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="familyCallout">Family/Group</Label>
                        <div className="flex space-x-2">
                          <Textarea
                            id="familyCallout"
                            value={brandingData.voiceAnnouncements.familyCallout}
                            onChange={(e) => handleVoiceAnnouncementChange('familyCallout', '', e.target.value)}
                            rows={2}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline"
                            onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.familyCallout)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Queue Messages */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Queue/System Messages</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Queue Open</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={brandingData.voiceAnnouncements.queueMessages.queueOpen}
                            onChange={(e) => handleVoiceAnnouncementChange('queueMessages', 'queueOpen', e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.queueMessages.queueOpen)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Queue Reminder</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={brandingData.voiceAnnouncements.queueMessages.queueReminder}
                            onChange={(e) => handleVoiceAnnouncementChange('queueMessages', 'queueReminder', e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.queueMessages.queueReminder)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Queue Empty</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={brandingData.voiceAnnouncements.queueMessages.queueEmpty}
                            onChange={(e) => handleVoiceAnnouncementChange('queueMessages', 'queueEmpty', e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.queueMessages.queueEmpty)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Error Message</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={brandingData.voiceAnnouncements.queueMessages.errorMessage}
                            onChange={(e) => handleVoiceAnnouncementChange('queueMessages', 'errorMessage', e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.queueMessages.errorMessage)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Check-in Messages */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Check-in & Attendance Messages</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Check-in Success</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={brandingData.voiceAnnouncements.checkinMessages.success}
                            onChange={(e) => handleVoiceAnnouncementChange('checkinMessages', 'success', e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.checkinMessages.success)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Invalid QR</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={brandingData.voiceAnnouncements.checkinMessages.invalid}
                            onChange={(e) => handleVoiceAnnouncementChange('checkinMessages', 'invalid', e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.checkinMessages.invalid)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Staff Time-In</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={brandingData.voiceAnnouncements.checkinMessages.staffTimeIn}
                            onChange={(e) => handleVoiceAnnouncementChange('checkinMessages', 'staffTimeIn', e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.checkinMessages.staffTimeIn)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Staff Time-Out</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={brandingData.voiceAnnouncements.checkinMessages.staffTimeOut}
                            onChange={(e) => handleVoiceAnnouncementChange('checkinMessages', 'staffTimeOut', e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.checkinMessages.staffTimeOut)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Available Variables */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h5 className="font-medium mb-2">Available Variables</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <Badge variant="outline">[First Name]</Badge>
                      <Badge variant="outline">[Last Initial]</Badge>
                      <Badge variant="outline">[Room #]</Badge>
                      <Badge variant="outline">[Staff Name]</Badge>
                      <Badge variant="outline">[Clinic Name]</Badge>
                    </div>
                  </div>

                  {/* Reset Voice Settings */}
                  <div className="flex justify-end">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setBrandingData({
                          ...brandingData,
                           voiceAnnouncements: {
                             selectedVoice: "default",
                             patientCallout: "Now serving [First Name] [Last Initial], please proceed to Room [Room #].",
                             familyCallout: "Now serving [First Name] [Last Initial] and family, please proceed to Room [Room #].",
                             queueMessages: {
                               queueOpen: "The queue is now open. Please check in using the QR code.",
                               queueReminder: "Please ensure you have checked in. If you need assistance, please speak to reception.",
                               queueEmpty: "No patients currently waiting. Walk-ins are welcome.",
                               errorMessage: "System temporarily unavailable. Please speak to reception for assistance."
                             },
                             checkinMessages: {
                               success: "Thank you [First Name], you have been successfully checked in.",
                               duplicate: "You are already checked in. Please wait to be called.",
                               invalid: "Invalid QR code or appointment not found. Please speak to reception.",
                               staffTimeIn: "Welcome [Staff Name], you are now clocked in.",
                               staffTimeOut: "Thank you [Staff Name], you are now clocked out.",
                               staffDuplicate: "You are already clocked in.",
                               staffExpired: "Your session has expired. Please scan the current QR code."
                             }
                           }
                        });
                        toast({
                          title: "Voice Settings Reset",
                          description: "All voice announcements have been reset to defaults.",
                        });
                      }}
                    >
                      <Reset className="w-4 h-4 mr-2" />
                      Reset Voice Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Design Templates</CardTitle>
                  <CardDescription>Choose a pre-built design template</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          brandingData.template === template.id
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground/50'
                        }`}
                        onClick={() => setBrandingData({ ...brandingData, template: template.id })}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          {brandingData.template === template.id && (
                            <Badge>Selected</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="text-xs bg-muted/50 p-2 rounded">{template.preview}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Live Preview</span>
              </CardTitle>
              <CardDescription>See how your changes look in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock Patient Portal Preview */}
                <div 
                  className="border rounded-lg p-4 space-y-3"
                  style={{ 
                    borderColor: brandingData.primaryColor + '40',
                    fontFamily: brandingData.fontStyle 
                  }}
                >
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-white font-bold mb-2"
                      style={{ backgroundColor: brandingData.primaryColor }}
                    >
                      {brandingData.clinicName.charAt(0)}
                    </div>
                    <h3 className="font-semibold text-sm">{brandingData.clinicName}</h3>
                  </div>
                  
                  <div className="text-xs text-center p-2 bg-muted/50 rounded">
                    {brandingData.welcomeMessage}
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      className="w-full p-2 rounded text-white text-xs font-medium"
                      style={{ backgroundColor: brandingData.primaryColor }}
                    >
                      {brandingData.buttonLabels.bookAppointment}
                    </button>
                    <button
                      className="w-full p-2 rounded text-white text-xs font-medium"
                      style={{ backgroundColor: brandingData.secondaryColor }}
                    >
                      {brandingData.buttonLabels.checkIn}
                    </button>
                    <button
                      className="w-full p-2 rounded border text-xs font-medium"
                      style={{ 
                        borderColor: brandingData.accentColor,
                        color: brandingData.accentColor
                      }}
                    >
                      {brandingData.buttonLabels.viewRecords}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Template:</strong> {templates.find(t => t.id === brandingData.template)?.name}</p>
                  <p><strong>Primary:</strong> {brandingData.primaryColor}</p>
                  <p><strong>Secondary:</strong> {brandingData.secondaryColor}</p>
                  <p><strong>Accent:</strong> {brandingData.accentColor}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}