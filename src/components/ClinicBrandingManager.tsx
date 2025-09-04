import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Palette, Eye, Save, RotateCcw, Download, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClinicBrandingManager() {
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
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

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    
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
    toast({
      title: "Logo Upload",
      description: "Logo upload functionality would be implemented here.",
    });
  };

  const handleSaveChanges = () => {
    toast({
      title: "Branding Saved",
      description: "Your clinic branding has been updated successfully.",
    });
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
    const previewMessage = message
      .replace(/\[First Name\]/g, "Maria")
      .replace(/\[Last Initial\]/g, "S")
      .replace(/\[Room #\]/g, "3")
      .replace(/\[Staff Name\]/g, "Dr. Rodriguez")
      .replace(/\[Clinic Name\]/g, brandingData.clinicName);

    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
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
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(`. ${previewMessage}`);
          
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clinic Branding Management</h2>
          <p className="text-muted-foreground">Customize clinic branding and appearance for all branches</p>
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
          <Button onClick={handleSaveChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Configure basic clinic details</CardDescription>
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
                  <CardDescription>Choose colors for your clinic brand</CardDescription>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Customization</CardTitle>
                  <CardDescription>Customize messages and button labels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">Welcome Message</Label>
                    <Textarea
                      id="welcomeMessage"
                      value={brandingData.welcomeMessage}
                      onChange={(e) => setBrandingData({ ...brandingData, welcomeMessage: e.target.value })}
                      placeholder="Enter your clinic welcome message"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Book Appointment Button</Label>
                      <Input
                        value={brandingData.buttonLabels.bookAppointment}
                        onChange={(e) => handleButtonLabelChange('bookAppointment', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check In Button</Label>
                      <Input
                        value={brandingData.buttonLabels.checkIn}
                        onChange={(e) => handleButtonLabelChange('checkIn', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>View Records Button</Label>
                      <Input
                        value={brandingData.buttonLabels.viewRecords}
                        onChange={(e) => handleButtonLabelChange('viewRecords', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pay Bill Button</Label>
                      <Input
                        value={brandingData.buttonLabels.payBill}
                        onChange={(e) => handleButtonLabelChange('payBill', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Voice Announcements</CardTitle>
                  <CardDescription>Configure automated voice messages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voiceSelect">Voice Selection</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={brandingData.voiceAnnouncements.selectedVoice}
                      onChange={(e) => handleVoiceAnnouncementChange('selectedVoice', '', e.target.value)}
                    >
                      <option value="default">Default System Voice</option>
                      {availableVoices.map((voice, index) => (
                        <option key={index} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Patient Callout Message</Label>
                    <div className="flex gap-2">
                      <Textarea
                        value={brandingData.voiceAnnouncements.patientCallout}
                        onChange={(e) => handleVoiceAnnouncementChange('patientCallout', '', e.target.value)}
                        placeholder="Enter patient callout message"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVoicePreview(brandingData.voiceAnnouncements.patientCallout)}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Use [First Name], [Last Initial], [Room #]</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg p-6 space-y-4"
                style={{ 
                  backgroundColor: `${brandingData.primaryColor}10`,
                  borderColor: brandingData.primaryColor + '40'
                }}
              >
                <div className="text-center">
                  <h3 
                    className="text-lg font-bold mb-2"
                    style={{ color: brandingData.primaryColor }}
                  >
                    {brandingData.clinicName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {brandingData.welcomeMessage}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    style={{ backgroundColor: brandingData.primaryColor }}
                  >
                    {brandingData.buttonLabels.bookAppointment}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    style={{ 
                      borderColor: brandingData.secondaryColor,
                      color: brandingData.secondaryColor
                    }}
                  >
                    {brandingData.buttonLabels.checkIn}
                  </Button>
                </div>
                
                <div className="text-center">
                  <Badge 
                    variant="secondary"
                    style={{ backgroundColor: `${brandingData.accentColor}20`, color: brandingData.accentColor }}
                  >
                    Live Preview
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}