import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, Clock, Plus, User, Phone, Mail, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  patient_id: string;
  dentist_id?: string;
  appointment_date: string;
  estimated_duration?: number;
  service_type: string;
  status: string;
  priority: string;
  appointment_type: string;
  fee: number;
  notes?: string;
  created_at: string;
  // Joined data
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  dentist_name?: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  is_active: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

export function AppointmentScheduling() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Form state
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '',
    dentist_id: '',
    appointment_date: '',
    appointment_time: '',
    service_id: '',
    estimated_duration: 30,
    appointment_type: 'scheduled',
    priority: 'normal',
    notes: '',
  });

  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, currentWeek]);

  const fetchData = async () => {
    try {
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('role', 'patient')
        .eq('is_active', true)
        .order('full_name');

      if (patientsError) throw patientsError;
      setPatients(patientsData || []);

      // Fetch dentists
      const { data: dentistsData, error: dentistsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('enhanced_role', 'dentist')
        .eq('is_active', true)
        .order('full_name');

      if (dentistsError) throw dentistsError;
      setDentists(dentistsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', startDate.toISOString())
        .lte('appointment_date', endDate.toISOString())
        .order('appointment_date');

      if (error) throw error;

      // For each appointment, fetch patient and dentist info separately
      const formattedAppointments = await Promise.all((data || []).map(async (appointment) => {
        let patientInfo = null;
        let dentistInfo = null;
        
        // Fetch patient info
        if (appointment.patient_id) {
          const { data: patient } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', appointment.patient_id)
            .single();
          patientInfo = patient;
        }
        
        // Fetch dentist info
        if (appointment.dentist_id) {
          const { data: dentist } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', appointment.dentist_id)
            .single();
          dentistInfo = dentist;
        }
        
        return {
          ...appointment,
          patient_name: patientInfo?.full_name || 'Unknown Patient',
          patient_email: patientInfo?.email || '',
          patient_phone: patientInfo?.phone || '',
          dentist_name: dentistInfo?.full_name || '',
        };
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    }
  };

  const resetAppointmentForm = () => {
    setAppointmentForm({
      patient_id: '',
      dentist_id: '',
      appointment_date: '',
      appointment_time: '',
      service_id: '',
      estimated_duration: 30,
      appointment_type: 'scheduled',
      priority: 'normal',
      notes: '',
    });
    setEditingAppointment(null);
  };

  const openAppointmentModal = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      const appointmentDate = new Date(appointment.appointment_date);
      setAppointmentForm({
        patient_id: appointment.patient_id,
        dentist_id: appointment.dentist_id || '',
        appointment_date: appointmentDate.toISOString().split('T')[0],
        appointment_time: appointmentDate.toTimeString().slice(0, 5),
        service_id: '', // Would need to link services properly
        estimated_duration: appointment.estimated_duration || 30,
        appointment_type: appointment.appointment_type,
        priority: appointment.priority,
        notes: appointment.notes || '',
      });
    } else {
      resetAppointmentForm();
      setAppointmentForm(prev => ({
        ...prev,
        appointment_date: selectedDate.toISOString().split('T')[0],
      }));
    }
    setIsAppointmentModalOpen(true);
  };

  const saveAppointment = async () => {
    if (!appointmentForm.patient_id || !appointmentForm.appointment_date || !appointmentForm.appointment_time) {
      toast.error('Patient, date, and time are required');
      return;
    }

    try {
      const appointmentDateTime = new Date(`${appointmentForm.appointment_date}T${appointmentForm.appointment_time}:00`);
      
      const selectedService = services.find(s => s.id === appointmentForm.service_id);
      
      const appointmentData = {
        patient_id: appointmentForm.patient_id,
        dentist_id: appointmentForm.dentist_id || null,
        appointment_date: appointmentDateTime.toISOString(),
        estimated_duration: appointmentForm.estimated_duration,
        service_type: selectedService?.name || 'General Consultation',
        appointment_type: appointmentForm.appointment_type,
        priority: appointmentForm.priority,
        fee: selectedService?.price || 0,
        notes: appointmentForm.notes || null,
        status: 'scheduled',
        branch_id: profile?.branch_id,
      };

      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', editingAppointment.id);
        
        if (error) throw error;
        toast.success('Appointment updated successfully');
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert(appointmentData);
        
        if (error) throw error;
        toast.success('Appointment created successfully');
      }

      setIsAppointmentModalOpen(false);
      resetAppointmentForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to save appointment');
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
      toast.success('Appointment deleted successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment');
    }
  };

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    const slotDuration = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const slotDate = new Date(selectedDate);
        slotDate.setHours(hour, minutes, 0, 0);

        const appointment = appointments.find(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate.getHours() === hour && aptDate.getMinutes() === minutes;
        });

        slots.push({
          time,
          available: !appointment,
          appointment,
        });
      }
    }

    return slots;
  };

  const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchTerm || 
      appointment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.dentist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'confirmed': return 'secondary';
      case 'in-treatment': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      case 'no-show': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'vip': return 'destructive';
      case 'senior': return 'secondary';
      case 'normal': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CalendarDays className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <div className="text-muted-foreground">Loading appointments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointment Scheduling</h1>
          <p className="text-muted-foreground">Manage appointments and schedule patients</p>
        </div>
        <Button onClick={() => openAppointmentModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>Choose a date to view appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardTitle>
                    <CardDescription>Available time slots and scheduled appointments</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {appointments.length} appointments
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {generateTimeSlots().map((slot) => (
                      <div
                        key={slot.time}
                        className={`p-3 border rounded-lg transition-colors ${
                          slot.available 
                            ? 'hover:bg-muted/50 cursor-pointer border-dashed' 
                            : 'bg-muted border-solid'
                        }`}
                        onClick={() => slot.available && openAppointmentModal()}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm">{slot.time}</span>
                            {slot.appointment ? (
                              <div>
                                <p className="font-medium">{slot.appointment.patient_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {slot.appointment.service_type}
                                  {slot.appointment.dentist_name && ` • Dr. ${slot.appointment.dentist_name}`}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Available</span>
                            )}
                          </div>
                          {slot.appointment && (
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(slot.appointment.status)}>
                                {slot.appointment.status}
                              </Badge>
                              <Badge variant={getPriorityColor(slot.appointment.priority)}>
                                {slot.appointment.priority}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                Week of {currentWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-8 gap-2">
                <div className="font-medium text-sm text-muted-foreground">Time</div>
                {getWeekDays(currentWeek).map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="font-medium text-sm">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {day.getDate()}
                    </div>
                  </div>
                ))}
                
                {/* Time slots */}
                {Array.from({ length: 10 }, (_, hour) => hour + 8).map(hour => (
                  <div key={hour} className="grid grid-cols-8 col-span-8 gap-2 border-t py-2">
                    <div className="text-sm text-muted-foreground">
                      {hour}:00
                    </div>
                    {getWeekDays(currentWeek).map((day, dayIndex) => {
                      const dayAppointments = appointments.filter(apt => {
                        const aptDate = new Date(apt.appointment_date);
                        return aptDate.toDateString() === day.toDateString() && 
                               aptDate.getHours() === hour;
                      });

                      return (
                        <div key={dayIndex} className="min-h-[60px] border rounded p-1">
                          {dayAppointments.map(apt => (
                            <div key={apt.id} className="text-xs bg-primary/10 rounded p-1 mb-1">
                              <div className="font-medium truncate">{apt.patient_name}</div>
                              <div className="text-muted-foreground truncate">{apt.service_type}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* Search and Filter */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-treatment">In Treatment</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Appointments List */}
          <div className="space-y-2">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{appointment.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.appointment_date).toLocaleString()}
                          {appointment.dentist_name && ` • Dr. ${appointment.dentist_name}`}
                        </p>
                        <p className="text-sm text-muted-foreground">{appointment.service_type}</p>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground italic">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <Badge variant={getPriorityColor(appointment.priority)}>
                        {appointment.priority}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAppointmentModal(appointment)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAppointment(appointment.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <Card className="text-center p-12">
              <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Appointments Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No appointments match your current filters.' 
                  : 'No appointments scheduled for the selected date.'
                }
              </p>
              <Button onClick={() => openAppointmentModal()}>Schedule First Appointment</Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Appointment Modal */}
      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Update appointment details' : 'Schedule a new patient appointment'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="patient">Patient *</Label>
                <Select
                  value={appointmentForm.patient_id}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, patient_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name} ({patient.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dentist">Dentist</Label>
                <Select
                  value={appointmentForm.dentist_id}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, dentist_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dentist" />
                  </SelectTrigger>
                  <SelectContent>
                    {dentists.map(dentist => (
                      <SelectItem key={dentist.id} value={dentist.id}>
                        Dr. {dentist.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentForm.appointment_date}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointment_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={appointmentForm.appointment_time}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointment_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="service">Service</Label>
                <Select
                  value={appointmentForm.service_id}
                  onValueChange={(value) => {
                    const service = services.find(s => s.id === value);
                    setAppointmentForm(prev => ({ 
                      ...prev, 
                      service_id: value,
                      estimated_duration: service?.duration || 30
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} (${service.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={appointmentForm.estimated_duration}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 30 }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="type">Appointment Type</Label>
                <Select
                  value={appointmentForm.appointment_type}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, appointment_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={appointmentForm.priority}
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or special instructions"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsAppointmentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveAppointment}>
              {editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}