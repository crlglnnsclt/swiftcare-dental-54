import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Plus, Search, Edit, Trash2, Eye, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React from "react";

export default function UserRoles() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: {}
  });

  // Demo roles and permissions data
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Super Admin",
      description: "Full system access with all privileges",
      users: 2,
      isSystem: true,
      color: "red",
      permissions: {
        "user_management": true,
        "clinic_management": true,
        "feature_toggles": true,
        "system_settings": true,
        "billing_access": true,
        "reports_access": true,
        "patient_management": true,
        "appointment_management": true,
        "inventory_management": true,
        "audit_logs": true
      }
    },
    {
      id: 2,
      name: "Clinic Admin",
      description: "Administrative access for clinic operations",
      users: 8,
      isSystem: true,
      color: "blue",
      permissions: {
        "user_management": true,
        "clinic_management": false,
        "feature_toggles": false,
        "system_settings": false,
        "billing_access": true,
        "reports_access": true,
        "patient_management": true,
        "appointment_management": true,
        "inventory_management": true,
        "audit_logs": true
      }
    },
    {
      id: 3,
      name: "Dentist",
      description: "Clinical staff with patient treatment access",
      users: 15,
      isSystem: true,
      color: "green",
      permissions: {
        "user_management": false,
        "clinic_management": false,
        "feature_toggles": false,
        "system_settings": false,
        "billing_access": false,
        "reports_access": false,
        "patient_management": true,
        "appointment_management": true,
        "inventory_management": false,
        "audit_logs": false
      }
    },
    {
      id: 4,
      name: "Staff",
      description: "Front desk and administrative support staff",
      users: 23,
      isSystem: true,
      color: "purple",
      permissions: {
        "user_management": false,
        "clinic_management": false,
        "feature_toggles": false,
        "system_settings": false,
        "billing_access": true,
        "reports_access": false,
        "patient_management": true,
        "appointment_management": true,
        "inventory_management": true,
        "audit_logs": false
      }
    },
    {
      id: 5,
      name: "Patient",
      description: "Standard patient portal access",
      users: 1247,
      isSystem: true,
      color: "gray",
      permissions: {
        "user_management": false,
        "clinic_management": false,
        "feature_toggles": false,
        "system_settings": false,
        "billing_access": false,
        "reports_access": false,
        "patient_management": false,
        "appointment_management": false,
        "inventory_management": false,
        "audit_logs": false
      }
    }
  ]);

  const permissionCategories = [
    {
      name: "System Administration",
      permissions: [
        { id: "user_management", name: "User Management", description: "Create, edit, and delete user accounts" },
        { id: "clinic_management", name: "Clinic Management", description: "Manage clinic settings and configurations" },
        { id: "feature_toggles", name: "Feature Toggles", description: "Enable/disable system features" },
        { id: "system_settings", name: "System Settings", description: "Configure global system settings" }
      ]
    },
    {
      name: "Business Operations",
      permissions: [
        { id: "billing_access", name: "Billing Access", description: "View and manage billing and payments" },
        { id: "reports_access", name: "Reports Access", description: "Generate and view business reports" },
        { id: "inventory_management", name: "Inventory Management", description: "Manage clinic inventory and supplies" },
        { id: "audit_logs", name: "Audit Logs", description: "View system audit trails and logs" }
      ]
    },
    {
      name: "Clinical Operations",
      permissions: [
        { id: "patient_management", name: "Patient Management", description: "Create and manage patient records" },
        { id: "appointment_management", name: "Appointment Management", description: "Schedule and manage appointments" }
      ]
    }
  ];

  const allPermissions = permissionCategories.flatMap(cat => cat.permissions);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const role = {
      id: roles.length + 1,
      name: newRole.name,
      description: newRole.description,
      users: 0,
      isSystem: false,
      color: "orange",
      permissions: newRole.permissions
    };

    setRoles([...roles, role]);
    setNewRole({
      name: "",
      description: "",
      permissions: {}
    });
    setShowCreateDialog(false);

    toast({
      title: "Role Created",
      description: "New role has been created successfully.",
    });
  };

  const handleDeleteRole = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast({
        title: "Cannot Delete",
        description: "System roles cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    setRoles(roles.filter(r => r.id !== roleId));
    toast({
      title: "Role Deleted",
      description: "Role has been deleted successfully.",
    });
  };

  const handlePermissionChange = (permissionId: string, enabled: boolean) => {
    setNewRole({
      ...newRole,
      permissions: {
        ...newRole.permissions,
        [permissionId]: enabled
      }
    });
  };

  const getPermissionCount = (role: any) => {
    return Object.values(role.permissions).filter(Boolean).length;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role Permissions</h1>
          <p className="text-muted-foreground">Manage user roles and access permissions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new user role with specific permissions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name *</Label>
                  <Input
                    id="roleName"
                    placeholder="e.g., Lead Dentist"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleDescription">Description *</Label>
                  <Input
                    id="roleDescription"
                    placeholder="Brief description of the role"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Permissions</h4>
                <div className="space-y-6">
                  {permissionCategories.map((category) => (
                    <div key={category.name} className="space-y-3">
                      <h5 className="font-medium text-sm text-muted-foreground">{category.name}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                            <Switch
                              id={permission.id}
                              checked={newRole.permissions[permission.id] || false}
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                            />
                            <div className="flex-1">
                              <Label htmlFor={permission.id} className="text-sm font-medium">
                                {permission.name}
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole}>
                  Create Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              {roles.filter(r => !r.isSystem).length} custom roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.reduce((sum, role) => sum + role.users, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Across all roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter(r => r.name.includes('Admin')).reduce((sum, role) => sum + role.users, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Administrative access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPermissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Available permissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roles List and Permissions Matrix */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles Overview</TabsTrigger>
          <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${role.color}-500`} />
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      {role.isSystem && (
                        <Badge variant="outline">System</Badge>
                      )}
                    </div>
                    {!role.isSystem && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Users assigned</span>
                      <Badge variant="secondary">{role.users}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Permissions</span>
                      <Badge variant="outline">
                        {getPermissionCount(role)}/{allPermissions.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Key Permissions</h5>
                      <div className="flex flex-wrap gap-1">
                        {allPermissions
                          .filter(p => role.permissions[p.id])
                          .slice(0, 3)
                          .map(permission => (
                            <Badge key={permission.id} variant="outline" className="text-xs">
                              {permission.name}
                            </Badge>
                          ))}
                        {getPermissionCount(role) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{getPermissionCount(role) - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>View permissions across all roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Permission</th>
                      {roles.map(role => (
                        <th key={role.id} className="text-center p-3 font-medium min-w-24">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionCategories.map(category => (
                      <React.Fragment key={category.name}>
                        <tr className="bg-muted/50">
                          <td colSpan={roles.length + 1} className="p-3 font-medium text-sm">
                            {category.name}
                          </td>
                        </tr>
                        {category.permissions.map(permission => (
                          <tr key={permission.id} className="border-b hover:bg-muted/25">
                            <td className="p-3">
                              <div>
                                <p className="font-medium text-sm">{permission.name}</p>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </div>
                            </td>
                            {roles.map(role => (
                              <td key={role.id} className="text-center p-3">
                                {role.permissions[permission.id] ? (
                                  <Badge variant="default" className="text-xs">✓</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">✗</Badge>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}