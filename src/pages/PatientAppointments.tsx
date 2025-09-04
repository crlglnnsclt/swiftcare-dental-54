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
  Loader2,
  Filter
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
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
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDentist, setSelectedDentist] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
      fetchServices();
      fetchDentists();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      console.log('User ID for patient lookup:', user?.id);
      // First, get the patient record for this user - patients table uses users.id, not users.user_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, clinic_id, role')
        .eq('user_id', user?.id)
        .maybeSingle();

      console.log('User lookup result:', { userData, userError });

      if (userError || !userData) {
        console.error('User lookup failed:', userError);
        setLoading(false);
        return;
      }

      // Check if user is actually a patient
      if (userData.role !== 'patient') {
        console.log('User is not a patient, role:', userData.role);
        setError('This page is only accessible to patients. Please contact your clinic to access your appointments.');
        setLoading(false);
        return;
      }

      // Get the first patient record for this user (handle duplicates gracefully)
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, clinic_id')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: true })
        .limit(1);

      console.log('Patient lookup result:', { patientData, patientError });

      if (patientError) {
        console.error('Error fetching patient data:', patientError);
        setError('Error loading patient data. Please try again.');
        setLoading(false);
        return;
      }

      if (!patientData || patientData.length === 0) {
        console.log('No patient record found for this user');
        setError('No patient record found. Please contact your clinic to set up your patient profile.');
        setAppointments([]);
        setLoading(false);
        return;
      }

      const patient = patientData[0]; // Get first patient record

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(full_name)
        `)
        .eq('patient_id', patient.id)
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
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      console.log('Fetching services from treatments table...');
      const { data, error } = await supabase
        .from('treatments')
        .select('id, name, default_duration_minutes, default_price, service_code');

      if (error) {
        console.error('Error fetching services:', error);
        // Fallback to mock data if database query fails
        const mockServices = [
          { id: '1', name: 'General Consultation', default_duration_minutes: 30, default_price: 100 },
          { id: '2', name: 'Dental Cleaning', default_duration_minutes: 45, default_price: 150 },
          { id: '3', name: 'Tooth Extraction', default_duration_minutes: 60, default_price: 200 }
        ];
        setServices(mockServices);
        return;
      }

      console.log('Services fetched:', data);
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchDentists = async () => {
    try {
      console.log('Fetching dentists...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'dentist');

      console.log('Dentists query result:', { data, error });
      
      if (error) {
        console.error('Error fetching dentists:', error);
        throw error;
      }
      setDentists(data || []);
    } catch (error) {
      console.error('Error fetching dentists:', error);
    }
  };

  const bookAppointment = async () => {
    if (!selectedService || !selectedDentist || !selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBooking(true);

      // Get patient ID
      const { data: userData } = await supabase
        .from('users')
        .select('id, role, clinic_id')
        .eq('user_id', user?.id)
        .single();

      if (!userData) {
        throw new Error('User not found');
      }

      if (userData.role !== 'patient') {
        throw new Error('Only patients can book appointments');
      }

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, clinic_id')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (patientError || !patientData || patientData.length === 0) {
        throw new Error('Patient record not found');
      }

      const patient = patientData[0];

      console.log('Found patient record:', patient);

      setBookingLoading(true);
      
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const selectedServiceData = services.find(s => s.id === selectedService);

      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patient.id,
          scheduled_time: appointmentDateTime.toISOString(),
          dentist_id: selectedDentist === 'any' ? null : selectedDentist || null,
          duration_minutes: selectedServiceData?.default_duration_minutes || 30,
          notes: appointmentNotes,
          clinic_id: patient.clinic_id,
          status: 'booked'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });
      setIsBookingOpen(false);
      resetBookingForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      });
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
          cancelled_by: user?.id,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Cancelled by patient'
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  // Filter and sort appointments
  const filteredAndSortedAppointments = () => {
    let filtered = [...appointments];
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }
    
    // Time filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    if (timeFilter === 'upcoming') {
      filtered = filtered.filter(apt => new Date(apt.scheduled_time) >= now);
    } else if (timeFilter === 'today') {
      const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.scheduled_time);
        return aptDate >= today && aptDate < tomorrow;
      });
    } else if (timeFilter === 'this_week') {
      filtered = filtered.filter(apt => new Date(apt.scheduled_time) >= thisWeek);
    } else if (timeFilter === 'this_month') {
      filtered = filtered.filter(apt => new Date(apt.scheduled_time) >= thisMonth);
    } else if (timeFilter === 'past') {
      filtered = filtered.filter(apt => new Date(apt.scheduled_time) < now);
    }
    
    // Sort appointments
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduled_time);
      const dateB = new Date(b.scheduled_time);
      
      if (sortBy === 'latest') {
        return dateB.getTime() - dateA.getTime(); // Most recent first
      } else if (sortBy === 'oldest') {
        return dateA.getTime() - dateB.getTime(); // Oldest first
      } else if (sortBy === 'upcoming') {
        return dateA.getTime() - dateB.getTime(); // Soonest first
      }
      return 0;
    });
    
    return filtered;
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground mt-1">View and manage your dental appointments</p>
        </div>
        <Button onClick={() => setIsBookingOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Book Appointment
        </Button>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="upcoming">Next Appointment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setTimeFilter('all');
                setSortBy('latest');
              }}
            >
              Clear Filters
            </Button>
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedAppointments().length} of {appointments.length} appointments
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Service Selection */}
            <div>
              <Label htmlFor="service">Service *</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="bg-background border border-border z-10">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                 <SelectContent className="bg-background border border-border shadow-lg z-50 backdrop-blur-sm">
                  {services.map((service) => (
                    <SelectItem 
                      key={service.id} 
                      value={service.id}
                      className="bg-background hover:bg-muted"
                    >
                      <div className="flex justify-between w-full">
                        <span>{service.name}</span>
                        <span className="text-muted-foreground ml-4">
                          ${service.default_price} • {service.default_duration_minutes}min
                        </span>
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
                 <SelectTrigger className="bg-background border border-border z-10">
                  <SelectValue placeholder="Any available dentist" />
                </SelectTrigger>
                 <SelectContent className="bg-background border-border shadow-lg z-[9999]">
                   <SelectItem value="any" className="bg-background hover:bg-muted">
                     Any available dentist
                   </SelectItem>
                  {dentists.map((dentist) => (
                    <SelectItem 
                      key={dentist.id} 
                      value={dentist.id}
                      className="bg-background hover:bg-muted"
                    >
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
                <SelectTrigger className="bg-background border border-border z-10">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-50 backdrop-blur-sm">
                  {timeSlots.map((time) => (
                    <SelectItem 
                      key={time} 
                      value={time}
                      className="bg-background hover:bg-muted"
                    >
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

      {/* Appointments List */}
      {filteredAndSortedAppointments().length === 0 ? (
        <Card className="text-center p-8">
          <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {appointments.length === 0 ? 'No Appointments Found' : 'No appointments match your filters'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {appointments.length === 0 
              ? 'You don\'t have any appointments yet. Book your first appointment to get started!'
              : 'Try adjusting your filters to see more appointments.'
            }
          </p>
          {appointments.length === 0 && (
            <Button onClick={() => setIsBookingOpen(true)}>
              Book Your First Appointment
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedAppointments().map((appointment, index) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
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
          ))}
        </div>
      )}
    </div>
  );
}