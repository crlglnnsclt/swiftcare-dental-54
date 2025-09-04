import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Database, Users, Calendar, FileText, CreditCard, Activity } from 'lucide-react';

interface DatabaseStats {
  totalUsers: number;
  totalPatients: number;
  totalAppointments: number;
  totalClinics: number;
  totalInvoices: number;
  pendingPayments: number;
  activeFeatures: number;
  todayAppointments: number;
}

export const DatabaseHealthStats: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        { data: users, error: usersError },
        { data: patients, error: patientsError },
        { data: appointments, error: appointmentsError },
        { data: clinics, error: clinicsError },
        { data: billing, error: billingError },
        { data: features, error: featuresError }
      ] = await Promise.all([
        supabase.from('users').select('id, role'),
        supabase.from('patients').select('id'),
        supabase.from('appointments').select('id, scheduled_time'),
        supabase.from('clinics').select('id'),
        supabase.from('clinic_billing').select('id, status'),
        supabase.from('clinic_feature_toggles').select('id, is_enabled')
      ]);

      // Check for errors
      const errors = [usersError, patientsError, appointmentsError, clinicsError, billingError, featuresError]
        .filter(Boolean);
      
      if (errors.length > 0) {
        throw new Error(`Database query errors: ${errors.map(e => e?.message).join(', ')}`);
      }

      // Calculate today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments?.filter(apt => 
        apt.scheduled_time?.startsWith(today)
      ).length || 0;

      // Calculate pending billing
      const pendingPayments = billing?.filter(bill => 
        bill.status === 'pending'
      ).length || 0;

      // Calculate active features
      const activeFeatures = features?.filter(feat => feat.is_enabled).length || 0;

      setStats({
        totalUsers: users?.length || 0,
        totalPatients: patients?.length || 0,
        totalAppointments: appointments?.length || 0,
        totalClinics: clinics?.length || 0,
        totalInvoices: billing?.length || 0,
        pendingPayments,
        activeFeatures,
        todayAppointments
      });

    } catch (err) {
      console.error('Database stats error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch database statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStats();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchDatabaseStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-800">
          <Activity className="h-4 w-4" />
          <span className="font-medium">Database Connection Error</span>
        </div>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Active Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'text-green-600'
    },
    {
      label: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      label: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'text-orange-600'
    },
    {
      label: 'Active Clinics',
      value: stats.totalClinics,
      icon: Database,
      color: 'text-indigo-600'
    },
    {
      label: 'Billing Records',
      value: stats.totalInvoices,
      icon: CreditCard,
      color: 'text-emerald-600'
    },
    {
      label: 'Pending Payments',
      value: stats.pendingPayments,
      icon: CreditCard,
      color: 'text-red-600'
    },
    {
      label: 'Enabled Features',
      value: stats.activeFeatures,
      icon: Activity,
      color: 'text-teal-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3 p-3 border rounded-lg">
              <Icon className={`h-5 w-5 ${item.color}`} />
              <div>
                <div className={`text-lg font-bold ${item.color}`}>
                  {item.value.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-muted-foreground">
            Database connected and operational
          </span>
        </div>
        <Badge variant="outline">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>
    </div>
  );
};