import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Heart,
  AlertTriangle,
  Pill,
  Scissors,
  Save,
  Loader2,
  Edit,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PatientDetails {
  id?: string;
  patient_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  home_address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  occupation?: string;
  blood_type?: string;
  allergies?: string;
  existing_medical_conditions?: string;
  current_medications?: string;
  previous_surgeries?: string;
  dental_history?: string;
  dental_concerns?: string;
  last_dental_visit?: string;
  insurance_provider?: string;
  policy_number?: string;
  preferred_time?: string;
  communication_preference?: string;
}

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const timePreferences = ['Morning (9AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-7PM)', 'No preference'];
const communicationPreferences = ['Email', 'SMS', 'Phone call', 'In-person only'];

export default function PatientProfile() {
  const { user, profile } = useAuth();
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    patient_id: profile?.id || '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchPatientDetails();
    }
  }, [profile]);

  const fetchPatientDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', profile?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPatientDetails({
          patient_id: data.id,
          first_name: data.full_name?.split(' ')[0] || '',
          last_name: data.full_name?.split(' ').slice(1).join(' ') || '',
          email: data.email || '',
          phone: data.contact_number || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          home_address: data.address || '',
          emergency_contact_name: data.emergency_contact?.split('|')[0] || '',
          emergency_contact_phone: data.emergency_contact?.split('|')[1] || '',
          allergies: data.medical_history?.split('|')[0] || '',
          existing_medical_conditions: data.medical_history?.split('|')[1] || '',
          current_medications: data.medical_history?.split('|')[2] || '',
          previous_surgeries: data.medical_history?.split('|')[3] || '',
        });
      } else {
        // Pre-populate with profile data if available
        setPatientDetails({
          patient_id: profile?.id || '',
          first_name: profile?.full_name?.split(' ')[0] || '',
          last_name: profile?.full_name?.split(' ').slice(1).join(' ') || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
        });
        setIsEditing(true); // Start in edit mode for new profiles
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const savePatientDetails = async () => {
    if (!patientDetails.first_name || !patientDetails.last_name) {
      toast.error('First name and last name are required');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...patientDetails,
        patient_id: profile?.id,
        age: patientDetails.date_of_birth ? 
          Math.floor((new Date().getTime() - new Date(patientDetails.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
          null
      };

      const { error } = await supabase
        .from('patients')
        .upsert({
          id: patientDetails.patient_id,
          full_name: `${patientDetails.first_name} ${patientDetails.last_name}`.trim(),
          email: patientDetails.email || null,
          contact_number: patientDetails.phone || null,
          date_of_birth: patientDetails.date_of_birth || null,
          gender: patientDetails.gender || null,
          address: patientDetails.home_address || null,
          emergency_contact: `${patientDetails.emergency_contact_name || ''}|${patientDetails.emergency_contact_phone || ''}`,
          medical_history: `${patientDetails.allergies || ''}|${patientDetails.existing_medical_conditions || ''}|${patientDetails.current_medications || ''}|${patientDetails.previous_surgeries || ''}`,
          clinic_id: profile?.clinic_id || '',
          user_id: user?.id
        }, { onConflict: 'id' });

      if (error) throw error;

      // Update the users table with basic info
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: `${patientDetails.first_name} ${patientDetails.last_name}`.trim(),
          phone: patientDetails.phone || null
        })
        .eq('user_id', user?.id);

      if (userError) throw userError;

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchPatientDetails();
    } catch (error) {
      console.error('Error saving patient details:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PatientDetails, value: string) => {
    setPatientDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Mobile-Optimized Glassmorphism Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-5 w-48 h-48 sm:w-96 sm:h-96 sm:top-20 sm:left-20 bg-primary/10 rounded-full blur-3xl opacity-60 animate-float"></div>
        <div className="absolute bottom-10 right-5 w-40 h-40 sm:w-80 sm:h-80 sm:bottom-20 sm:right-20 bg-secondary/10 rounded-full blur-3xl opacity-40 animate-float-gentle"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-[600px] sm:h-[400px] bg-accent/5 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 relative z-10 animate-fade-in max-w-sm sm:max-w-4xl">
        {/* Mobile-First Header with Glass Card */}
        <div className="glass-card-3d p-4 sm:p-8 rounded-2xl backdrop-blur-xl bg-background/20 border border-white/20 shadow-elegant hover-scale">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
                My Profile
              </h1>
              <p className="text-muted-foreground/80 text-sm sm:text-lg">Manage your personal and medical information</p>
            </div>
            
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    className="glass-button-3d bg-background/40 backdrop-blur-sm border-white/30 hover:bg-background/60 transition-all duration-300 flex-1 sm:flex-none"
                    onClick={() => {
                      setIsEditing(false);
                      fetchPatientDetails();
                    }}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                  <Button 
                    onClick={savePatientDetails}
                    disabled={saving}
                    className="glass-button-3d bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Save Changes</span>
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="glass-button-3d bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                >
                  <Edit className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-4 sm:space-y-8">
          <TabsList className="glass-card-3d grid w-full grid-cols-2 sm:grid-cols-4 bg-background/30 backdrop-blur-xl border border-white/20 p-1 sm:p-2 rounded-xl h-12 sm:h-14">
            <TabsTrigger 
              value="personal" 
              className="glass-tab-3d data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 text-xs sm:text-sm px-1 sm:px-3"
            >
              <span className="sm:hidden">Personal</span>
              <span className="hidden sm:inline">Personal Info</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contact"
              className="glass-tab-3d data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 text-xs sm:text-sm px-1 sm:px-3"
            >
              <span className="sm:hidden">Contact</span>
              <span className="hidden sm:inline">Contact & Emergency</span>
            </TabsTrigger>
            <TabsTrigger 
              value="medical"
              className="glass-tab-3d data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 text-xs sm:text-sm px-1 sm:px-3"
            >
              <span className="sm:hidden">Medical</span>
              <span className="hidden sm:inline">Medical History</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dental"
              className="glass-tab-3d data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 text-xs sm:text-sm px-1 sm:px-3"
            >
              <span className="sm:hidden">Dental</span>
              <span className="hidden sm:inline">Dental History</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-4 sm:space-y-8 animate-fade-in">
            <Card className="glass-card-3d backdrop-blur-xl bg-background/20 border border-white/20 shadow-elegant rounded-2xl overflow-hidden hover-scale transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-float-gentle" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium text-foreground/80">First Name *</Label>
                    <Input
                      id="first_name"
                      value={patientDetails.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={!isEditing}
                      required
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle_name" className="text-sm font-medium text-foreground/80">Middle Name</Label>
                    <Input
                      id="middle_name"
                      value={patientDetails.middle_name || ''}
                      onChange={(e) => handleInputChange('middle_name', e.target.value)}
                      disabled={!isEditing}
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium text-foreground/80">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={patientDetails.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={!isEditing}
                      required
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-sm font-medium text-foreground/80">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={patientDetails.date_of_birth || ''}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      disabled={!isEditing}
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-foreground/80">Gender</Label>
                    <Select 
                      value={patientDetails.gender || ''} 
                      onValueChange={(value) => handleInputChange('gender', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="glass-card-3d bg-background/90 backdrop-blur-xl border-white/20">
                        {genderOptions.map(option => (
                          <SelectItem key={option} value={option} className="hover:bg-primary/10">{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blood_type" className="text-sm font-medium text-foreground/80">Blood Type</Label>
                    <Select 
                      value={patientDetails.blood_type || ''} 
                      onValueChange={(value) => handleInputChange('blood_type', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent className="glass-card-3d bg-background/90 backdrop-blur-xl border-white/20">
                        {bloodTypes.map(type => (
                          <SelectItem key={type} value={type} className="hover:bg-primary/10">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation" className="text-sm font-medium text-foreground/80">Occupation</Label>
                  <Input
                    id="occupation"
                    value={patientDetails.occupation || ''}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    disabled={!isEditing}
                    className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact & Emergency */}
          <TabsContent value="contact" className="space-y-4 sm:space-y-8 animate-fade-in">
            <Card className="glass-card-3d backdrop-blur-xl bg-background/20 border border-white/20 shadow-elegant rounded-2xl overflow-hidden hover-scale transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-float-gentle" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientDetails.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground/80">Phone Number</Label>
                    <Input
                      id="phone"
                      value={patientDetails.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="home_address" className="text-sm font-medium text-foreground/80">Home Address</Label>
                  <Textarea
                    id="home_address"
                    value={patientDetails.home_address || ''}
                    onChange={(e) => handleInputChange('home_address', e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                    className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name" className="text-sm font-medium text-foreground/80">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={patientDetails.emergency_contact_name || ''}
                      onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                      disabled={!isEditing}
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone" className="text-sm font-medium text-foreground/80">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={patientDetails.emergency_contact_phone || ''}
                      onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                      disabled={!isEditing}
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_time" className="text-sm font-medium text-foreground/80">Preferred Appointment Time</Label>
                    <Select 
                      value={patientDetails.preferred_time || ''} 
                      onValueChange={(value) => handleInputChange('preferred_time', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300">
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                      <SelectContent className="glass-card-3d bg-background/90 backdrop-blur-xl border-white/20">
                        {timePreferences.map(pref => (
                          <SelectItem key={pref} value={pref} className="hover:bg-primary/10">{pref}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="communication_preference" className="text-sm font-medium text-foreground/80">Communication Preference</Label>
                    <Select 
                      value={patientDetails.communication_preference || ''} 
                      onValueChange={(value) => handleInputChange('communication_preference', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300">
                        <SelectValue placeholder="Select communication method" />
                      </SelectTrigger>
                      <SelectContent className="glass-card-3d bg-background/90 backdrop-blur-xl border-white/20">
                        {communicationPreferences.map(pref => (
                          <SelectItem key={pref} value={pref} className="hover:bg-primary/10">{pref}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card className="glass-card-3d backdrop-blur-xl bg-background/20 border border-white/20 shadow-elegant rounded-2xl overflow-hidden hover-scale transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-float-gentle" />
                  </div>
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="insurance_provider" className="text-sm font-medium text-foreground/80">Insurance Provider</Label>
                    <Input
                      id="insurance_provider"
                      value={patientDetails.insurance_provider || ''}
                      onChange={(e) => handleInputChange('insurance_provider', e.target.value)}
                      disabled={!isEditing}
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policy_number" className="text-sm font-medium text-foreground/80">Policy Number</Label>
                    <Input
                      id="policy_number"
                      value={patientDetails.policy_number || ''}
                      onChange={(e) => handleInputChange('policy_number', e.target.value)}
                      disabled={!isEditing}
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical History */}
          <TabsContent value="medical" className="space-y-4 sm:space-y-8 animate-fade-in">
            <Card className="glass-card-3d backdrop-blur-xl bg-background/20 border border-white/20 shadow-elegant rounded-2xl overflow-hidden hover-scale transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-float-gentle" />
                  </div>
                  Medical History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-8">
                <div className="space-y-2">
                  <Label htmlFor="allergies" className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <AlertTriangle className="w-4 h-4" />
                    Allergies
                  </Label>
                  <Textarea
                    id="allergies"
                    value={patientDetails.allergies || ''}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    disabled={!isEditing}
                    placeholder="List any known allergies (medications, foods, etc.)"
                    rows={2}
                    className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existing_medical_conditions" className="text-sm font-medium text-foreground/80">Existing Medical Conditions</Label>
                  <Textarea
                    id="existing_medical_conditions"
                    value={patientDetails.existing_medical_conditions || ''}
                    onChange={(e) => handleInputChange('existing_medical_conditions', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Diabetes, hypertension, heart conditions, etc."
                    rows={3}
                    className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_medications" className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <Pill className="w-4 h-4" />
                    Current Medications
                  </Label>
                  <Textarea
                    id="current_medications"
                    value={patientDetails.current_medications || ''}
                    onChange={(e) => handleInputChange('current_medications', e.target.value)}
                    disabled={!isEditing}
                    placeholder="List all medications you are currently taking"
                    rows={3}
                    className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous_surgeries" className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <Scissors className="w-4 h-4" />
                    Previous Surgeries
                  </Label>
                  <Textarea
                    id="previous_surgeries"
                    value={patientDetails.previous_surgeries || ''}
                    onChange={(e) => handleInputChange('previous_surgeries', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Include dates and types of surgeries"
                    rows={3}
                    className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dental History */}
          <TabsContent value="dental" className="space-y-4 sm:space-y-8 animate-fade-in">
            <Card className="glass-card-3d backdrop-blur-xl bg-background/20 border border-white/20 shadow-elegant rounded-2xl overflow-hidden hover-scale transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-float-gentle" />
                  </div>
                  Dental History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-8">
                <div className="space-y-2">
                  <Label htmlFor="last_dental_visit" className="text-sm font-medium text-foreground/80">Last Dental Visit</Label>
                  <Input
                    id="last_dental_visit"
                    type="date"
                    value={patientDetails.last_dental_visit || ''}
                    onChange={(e) => handleInputChange('last_dental_visit', e.target.value)}
                    disabled={!isEditing}
                    className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dental_history" className="text-sm font-medium text-foreground/80">Previous Dental Treatments</Label>
                  <Textarea
                    id="dental_history"
                    value={patientDetails.dental_history || ''}
                    onChange={(e) => handleInputChange('dental_history', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Fillings, crowns, extractions, orthodontics, etc."
                    rows={4}
                    className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dental_concerns" className="text-sm font-medium text-foreground/80">Current Dental Concerns</Label>
                  <Textarea
                    id="dental_concerns"
                    value={patientDetails.dental_concerns || ''}
                    onChange={(e) => handleInputChange('dental_concerns', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Pain, sensitivity, cosmetic concerns, etc."
                    rows={3}
                    className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}