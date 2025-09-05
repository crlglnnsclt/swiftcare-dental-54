import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Clock, 
  DollarSign, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface StaffProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  enhanced_role: string;
  is_active: boolean;
  phone?: string;
  hire_date?: string;
}

interface Timesheet {
  id: string;
  staff_id: string;
  date: string;
  hours_worked: number;
  status: 'pending' | 'approved' | 'rejected';
  staff_name: string;
  approver_name?: string;
  updated_at: string;
}

interface PayrollRecord {
  id: string;
  staff_id: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  net_pay: number;
  status: 'draft' | 'approved' | 'paid';
  staff_name: string;
}

export default function StaffManagement() {
  const { profile } = useAuth();
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      await Promise.all([
        fetchStaff(),
        fetchTimesheets(),
        fetchPayroll()
      ]);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      // Query users table for staff members (not profiles)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'patient')
        .order('full_name');

      if (error) throw error;
      
      // Map to StaffProfile format
      const mappedStaff = (data || []).map(user => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        enhanced_role: user.role, // Use role as enhanced_role
        is_active: user.status === 'active',
        phone: user.phone || undefined,
        hire_date: user.created_at
      }));

      setStaffProfiles(mappedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      // Use mock data if query fails
      setStaffProfiles([]);
    }
  };

  const fetchTimesheets = async () => {
    try {
      // Mock timesheet data since table doesn't exist
      const mockTimesheets: Timesheet[] = [
        {
          id: '1',
          staff_id: '1',
          date: new Date().toISOString().split('T')[0],
          hours_worked: 8,
          status: 'pending',
          staff_name: 'Dr. Smith',
          updated_at: new Date().toISOString()
        }
      ];
      setTimesheets(mockTimesheets);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      setTimesheets([]);
    }
  };

  const fetchPayroll = async () => {
    try {
      // Mock payroll data since table doesn't exist
      const mockPayroll: PayrollRecord[] = [
        {
          id: '1',
          staff_id: '1',
          pay_period_start: '2024-01-01',
          pay_period_end: '2024-01-15',
          gross_pay: 5000,
          net_pay: 4000,
          status: 'approved',
          staff_name: 'Dr. Smith'
        }
      ];
      setPayrollRecords(mockPayroll);
    } catch (error) {
      console.error('Error fetching payroll:', error);
      setPayrollRecords([]);
    }
  };

  const filteredStaff = staffProfiles.filter(staff =>
    staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'inactive':
      case 'rejected':
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'clinic_admin':
      case 'super_admin':
        return 'destructive';
      case 'dentist':
        return 'default';
      case 'staff':
      case 'receptionist':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Loading staff management...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff profiles, timesheets, and payroll</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create a new staff member profile
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dentist">Dentist</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="clinic_admin">Clinic Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Create Staff Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Profiles</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Staff Members ({filteredStaff.length})
              </CardTitle>
              <CardDescription>
                Manage staff profiles and access levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{staff.full_name}</p>
                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {staff.hire_date ? new Date(staff.hire_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={getRoleColor(staff.role)}>
                        {staff.role.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getStatusColor(staff.is_active ? 'active' : 'inactive')}>
                        {staff.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredStaff.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No staff members found matching your search' : 'No staff members found'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timesheets ({timesheets.length})
              </CardTitle>
              <CardDescription>
                Track and approve staff working hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {timesheets.map((timesheet) => (
                <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{timesheet.staff_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(timesheet.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Hours: {timesheet.hours_worked}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(timesheet.status)}>
                      {timesheet.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                </div>
              ))}

              {timesheets.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No timesheets submitted</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payroll Records ({payrollRecords.length})
              </CardTitle>
              <CardDescription>
                Manage staff compensation and payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {payrollRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{record.staff_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Period: {new Date(record.pay_period_start).toLocaleDateString()} - {new Date(record.pay_period_end).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Gross: ${record.gross_pay} | Net: ${record.net_pay}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}

              {payrollRecords.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No payroll records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}