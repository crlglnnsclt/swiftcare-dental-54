import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Users, UserPlus, Heart, Baby, Crown, UserX } from 'lucide-react';
import { toast } from 'sonner';

interface FamilyAccount {
  id: string;
  primary_patient_name: string;
  primary_patient_id: string;
  primary_contact: string;
  family_members: FamilyMember[];
  total_members: number;
  created_at: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  date_of_birth?: string;
  contact_number?: string;
  is_primary: boolean;
}

export default function FamilyManagement() {
  const [familyAccounts, setFamilyAccounts] = useState<FamilyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    date_of_birth: '',
    contact_number: '',
    primary_patient_id: ''
  });
  const { profile } = useAuth();

  useEffect(() => {
    fetchFamilyAccounts();
  }, []);

  const fetchFamilyAccounts = async () => {
    try {
      // Mock family accounts data
      const mockFamilyAccounts: FamilyAccount[] = [
        {
          id: '1',
          primary_patient_name: 'Maria Santos',
          primary_patient_id: '1',
          primary_contact: '(555) 123-4567',
          total_members: 4,
          created_at: '2024-01-15',
          family_members: [
            {
              id: '1',
              name: 'Maria Santos',
              relationship: 'Primary',
              date_of_birth: '1985-03-15',
              contact_number: '(555) 123-4567',
              is_primary: true
            },
            {
              id: '2',
              name: 'Carlos Santos',
              relationship: 'Spouse',
              date_of_birth: '1983-07-22',
              contact_number: '(555) 123-4568',
              is_primary: false
            },
            {
              id: '3',
              name: 'Ana Santos',
              relationship: 'Daughter',
              date_of_birth: '2010-11-08',
              contact_number: '',
              is_primary: false
            },
            {
              id: '4',
              name: 'Luis Santos',
              relationship: 'Son',
              date_of_birth: '2012-05-30',
              contact_number: '',
              is_primary: false
            }
          ]
        },
        {
          id: '2',
          primary_patient_name: 'David Rodriguez',
          primary_patient_id: '2',
          primary_contact: '(555) 987-6543',
          total_members: 3,
          created_at: '2024-02-10',
          family_members: [
            {
              id: '5',
              name: 'David Rodriguez',
              relationship: 'Primary',
              date_of_birth: '1978-12-03',
              contact_number: '(555) 987-6543',
              is_primary: true
            },
            {
              id: '6',
              name: 'Isabella Rodriguez',
              relationship: 'Daughter',
              date_of_birth: '2008-09-15',
              contact_number: '',
              is_primary: false
            },
            {
              id: '7',
              name: 'Sofia Rodriguez',
              relationship: 'Daughter',
              date_of_birth: '2011-03-28',
              contact_number: '',
              is_primary: false
            }
          ]
        }
      ];

      setFamilyAccounts(mockFamilyAccounts);
    } catch (error) {
      console.error('Error fetching family accounts:', error);
      toast.error('Failed to load family accounts');
    } finally {
      setLoading(false);
    }
  };

  const addFamilyMember = async () => {
    if (!newMember.name.trim() || !newMember.relationship.trim() || !newMember.primary_patient_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // In real implementation, this would create a family member record
      toast.success('Family member added successfully');
      setShowAddDialog(false);
      setNewMember({
        name: '',
        relationship: '',
        date_of_birth: '',
        contact_number: '',
        primary_patient_id: ''
      });
      fetchFamilyAccounts();
    } catch (error) {
      console.error('Error adding family member:', error);
      toast.error('Failed to add family member');
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'primary': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'spouse': case 'husband': case 'wife': return <Heart className="h-4 w-4 text-red-600" />;
      case 'daughter': case 'son': case 'child': return <Baby className="h-4 w-4 text-blue-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const filteredFamilyAccounts = familyAccounts.filter(account =>
    account.primary_patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.family_members.some(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Family Account Management</h1>
          <p className="text-muted-foreground">Manage family accounts and member relationships</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
              <DialogDescription>
                Add a new member to an existing family account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="primary_patient">Primary Patient *</Label>
                <Select value={newMember.primary_patient_id} onValueChange={(value) => setNewMember(prev => ({ ...prev, primary_patient_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyAccounts.map(account => (
                      <SelectItem key={account.id} value={account.primary_patient_id}>
                        {account.primary_patient_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Member Name *</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter family member name"
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Select value={newMember.relationship} onValueChange={(value) => setNewMember(prev => ({ ...prev, relationship: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="son">Son</SelectItem>
                    <SelectItem value="daughter">Daughter</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="brother">Brother</SelectItem>
                    <SelectItem value="sister">Sister</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={newMember.date_of_birth}
                  onChange={(e) => setNewMember(prev => ({ ...prev, date_of_birth: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  value={newMember.contact_number}
                  onChange={(e) => setNewMember(prev => ({ ...prev, contact_number: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addFamilyMember}>
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search family accounts or members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Family Accounts */}
      <div className="space-y-6">
        {filteredFamilyAccounts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No family accounts found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by creating a family account'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFamilyAccounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {account.primary_patient_name} Family
                    </CardTitle>
                    <CardDescription>
                      {account.total_members} members • Created {new Date(account.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {account.total_members} members
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.family_members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getRelationshipIcon(member.relationship)}
                            {member.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.is_primary ? 'default' : 'secondary'}>
                            {member.relationship}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.date_of_birth ? (
                            <div>
                              <div>{getAge(member.date_of_birth)} years</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(member.date_of_birth).toLocaleDateString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.contact_number || (
                            <span className="text-muted-foreground">
                              {member.is_primary ? account.primary_contact : 'Uses primary contact'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            {!member.is_primary && (
                              <Button variant="outline" size="sm">
                                <UserX className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}