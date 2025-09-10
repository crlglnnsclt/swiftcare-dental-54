import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  Users,
  Activity,
  AlertTriangle,
  Timer,
  Signature,
  Package,
  DollarSign,
  GripHorizontal
} from 'lucide-react';

const EnhancedDentistDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    completedProcedures: 0,
    revenue: 0
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
        fetchPatients(),
        fetchTreatmentPlans(),
        fetchStats()
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
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select('*, patients(full_name)')
        .eq('dentist_id', user?.id)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lte('scheduled_time', `${today}T23:59:59`)
        .order('scheduled_time');

      if (error) throw error;

      // Transform appointments to match expected interface
      const transformedAppointments = (data || []).map((appointment: any) => ({
        id: appointment.id,
        patient_id: appointment.patient_id,
        dentist_id: appointment.dentist_id,
        scheduled_time: appointment.scheduled_time,
        duration_minutes: appointment.duration_minutes,
        status: appointment.status,
        booking_type: appointment.booking_type,
        notes: appointment.notes,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at,
        patients: appointment.patients || { full_name: 'Unknown Patient' }
      }));
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchTreatmentPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTreatmentPlans(data || []);
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [appointmentsRes, patientsRes] = await Promise.all([
        supabase.from('appointments').select('*').eq('dentist_id', user?.id).gte('scheduled_time', `${today}T00:00:00`),
        supabase.from('patients').select('id')
      ]);

      setStats({
        todayAppointments: appointmentsRes.data?.length || 0,
        totalPatients: patientsRes.data?.length || 0,
        completedProcedures: appointmentsRes.data?.filter(apt => apt.status === 'completed').length || 0,
        revenue: 0 // Would calculate from treatment records
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'booked' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'waiting' | 'in_procedure' | 'billing') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment status updated",
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dentist Dashboard</h1>
          <Button onClick={fetchData}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold">{stats.todayAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold">{stats.completedProcedures}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">${stats.revenue}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No appointments scheduled for today</p>
                ) : (
                  appointments.map((appointment: any) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{appointment.patients?.full_name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.scheduled_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} • {appointment.duration_minutes || 30} min
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed' as any)}
                            disabled={appointment.status === 'completed'}
                          >
                            Complete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Treatment Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Active Treatment Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {treatmentPlans.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No active treatment plans</p>
                ) : (
                  treatmentPlans.slice(0, 3).map((plan: any) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Patient: {plan.patient_name}</p>
                          <p className="text-sm text-gray-600">Procedure: {plan.procedure}</p>
                          <p className="text-sm text-gray-600">
                            Est. Cost: ${plan.estimated_cost || 0}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {plan.status || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {patients.length === 0 ? (
                <p className="col-span-3 text-gray-500 text-center py-4">No patients found</p>
              ) : (
                patients.slice(0, 6).map((patient: any) => (
                  <div key={patient.id} className="border rounded-lg p-4">
                    <h4 className="font-medium">{patient.full_name}</h4>
                    <p className="text-sm text-gray-600">{patient.email}</p>
                    <p className="text-sm text-gray-600">{patient.contact_number}</p>
                    {patient.date_of_birth && (
                      <p className="text-sm text-gray-500">
                        DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                      </p>
                    )}
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

export default EnhancedDentistDashboard;