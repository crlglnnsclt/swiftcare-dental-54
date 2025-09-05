import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, CheckCircle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Clinic {
  id: string;
  clinic_name: string;
  address?: string;
}

interface Dentist {
  id: string;
  full_name: string;
}

interface Treatment {
  id: string;
  name: string;
  default_duration_minutes: number;
  default_price: number;
}

export function AppointmentBookingForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  
  const [formData, setFormData] = useState({
    treatment_type: '',
    dentist_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    // Fetch dentists and treatments for single clinic
    fetchDentists();
    fetchTreatments();
  }, []);

  const fetchClinics = async () => {
    // For single clinic mode, we don't need to fetch clinics
    // The clinic is hardcoded as SwiftCare Dental Clinic
  };

  const fetchDentists = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'dentist')
        .order('full_name');
      
      if (error) throw error;
      setDentists(data || []);
    } catch (error) {
      console.error('Error fetching dentists:', error);
    }
  };

  const fetchTreatments = async () => {
    // Use predefined treatments since treatments table may not exist
    setTreatments([
      { id: 'checkup', name: 'Routine Checkup', default_duration_minutes: 30, default_price: 150 },
      { id: 'cleaning', name: 'Dental Cleaning', default_duration_minutes: 45, default_price: 120 },
      { id: 'filling', name: 'Tooth Filling', default_duration_minutes: 60, default_price: 200 },
      { id: 'extraction', name: 'Tooth Extraction', default_duration_minutes: 30, default_price: 300 },
      { id: 'emergency', name: 'Emergency Care', default_duration_minutes: 30, default_price: 250 },
    ]);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getAvailableTimeSlots = () => {
    // In a real app, this would check dentist availability
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];
  };

  const handleSubmit = async () => {
    if (!formData.appointment_date || !formData.appointment_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get patient record directly from patients table using user profile
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', profile?.id)
        .single();

      if (patientError || !patientData) {
        throw new Error('Patient record not found. Please contact the clinic.');
      }

      const scheduledTime = `${formData.appointment_date}T${formData.appointment_time}:00`;
      
      const { data: appointmentData, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientData.id,
          dentist_id: formData.dentist_id || null,
          scheduled_time: scheduledTime,
          duration_minutes: 30, // Default duration
          status: 'booked',
          booking_type: 'online',
          notes: formData.notes
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your appointment has been booked successfully!",
      });

      // Navigate to confirmation with booking details
      navigate('/booking-confirmation', {
        state: {
          bookingId: appointmentData.id,
          appointmentDate: formData.appointment_date,
          appointmentTime: formData.appointment_time,
          clinic: 'SwiftCare Dental Clinic',
          dentist: dentists.find(d => d.id === formData.dentist_id)?.full_name
        }
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to book appointment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.treatment_type;
      case 2:
        return formData.appointment_date && formData.appointment_time;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[
            { num: 1, label: 'Service & Location' },
            { num: 2, label: 'Date & Time' },
            { num: 3, label: 'Confirm' }
          ].map((stepInfo, index) => (
            <div key={stepInfo.num} className="flex items-center">
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= stepInfo.num 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {stepInfo.num}
                </div>
                <span className="text-xs text-muted-foreground mt-1 hidden sm:block">{stepInfo.label}</span>
              </div>
              {index < 2 && (
                <div className={`w-8 h-0.5 mx-2 transition-all ${
                  step > stepInfo.num ? 'bg-primary' : 'bg-muted'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 1 && "Select Service & Location"}
            {step === 2 && "Choose Date & Time"}
            {step === 3 && "Confirm Appointment"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Service & Location */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">SwiftCare Dental Clinic</h3>
                <p className="text-sm text-muted-foreground">123 Healthcare Drive, Medical Center, CA 90210</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Treatment Type</Label>
                <Select value={formData.treatment_type} onValueChange={(value) => setFormData({...formData, treatment_type: value})}>
                  <SelectTrigger className="h-auto min-h-[50px]">
                    <SelectValue placeholder="Select treatment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatments.map((treatment) => (
                      <SelectItem key={treatment.id} value={treatment.id}>
                        <div className="flex justify-between items-center w-full">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{treatment.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {treatment.default_duration_minutes} mins
                            </span>
                          </div>
                          <span className="font-semibold text-primary ml-4">
                            ${treatment.default_price}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Preferred Dentist (Optional)</Label>
                <Select value={formData.dentist_id} onValueChange={(value) => setFormData({...formData, dentist_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any available dentist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Available Dentist</SelectItem>
                    {dentists.map((dentist) => (
                      <SelectItem key={dentist.id} value={dentist.id}>
                        Dr. {dentist.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Appointment Date</Label>
                <Input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                  min={getMinDate()}
                  className="text-base"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Appointment Time</Label>
                <Select value={formData.appointment_time} onValueChange={(value) => setFormData({...formData, appointment_time: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTimeSlots().map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Additional Notes (Optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any special requests or notes for your appointment"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-6 bg-muted/50 rounded-lg space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Appointment Summary
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Clinic</p>
                    <p className="font-medium">SwiftCare Dental Clinic</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Treatment</p>
                    <p className="font-medium">{treatments.find(t => t.id === formData.treatment_type)?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {new Date(formData.appointment_date).toLocaleDateString()} at {formData.appointment_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dentist</p>
                    <p className="font-medium">
                      {formData.dentist_id 
                        ? `Dr. ${dentists.find(d => d.id === formData.dentist_id)?.full_name}`
                        : 'Any Available'
                      }
                    </p>
                  </div>
                </div>
                
                {formData.notes && (
                  <div>
                    <p className="text-muted-foreground">Notes</p>
                    <p className="font-medium">{formData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            {step < 3 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1"
              >
                Continue
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}