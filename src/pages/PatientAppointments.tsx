import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  X, 
  MapPin, 
  Phone,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

interface Appointment {
  id: string;
  scheduled_time: string;
  status: 'booked' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  duration_minutes?: number;
  dentist_id?: string;
  queue_position?: number;
  dentist?: {
    full_name: string;
  };
}

interface Service {
  id: string;
  name: string;
  description?: string;
  default_duration_minutes: number;
  default_price: number;
}

interface Dentist {
  id: string;
  full_name: string;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export default function PatientAppointments() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDentist, setSelectedDentist] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  useEffect(() => {
    if (profile?.id) {
      fetchAppointments();
      fetchServices();
      fetchDentists();
    }
  }, [profile]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(full_name)
        `)
        .eq('patient_id', profile?.id)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      
      // For each appointment, fetch dentist info separately if dentist_id exists
      const appointmentsWithDentist = await Promise.all((data || []).map(async (appointment) => {
        let dentistInfo = null;
        if (appointment.dentist_id) {
          const { data: dentist } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', appointment.dentist_id)
            .maybeSingle();
          dentistInfo = dentist;
        }
        
        return {
          ...appointment,
          status: appointment.status as 'booked' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show',
          dentist: dentistInfo
        };
      }));
      
      setAppointments(appointmentsWithDentist);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

    const fetchDentists = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'dentist')
          .eq('status', 'active');

        if (error) throw error;
        setDentists(data || []);
      } catch (error) {
        console.error('Error fetching dentists:', error);
      }
    };

  const bookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedService || !profile?.id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setBookingLoading(true);
    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const selectedServiceData = services.find(s => s.id === selectedService);

      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: profile.id,
          scheduled_time: appointmentDateTime.toISOString(),
          dentist_id: selectedDentist || null,
          duration_minutes: selectedServiceData?.default_duration_minutes || 30,
          notes: appointmentNotes,
          clinic_id: profile.clinic_id,
          status: 'booked'
        });

      if (error) throw error;

      toast.success('Appointment booked successfully!');
      setIsBookingOpen(false);
      resetBookingForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          cancelled_by: profile?.id,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Cancelled by patient'
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const resetBookingForm = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    setSelectedService('');
    setSelectedDentist('');
    setAppointmentNotes('');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      booked: { color: 'bg-blue-100 text-blue-800', label: 'Booked' },
      checked_in: { color: 'bg-yellow-100 text-yellow-800', label: 'Checked In' },
      in_progress: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      no_show: { color: 'bg-gray-100 text-gray-800', label: 'No Show' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.booked;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
      case 'no-show':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const canCancelAppointment = (appointmentDate: string, status: string) => {
    const appointmentDateTime = new Date(appointmentDate);
    const now = new Date();
    const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return status === 'booked' && hoursDifference > 24;
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
          <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
          <p className="text-muted-foreground">Book, manage, and track your dental appointments</p>
        </div>
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogTrigger asChild>
            <Button className="medical-gradient text-white btn-3d">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Service Selection */}
              <div>
                <Label htmlFor="service">Service *</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex justify-between w-full">
                          <span>{service.name}</span>
                          <span className="text-muted-foreground ml-4">${service.default_price}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dentist Selection */}
              <div>
                <Label htmlFor="dentist">Preferred Dentist (Optional)</Label>
                <Select value={selectedDentist} onValueChange={setSelectedDentist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any available dentist" />
                  </SelectTrigger>
                  <SelectContent>
                    {dentists.map((dentist) => (
                      <SelectItem key={dentist.id} value={dentist.id}>
                        Dr. {dentist.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div>
                <Label>Appointment Date *</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, startOfDay(new Date())) || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>

              {/* Time Selection */}
              <div>
                <Label htmlFor="time">Appointment Time *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Any specific concerns or requests..."
                  rows={3}
                />
              </div>

              {/* Booking Summary */}
              {selectedService && selectedDate && selectedTime && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Service:</strong> {services.find(s => s.id === selectedService)?.name}</p>
                    <p><strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM do, yyyy')}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Duration:</strong> {services.find(s => s.id === selectedService)?.default_duration_minutes} minutes</p>
                    <p><strong>Fee:</strong> ${services.find(s => s.id === selectedService)?.default_price}</p>
                    {selectedDentist && (
                      <p><strong>Dentist:</strong> Dr. {dentists.find(d => d.id === selectedDentist)?.full_name}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsBookingOpen(false)}
                  disabled={bookingLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={bookAppointment}
                  disabled={bookingLoading}
                  className="flex-1"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card className="text-center p-12 card-3d interactive-3d">
            <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 float-gentle" />
            <h3 className="text-xl font-semibold mb-2">No Appointments Yet</h3>
            <p className="text-muted-foreground mb-6">
              Book your first appointment to get started with your dental care.
            </p>
            <Button onClick={() => setIsBookingOpen(true)} className="medical-gradient text-white btn-3d">
              <Plus className="w-4 h-4 mr-2" />
              Book First Appointment
            </Button>
          </Card>
        ) : (
          appointments.map((appointment, index) => (
            <Card key={appointment.id} className={`hover:shadow-md transition-shadow card-3d interactive-3d card-stagger-${(index % 4) + 1}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(appointment.status)}
                    <div>
                      <CardTitle className="text-lg">Appointment</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.scheduled_time), 'EEEE, MMMM do, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {appointment.dentist && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Dr. {appointment.dentist.full_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Duration: {appointment.duration_minutes || 30} minutes</span>
                    </div>
                  </div>

                  {appointment.status === 'checked_in' && appointment.queue_position && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        Queue Position: #{appointment.queue_position}
                      </p>
                      <p className="text-xs text-blue-600">You're checked in and waiting</p>
                    </div>
                  )}
                </div>

                {appointment.notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm"><strong>Notes:</strong> {appointment.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  {canCancelAppointment(appointment.scheduled_time, appointment.status) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this appointment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => cancelAppointment(appointment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Cancel Appointment
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {appointment.status === 'booked' && (
                    <div className="text-xs text-muted-foreground">
                      • Cancellation allowed up to 24 hours before appointment
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}