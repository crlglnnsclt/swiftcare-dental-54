import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Send, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  role: 'staff' | 'dentist' | 'receptionist' | 'clinic_admin' | 'super_admin';
  clinic_id: string;
  branch_id?: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  clinics?: {
    clinic_name: string;
  };
}

interface Clinic {
  id: string;
  clinic_name: string;
  parent_clinic_id?: string;
}

export function StaffInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'staff',
    clinicId: '',
    branchId: ''
  });

  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'clinic_admin' || profile?.role === 'super_admin') {
      fetchInvitations();
      fetchClinics();
    }
  }, [profile]);

  const fetchInvitations = async () => {
    try {
      let query = supabase
        .from('user_invitations')
        .select(`
          *,
          clinics:clinic_id (
            clinic_name
          )
        `)
        .order('created_at', { ascending: false });

      // Clinic admins can only see their clinic's invitations
      if (profile?.role === 'clinic_admin') {
        query = query.eq('clinic_id', profile.clinic_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvitations((data || []) as any);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    }
  };

  const fetchClinics = async () => {
    try {
      let query = supabase
        .from('clinics')
        .select('id, clinic_name, parent_clinic_id')
        .order('clinic_name');

      // Clinic admins can only see their clinic and its branches
      if (profile?.role === 'clinic_admin') {
        query = query.or(`id.eq.${profile.clinic_id},parent_clinic_id.eq.${profile.clinic_id}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const sendInvitation = async () => {
    if (!formData.email || !formData.role || !formData.clinicId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate invitation token
      const invitationToken = crypto.randomUUID();

      const { error } = await supabase
        .from('user_invitations')
        .insert({
          email: formData.email,
          role: formData.role as any,
          clinic_id: formData.clinicId,
          branch_id: formData.branchId || null,
          invitation_token: invitationToken,
          created_by: profile?.user_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      setFormData({
        email: '',
        role: 'staff',
        clinicId: '',
        branchId: ''
      });
      setShowDialog(false);
      fetchInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Extend for 7 more days
        })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation extended successfully",
      });

      fetchInvitations();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (invitation: Invitation) => {
    if (invitation.accepted_at) {
      return <Badge className="bg-success text-success-foreground">Accepted</Badge>;
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    return <Badge variant="secondary">Pending</Badge>;
  };

  const getStatusIcon = (invitation: Invitation) => {
    if (invitation.accepted_at) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <XCircle className="w-4 h-4 text-destructive" />;
    }
    
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  if (profile?.role !== 'clinic_admin' && profile?.role !== 'super_admin') {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Staff Invitations</CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="medical-gradient text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="dentist">Dentist</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    {profile?.role === 'super_admin' && (
                      <SelectItem value="clinic_admin">Clinic Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic">Clinic</Label>
                <Select value={formData.clinicId} onValueChange={(value) => setFormData({ ...formData, clinicId: value, branchId: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select clinic" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.filter(c => !c.parent_clinic_id).map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.clinic_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.clinicId && (
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch (Optional)</Label>
                  <Select value={formData.branchId} onValueChange={(value) => setFormData({ ...formData, branchId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.filter(c => c.parent_clinic_id === formData.clinicId).map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.clinic_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowDialog(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={sendInvitation} disabled={isLoading} className="flex-1 medical-gradient text-white">
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">{invitation.email}</TableCell>
                <TableCell className="capitalize">{invitation.role.replace('_', ' ')}</TableCell>
                <TableCell>{invitation.clinics?.clinic_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invitation)}
                    {getStatusBadge(invitation)}
                  </div>
                </TableCell>
                <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {!invitation.accepted_at && new Date(invitation.expires_at) < new Date() && (
                    <Button
                      onClick={() => resendInvitation(invitation.id)}
                      size="sm"
                      variant="outline"
                    >
                      Resend
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {invitations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No invitations sent yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}