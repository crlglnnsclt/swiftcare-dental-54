import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Users, Clock, DollarSign, Plus, Calendar as CalendarIcon, Check, X, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface StaffProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  enhanced_role: string;
  phone?: string;
  is_active: boolean;
  branch_id?: string;
  created_at: string;
}

interface Timesheet {
  id: string;
  staff_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  total_hours?: number;
  overtime_hours?: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  branch_id?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  staff_name?: string;
  approver_name?: string;
}

interface PayrollRecord {
  id: string;
  staff_id: string;
  pay_period_start: string;
  pay_period_end: string;
  base_salary?: number;
  overtime_hours?: number;
  overtime_rate?: number;
  bonus?: number;
  deductions?: number;
  total_gross?: number;
  total_net?: number;
  status: 'draft' | 'approved' | 'paid';
  approved_by?: string;
  approved_at?: string;
  branch_id?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  staff_name?: string;
}

export function StaffManagement() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('staff');
  
  // State
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  
  // Form state
  const [timesheetForm, setTimesheetForm] = useState({
    staff_id: '',
    date: new Date().toISOString().split('T')[0],
    clock_in: '',
    clock_out: '',
    break_start: '',
    break_end: '',
    notes: '',
  });

  const [payrollForm, setPayrollForm] = useState({
    staff_id: '',
    pay_period_start: '',
    pay_period_end: '',
    base_salary: '',
    overtime_hours: '',
    overtime_rate: '',
    bonus: '',
    deductions: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch staff profiles
      const { data: staffData, error: staffError } = await supabase
        .from('profiles')
        .select('*')
        .in('enhanced_role', ['staff', 'dentist', 'admin'])
        .eq('is_active', true)
        .order('full_name');

      if (staffError) throw staffError;
      setStaff(staffData || []);

      // Fetch recent timesheets
      const { data: timesheetsData, error: timesheetsError } = await supabase
        .from('timesheets')
        .select(`
          *,
          profiles!timesheets_staff_id_fkey(full_name)
        `)
        .order('date', { ascending: false })
        .limit(50);

      if (timesheetsError) throw timesheetsError;
      
      const formattedTimesheets = timesheetsData?.map(timesheet => ({
        ...timesheet,
        status: timesheet.status as 'pending' | 'approved' | 'rejected',
        staff_name: timesheet.profiles?.full_name,
        approver_name: undefined,
      })) || [];
      
      setTimesheets(formattedTimesheets);

      // Fetch payroll records
      const { data: payrollData, error: payrollError } = await supabase
        .from('payroll_records')
        .select(`
          *,
          staff:profiles!payroll_records_staff_id_fkey(full_name)
        `)
        .order('pay_period_end', { ascending: false })
        .limit(50);

      if (payrollError) throw payrollError;
      
      const formattedPayroll = payrollData?.map(record => ({
        ...record,
        status: record.status as 'draft' | 'approved' | 'paid',
        staff_name: record.staff?.full_name,
      })) || [];
      
      setPayrollRecords(formattedPayroll);

    } catch (error) {
      console.error('Error fetching staff data:', error);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = (clockIn: string, clockOut: string, breakStart?: string, breakEnd?: string): number => {
    if (!clockIn || !clockOut) return 0;

    const start = new Date(`1970-01-01T${clockIn}:00`);
    const end = new Date(`1970-01-01T${clockOut}:00`);
    let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    // Subtract break time
    if (breakStart && breakEnd) {
      const breakStartTime = new Date(`1970-01-01T${breakStart}:00`);
      const breakEndTime = new Date(`1970-01-01T${breakEnd}:00`);
      const breakMinutes = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60);
      totalMinutes -= breakMinutes;
    }

    return Math.max(0, totalMinutes / 60);
  };

  const saveTimesheet = async () => {
    if (!timesheetForm.staff_id || !timesheetForm.date) {
      toast.error('Staff member and date are required');
      return;
    }

    try {
      const totalHours = calculateTotalHours(
        timesheetForm.clock_in,
        timesheetForm.clock_out,
        timesheetForm.break_start,
        timesheetForm.break_end
      );

      const overtimeHours = Math.max(0, totalHours - 8); // Overtime after 8 hours

      const timesheetData = {
        staff_id: timesheetForm.staff_id,
        date: timesheetForm.date,
        clock_in: timesheetForm.clock_in || null,
        clock_out: timesheetForm.clock_out || null,
        break_start: timesheetForm.break_start || null,
        break_end: timesheetForm.break_end || null,
        total_hours: totalHours,
        overtime_hours: overtimeHours,
        notes: timesheetForm.notes || null,
        status: 'pending',
        branch_id: profile?.branch_id,
      };

      const { error } = await supabase
        .from('timesheets')
        .insert(timesheetData);
      
      if (error) throw error;

      toast.success('Timesheet created successfully');
      setIsTimesheetModalOpen(false);
      resetTimesheetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving timesheet:', error);
      toast.error('Failed to save timesheet');
    }
  };

  const approveTimesheet = async (timesheetId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .update({
          status: approve ? 'approved' : 'rejected',
          approved_by: profile?.id,
        })
        .eq('id', timesheetId);

      if (error) throw error;

      toast.success(`Timesheet ${approve ? 'approved' : 'rejected'}`);
      fetchData();
    } catch (error) {
      console.error('Error updating timesheet:', error);
      toast.error('Failed to update timesheet');
    }
  };

  const generatePayroll = async () => {
    if (!payrollForm.staff_id || !payrollForm.pay_period_start || !payrollForm.pay_period_end) {
      toast.error('Staff member and pay period are required');
      return;
    }

    try {
      const baseSalary = parseFloat(payrollForm.base_salary) || 0;
      const overtimeHours = parseFloat(payrollForm.overtime_hours) || 0;
      const overtimeRate = parseFloat(payrollForm.overtime_rate) || 0;
      const bonus = parseFloat(payrollForm.bonus) || 0;
      const deductions = parseFloat(payrollForm.deductions) || 0;
      
      const overtimePay = overtimeHours * overtimeRate;
      const totalGross = baseSalary + overtimePay + bonus;
      const totalNet = totalGross - deductions;

      const payrollData = {
        staff_id: payrollForm.staff_id,
        pay_period_start: payrollForm.pay_period_start,
        pay_period_end: payrollForm.pay_period_end,
        base_salary: baseSalary,
        overtime_hours: overtimeHours,
        overtime_rate: overtimeRate,
        bonus: bonus,
        deductions: deductions,
        total_gross: totalGross,
        total_net: totalNet,
        status: 'draft',
        branch_id: profile?.branch_id,
      };

      const { error } = await supabase
        .from('payroll_records')
        .insert(payrollData);
      
      if (error) throw error;

      toast.success('Payroll record created successfully');
      setIsPayrollModalOpen(false);
      resetPayrollForm();
      fetchData();
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast.error('Failed to generate payroll');
    }
  };

  const resetTimesheetForm = () => {
    setTimesheetForm({
      staff_id: '',
      date: new Date().toISOString().split('T')[0],
      clock_in: '',
      clock_out: '',
      break_start: '',
      break_end: '',
      notes: '',
    });
  };

  const resetPayrollForm = () => {
    setPayrollForm({
      staff_id: '',
      pay_period_start: '',
      pay_period_end: '',
      base_salary: '',
      overtime_hours: '',
      overtime_rate: '',
      bonus: '',
      deductions: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Loading staff data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff, timesheets, and payroll</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <h2 className="text-xl font-semibold">Staff Members</h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        {member.full_name}
                      </CardTitle>
                      <CardDescription>{member.email}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {member.enhanced_role?.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    {member.phone && <p><strong>Phone:</strong> {member.phone}</p>}
                    <p><strong>Status:</strong> {member.is_active ? 'Active' : 'Inactive'}</p>
                    <p><strong>Joined:</strong> {new Date(member.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timesheets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Timesheets</h2>
            <Button onClick={() => setIsTimesheetModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Timesheet
            </Button>
          </div>

          <div className="space-y-2">
            {timesheets.map((timesheet) => (
              <Card key={timesheet.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{timesheet.staff_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(timesheet.date).toLocaleDateString()}
                        {timesheet.clock_in && timesheet.clock_out && (
                          <span> • {timesheet.clock_in} - {timesheet.clock_out}</span>
                        )}
                        {timesheet.total_hours && (
                          <span> • {timesheet.total_hours.toFixed(1)}h</span>
                        )}
                      </p>
                      {timesheet.notes && (
                        <p className="text-sm text-muted-foreground italic">{timesheet.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        timesheet.status === 'approved' ? 'default' : 
                        timesheet.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {timesheet.status}
                      </Badge>
                      {timesheet.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveTimesheet(timesheet.id, true)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveTimesheet(timesheet.id, false)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payroll Records</h2>
            <Button onClick={() => setIsPayrollModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Payroll
            </Button>
          </div>

          <div className="space-y-2">
            {payrollRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{record.staff_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.pay_period_start).toLocaleDateString()} - {new Date(record.pay_period_end).toLocaleDateString()}
                        {record.total_net && (
                          <span> • Net: ${record.total_net.toFixed(2)}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        record.status === 'paid' ? 'default' : 
                        record.status === 'approved' ? 'secondary' : 'outline'
                      }>
                        {record.status}
                      </Badge>
                      {record.total_gross && (
                        <div className="text-right">
                          <p className="text-sm font-medium">${record.total_gross.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Gross</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Timesheet Modal */}
      <Dialog open={isTimesheetModalOpen} onOpenChange={setIsTimesheetModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Timesheet</DialogTitle>
            <DialogDescription>
              Record staff working hours
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="timesheetStaff">Staff Member *</Label>
              <Select
                value={timesheetForm.staff_id}
                onValueChange={(value) => setTimesheetForm(prev => ({ ...prev, staff_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timesheetDate">Date *</Label>
              <Input
                id="timesheetDate"
                type="date"
                value={timesheetForm.date}
                onChange={(e) => setTimesheetForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="clockIn">Clock In</Label>
                <Input
                  id="clockIn"
                  type="time"
                  value={timesheetForm.clock_in}
                  onChange={(e) => setTimesheetForm(prev => ({ ...prev, clock_in: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="clockOut">Clock Out</Label>
                <Input
                  id="clockOut"
                  type="time"
                  value={timesheetForm.clock_out}
                  onChange={(e) => setTimesheetForm(prev => ({ ...prev, clock_out: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="breakStart">Break Start</Label>
                <Input
                  id="breakStart"
                  type="time"
                  value={timesheetForm.break_start}
                  onChange={(e) => setTimesheetForm(prev => ({ ...prev, break_start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="breakEnd">Break End</Label>
                <Input
                  id="breakEnd"
                  type="time"
                  value={timesheetForm.break_end}
                  onChange={(e) => setTimesheetForm(prev => ({ ...prev, break_end: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="timesheetNotes">Notes</Label>
              <Input
                id="timesheetNotes"
                value={timesheetForm.notes}
                onChange={(e) => setTimesheetForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>

            {timesheetForm.clock_in && timesheetForm.clock_out && (
              <div className="text-sm text-muted-foreground">
                Total Hours: {calculateTotalHours(
                  timesheetForm.clock_in,
                  timesheetForm.clock_out,
                  timesheetForm.break_start,
                  timesheetForm.break_end
                ).toFixed(1)}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsTimesheetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveTimesheet}>Add Timesheet</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Payroll Modal */}
      <Dialog open={isPayrollModalOpen} onOpenChange={setIsPayrollModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
            <DialogDescription>
              Create a new payroll record for a staff member
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="payrollStaff">Staff Member *</Label>
              <Select
                value={payrollForm.staff_id}
                onValueChange={(value) => setPayrollForm(prev => ({ ...prev, staff_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="payPeriodStart">Pay Period Start *</Label>
                <Input
                  id="payPeriodStart"
                  type="date"
                  value={payrollForm.pay_period_start}
                  onChange={(e) => setPayrollForm(prev => ({ ...prev, pay_period_start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="payPeriodEnd">Pay Period End *</Label>
                <Input
                  id="payPeriodEnd"
                  type="date"
                  value={payrollForm.pay_period_end}
                  onChange={(e) => setPayrollForm(prev => ({ ...prev, pay_period_end: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="baseSalary">Base Salary</Label>
              <Input
                id="baseSalary"
                type="number"
                step="0.01"
                value={payrollForm.base_salary}
                onChange={(e) => setPayrollForm(prev => ({ ...prev, base_salary: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="overtimeHours">Overtime Hours</Label>
                <Input
                  id="overtimeHours"
                  type="number"
                  step="0.1"
                  value={payrollForm.overtime_hours}
                  onChange={(e) => setPayrollForm(prev => ({ ...prev, overtime_hours: e.target.value }))}
                  placeholder="0.0"
                />
              </div>
              <div>
                <Label htmlFor="overtimeRate">Overtime Rate</Label>
                <Input
                  id="overtimeRate"
                  type="number"
                  step="0.01"
                  value={payrollForm.overtime_rate}
                  onChange={(e) => setPayrollForm(prev => ({ ...prev, overtime_rate: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="bonus">Bonus</Label>
                <Input
                  id="bonus"
                  type="number"
                  step="0.01"
                  value={payrollForm.bonus}
                  onChange={(e) => setPayrollForm(prev => ({ ...prev, bonus: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="deductions">Deductions</Label>
                <Input
                  id="deductions"
                  type="number"
                  step="0.01"
                  value={payrollForm.deductions}
                  onChange={(e) => setPayrollForm(prev => ({ ...prev, deductions: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsPayrollModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={generatePayroll}>Generate Payroll</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}