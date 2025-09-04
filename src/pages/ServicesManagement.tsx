import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, DollarSign, Clock, FileText, Stethoscope, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Treatment {
  id: string;
  name: string;
  description?: string;
  default_price: number | null;
  default_duration_minutes: number | null;
  category: string;
  is_active: boolean;
  clinic_id: string;
  requires_patient_signature: boolean;
  requires_dentist_signature: boolean;
  attached_forms: string[];
  created_at: string;
  updated_at: string;
}

interface DigitalForm {
  id: string;
  name: string;
  category: string;
  requires_signature: boolean;
}

export default function ServicesManagement() {
  const { toast } = useToast();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [digitalForms, setDigitalForms] = useState<DigitalForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    default_price: "",
    default_duration_minutes: "",
    is_active: true,
    requires_patient_signature: false,
    requires_dentist_signature: false,
    attached_forms: [] as string[]
  });

  const categories = [
    "Preventive",
    "Restorative", 
    "Cosmetic",
    "Endodontic",
    "Orthodontic",
    "Surgical",
    "Emergency",
    "Pediatric"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch treatments - using the actual table structure
      const { data: treatmentsData, error: treatmentsError } = await supabase
        .from('treatments')
        .select('*')
        .order('name');

      if (treatmentsError) throw treatmentsError;

      // Transform data to include our enhanced fields with defaults using type casting
      const enhancedTreatments = (treatmentsData || []).map(treatment => ({
        ...treatment,
        description: (treatment as any).description || '',
        category: (treatment as any).category || 'General',
        is_active: (treatment as any).is_active !== undefined ? (treatment as any).is_active : true,
        requires_patient_signature: (treatment as any).requires_patient_signature || false,
        requires_dentist_signature: (treatment as any).requires_dentist_signature || false,
        attached_forms: (treatment as any).attached_forms || []
      }));

      setTreatments(enhancedTreatments);

      // Fetch available digital forms
      const { data: formsData, error: formsError } = await supabase
        .from('digital_forms')
        .select('id, name, category, requires_signature')
        .eq('is_active', true);

      if (formsError) throw formsError;
      setDigitalForms(formsData || []);

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
    if (!formData.name.trim() || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Only include fields that exist in the current table structure
      const insertData: any = {
        name: formData.name.trim(),
        default_price: formData.default_price ? parseFloat(formData.default_price) : null,
        default_duration_minutes: formData.default_duration_minutes ? parseInt(formData.default_duration_minutes) : null
      };

      // Add optional fields only if they exist in the table
      if (formData.description.trim()) {
        insertData.description = formData.description.trim();
      }
      if (formData.category) {
        insertData.category = formData.category;
      }

      const { data, error } = await supabase
        .from('treatments')
        .insert([insertData])
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
    if (!editingTreatment || !formData.name.trim() || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Only include fields that exist in the current table structure
      const updateData: any = {
        name: formData.name.trim(),
        default_price: formData.default_price ? parseFloat(formData.default_price) : null,
        default_duration_minutes: formData.default_duration_minutes ? parseInt(formData.default_duration_minutes) : null,
        updated_at: new Date().toISOString()
      };

      // Add optional fields only if they exist in the table
      if (formData.description.trim()) {
        updateData.description = formData.description.trim();
      }
      if (formData.category) {
        updateData.category = formData.category;
      }

      const { error } = await supabase
        .from('treatments')
        .update(updateData)
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
      category: treatment.category,
      default_price: treatment.default_price?.toString() || "",
      default_duration_minutes: treatment.default_duration_minutes?.toString() || "",
      is_active: treatment.is_active,
      requires_patient_signature: treatment.requires_patient_signature,
      requires_dentist_signature: treatment.requires_dentist_signature,
      attached_forms: treatment.attached_forms
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      default_price: "",
      default_duration_minutes: "",
      is_active: true,
      requires_patient_signature: false,
      requires_dentist_signature: false,
      attached_forms: []
    });
  };

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || treatment.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
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
          <p className="text-muted-foreground">Manage dental services, pricing, and form requirements</p>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTreatment ? 'Edit Service' : 'Create New Service'}</DialogTitle>
              <DialogDescription>
                Define service details, pricing, and form requirements
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Signature Requirements</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="patient-signature">Requires Patient Signature</Label>
                      <p className="text-sm text-muted-foreground">Patient must sign consent forms</p>
                    </div>
                    <Switch
                      id="patient-signature"
                      checked={formData.requires_patient_signature}
                      onCheckedChange={(checked) => setFormData({ ...formData, requires_patient_signature: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dentist-signature">Requires Dentist Signature</Label>
                      <p className="text-sm text-muted-foreground">Dentist must sign completion forms</p>
                    </div>
                    <Switch
                      id="dentist-signature"
                      checked={formData.requires_dentist_signature}
                      onCheckedChange={(checked) => setFormData({ ...formData, requires_dentist_signature: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Attached Forms</Label>
                  <Select
                    value=""
                    onValueChange={(formId) => {
                      if (!formData.attached_forms.includes(formId)) {
                        setFormData({ 
                          ...formData, 
                          attached_forms: [...formData.attached_forms, formId] 
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add form requirement" />
                    </SelectTrigger>
                    <SelectContent>
                      {digitalForms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.name} ({form.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {formData.attached_forms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.attached_forms.map((formId) => {
                        const form = digitalForms.find(f => f.id === formId);
                        return (
                          <Badge key={formId} variant="secondary" className="flex items-center gap-1">
                            {form?.name || 'Unknown Form'}
                            <button
                              onClick={() => setFormData({
                                ...formData,
                                attached_forms: formData.attached_forms.filter(id => id !== formId)
                              })}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active">Service Active</Label>
                  <p className="text-sm text-muted-foreground">Available for booking</p>
                </div>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services by name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTreatments.map((treatment) => (
          <Card key={treatment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{treatment.name}</CardTitle>
                  <Badge variant="outline">{treatment.category}</Badge>
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
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Price:</span>
                  </div>
                  <span className="font-semibold">
                    {treatment.default_price ? `$${treatment.default_price}` : 'Custom'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Duration:</span>
                  </div>
                  <span>
                    {treatment.default_duration_minutes ? `${treatment.default_duration_minutes} mins` : 'Variable'}
                  </span>
                </div>

                {(treatment.requires_patient_signature || treatment.requires_dentist_signature) && (
                  <div className="flex items-center space-x-2 text-sm">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Signatures:</span>
                    <div className="flex space-x-1">
                      {treatment.requires_patient_signature && (
                        <Badge variant="secondary" className="text-xs">Patient</Badge>
                      )}
                      {treatment.requires_dentist_signature && (
                        <Badge variant="secondary" className="text-xs">Dentist</Badge>
                      )}
                    </div>
                  </div>
                )}

                {treatment.attached_forms.length > 0 && (
                  <div className="text-sm">
                    <div className="flex items-center space-x-1 mb-1">
                      <Stethoscope className="w-4 h-4 text-medical-blue" />
                      <span>Forms:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {treatment.attached_forms.slice(0, 2).map((formId) => {
                        const form = digitalForms.find(f => f.id === formId);
                        return (
                          <Badge key={formId} variant="outline" className="text-xs">
                            {form?.name || 'Form'}
                          </Badge>
                        );
                      })}
                      {treatment.attached_forms.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{treatment.attached_forms.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Badge variant={treatment.is_active ? "default" : "secondary"}>
                    {treatment.is_active ? "Active" : "Inactive"}
                  </Badge>
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