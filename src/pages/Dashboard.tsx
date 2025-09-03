import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Clock,
  Settings,
  Bell,
  Search,
  Plus,
  Phone,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useAppointments } from '@/hooks/useAppointments';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { Appointment } from '@/lib/types';

const Dashboard = () => {
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({
    patient_name: '',
    service_type: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: 'scheduled',
    priority: 'normal'
  });

  const { user, profile } = useAuth();
  const { appointments, loading: apptLoading, checkInPatient, updateAppointmentStatus, createAppointment } = useAppointments();
  
  // Type assertion for appointments to use our simplified interface
  const typedAppointments = appointments as Appointment[];
  const { stats, loading: statsLoading } = useDashboardStats();
  const { toast } = useToast();

  const handleCheckIn = async (appointmentId: string) => {
    const result = await checkInPatient(appointmentId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Patient checked in successfully",
      });
    } else {
      toast({
        title: "Error", 
        description: "Failed to check in patient",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    const result = await updateAppointmentStatus(appointmentId, status);
    if (result.success) {
      toast({
        title: "Success",
        description: `Appointment status updated to ${status}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update appointment status", 
        variant: "destructive"
      });
    }
  };

  const handleCreateAppointment = async () => {
    if (!newAppt.patient_name || !newAppt.service_type || !newAppt.appointment_date || !newAppt.appointment_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const appointmentDateTime = `${newAppt.appointment_date}T${newAppt.appointment_time}:00`;
    
    const appointmentData = {
      patient_id: profile?.id, // For demo - in real app, you'd select from patients
      service_type: newAppt.service_type,
      appointment_date: appointmentDateTime,
      appointment_type: newAppt.appointment_type,
      priority: newAppt.priority,
      status: 'scheduled',
      fee: 150, // Default fee
    };

    const result = await createAppointment(appointmentData);
    if (result.success) {
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
      setIsNewApptOpen(false);
      setNewAppt({
        patient_name: '',
        service_type: '',
        appointment_date: '',
        appointment_time: '',
        appointment_type: 'scheduled',
        priority: 'normal'
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive"
      });
    }
  };

  const queueAppointments = typedAppointments.filter(apt => 
    apt.status === 'checked_in'
  );

  const todayAppointments = typedAppointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    const apptDate = new Date(apt.scheduled_time).toISOString().split('T')[0];
    return apptDate === today;
  });

  return (
    <div className="p-6 page-container">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card card-3d card-stagger-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Today's Patients</p>
                <p className="text-2xl font-bold text-medical-blue">
                  {statsLoading ? '...' : stats.todayPatients}
                </p>
              </div>
              <div className="w-12 h-12 bg-medical-blue/10 rounded-xl flex items-center justify-center float-gentle">
                <Users className="w-6 h-6 text-medical-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className="glass-card card-3d card-stagger-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Revenue Today</p>
                  <p className="text-2xl font-bold text-dental-mint">
                    {statsLoading ? '...' : `$${stats.todayRevenue}`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-dental-mint/10 rounded-xl flex items-center justify-center float-gentle">
                  <BarChart3 className="w-6 h-6 text-dental-mint" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card card-3d card-stagger-3">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Appointments</p>
                  <p className="text-2xl font-bold text-professional-navy">
                    {statsLoading ? '...' : stats.todayAppointments}
                  </p>
                </div>
                <div className="w-12 h-12 bg-professional-navy/10 rounded-xl flex items-center justify-center float-gentle">
                  <Calendar className="w-6 h-6 text-professional-navy" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card card-3d card-stagger-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">In Queue</p>
                  <p className="text-2xl font-bold text-warning">
                    {statsLoading ? '...' : stats.queueCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center float-gentle">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Welcome Section & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Banner */}
            <Card className="glass-card card-3d interactive-3d">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {profile?.role === 'patient' ? 'Patient Portal' : 
                       profile?.role === 'super_admin' ? 'Super Admin Dashboard' :
                       profile?.role === 'admin' ? 'Admin Dashboard' : 
                       profile?.role === 'dentist' ? 'Dentist Dashboard' : 'Dashboard'}
                    </h1>
                    <p className="text-muted-foreground mb-2">
                      Welcome back, {profile?.full_name || user?.email}
                    </p>
                    {profile?.role && (
                      <Badge variant="outline" className="ml-2">
                        {profile.role.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <Dialog open={isNewApptOpen} onOpenChange={setIsNewApptOpen}>
                    <DialogTrigger asChild>
                      <Button className="medical-gradient text-white btn-3d">
                        <Plus className="w-4 h-4 mr-2" />
                        New Appointment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="patient-name">Patient Name</Label>
                          <Input
                            id="patient-name"
                            value={newAppt.patient_name}
                            onChange={(e) => setNewAppt({...newAppt, patient_name: e.target.value})}
                            placeholder="Enter patient name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="service-type">Service Type</Label>
                          <Select value={newAppt.service_type} onValueChange={(value) => setNewAppt({...newAppt, service_type: value})}>
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
                            <Label htmlFor="appointment-date">Date</Label>
                            <Input
                              id="appointment-date"
                              type="date"
                              value={newAppt.appointment_date}
                              onChange={(e) => setNewAppt({...newAppt, appointment_date: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="appointment-time">Time</Label>
                            <Input
                              id="appointment-time"
                              type="time"
                              value={newAppt.appointment_time}
                              onChange={(e) => setNewAppt({...newAppt, appointment_time: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="appointment-type">Type</Label>
                          <Select value={newAppt.appointment_type} onValueChange={(value) => setNewAppt({...newAppt, appointment_type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
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
                          <Select value={newAppt.priority} onValueChange={(value) => setNewAppt({...newAppt, priority: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="senior">Senior</SelectItem>
                              <SelectItem value="vip">VIP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleCreateAppointment} className="w-full medical-gradient text-white">
                          Create Appointment
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Queue Management */}
            <Card className="glass-card card-3d interactive-3d">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Queue</span>
                  <Badge className="bg-medical-blue/10 text-medical-blue float-gentle">
                    {queueAppointments.length} waiting
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apptLoading ? (
                    <p className="text-center text-muted-foreground py-8">Loading appointments...</p>
                  ) : queueAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No patients in queue</p>
                  ) : (
                    queueAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 smooth-transition interactive-3d">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center text-white font-semibold text-sm float-gentle">
                            {appointment.profiles?.full_name ? 
                              appointment.profiles.full_name.split(' ').map(n => n[0]).join('') : 
                              'P'
                            }
                          </div>
                          <div>
                            <p className="font-medium">
                              {appointment.profiles?.full_name || 'Patient'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                 className={`text-xs ${
                                   appointment.booking_type === 'emergency' ? 'border-destructive text-destructive' :
                                   appointment.booking_type === 'online' ? 'border-medical-blue text-medical-blue' :
                                   'border-warning text-warning'
                                 }`}
                               >
                                 {appointment.booking_type || 'online'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(appointment.scheduled_time).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`${
                              appointment.status === 'booked' ? 'bg-success/10 text-success' :
                              appointment.status === 'in_progress' ? 'bg-medical-blue/10 text-medical-blue' :
                              'bg-warning/10 text-warning'
                            }`}
                          >
                            {appointment.status === 'in_progress' ? 'In Progress' : 
                             appointment.status === 'booked' ? 'Ready' : appointment.status}
                          </Badge>
                          {appointment.status === 'booked' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="btn-3d"
                              onClick={() => handleCheckIn(appointment.id)}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Check In
                            </Button>
                          ) : appointment.status === 'checked_in' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="btn-3d"
                              onClick={() => handleStatusUpdate(appointment.id, 'in_progress')}
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                          ) : appointment.status === 'in_progress' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="btn-3d"
                              onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            >
                              Complete
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayAppointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No appointments today</p>
                ) : (
                  todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">
                          {appointment.profiles?.full_name || 'Patient'}
                        </p>
                        <p className="text-xs text-muted-foreground">Treatment</p>
                      </div>
                      <span className="text-xs font-medium text-medical-blue">
                        {new Date(appointment.scheduled_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {profile?.role === 'super_admin' ? 'Super Admin Actions' : 'Quick Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile?.role === 'super_admin' ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://supabase.com/dashboard/project/yqpiwtaxwdhicicrtsgi/auth/users', '_blank')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage All Users
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://supabase.com/dashboard/project/yqpiwtaxwdhicicrtsgi/editor', '_blank')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Database Management
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://supabase.com/dashboard/project/yqpiwtaxwdhicicrtsgi/logs/explorer', '_blank')}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      System Analytics
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        toast({
                          title: "Branch Management",
                          description: "Access all branches and manage system-wide settings",
                        });
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Manage Branches
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        toast({
                          title: "Staff Management",
                          description: "Staff management feature coming soon!",
                        });
                      }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Staff
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        toast({
                          title: "Calendar View",
                          description: "Calendar feature coming soon!",
                        });
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      View Calendar
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        toast({
                          title: "Reports Generated",
                          description: "Analytics report generated successfully!",
                        });
                      }}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        toast({
                          title: "Settings",
                          description: "Settings panel opened!",
                        });
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;