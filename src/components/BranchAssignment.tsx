import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Building2, 
  Edit, 
  Search,
  Filter,
  Eye,
  EyeOff,
  UserCheck,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  clinic_id?: string;
  created_at: string;
}

interface Branch {
  id: string;
  clinic_name: string;
  address?: string;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

export function BranchAssignment() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    clinic_id: '',
    role: '',
    permissions: [] as string[]
  });

  const permissions: Permission[] = [
    { id: 'view_all_patients', name: 'View All Patients', description: 'Access to view all patient records in the clinic' },
    { id: 'manage_appointments', name: 'Manage Appointments', description: 'Create, edit, and delete appointments' },
    { id: 'access_financial_reports', name: 'Financial Reports', description: 'View revenue and financial analytics' },
    { id: 'manage_inventory', name: 'Manage Inventory', description: 'Add, edit, and track inventory items' },
    { id: 'manage_staff', name: 'Manage Staff', description: 'Add, edit, and manage staff members' },
    { id: 'view_analytics', name: 'View Analytics', description: 'Access to clinic analytics and reports' },
    { id: 'manage_forms', name: 'Manage Forms', description: 'Create and edit digital forms' },
    { id: 'access_chat', name: 'Access Messaging', description: 'Use internal messaging system' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, branchFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Users fetch error:', usersError);
        throw usersError;
      }

      // Fetch all clinics
      const { data: clinicsData, error: clinicsError } = await supabase
        .from('clinics')
        .select('*')
        .order('clinic_name');

      if (clinicsError) {
        console.error('Clinics fetch error:', clinicsError);
        throw clinicsError;
      }

      setUsers(usersData || []);
      setBranches(clinicsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Branch filter
    if (branchFilter !== 'all') {
      if (branchFilter === 'unassigned') {
        filtered = filtered.filter(user => !user.clinic_id);
      } else {
        filtered = filtered.filter(user => user.clinic_id === branchFilter);
      }
    }

    setFilteredUsers(filtered);
  };

  const openAssignmentDialog = (user: User) => {
    setSelectedUser(user);
    setAssignmentForm({
      clinic_id: user.clinic_id || '',
      role: user.role || '',
      permissions: [] // Would fetch from a user_permissions table
    });
    setIsAssignmentOpen(true);
  };

  const handleAssignUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData = {
        clinic_id: assignmentForm.clinic_id === 'unassigned' ? null : assignmentForm.clinic_id || null,
        role: assignmentForm.role as 'patient' | 'clinic_admin' | 'staff' | 'dentist' | 'receptionist' | 'super_admin',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('User assignment updated successfully');
      setIsAssignmentOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating user assignment:', error);
      toast.error(`Failed to update user assignment: ${error.message}`);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'clinic_admin': return 'bg-red-100 text-red-800';
      case 'dentist': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'receptionist': return 'bg-yellow-100 text-yellow-800';
      case 'patient': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="glass-card card-3d">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card card-3d interactive-3d">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 float-gentle" />
            Clinic Assignment Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Assign users to clinics and manage their permissions
          </p>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="clinic_admin">Clinic Admin</SelectItem>
                <SelectItem value="dentist">Dentist</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by clinic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clinics</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.clinic_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredUsers.map((user, index) => (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 smooth-transition card-3d interactive-3d card-stagger-${(index % 4) + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center text-white font-semibold text-sm float-gentle">
                      {user.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role?.replace('_', ' ').toLowerCase()}
                    </Badge>
                    
                    {user.clinic_id ? (
                      <Badge variant="outline" className="text-xs">
                        {branches.find(b => b.id === user.clinic_id)?.clinic_name || 'Unknown Clinic'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Unassigned
                      </Badge>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAssignmentDialog(user)}
                      className="btn-3d"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found matching your filters</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentOpen} onOpenChange={setIsAssignmentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Assign User to Clinic
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center text-white font-semibold">
                  {selectedUser.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{selectedUser.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              {/* Assignment Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clinic">Clinic Assignment</Label>
                  <Select 
                    value={assignmentForm.clinic_id} 
                    onValueChange={(value) => setAssignmentForm({...assignmentForm, clinic_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No Clinic (Unassigned)</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.clinic_name} {branch.address && `- ${branch.address}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={assignmentForm.role} 
                    onValueChange={(value) => setAssignmentForm({...assignmentForm, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="dentist">Dentist</SelectItem>
                      <SelectItem value="clinic_admin">Clinic Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissions */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Clinic Permissions</Label>
                  <div className="space-y-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={permission.id}
                          checked={assignmentForm.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAssignmentForm({
                                ...assignmentForm,
                                permissions: [...assignmentForm.permissions, permission.id]
                              });
                            } else {
                              setAssignmentForm({
                                ...assignmentForm,
                                permissions: assignmentForm.permissions.filter(p => p !== permission.id)
                              });
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleAssignUser} className="flex-1 btn-3d">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Update Assignment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAssignmentOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}