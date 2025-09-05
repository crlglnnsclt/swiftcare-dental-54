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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertTriangle,
  UserCog,
  Settings,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Crown,
  Stethoscope
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
    if (profile?.role === 'super_admin' || profile?.role === 'admin') {
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
        .from('users')
        .select(`
          *,
          clinics (
            clinic_name
          )
        `)
        .order('created_at', { ascending: false });

      // No longer filtering by clinic_id since we removed multi-clinic support

      const { data, error } = await query;
      if (error) throw error;
      
      // Map users data to UserProfile format
      const mappedUsers = (data || []).map(user => ({
        id: user.id,
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        enhanced_role: user.role, // Use role as enhanced_role
        branch_id: null, // No longer using clinic_id
        phone: user.phone,
        is_active: user.status === 'active',
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
      
      setUsers(mappedUsers);
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
        .from('clinics')
        .select('id, clinic_name')
        .order('clinic_name');

      if (error) throw error;
      setBranches(data?.map(clinic => ({
        id: clinic.id,
        name: clinic.clinic_name
      })) || []);
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
      // Mock invitations since user_invitations table doesn't exist
      // TODO: Implement actual invitation functionality when table is created
      
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
        .from('users')
        .update({
          full_name: editData.full_name,
          phone: editData.phone,
          role: editData.role as any,
          status: editData.is_active ? 'active' : 'inactive'
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
        .from('users')
        .update({ status: 'inactive' })
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

  // SwiftCare role configuration
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return Crown;
      case 'admin': return Shield;
      case 'dentist': return Stethoscope;
      case 'staff': return UserCog;
      case 'patient': return Users;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-yellow-600';
      case 'admin': return 'text-medical-blue';
      case 'dentist': return 'text-dental-mint';
      case 'staff': return 'text-professional-navy';
      case 'patient': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
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

  if (profile?.role !== 'super_admin' && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 page-container flex items-center justify-center">
        <Card className="card-3d bg-card/80 backdrop-blur-sm border-2 border-border/50 max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto text-medical-blue mb-4 float-gentle" />
            <CardTitle className="text-2xl font-bold text-foreground">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              You need admin privileges to access user management in SwiftCare.
            </p>
            <Button className="w-full btn-3d medical-gradient" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 page-container flex items-center justify-center">
        <Card className="card-3d bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-medical-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading SwiftCare users...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 page-container">
      <div className="p-4 md:p-6 space-y-6">
        {/* Enhanced SwiftCare Header */}
        <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 border border-border/40 card-3d">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="card-stagger-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-medical-blue/10 rounded-xl">
                  <Users className="w-8 h-8 text-medical-blue" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">SwiftCare Team</h1>
                  <p className="text-muted-foreground">Manage users, roles, and access control</p>
                </div>
              </div>
              {profile?.role === 'super_admin' && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Crown className="w-3 h-3 mr-1" />
                  Super Admin Access
                </Badge>
              )}
            </div>
            
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button className="btn-3d medical-gradient shadow-lg hover:shadow-xl smooth-transition">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-medical-blue" />
                    Invite New Team Member
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invite-email">Email Address *</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                      placeholder="user@swiftcare.com"
                      className="btn-3d mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invite-name">Full Name *</Label>
                    <Input
                      id="invite-name"
                      value={inviteData.fullName}
                      onChange={(e) => setInviteData({...inviteData, fullName: e.target.value})}
                      placeholder="John Smith"
                      className="btn-3d mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invite-role">Role & Access Level *</Label>
                    <Select value={inviteData.enhancedRole} onValueChange={(value) => setInviteData({...inviteData, enhancedRole: value, role: value === 'super_admin' ? 'admin' : value})}>
                      <SelectTrigger className="btn-3d mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="staff">
                          <div className="flex items-center gap-2">
                            <UserCog className="w-4 h-4 text-professional-navy" />
                            <span>Staff Member</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dentist">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-dental-mint" />
                            <span>Dentist</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-medical-blue" />
                            <span>Branch Admin</span>
                          </div>
                        </SelectItem>
                        {profile?.role === 'super_admin' && (
                          <SelectItem value="super_admin">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-yellow-600" />
                              <span>Super Admin</span>
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="invite-branch">SwiftCare Branch</Label>
                    <Select value={inviteData.branchId} onValueChange={(value) => setInviteData({...inviteData, branchId: value})}>
                      <SelectTrigger className="btn-3d mt-2">
                        <SelectValue placeholder="Select clinic branch" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              {branch.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={inviteUser} 
                    className="w-full btn-3d medical-gradient"
                    disabled={!inviteData.email || !inviteData.fullName}
                  >
                    Send SwiftCare Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* SwiftCare Tabs Interface */}
        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass-card p-1">
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Team Members</span>
              <span className="sm:hidden">Team</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
              <span className="sm:hidden">Log</span>
            </TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="team" className="space-y-6">
            {/* Enhanced Search & Filters */}
            <Card className="glass-card card-3d">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search team members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 btn-3d"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-48 btn-3d">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super_admin">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-600" />
                          Super Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-medical-blue" />
                          Branch Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="dentist">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-dental-mint" />
                          Dentist
                        </div>
                      </SelectItem>
                      <SelectItem value="staff">
                        <div className="flex items-center gap-2">
                          <UserCog className="w-4 h-4 text-professional-navy" />
                          Staff
                        </div>
                      </SelectItem>
                      <SelectItem value="patient">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          Patient
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user, index) => {
                const RoleIcon = getRoleIcon(user.enhanced_role || user.role);
                return (
                  <Card key={user.id} className={`card-3d interactive-3d bg-card/90 backdrop-blur-sm border border-border/40 card-stagger-${(index % 4) + 1}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12 ring-2 ring-border/20">
                              <AvatarFallback className={`${getRoleColor(user.enhanced_role || user.role)} text-white font-semibold`} style={{
                                background: user.enhanced_role === 'super_admin' ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                           user.enhanced_role === 'admin' ? 'hsl(var(--medical-blue))' :
                                           user.enhanced_role === 'dentist' ? 'hsl(var(--dental-mint))' :
                                           user.enhanced_role === 'staff' ? 'hsl(var(--professional-navy))' :
                                           'hsl(var(--muted))'
                              }}>
                                {user.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-background border-2 border-border/20`}>
                              <RoleIcon className={`w-3 h-3 ${getRoleColor(user.enhanced_role || user.role)}`} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg font-semibold">
                                {user.full_name || 'Unknown User'}
                              </CardTitle>
                              {user.enhanced_role === 'super_admin' && (
                                <Crown className="w-4 h-4 text-yellow-600" />
                              )}
                            </div>
                            <Badge 
                              variant={getRoleBadgeVariant(user.enhanced_role || user.role)}
                              className="text-xs"
                            >
                              {user.enhanced_role?.replace('_', ' ') || user.role}
                            </Badge>
                            {!user.is_active && (
                              <Badge variant="secondary" className="ml-2 text-xs">Inactive</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openViewModal(user)}
                            className="h-8 w-8 p-0 hover:bg-medical-blue/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditModal(user)}
                            className="h-8 w-8 p-0 hover:bg-dental-mint/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteUser(user.id, user.full_name || 'User')}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.branches?.name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{user.branches.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openViewModal(user)}
                          className="flex-1 btn-3d text-xs"
                        >
                          View Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditModal(user)}
                          className="btn-3d px-3 text-xs"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* No Users */}
            {filteredUsers.length === 0 && (
              <Card className="card-3d bg-card/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 float-gentle" />
                  <h3 className="text-xl font-semibold mb-2">No Team Members Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || roleFilter !== 'all' 
                      ? 'No users match your current filters.' 
                      : 'No team members have been added to SwiftCare yet.'
                    }
                  </p>
                  {(!searchTerm && roleFilter === 'all') && (
                    <Button onClick={() => setIsInviteOpen(true)} className="btn-3d medical-gradient">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite First Team Member
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Enhanced Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-card card-3d interactive-3d">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="w-5 h-5 text-yellow-600 mr-2" />
                    <Shield className="w-5 h-5 text-medical-blue" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{users.filter(u => u.enhanced_role === 'admin' || u.enhanced_role === 'super_admin').length}</div>
                  <div className="text-sm text-muted-foreground">Admins</div>
                </CardContent>
              </Card>
              <Card className="glass-card card-3d interactive-3d">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Stethoscope className="w-5 h-5 text-dental-mint" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{users.filter(u => u.enhanced_role === 'dentist').length}</div>
                  <div className="text-sm text-muted-foreground">Dentists</div>
                </CardContent>
              </Card>
              <Card className="glass-card card-3d interactive-3d">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <UserCog className="w-5 h-5 text-professional-navy" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{users.filter(u => u.enhanced_role === 'staff').length}</div>
                  <div className="text-sm text-muted-foreground">Staff</div>
                </CardContent>
              </Card>
              <Card className="glass-card card-3d interactive-3d">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{users.filter(u => u.enhanced_role === 'patient').length}</div>
                  <div className="text-sm text-muted-foreground">Patients</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card card-3d">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-medical-blue" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{users.filter(u => u.is_active).length}</div>
                  <p className="text-muted-foreground text-sm">Currently active in system</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card card-3d">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-dental-mint" />
                    Recent Joins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {users.filter(u => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(u.created_at) > weekAgo;
                    }).length}
                  </div>
                  <p className="text-muted-foreground text-sm">Joined this week</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card card-3d">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-professional-navy" />
                    Branches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{branches.length}</div>
                  <p className="text-muted-foreground text-sm">Active clinic locations</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="glass-card card-3d">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-medical-blue" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated profile • {new Date(user.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Edit User Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-medical-blue" />
                Edit Team Member
              </DialogTitle>
            </DialogHeader>
            {editData && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editData.full_name || ''}
                    onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                    className="btn-3d mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="btn-3d mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Role & Access Level *</Label>
                  <Select 
                    value={editData.enhanced_role || editData.role} 
                    onValueChange={(value) => setEditData({
                      ...editData, 
                      enhanced_role: value,
                      role: value === 'super_admin' ? 'admin' : value
                    })}
                  >
                    <SelectTrigger className="btn-3d mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="staff">
                        <div className="flex items-center gap-2">
                          <UserCog className="w-4 h-4 text-professional-navy" />
                          <span>Staff Member</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dentist">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-dental-mint" />
                          <span>Dentist</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-medical-blue" />
                          <span>Branch Admin</span>
                        </div>
                      </SelectItem>
                      {profile?.role === 'super_admin' && (
                        <SelectItem value="super_admin">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-yellow-600" />
                            <span>Super Admin</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-branch">SwiftCare Branch</Label>
                  <Select 
                    value={editData.branch_id || ''} 
                    onValueChange={(value) => setEditData({...editData, branch_id: value})}
                  >
                    <SelectTrigger className="btn-3d mt-2">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {branch.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-muted/20 rounded-lg">
                  <Switch
                    id="edit-active"
                    checked={editData.is_active}
                    onCheckedChange={(checked) => setEditData({...editData, is_active: checked})}
                  />
                  <Label htmlFor="edit-active" className="font-medium">Active Team Member</Label>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={updateUser} 
                    className="flex-1 btn-3d medical-gradient"
                    disabled={!editData.full_name}
                  >
                    Update Member
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditOpen(false)}
                    className="flex-1 btn-3d"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Enhanced View User Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-medical-blue" />
                Team Member Profile
              </DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-medical-blue/10 to-dental-mint/10 rounded-xl">
                  <Avatar className="w-16 h-16 ring-2 ring-border/20">
                    <AvatarFallback className="text-lg font-semibold" style={{
                      background: selectedUser.enhanced_role === 'super_admin' ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                 selectedUser.enhanced_role === 'admin' ? 'hsl(var(--medical-blue))' :
                                 selectedUser.enhanced_role === 'dentist' ? 'hsl(var(--dental-mint))' :
                                 selectedUser.enhanced_role === 'staff' ? 'hsl(var(--professional-navy))' :
                                 'hsl(var(--muted))',
                      color: 'white'
                    }}>
                      {selectedUser.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {selectedUser.full_name}
                      {selectedUser.enhanced_role === 'super_admin' && (
                        <Crown className="w-4 h-4 text-yellow-600" />
                      )}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <Badge className={`text-xs ${
                        selectedUser.enhanced_role === 'super_admin' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        selectedUser.enhanced_role === 'admin' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        selectedUser.enhanced_role === 'dentist' ? 'bg-green-100 text-green-800 border-green-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {selectedUser.enhanced_role?.replace('_', ' ') || selectedUser.role}
                      </Badge>
                      {!selectedUser.is_active && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                        <p className="text-sm">{selectedUser.email}</p>
                      </div>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                          <p className="text-sm">{selectedUser.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedUser.branches?.name && (
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">SwiftCare Branch</Label>
                          <p className="text-sm">{selectedUser.branches.name}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Member Since</Label>
                        <p className="text-sm">
                          {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setIsViewOpen(false)}
                  className="w-full btn-3d"
                  variant="outline"
                >
                  Close Profile
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}