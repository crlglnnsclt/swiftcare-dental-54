import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  UserPlus, 
  Mail, 
  Phone,
  Building2,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  enhanced_role: string | null;
  branch_id: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branches?: {
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

export default function UsersStaff() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const [inviteData, setInviteData] = useState({
    email: '',
    fullName: '',
    role: 'staff',
    enhancedRole: 'staff',
    branchId: ''
  });

  const [editData, setEditData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (profile?.enhanced_role === 'super_admin' || profile?.enhanced_role === 'admin') {
      fetchUsers();
      fetchBranches();
    }
  }, [profile]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          branches (
            name
          )
        `)
        .order('created_at', { ascending: false });

      // If user is branch admin, only show users from their branch
      if (profile?.enhanced_role === 'admin' && profile.branch_id) {
        query = query.eq('branch_id', profile.branch_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.enhanced_role === roleFilter || user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const inviteUser = async () => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .insert({
          email: inviteData.email,
          full_name: inviteData.fullName,
          role: inviteData.role as any,
          enhanced_role: inviteData.enhancedRole as any,
          branch_id: inviteData.branchId || profile?.branch_id,
          invited_by: profile?.id
        });

      if (error) throw error;

      // TODO: Send actual invitation email via edge function
      toast({
        title: "Success",
        description: `Invitation sent to ${inviteData.email}`,
      });

      setIsInviteOpen(false);
      setInviteData({
        email: '',
        fullName: '',
        role: 'staff',
        enhancedRole: 'staff',
        branchId: ''
      });
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    }
  };

  const updateUser = async () => {
    if (!editData) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editData.full_name,
          phone: editData.phone,
          enhanced_role: editData.enhanced_role as any,
          role: editData.role as any,
          branch_id: editData.branch_id,
          is_active: editData.is_active
        })
        .eq('id', editData.id);

      if (error) throw error;

      setUsers(users.map(u => u.id === editData.id ? editData : u));
      setIsEditOpen(false);
      setEditData(null);

      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${userName}? This will prevent them from accessing the system.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, is_active: false } : u));
      
      toast({
        title: "Success",
        description: "User deactivated successfully",
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (user: UserProfile) => {
    setEditData({ ...user });
    setIsEditOpen(true);
  };

  const openViewModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'default';
      case 'admin': return 'default';
      case 'dentist': return 'secondary';
      case 'staff': return 'outline';
      case 'patient': return 'destructive';
      default: return 'outline';
    }
  };

  if (profile?.enhanced_role !== 'super_admin' && profile?.enhanced_role !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need admin privileges to access user management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users & Staff</h1>
          <p className="text-muted-foreground">Manage system users and staff members</p>
        </div>
        
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="medical-gradient text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">Email Address *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="invite-name">Full Name *</Label>
                <Input
                  id="invite-name"
                  value={inviteData.fullName}
                  onChange={(e) => setInviteData({...inviteData, fullName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
                <div>
                  <Label htmlFor="invite-role">Role *</Label>
                  <Select value={inviteData.enhancedRole} onValueChange={(value) => setInviteData({...inviteData, enhancedRole: value, role: value === 'super_admin' ? 'admin' : value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="dentist">Dentist</SelectItem>
                      <SelectItem value="admin">Branch Admin</SelectItem>
                      {profile?.enhanced_role === 'super_admin' && (
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invite-branch">Branch</Label>
                  <Select value={inviteData.branchId} onValueChange={(value) => setInviteData({...inviteData, branchId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={inviteUser} 
                  className="w-full medical-gradient text-white"
                  disabled={!inviteData.email || !inviteData.fullName}
                >
                  Send Invitation
                </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Branch Admin</SelectItem>
                <SelectItem value="dentist">Dentist</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="glass-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-medical-blue text-white">
                      {user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {user.full_name || 'Unknown'}
                      {!user.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </CardTitle>
                    <Badge variant={getRoleBadgeVariant(user.enhanced_role || user.role)}>
                      {user.enhanced_role?.replace('_', ' ') || user.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openViewModal(user)} title="View Details">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} title="Edit User">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteUser(user.id, user.full_name || 'User')}
                    className="text-red-600 hover:text-red-700"
                    title="Deactivate User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.branches?.name && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{user.branches.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Users */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || roleFilter !== 'all' 
                ? 'No users match your current filters.' 
                : 'No users have been added to the system yet.'
              }
            </p>
            {(!searchTerm && roleFilter === 'all') && (
              <Button onClick={() => setIsInviteOpen(true)} className="medical-gradient text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite First User
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{users.filter(u => u.enhanced_role === 'admin' || u.enhanced_role === 'super_admin').length}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{users.filter(u => u.enhanced_role === 'dentist').length}</div>
            <div className="text-sm text-muted-foreground">Dentists</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{users.filter(u => u.enhanced_role === 'staff').length}</div>
            <div className="text-sm text-muted-foreground">Staff</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{users.filter(u => u.enhanced_role === 'patient').length}</div>
            <div className="text-sm text-muted-foreground">Patients</div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={editData.full_name || ''}
                  onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role *</Label>
                <Select 
                  value={editData.enhanced_role || editData.role} 
                  onValueChange={(value) => setEditData({
                    ...editData, 
                    enhanced_role: value,
                    role: value === 'super_admin' ? 'admin' : value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="dentist">Dentist</SelectItem>
                    <SelectItem value="admin">Branch Admin</SelectItem>
                    {profile?.enhanced_role === 'super_admin' && (
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-branch">Branch</Label>
                <Select 
                  value={editData.branch_id || ''} 
                  onValueChange={(value) => setEditData({...editData, branch_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editData.is_active}
                  onCheckedChange={(checked) => setEditData({...editData, is_active: checked})}
                />
                <Label htmlFor="edit-active">Active User</Label>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={updateUser} 
                  className="flex-1 medical-gradient text-white"
                  disabled={!editData.full_name}
                >
                  Update User
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-medical-blue text-white text-lg">
                    {selectedUser.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                  <Badge variant={getRoleBadgeVariant(selectedUser.enhanced_role || selectedUser.role)}>
                    {selectedUser.enhanced_role?.replace('_', ' ') || selectedUser.role}
                  </Badge>
                  {!selectedUser.is_active && (
                    <Badge variant="secondary" className="ml-2">Inactive</Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <Label className="font-medium">Email</Label>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <Label className="font-medium">Phone</Label>
                    <p className="text-muted-foreground">{selectedUser.phone}</p>
                  </div>
                )}
                {selectedUser.branches?.name && (
                  <div>
                    <Label className="font-medium">Branch</Label>
                    <p className="text-muted-foreground">{selectedUser.branches.name}</p>
                  </div>
                )}
                <div>
                  <Label className="font-medium">Created</Label>
                  <p className="text-muted-foreground">
                    {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Last Updated</Label>
                  <p className="text-muted-foreground">
                    {new Date(selectedUser.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => setIsViewOpen(false)}
                className="w-full"
                variant="outline"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}