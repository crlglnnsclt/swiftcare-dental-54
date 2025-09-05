import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  email?: string;
}

interface Dentist {
  id: string;
  full_name: string;
}

interface AppointmentCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AppointmentCreationDialog({ isOpen, onClose, onSuccess }: AppointmentCreationDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    dentist_id: '',
    service_type: '',
    appointment_date: '',
    appointment_time: '',
    booking_type: 'online' as const,
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      fetchDentists();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, email')
        .order('full_name');
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
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

  const handleSubmit = async () => {
    if (!formData.patient_id || !formData.service_type || !formData.appointment_date || !formData.appointment_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const scheduledTime = `${formData.appointment_date}T${formData.appointment_time}:00`;
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: formData.patient_id,
          dentist_id: formData.dentist_id || null,
          scheduled_time: scheduledTime,
          duration_minutes: 30,
          status: 'booked',
          booking_type: formData.booking_type,
          notes: formData.notes
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment created successfully",
      });

      // Reset form
      setFormData({
        patient_id: '',
        dentist_id: '',
        service_type: '',
        appointment_date: '',
        appointment_time: '',
        booking_type: 'online',
        notes: ''
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="patient">Patient *</Label>
            <Select value={formData.patient_id} onValueChange={(value) => setFormData({...formData, patient_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dentist">Dentist</Label>
            <Select value={formData.dentist_id} onValueChange={(value) => setFormData({...formData, dentist_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select dentist (optional)" />
              </SelectTrigger>
              <SelectContent>
                {dentists.map(dentist => (
                  <SelectItem key={dentist.id} value={dentist.id}>
                    {dentist.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="service-type">Service Type *</Label>
            <Select value={formData.service_type} onValueChange={(value) => setFormData({...formData, service_type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkup">Checkup</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="filling">Filling</SelectItem>
                <SelectItem value="extraction">Extraction</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointment-date">Date *</Label>
              <Input
                id="appointment-date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="appointment-time">Time *</Label>
              <Input
                id="appointment-time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="booking-type">Booking Type</Label>
            <Select value={formData.booking_type} onValueChange={(value: any) => setFormData({...formData, booking_type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Appointment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}