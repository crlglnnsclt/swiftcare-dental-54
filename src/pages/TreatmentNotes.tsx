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
import { FileText, Plus, Search, Edit, Eye, Calendar, User, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TreatmentNotes() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNote, setNewNote] = useState({
    patientId: "",
    treatmentType: "",
    diagnosis: "",
    procedure: "",
    notes: "",
    followUpRequired: false,
    visibleToPatient: false,
    medications: "",
    nextAppointment: ""
  });

  // Demo treatment notes data
  const [treatmentNotes, setTreatmentNotes] = useState([
    {
      id: 1,
      patientName: "Sarah Johnson",
      patientId: "P001",
      date: "2025-01-02",
      treatmentType: "Root Canal",
      diagnosis: "Severe dental caries in tooth #14",
      procedure: "Endodontic treatment with temporary filling",
      notes: "Patient presented with severe pain. Local anesthesia administered. Root canal initiated on tooth #14. Temporary filling placed. Patient advised on post-treatment care.",
      dentistName: "Dr. Michael Chen",
      followUpDate: "2025-01-09",
      medications: "Ibuprofen 600mg TID, Amoxicillin 500mg BID",
      visibleToPatient: true,
      status: "completed",
      duration: 90
    },
    {
      id: 2,
      patientName: "Robert Davis",
      patientId: "P002",
      date: "2025-01-02",
      treatmentType: "Dental Cleaning",
      diagnosis: "Mild gingivitis, plaque buildup",
      procedure: "Professional prophylaxis and fluoride treatment",
      notes: "Routine cleaning performed. Patient education provided on proper brushing technique. Fluoride treatment applied. No complications noted.",
      dentistName: "Dr. Sarah Johnson",
      followUpDate: "2025-07-02",
      medications: "None",
      visibleToPatient: true,
      status: "completed",
      duration: 45
    },
    {
      id: 3,
      patientName: "Emily Wilson",
      patientId: "P003",
      date: "2025-01-02",
      treatmentType: "Crown Preparation",
      diagnosis: "Fractured tooth #11 requiring crown",
      procedure: "Tooth preparation for porcelain crown",
      notes: "Tooth prepared for crown placement. Impression taken. Temporary crown placed. Patient tolerating procedure well. Permanent crown to be placed in 2 weeks.",
      dentistName: "Dr. Lisa Rodriguez",
      followUpDate: "2025-01-16",
      medications: "Acetaminophen 500mg PRN",
      visibleToPatient: false,
      status: "in_progress",
      duration: 120
    },
    {
      id: 4,
      patientName: "David Brown",
      patientId: "P004",
      date: "2025-01-01",
      treatmentType: "Tooth Extraction",
      diagnosis: "Impacted wisdom tooth #32",
      procedure: "Surgical extraction of impacted third molar",
      notes: "Complex extraction due to impaction. Local anesthesia with sedation. Tooth sectioned and removed. Sutures placed. Post-op instructions given.",
      dentistName: "Dr. Michael Chen",
      followUpDate: "2025-01-08",
      medications: "Hydrocodone 5mg/325mg q4-6h PRN, Chlorhexidine rinse BID",
      visibleToPatient: true,
      status: "completed",
      duration: 75
    }
  ]);

  const handleCreateNote = () => {
    if (!newNote.patientId || !newNote.treatmentType || !newNote.diagnosis) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const note = {
      id: treatmentNotes.length + 1,
      patientName: "New Patient", // In real app, this would be fetched based on patientId
      patientId: newNote.patientId,
      date: new Date().toISOString().split('T')[0],
      treatmentType: newNote.treatmentType,
      diagnosis: newNote.diagnosis,
      procedure: newNote.procedure,
      notes: newNote.notes,
      dentistName: "Dr. Current User", // Would be from auth context
      followUpDate: newNote.nextAppointment,
      medications: newNote.medications,
      visibleToPatient: newNote.visibleToPatient,
      status: "completed",
      duration: 60
    };

    setTreatmentNotes([note, ...treatmentNotes]);
    setNewNote({
      patientId: "",
      treatmentType: "",
      diagnosis: "",
      procedure: "",
      notes: "",
      followUpRequired: false,
      visibleToPatient: false,
      medications: "",
      nextAppointment: ""
    });
    setShowCreateDialog(false);

    toast({
      title: "Treatment Note Created",
      description: "Treatment note has been successfully saved.",
    });
  };

  const filteredNotes = treatmentNotes.filter(note => {
    const matchesSearch = note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || note.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

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
                  <Label htmlFor="patientId">Patient ID *</Label>
                  <Input
                    id="patientId"
                    placeholder="P001"
                    value={newNote.patientId}
                    onChange={(e) => setNewNote({ ...newNote, patientId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treatmentType">Treatment Type *</Label>
                  <Select value={newNote.treatmentType} onValueChange={(value) => setNewNote({ ...newNote, treatmentType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Dental Cleaning</SelectItem>
                      <SelectItem value="filling">Tooth Filling</SelectItem>
                      <SelectItem value="root_canal">Root Canal</SelectItem>
                      <SelectItem value="crown">Crown Placement</SelectItem>
                      <SelectItem value="extraction">Tooth Extraction</SelectItem>
                      <SelectItem value="orthodontics">Orthodontic Treatment</SelectItem>
                      <SelectItem value="surgery">Oral Surgery</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
            placeholder="Search by patient name, treatment type, or diagnosis..."
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
                    <CardTitle className="text-lg">{note.patientName}</CardTitle>
                    <Badge variant="outline">{note.patientId}</Badge>
                  </div>
                  <Badge variant={note.status === 'completed' ? 'default' : 'secondary'}>
                    {note.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                  {note.visibleToPatient && (
                    <Badge variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      Patient Visible
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{note.date}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <CardDescription className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Stethoscope className="w-4 h-4" />
                    <span>{note.treatmentType}</span>
                  </span>
                  <span>•</span>
                  <span>{note.dentistName}</span>
                  <span>•</span>
                  <span>{note.duration} minutes</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="diagnosis" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                  <TabsTrigger value="procedure">Procedure</TabsTrigger>
                  <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
                  <TabsTrigger value="followup">Follow-up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="diagnosis" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Primary Diagnosis</h4>
                    <p className="text-sm text-muted-foreground">{note.diagnosis}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="procedure" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Procedure Performed</h4>
                    <p className="text-sm text-muted-foreground">{note.procedure}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Clinical Observations</h4>
                    <p className="text-sm text-muted-foreground">{note.notes}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="followup" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Medications Prescribed</h4>
                      <p className="text-sm text-muted-foreground">{note.medications || "None prescribed"}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Next Appointment</h4>
                      <p className="text-sm text-muted-foreground">
                        {note.followUpDate ? new Date(note.followUpDate).toLocaleDateString() : "No follow-up scheduled"}
                      </p>
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