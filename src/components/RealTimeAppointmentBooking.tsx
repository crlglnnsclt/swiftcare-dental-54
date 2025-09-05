import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  QrCode,
  Phone,
  AlertCircle,
  Bell,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Dentist {
  id: string;
  full_name: string;
  specialization?: string;
  available_days?: string[];
}

interface AppointmentSlot {
  time: string;
  available: boolean;
  dentist_id?: string;
}

interface BookingFormData {
  treatment_type: string;
  dentist_id: string;
  appointment_date: string;
  appointment_time: string;
  notes: string;
  is_emergency: boolean;
  contact_number: string;
}

export function RealTimeAppointmentBooking() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BookingFormData>({
    treatment_type: '',
    dentist_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
    is_emergency: false,
    contact_number: ''
  });

  const treatments = [
    { id: 'routine_checkup', name: 'Routine Checkup', duration: 30, price: 150, emergency: false },
    { id: 'dental_cleaning', name: 'Dental Cleaning', duration: 45, price: 120, emergency: false },
    { id: 'tooth_filling', name: 'Tooth Filling', duration: 60, price: 200, emergency: false },
    { id: 'tooth_extraction', name: 'Tooth Extraction', duration: 30, price: 300, emergency: false },
    { id: 'emergency_care', name: 'Emergency Care', duration: 30, price: 250, emergency: true },
    { id: 'root_canal', name: 'Root Canal Treatment', duration: 90, price: 800, emergency: false },
    { id: 'teeth_whitening', name: 'Teeth Whitening', duration: 60, price: 400, emergency: false },
  ];

  // Real-time subscription for appointments
  useEffect(() => {
    const channel = supabase
      .channel('appointment-booking')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('New appointment created:', payload);
          // Refresh available slots when new appointment is booked
          if (formData.appointment_date) {
            fetchAvailableSlots(formData.appointment_date);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Appointment updated:', payload);
          // Refresh slots if status changes affect availability
          if (formData.appointment_date) {
            fetchAvailableSlots(formData.appointment_date);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formData.appointment_date]);

  useEffect(() => {
    fetchDentists();
  }, []);

  useEffect(() => {
    if (formData.appointment_date) {
      fetchAvailableSlots(formData.appointment_date);
    }
  }, [formData.appointment_date, formData.dentist_id]);

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
      toast({
        title: "Error",
        description: "Failed to load dentists",
        variant: "destructive"
      });
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    try {
      // Get existing appointments for the selected date
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('scheduled_time, dentist_id, duration_minutes')
        .gte('scheduled_time', `${date}T00:00:00`)
        .lt('scheduled_time', `${date}T23:59:59`)
        .neq('status', 'cancelled');

      if (error) throw error;

      // Generate time slots (9 AM to 5 PM, 30-minute intervals)
      const slots: AppointmentSlot[] = [];
      const startHour = 9;
      const endHour = 17;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotDateTime = new Date(`${date}T${timeString}`);
          
          // Check if this slot conflicts with existing appointments
          const isBooked = existingAppointments?.some(apt => {
            const aptTime = new Date(apt.scheduled_time);
            const aptEndTime = new Date(aptTime.getTime() + (apt.duration_minutes || 30) * 60000);
            const slotEndTime = new Date(slotDateTime.getTime() + 30 * 60000);
            
            // Check for overlap and dentist conflict
            const hasTimeOverlap = slotDateTime < aptEndTime && slotEndTime > aptTime;
            const hasDentistConflict = !formData.dentist_id || apt.dentist_id === formData.dentist_id;
            
            return hasTimeOverlap && hasDentistConflict;
          });

          slots.push({
            time: timeString,
            available: !isBooked,
            dentist_id: formData.dentist_id
          });
        }
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const generateQRCode = (appointmentId: string): string => {
    return JSON.stringify({
      type: 'appointment_checkin',
      appointment_id: appointmentId,
      patient_id: profile?.id,
      timestamp: new Date().toISOString()
    });
  };

  const sendConfirmationMessage = async (appointmentId: string) => {
    try {
      const treatment = treatments.find(t => t.id === formData.treatment_type);
      const dentist = dentists.find(d => d.id === formData.dentist_id);
      
      const message = `Appointment Confirmed!
      
📅 Date: ${new Date(formData.appointment_date).toLocaleDateString()}
⏰ Time: ${formData.appointment_time}
🦷 Treatment: ${treatment?.name}
👨‍⚕️ Dentist: Dr. ${dentist?.full_name || 'Available dentist'}
📍 SwiftCare Dental Clinic

Your QR code for check-in is ready. Show this at the clinic for quick check-in.

Appointment ID: ${appointmentId}`;

      // Log communication
      await supabase.from('communication_logs').insert({
        patient_id: profile?.id,
        appointment_id: appointmentId,
        subject: 'Appointment Confirmation',
        content: message,
        recipient_email: user?.email || '',
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      toast({
        title: "Confirmation Sent",
        description: "Appointment confirmation has been sent to your email",
      });
    } catch (error) {
      console.error('Error sending confirmation:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.appointment_date || !formData.appointment_time || !formData.treatment_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get patient record
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', profile?.id)
        .single();

      if (patientError || !patientData) {
        throw new Error('Patient record not found. Please contact the clinic.');
      }

      const scheduledTime = `${formData.appointment_date}T${formData.appointment_time}:00`;
      const treatment = treatments.find(t => t.id === formData.treatment_type);
      
      // Create appointment with QR code
      const qrCodeData = generateQRCode('temp-id');
      
      const { data: appointmentData, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientData.id,
          dentist_id: formData.dentist_id || null,
          scheduled_time: scheduledTime,
          duration_minutes: treatment?.duration || 30,
          status: 'booked',
          booking_type: formData.is_emergency ? 'emergency' : 'online',
          notes: formData.notes,
          qr_code: qrCodeData
        })
        .select()
        .single();

      if (error) throw error;

      // Update QR code with actual appointment ID
      const finalQrCode = generateQRCode(appointmentData.id);
      await supabase
        .from('appointments')
        .update({ qr_code: finalQrCode })
        .eq('id', appointmentData.id);

      setBookingId(appointmentData.id);
      setQrCode(finalQrCode);
      
      // Send confirmation
      await sendConfirmationMessage(appointmentData.id);
      
      // If emergency, add to priority queue
      if (formData.is_emergency) {
        await supabase.from('queue').insert({
          appointment_id: appointmentData.id,
          priority: 'emergency',
          status: 'waiting',
          position: 1
        });
      }

      toast({
        title: "Success",
        description: "Your appointment has been booked successfully!",
      });

      setStep(4); // Move to confirmation step
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

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.treatment_type;
      case 2:
        return formData.dentist_id || !formData.dentist_id; // Allow "any dentist"
      case 3:
        return formData.appointment_date && formData.appointment_time;
      default:
        return true;
    }
  };

  if (step === 4 && bookingId && qrCode) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-800">Appointment Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Appointment Details */}
            <div className="bg-white p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg">Appointment Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-medium">{new Date(formData.appointment_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Time</p>
                  <p className="font-medium">{formData.appointment_time}</p>
                </div>
                <div>
                  <p className="text-gray-600">Treatment</p>
                  <p className="font-medium">{treatments.find(t => t.id === formData.treatment_type)?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Dentist</p>
                  <p className="font-medium">
                    {formData.dentist_id 
                      ? `Dr. ${dentists.find(d => d.id === formData.dentist_id)?.full_name}`
                      : 'Any Available'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline">Booking ID: {bookingId}</Badge>
                {formData.is_emergency && <Badge className="bg-red-100 text-red-700">Emergency Priority</Badge>}
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-6 rounded-lg text-center">
              <h3 className="font-semibold text-lg mb-4">QR Code for Check-In</h3>
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <QRCodeSVG 
                  value={qrCode} 
                  size={200} 
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Show this QR code at the clinic for quick check-in
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/my-appointments')}
                className="flex-1"
              >
                View My Appointments
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setFormData({
                    treatment_type: '',
                    dentist_id: '',
                    appointment_date: '',
                    appointment_time: '',
                    notes: '',
                    is_emergency: false,
                    contact_number: ''
                  });
                  setQrCode(null);
                  setBookingId(null);
                }}
                className="flex-1"
              >
                Book Another
              </Button>
            </div>

            {/* Clinic Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Clinic Information</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>📍 SwiftCare Dental Clinic</p>
                <p>🕒 Operating Hours: 9:00 AM - 5:00 PM</p>
                <p>📞 Contact: (555) 123-4567</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[
            { num: 1, label: 'Treatment' },
            { num: 2, label: 'Dentist' },
            { num: 3, label: 'Schedule' },
            { num: 4, label: 'Confirm' }
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
              {index < 3 && (
                <div className={`w-8 h-0.5 mx-2 transition-all ${
                  step > stepInfo.num ? 'bg-primary' : 'bg-muted'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 1 && "Select Treatment Type"}
            {step === 2 && "Choose Your Dentist"}
            {step === 3 && "Schedule Your Appointment"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Treatment Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Treatment Type *</Label>
                <div className="grid gap-3">
                  {treatments.map((treatment) => (
                    <Card 
                      key={treatment.id}
                      className={`cursor-pointer transition-all border-2 ${
                        formData.treatment_type === treatment.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setFormData({...formData, treatment_type: treatment.id})}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{treatment.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {treatment.duration} minutes
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">${treatment.price}</p>
                            {treatment.emergency && (
                              <Badge className="bg-red-100 text-red-700 text-xs">Emergency</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Emergency toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={formData.is_emergency}
                  onChange={(e) => setFormData({...formData, is_emergency: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="emergency" className="text-sm">
                  This is an emergency (priority booking)
                </Label>
              </div>
            </div>
          )}

          {/* Step 2: Dentist Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Preferred Dentist</Label>
                <Select value={formData.dentist_id} onValueChange={(value) => setFormData({...formData, dentist_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a dentist or any available" />
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

              <div>
                <Label className="text-sm font-medium mb-3 block">Contact Number *</Label>
                <Input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                  placeholder="Your contact number"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Date & Time Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Appointment Date *</Label>
                <Input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                  min={getMinDate()}
                  className="text-base"
                />
              </div>
              
              {formData.appointment_date && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">Available Time Slots</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={formData.appointment_time === slot.time ? "default" : "outline"}
                        className={`h-12 ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!slot.available}
                        onClick={() => slot.available && setFormData({...formData, appointment_time: slot.time})}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                  {availableSlots.filter(s => s.available).length === 0 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      No available slots for this date. Please try another date.
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label className="text-sm font-medium mb-3 block">Additional Notes (Optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any special requests or notes for your appointment"
                  rows={3}
                />
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
                disabled={loading || !canProceed()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Appointment'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}