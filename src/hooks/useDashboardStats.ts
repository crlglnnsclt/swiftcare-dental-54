import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface DashboardStats {
  todayPatients: number;
  todayRevenue: number;
  todayAppointments: number;
  avgWaitTime: number;
  queueCount: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    todayPatients: 0,
    todayRevenue: 0,
    todayAppointments: 0,
    avgWaitTime: 0,
    queueCount: 0
  });
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchStats = async () => {
    if (!user || !profile) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's appointments
      let appointmentsQuery = supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', `${today}T00:00:00`)
        .lt('appointment_date', `${today}T23:59:59`);

      if (profile.role === 'dentist') {
        appointmentsQuery = appointmentsQuery.eq('dentist_id', profile.id);
      }

      const { data: todayAppointments } = await appointmentsQuery;

      // Calculate stats
      const completedAppointments = todayAppointments?.filter(apt => apt.status === 'completed') || [];
      const checkedInPatients = todayAppointments?.filter(apt => apt.is_checked_in) || [];
      const queuePatients = todayAppointments?.filter(apt => 
        apt.is_checked_in && !['completed', 'cancelled', 'no-show'].includes(apt.status)
      ) || [];

      // Simulate revenue calculation (you might want to add actual payment tracking)
      const estimatedRevenue = completedAppointments.length * 150; // Average treatment cost

      // Calculate average wait time (simplified)
      const avgWait = queuePatients.length > 0 ? 12 : 0; // Minutes

      setStats({
        todayPatients: checkedInPatients.length,
        todayRevenue: estimatedRevenue,
        todayAppointments: todayAppointments?.length || 0,
        avgWaitTime: avgWait,
        queueCount: queuePatients.length
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [user, profile]);

  return { stats, loading, refetch: fetchStats };
}