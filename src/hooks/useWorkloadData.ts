import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DentistWorkloadData {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  todayPatients: number;
  weeklyHours: number;
  avgTreatmentTime: number;
  patientSatisfaction: number;
  specialties: string[];
  thisWeekStats: {
    appointments: number;
    completed: number;
    noShows: number;
    revenue: number;
  };
  dailySchedule: Array<{
    day: string;
    hours: number;
    patients: number;
    utilization: number;
  }>;
}

interface OverallStats {
  totalDentists: number;
  avgUtilization: number;
  totalPatientsToday: number;
  totalWeeklyHours: number;
  avgSatisfaction: number;
}

export function useWorkloadData() {
  const [dentistData, setDentistData] = useState<DentistWorkloadData[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalDentists: 0,
    avgUtilization: 0,
    totalPatientsToday: 0,
    totalWeeklyHours: 0,
    avgSatisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkloadData();
  }, []);

  const fetchWorkloadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get dentists (users with dentist role)
      const { data: dentists, error: dentistsError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'dentist');

      if (dentistsError) throw dentistsError;

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Get week range
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Get appointments for analysis
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .gte('scheduled_time', startOfWeek.toISOString())
        .lte('scheduled_time', endOfWeek.toISOString());

      if (appointmentsError) throw appointmentsError;

      // Get invoices for revenue data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .gte('created_at', startOfWeek.toISOString())
        .lte('created_at', endOfWeek.toISOString());

      if (invoicesError) throw invoicesError;

      // Process data for each dentist
      const processedDentistData: DentistWorkloadData[] = await Promise.all(
        dentists.map(async (dentist) => {
          // Today's appointments
          const todayAppointments = appointments.filter(
            (apt) => 
              apt.dentist_id === dentist.id &&
              new Date(apt.scheduled_time) >= startOfDay &&
              new Date(apt.scheduled_time) <= endOfDay
          );

          // Week's appointments
          const weekAppointments = appointments.filter(
            (apt) => apt.dentist_id === dentist.id
          );

          // Week's revenue
          const weekRevenue = invoices
            .filter(invoice => {
              const invoiceAppointment = appointments.find(apt => apt.id === invoice.appointment_id);
              return invoiceAppointment?.dentist_id === dentist.id;
            })
            .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

          // Calculate weekly stats
          const completedAppointments = weekAppointments.filter(apt => apt.status === 'completed');
          const noShowAppointments = weekAppointments.filter(apt => apt.status === 'no_show');

          // Calculate daily schedule (mock data for now)
          const dailySchedule = [
            'Mon', 'Tue', 'Wed', 'Thu', 'Fri'
          ].map(day => ({
            day,
            hours: 7.5 + Math.random() * 1.5, // 7.5-9 hours
            patients: Math.floor(8 + Math.random() * 8), // 8-16 patients
            utilization: Math.floor(75 + Math.random() * 25) // 75-100%
          }));

          const initials = dentist.full_name
            ? dentist.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
            : dentist.email.slice(0, 2).toUpperCase();

          return {
            id: dentist.id,
            name: dentist.full_name || dentist.email,
            avatar: '',
            initials,
            todayPatients: todayAppointments.length,
            weeklyHours: dailySchedule.reduce((sum, day) => sum + day.hours, 0),
            avgTreatmentTime: weekAppointments.length > 0 
              ? Math.round(weekAppointments.reduce((sum, apt) => sum + (apt.duration_minutes || 30), 0) / weekAppointments.length)
              : 45,
            patientSatisfaction: 4.5 + Math.random() * 0.5, // Mock satisfaction rating
            specialties: ['General'], // Mock specialties
            thisWeekStats: {
              appointments: weekAppointments.length,
              completed: completedAppointments.length,
              noShows: noShowAppointments.length,
              revenue: Number(weekRevenue)
            },
            dailySchedule
          };
        })
      );

      // Calculate overall stats
      const totalPatientsToday = processedDentistData.reduce((sum, d) => sum + d.todayPatients, 0);
      const totalWeeklyHours = processedDentistData.reduce((sum, d) => sum + d.weeklyHours, 0);
      const avgUtilization = processedDentistData.length > 0
        ? processedDentistData.reduce((sum, d) => {
            const avgDailyUtil = d.dailySchedule.reduce((s, day) => s + day.utilization, 0) / d.dailySchedule.length;
            return sum + avgDailyUtil;
          }, 0) / processedDentistData.length
        : 0;
      const avgSatisfaction = processedDentistData.length > 0
        ? processedDentistData.reduce((sum, d) => sum + d.patientSatisfaction, 0) / processedDentistData.length
        : 0;

      setDentistData(processedDentistData);
      setOverallStats({
        totalDentists: processedDentistData.length,
        avgUtilization: Number(avgUtilization.toFixed(1)),
        totalPatientsToday,
        totalWeeklyHours: Number(totalWeeklyHours.toFixed(1)),
        avgSatisfaction: Number(avgSatisfaction.toFixed(2))
      });

    } catch (err) {
      console.error('Error fetching workload data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch workload data');
    } finally {
      setLoading(false);
    }
  };

  return {
    dentistData,
    overallStats,
    loading,
    error,
    refetch: fetchWorkloadData
  };
}