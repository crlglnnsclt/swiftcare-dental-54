import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, DollarSign, Clock, Stethoscope, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Treatment {
  id: string;
  name: string;
  description?: string;
  default_price: number | null;
  default_duration_minutes: number | null;
  clinic_id: string;
  created_at?: string;
  updated_at?: string;
}

export default function ServicesManagement() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    default_price: "",
    default_duration_minutes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let treatmentsQuery = supabase
        .from('treatments')
        .select('*')
        .order('name');

      // Filter by clinic for non-super-admin users
      if (profile?.role !== 'super_admin' && profile?.clinic_id) {
        treatmentsQuery = treatmentsQuery.eq('clinic_id', profile.clinic_id);
      }

      const { data: treatmentsData, error: treatmentsError } = await treatmentsQuery;

      if (treatmentsError) throw treatmentsError;
      setTreatments(treatmentsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load services data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTreatment = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a service name.",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.clinic_id) {
      toast({
        title: "Error",
        description: "Unable to determine clinic. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('treatments')
        .insert([{
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          default_price: formData.default_price ? parseFloat(formData.default_price) : null,
          default_duration_minutes: formData.default_duration_minutes ? parseInt(formData.default_duration_minutes) : null,
          clinic_id: profile.clinic_id,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Service Created",
        description: "New service has been added successfully.",
      });

      resetForm();
      setShowCreateDialog(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating treatment:', error);
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTreatment = async () => {
    if (!editingTreatment || !formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a service name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('treatments')
        .update({
          name: formData.name.trim(),
          default_price: formData.default_price ? parseFloat(formData.default_price) : null,
          default_duration_minutes: formData.default_duration_minutes ? parseInt(formData.default_duration_minutes) : null
        })
        .eq('id', editingTreatment.id);

      if (error) throw error;

      toast({
        title: "Service Updated",
        description: "Service has been updated successfully.",
      });

      resetForm();
      setEditingTreatment(null);
      await fetchData();
    } catch (error) {
      console.error('Error updating treatment:', error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTreatment = async (treatment: Treatment) => {
    if (!confirm(`Are you sure you want to delete "${treatment.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('id', treatment.id);

      if (error) throw error;

      toast({
        title: "Service Deleted",
        description: "Service has been removed successfully.",
      });

      await fetchData();
    } catch (error) {
      console.error('Error deleting treatment:', error);
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setFormData({
      name: treatment.name,
      description: treatment.description || "",
      default_price: treatment.default_price?.toString() || "",
      default_duration_minutes: treatment.default_duration_minutes?.toString() || ""
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      default_price: "",
      default_duration_minutes: ""
    });
  };

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services Management</h1>
          <p className="text-muted-foreground">Manage dental services and pricing</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            resetForm();
            setEditingTreatment(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTreatment ? 'Edit Service' : 'Create New Service'}</DialogTitle>
              <DialogDescription>
                Define service details and pricing
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Routine Cleaning"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the service..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Default Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="180.00"
                    value={formData.default_price}
                    onChange={(e) => setFormData({ ...formData, default_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="45"
                    value={formData.default_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, default_duration_minutes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                  setEditingTreatment(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={editingTreatment ? handleUpdateTreatment : handleCreateTreatment}>
                  {editingTreatment ? 'Update Service' : 'Create Service'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTreatments.map((treatment) => (
          <Card key={treatment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{treatment.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      startEdit(treatment);
                      setShowCreateDialog(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTreatment(treatment)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {treatment.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {treatment.description}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span>Price:</span>
                  </div>
                  <span className="font-semibold">
                    {treatment.default_price ? `$${treatment.default_price}` : 'Custom'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span>Duration:</span>
                  </div>
                  <span>
                    {treatment.default_duration_minutes ? `${treatment.default_duration_minutes} mins` : 'Variable'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTreatments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Stethoscope className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Services Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No services match your search criteria." : "No services have been created yet."}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}