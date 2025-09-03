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
        .from('patient_details')
        .select('*')
        .eq('patient_id', profile?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPatientDetails(data);
      } else {
        // Pre-populate with profile data if available
        setPatientDetails(prev => ({
          ...prev,
          email: profile?.email || '',
          phone: profile?.phone || '',
          first_name: profile?.full_name?.split(' ')[0] || '',
          last_name: profile?.full_name?.split(' ').slice(1).join(' ') || '',
        }));
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
        .from('patient_details')
        .upsert(dataToSave, { onConflict: 'patient_id' });

      if (error) throw error;

      // Update the profile table with basic info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: `${patientDetails.first_name} ${patientDetails.last_name}`.trim(),
          phone: patientDetails.phone || null
        })
        .eq('id', profile?.id);

      if (profileError) throw profileError;

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
    <div className="container mx-auto p-6 space-y-6 page-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal and medical information</p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                className="btn-3d"
                onClick={() => {
                  setIsEditing(false);
                  fetchPatientDetails();
                }}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={savePatientDetails}
                disabled={saving}
                className="medical-gradient text-white btn-3d"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="medical-gradient text-white btn-3d"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="contact">Contact & Emergency</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="dental">Dental History</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-6">
          <Card className="card-3d interactive-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 float-gentle" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={patientDetails.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    value={patientDetails.middle_name || ''}
                    onChange={(e) => handleInputChange('middle_name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={patientDetails.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={patientDetails.date_of_birth || ''}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={patientDetails.gender || ''} 
                    onValueChange={(value) => handleInputChange('gender', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="blood_type">Blood Type</Label>
                  <Select 
                    value={patientDetails.blood_type || ''} 
                    onValueChange={(value) => handleInputChange('blood_type', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={patientDetails.occupation || ''}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact & Emergency */}
        <TabsContent value="contact" className="space-y-6">
          <Card className="card-3d interactive-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 float-gentle" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={patientDetails.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={patientDetails.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="home_address">Home Address</Label>
                <Textarea
                  id="home_address"
                  value={patientDetails.home_address || ''}
                  onChange={(e) => handleInputChange('home_address', e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={patientDetails.emergency_contact_name || ''}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={patientDetails.emergency_contact_phone || ''}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferred_time">Preferred Appointment Time</Label>
                  <Select 
                    value={patientDetails.preferred_time || ''} 
                    onValueChange={(value) => handleInputChange('preferred_time', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timePreferences.map(pref => (
                        <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="communication_preference">Communication Preference</Label>
                  <Select 
                    value={patientDetails.communication_preference || ''} 
                    onValueChange={(value) => handleInputChange('communication_preference', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select communication method" />
                    </SelectTrigger>
                    <SelectContent>
                      {communicationPreferences.map(pref => (
                        <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insurance_provider">Insurance Provider</Label>
                  <Input
                    id="insurance_provider"
                    value={patientDetails.insurance_provider || ''}
                    onChange={(e) => handleInputChange('insurance_provider', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="policy_number">Policy Number</Label>
                  <Input
                    id="policy_number"
                    value={patientDetails.policy_number || ''}
                    onChange={(e) => handleInputChange('policy_number', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History */}
        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="allergies" className="flex items-center gap-2">
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
                />
              </div>

              <div>
                <Label htmlFor="existing_medical_conditions">Existing Medical Conditions</Label>
                <Textarea
                  id="existing_medical_conditions"
                  value={patientDetails.existing_medical_conditions || ''}
                  onChange={(e) => handleInputChange('existing_medical_conditions', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Diabetes, hypertension, heart conditions, etc."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="current_medications" className="flex items-center gap-2">
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
                />
              </div>

              <div>
                <Label htmlFor="previous_surgeries" className="flex items-center gap-2">
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
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dental History */}
        <TabsContent value="dental" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Dental History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="last_dental_visit">Last Dental Visit</Label>
                <Input
                  id="last_dental_visit"
                  type="date"
                  value={patientDetails.last_dental_visit || ''}
                  onChange={(e) => handleInputChange('last_dental_visit', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="dental_history">Previous Dental Treatments</Label>
                <Textarea
                  id="dental_history"
                  value={patientDetails.dental_history || ''}
                  onChange={(e) => handleInputChange('dental_history', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Fillings, crowns, extractions, orthodontics, etc."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="dental_concerns">Current Dental Concerns</Label>
                <Textarea
                  id="dental_concerns"
                  value={patientDetails.dental_concerns || ''}
                  onChange={(e) => handleInputChange('dental_concerns', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Pain, sensitivity, cosmetic concerns, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}