import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBranchSharing } from '@/hooks/useBranchSharing';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Settings, 
  Share2, 
  Shield, 
  Trash2,
  Building2,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

export function BranchSharingManager() {
  const { profile } = useAuth();
  const {
    sharingGroups,
    groupMembers,
    availableBranches,
    loading,
    createSharingGroup,
    addBranchToGroup,
    removeBranchFromGroup,
    toggleBranchSharing,
    deleteSharingGroup
  } = useBranchSharing();

  const [newGroupData, setNewGroupData] = useState({
    group_name: '',
    description: ''
  });
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);

  if (profile?.role !== 'clinic_admin') {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Only clinic administrators can manage branch data sharing settings.
        </AlertDescription>
      </Alert>
    );
  }

  const handleCreateGroup = async () => {
    if (!newGroupData.group_name.trim()) {
      toast.error('Group name is required');
      return;
    }

    const result = await createSharingGroup(newGroupData);
    if (result.success) {
      toast.success('Sharing group created successfully');
      setNewGroupData({ group_name: '', description: '' });
      setIsCreateGroupOpen(false);
    } else {
      toast.error('Failed to create sharing group');
    }
  };

  const handleAddBranchToGroup = async () => {
    if (!selectedGroup || !selectedBranch) {
      toast.error('Please select both a group and a branch');
      return;
    }

    const result = await addBranchToGroup(selectedBranch, selectedGroup);
    if (result.success) {
      toast.success('Branch added to sharing group');
      setSelectedGroup('');
      setSelectedBranch('');
      setIsAddBranchOpen(false);
    } else {
      toast.error('Failed to add branch to group');
    }
  };

  const handleRemoveBranch = async (memberId: string, branchName: string) => {
    const result = await removeBranchFromGroup(memberId);
    if (result.success) {
      toast.success(`${branchName} removed from sharing group`);
    } else {
      toast.error('Failed to remove branch from group');
    }
  };

  const handleToggleSharing = async (branchId: string, enabled: boolean, branchName: string) => {
    const result = await toggleBranchSharing(branchId, enabled);
    if (result.success) {
      toast.success(`Data sharing ${enabled ? 'enabled' : 'disabled'} for ${branchName}`);
    } else {
      toast.error('Failed to update sharing settings');
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (window.confirm(`Are you sure you want to delete the sharing group "${groupName}"? This will remove all branch memberships.`)) {
      const result = await deleteSharingGroup(groupId);
      if (result.success) {
        toast.success('Sharing group deleted successfully');
      } else {
        toast.error('Failed to delete sharing group');
      }
    }
  };

  const getGroupMembers = (groupId: string) => {
    return groupMembers.filter(member => member.group_id === groupId);
  };

  const getAvailableBranchesForGroup = (groupId: string) => {
    const usedBranchIds = groupMembers
      .filter(member => member.group_id === groupId)
      .map(member => member.branch_id);
    
    return availableBranches.filter(branch => 
      !usedBranchIds.includes(branch.id) && branch.sharing_enabled
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sharing settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branch Data Sharing</h1>
          <p className="text-muted-foreground">
            Configure data sharing between clinic branches and manage access controls
          </p>
        </div>
        <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Sharing Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Sharing Group</DialogTitle>
              <DialogDescription>
                Create a group to manage data sharing between specific clinic branches.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group_name">Group Name</Label>
                <Input
                  id="group_name"
                  value={newGroupData.group_name}
                  onChange={(e) => setNewGroupData(prev => ({ ...prev, group_name: e.target.value }))}
                  placeholder="e.g., Main Branch Network"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this sharing group..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="groups">Sharing Groups</TabsTrigger>
          <TabsTrigger value="branches">Branch Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          {sharingGroups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Share2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sharing Groups</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first sharing group to enable data sharing between branches.
                </p>
                <Button onClick={() => setIsCreateGroupOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sharing Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sharingGroups.map((group) => {
                const members = getGroupMembers(group.id);
                return (
                  <Card key={group.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            {group.group_name}
                            <Badge variant={group.is_active ? "default" : "secondary"}>
                              {group.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </CardTitle>
                          {group.description && (
                            <CardDescription>{group.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={isAddBranchOpen} onOpenChange={setIsAddBranchOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Branch
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Branch to Group</DialogTitle>
                                <DialogDescription>
                                  Select a branch to add to "{group.group_name}".
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Select Branch</Label>
                                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose a branch..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getAvailableBranchesForGroup(group.id).map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id}>
                                          {branch.clinic_name}
                                          {branch.address && ` - ${branch.address}`}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddBranchOpen(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => {
                                    setSelectedGroup(group.id);
                                    handleAddBranchToGroup();
                                  }}
                                >
                                  Add Branch
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteGroup(group.id, group.group_name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {members.length === 0 ? (
                        <p className="text-muted-foreground">No branches in this group yet.</p>
                      ) : (
                        <div className="space-y-3">
                          <h4 className="font-medium">Member Branches ({members.length})</h4>
                          <div className="grid gap-2">
                            {members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Building2 className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{member.clinics?.clinic_name}</p>
                                    {member.clinics?.address && (
                                      <p className="text-sm text-muted-foreground">{member.clinics.address}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    Joined {new Date(member.joined_at).toLocaleDateString()}
                                  </Badge>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleRemoveBranch(member.id, member.clinics?.clinic_name || 'Branch')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Branch Sharing Settings
              </CardTitle>
              <CardDescription>
                Configure data sharing settings for each clinic branch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableBranches.map((branch) => (
                  <div key={branch.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{branch.clinic_name}</h4>
                        {branch.address && (
                          <p className="text-sm text-muted-foreground">{branch.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor={`sharing-${branch.id}`} className="text-sm">
                          Data Sharing
                        </Label>
                        <Switch
                          id={`sharing-${branch.id}`}
                          checked={branch.sharing_enabled}
                          onCheckedChange={(enabled) => 
                            handleToggleSharing(branch.id, enabled, branch.clinic_name)
                          }
                        />
                      </div>
                      <Badge variant={branch.sharing_enabled ? "default" : "secondary"}>
                        {branch.sharing_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}