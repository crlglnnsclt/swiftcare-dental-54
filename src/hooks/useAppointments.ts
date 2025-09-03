import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string | null;
  scheduled_time: string;
  status: string;
  duration_minutes?: number;
  notes?: string;
  clinic_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchAppointments = async () => {
    if (!user || !profile) return;

    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patients(full_name)
        `)
        .order('scheduled_time', { ascending: true });

      // Filter based on user role
      if (profile.role === 'patient') {
        query = query.eq('patient_id', profile.id);
      } else if (profile.role === 'dentist') {
        query = query.eq('dentist_id', profile.id);
      }
      // Admin and staff can see all appointments

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkInPatient = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'checked_in'
        })
        .eq('id', appointmentId);

      if (error) throw error;
      
      await fetchAppointments();
      return { success: true };
    } catch (error) {
      console.error('Error checking in patient:', error);
      return { success: false, error };
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const updates: any = { status };
      
      if (status === 'in-treatment') {
        updates.actual_start_time = new Date().toISOString();
      } else if (status === 'completed') {
        updates.actual_end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId);

      if (error) throw error;
      
      await fetchAppointments();
      return { success: true };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return { success: false, error };
    }
  };

  const createAppointment = async (appointmentData: any) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);

      if (error) throw error;
      
      await fetchAppointments();
      return { success: true };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, profile]);

  return {
    appointments,
    loading,
    checkInPatient,
    updateAppointmentStatus,
    createAppointment,
    refetch: fetchAppointments
  };
}