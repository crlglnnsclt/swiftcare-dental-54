import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileText, Plus, Search, Edit, Eye, Calendar, User, Stethoscope, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  full_name: string;
  contact_number?: string;
}

interface Treatment {
  id: string;
  name: string;
  default_price?: number;
  default_duration_minutes?: number;
}

interface TreatmentRecord {
  id: string;
  patient_id: string;
  treatment_id: string;
  dentist_id: string;
  clinic_id: string;
  notes?: string;
  complications?: string;
  follow_up_required?: boolean;
  follow_up_notes?: string;
  status: string;
  price_charged?: number;
  actual_duration_minutes?: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
}

export default function TreatmentNotes() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState({
    patientId: "",
    treatmentId: "",
    diagnosis: "",
    procedure: "",
    notes: "",
    followUpRequired: false,
    visibleToPatient: false,
    medications: "",
    nextAppointment: "",
    cost: "",
    duration: ""
  });

  const [treatmentNotes, setTreatmentNotes] = useState<TreatmentRecord[]>([]);

  useEffect(() => {
    if (profile?.clinic_id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!profile?.clinic_id) {
        return;
      }

      // Fetch patients using simple approach
      const patientsResult = await supabase
        .from('patients')
        .select('id, full_name, contact_number');
      
      if (patientsResult.data) {
        setPatients(patientsResult.data);
      }

      // Fetch treatments using simple approach
      const treatmentsResult = await supabase
        .from('treatments')
        .select('id, name, default_price, default_duration_minutes');
      
      if (treatmentsResult.data) {
        setTreatments(treatmentsResult.data);
      }

      // Fetch treatment records using simple approach
      const recordsResult = await supabase
        .from('treatment_records')
        .select('*');
      
      if (recordsResult.data) {
        setTreatmentNotes(recordsResult.data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load treatment data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.patientId || !newNote.treatmentId || !newNote.diagnosis) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedTreatment = treatments.find(t => t.id === newNote.treatmentId);
      const treatmentCost = parseFloat(newNote.cost) || selectedTreatment?.default_price || 0;
      const treatmentDuration = parseInt(newNote.duration) || selectedTreatment?.default_duration_minutes || 60;

      // Create treatment record
      const { data: record, error: recordError } = await supabase
        .from('treatment_records')
        .insert({
          patient_id: newNote.patientId,
          dentist_id: profile?.user_id,
          treatment_id: newNote.treatmentId,
          clinic_id: profile?.clinic_id,
          notes: `Diagnosis: ${newNote.diagnosis}\n\nProcedure: ${newNote.procedure}\n\nClinical Notes: ${newNote.notes}\n\nMedications: ${newNote.medications}`,
          follow_up_required: !!newNote.nextAppointment,
          follow_up_notes: newNote.nextAppointment ? `Follow-up scheduled for ${newNote.nextAppointment}` : null,
          status: 'completed',
          price_charged: treatmentCost,
          actual_duration_minutes: treatmentDuration,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + treatmentDuration * 60000).toISOString()
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Auto-generate invoice if cost > 0
      if (treatmentCost > 0) {
        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            patient_id: newNote.patientId,
            clinic_id: profile?.clinic_id,
            invoice_number: `INV-${Date.now()}`,
            invoice_type: 'treatment',
            subtotal: treatmentCost,
            total_amount: treatmentCost,
            balance_due: treatmentCost,
            payment_status: 'pending',
            treatments: JSON.stringify([{
              treatment_id: newNote.treatmentId,
              treatment_name: selectedTreatment?.name,
              cost: treatmentCost,
              record_id: record.id
            }]),
            issued_by: profile?.user_id
          });

        if (invoiceError) {
          console.error('Error creating invoice:', invoiceError);
        }
      }

      // Reset form and refresh data
      setNewNote({
        patientId: "",
        treatmentId: "",
        diagnosis: "",
        procedure: "",
        notes: "",
        followUpRequired: false,
        visibleToPatient: false,
        medications: "",
        nextAppointment: "",
        cost: "",
        duration: ""
      });
      setShowCreateDialog(false);
      fetchData();

      toast({
        title: "Treatment Note Created",
        description: treatmentCost > 0 ? 
          "Treatment note saved and invoice generated automatically." :
          "Treatment note has been successfully saved.",
      });
    } catch (error) {
      console.error('Error creating treatment note:', error);
      toast({
        title: "Error",
        description: "Failed to create treatment note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredNotes = treatmentNotes.filter(note => {
    const matchesSearch = note.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.complications?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || note.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
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
          <h1 className="text-3xl font-bold text-foreground">Treatment Notes</h1>
          <p className="text-muted-foreground">Manage patient treatment records and clinical notes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Treatment Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Treatment Note</DialogTitle>
              <DialogDescription>
                Record treatment details and clinical observations
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient *</Label>
                <Select value={newNote.patientId} onValueChange={(value) => setNewNote({ ...newNote, patientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name} {patient.contact_number && `(${patient.contact_number})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatmentId">Treatment/Service *</Label>
                <Select value={newNote.treatmentId} onValueChange={(value) => {
                  const treatment = treatments.find(t => t.id === value);
                  setNewNote({ 
                    ...newNote, 
                    treatmentId: value,
                    cost: treatment?.default_price?.toString() || "",
                    duration: treatment?.default_duration_minutes?.toString() || ""
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatments.map((treatment) => (
                      <SelectItem key={treatment.id} value={treatment.id}>
                        {treatment.name} {treatment.default_price && `($${treatment.default_price})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter primary diagnosis..."
                  value={newNote.diagnosis}
                  onChange={(e) => setNewNote({ ...newNote, diagnosis: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="procedure">Procedure Performed</Label>
                <Textarea
                  id="procedure"
                  placeholder="Describe the procedure performed..."
                  value={newNote.procedure}
                  onChange={(e) => setNewNote({ ...newNote, procedure: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter detailed clinical observations, patient response, complications, etc..."
                  value={newNote.notes}
                  onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Medications Prescribed</Label>
                <Textarea
                  id="medications"
                  placeholder="List medications, dosages, and instructions..."
                  value={newNote.medications}
                  onChange={(e) => setNewNote({ ...newNote, medications: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="Auto-filled from service"
                    value={newNote.cost}
                    onChange={(e) => setNewNote({ ...newNote, cost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Auto-filled from service"
                    value={newNote.duration}
                    onChange={(e) => setNewNote({ ...newNote, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextAppointment">Next Appointment Date</Label>
                <Input
                  id="nextAppointment"
                  type="date"
                  value={newNote.nextAppointment}
                  onChange={(e) => setNewNote({ ...newNote, nextAppointment: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="visibleToPatient"
                  checked={newNote.visibleToPatient}
                  onCheckedChange={(checked) => setNewNote({ ...newNote, visibleToPatient: checked })}
                />
                <Label htmlFor="visibleToPatient">Make visible to patient</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNote}>
                  Save Treatment Note
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
            placeholder="Search treatment notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notes</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Treatment Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Patient #{note.patient_id.slice(0, 8)}</CardTitle>
                    <Badge variant="outline">{note.id.slice(0, 8)}</Badge>
                  </div>
                  <Badge variant={note.status === 'completed' ? 'default' : 'secondary'}>
                    {note.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                  {note.price_charged && note.price_charged > 0 && (
                    <Badge variant="outline" className="text-green-600">
                      <DollarSign className="w-3 h-3 mr-1" />
                      ${note.price_charged}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <CardDescription className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Stethoscope className="w-4 h-4" />
                    <span>Treatment #{note.treatment_id.slice(0, 8)}</span>
                  </span>
                  <span>•</span>
                  <span>Dr. {note.dentist_id.slice(0, 8)}</span>
                  <span>•</span>
                  <span>{note.actual_duration_minutes || 30} minutes</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="complications">Complications</TabsTrigger>
                  <TabsTrigger value="followup">Follow-up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="notes" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Treatment Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.notes || "No notes available"}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="complications" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Complications</h4>
                    <p className="text-sm text-muted-foreground">{note.complications || "No complications reported"}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="followup" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Follow-up Required</h4>
                      <p className="text-sm text-muted-foreground">{note.follow_up_required ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Follow-up Notes</h4>
                      <p className="text-sm text-muted-foreground">{note.follow_up_notes || "No follow-up notes"}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Note
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Treatment Notes Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No notes match your search criteria." : "No treatment notes have been created yet."}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Treatment Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}