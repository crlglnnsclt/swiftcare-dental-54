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
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's appointments
      // Build filter conditions
      const filters: any = {
        scheduled_time: {
          gte: `${today}T00:00:00`,
          lt: `${today}T23:59:59`
        }
      };

      if (profile.role === 'dentist') {
        filters.dentist_id = profile.id;
      } else if (profile.role !== 'super_admin' && profile.clinic_id) {
        filters.clinic_id = profile.clinic_id;
      }

      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select('*')
        .gte('scheduled_time', filters.scheduled_time.gte)
        .lt('scheduled_time', filters.scheduled_time.lt);

      // Get today's payments for revenue calculation
      let paymentsQuery = supabase
        .from('payments')
        .select('amount')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      if (profile.role !== 'super_admin' && profile.clinic_id) {
        paymentsQuery = paymentsQuery.eq('clinic_id', profile.clinic_id);
      }

      const { data: payments } = await paymentsQuery;

      // Calculate stats
      const completedAppointments = todayAppointments?.filter(apt => apt.status === 'completed') || [];
      const checkedInPatients = todayAppointments?.filter(apt => apt.status === 'checked_in') || [];
      const queuePatients = todayAppointments?.filter(apt => 
        apt.status === 'checked_in' || apt.status === 'in_progress'
      ) || [];

      // Calculate actual revenue from payments
      const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Calculate average wait time (simplified)
      const avgWait = queuePatients.length > 0 ? 12 : 0; // Minutes

      setStats({
        todayPatients: checkedInPatients.length,
        todayRevenue: totalRevenue,
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