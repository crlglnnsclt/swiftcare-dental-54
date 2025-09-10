import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  FileText,
  DollarSign,
  User,
  Bell
} from 'lucide-react';

interface TreatmentHistory {
  id: string;
  procedure_name: string;
  treatment_date: string;
  dentist_name: string;
  cost: number;
  notes: string;
}

interface BillingRecord {
  id: string;
  patient_id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: string;
  created_at: string;
}

const EnhancedPatientPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentHistory[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    treatmentRecords: 0,
    outstandingBalance: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchAppointments(),
        fetchTreatmentHistory(),
        fetchBillingRecords(),
        fetchNotifications()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, users(full_name)')
        .eq('patient_id', user?.id)
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time');

      if (error) throw error;

      // Transform appointments to match expected interface
      const transformedAppointments = (data || []).map((apt: any) => ({
        id: apt.id,
        patient_id: apt.patient_id,
        dentist_id: apt.dentist_id,
        scheduled_time: apt.scheduled_time,
        status: apt.status,
        appointment_type: apt.booking_type || 'consultation',
        reason_for_visit: apt.notes || 'Regular checkup',
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        dentist: apt.users || { full_name: 'TBA' }
      }));
      
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchTreatmentHistory = async () => {
    try {
      // Since TreatmentHistory interface doesn't match, use mock data
      setTreatmentHistory([]);
    } catch (error) {
      console.error('Error fetching treatment history:', error);
      // Mock data for demo
      setTreatmentHistory([
        {
          id: '1',
          procedure_name: 'Dental Cleaning',
          treatment_date: '2024-01-15',
          dentist_name: 'Dr. Sarah Johnson',
          cost: 120,
          notes: 'Routine cleaning completed. Good oral hygiene.'
        }
      ]);
    }
  };

  const fetchBillingRecords = async () => {
    try {
      // Mock billing data
      setBillingRecords([
        {
          id: '1',
          patient_id: user?.id || '',
          invoice_number: 'INV-2024-001',
          total_amount: 850,
          paid_amount: 0,
          balance_due: 850,
          status: 'pending',
          created_at: '2024-01-15'
        }
      ]);
    } catch (error) {
      console.error('Error fetching billing records:', error);
    }
  };

  const fetchNotifications = async () => {
    // Mock notifications - in real app, fetch from database
    setNotifications([
      {
        id: '1',
        title: 'Appointment Reminder',
        message: 'Your appointment is scheduled for tomorrow at 2:00 PM',
        read: false,
        created_at: '2024-01-20'
      }
    ]);
  };

  const fetchStats = async () => {
    try {
      const upcomingAppointments = appointments.length;
      const treatmentRecords = treatmentHistory.length;
      const outstandingBalance = billingRecords.reduce((sum, record) => sum + (record.balance_due || 0), 0);
      const unreadNotifications = notifications.filter((n: any) => !n.read).length;

      setStats({
        upcomingAppointments,
        treatmentRecords,
        outstandingBalance,
        unreadNotifications
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'booked': 'bg-blue-100 text-blue-800',
      'checked_in': 'bg-yellow-100 text-yellow-800',
      'in_procedure': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no_show': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Patient Portal</h1>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span className="text-sm text-gray-600">{user?.email}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                  <p className="text-2xl font-bold">{stats.upcomingAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Treatment Records</p>
                  <p className="text-2xl font-bold">{stats.treatmentRecords}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                  <p className="text-2xl font-bold">${stats.outstandingBalance}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
                </div>
                <Bell className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                ) : (
                  appointments.slice(0, 3).map((appointment: any) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {new Date(appointment.scheduled_time).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.appointment_type} with Dr. {appointment.dentist?.full_name || 'TBA'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Treatment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Treatments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {treatmentHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No treatment history</p>
                ) : (
                  treatmentHistory.slice(0, 3).map((treatment) => (
                    <div key={treatment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{treatment.procedure_name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(treatment.treatment_date).toLocaleDateString()} • {treatment.dentist_name}
                          </p>
                          {treatment.notes && (
                            <p className="text-sm text-gray-500 mt-1">{treatment.notes}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium">${treatment.cost}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No billing records</p>
              ) : (
                billingRecords.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{record.invoice_number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${record.total_amount}</p>
                        <p className="text-sm text-gray-600">
                          Balance: ${record.balance_due}
                        </p>
                        <Badge variant={record.status === 'paid' ? 'default' : 'destructive'}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedPatientPortal;