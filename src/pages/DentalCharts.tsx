import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import InteractiveDentalChart from '@/components/InteractiveDentalChart';
import { toast } from 'sonner';
import swiftCareLogo from '@/assets/swift-care-logo-correct.png';
import { Plus, Palette, User, FileText, Activity } from 'lucide-react';
import { useOdontogramPreference } from '@/hooks/useOdontogramPreference';

interface ToothCondition {
  id: string;
  patient_id: string;
  tooth_number: number;
  condition: string;
  notes?: string;
  treatment?: string;
  date?: string;
  created_at: string;
  updated_at: string;
}

interface ProgressNote {
  id: string;
  patient_id: string;
  date: string;
  note: string;
  written_by: string;
  created_at: string;
  updated_at: string;
}

export default function DentalCharts() {
  const { profile } = useAuth();
  const { selectedDesign, updateDesignPreference } = useOdontogramPreference();

  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [currentPatientData, setCurrentPatientData] = useState<any>(null);
  const [showDesignSelector, setShowDesignSelector] = useState(false);

  const [teethConditions, setTeethConditions] = useState<ToothCondition[]>([]);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [newNote, setNewNote] = useState('');

  // --- Fetch Patients ---
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const clinicId = profile?.clinic_id;
      if (!clinicId) return;

      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, email');

      if (error) throw error;
      setPatients(data || []);

      if (data && data.length > 0 && !selectedPatient) {
        setSelectedPatient(data[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load patients');
    }
  };

  // --- Fetch Patient Data When Selected ---
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient);
    }
  }, [selectedPatient]);

  const fetchPatientData = async (patientId: string) => {
    try {
      // Patient info
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;
      setCurrentPatientData(patientData);

      // Fetch all patient-specific data
      await Promise.all([
        fetchTeethConditions(patientId),
        fetchProgressNotes(patientId)
      ]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load patient data');
    }
  };

  const fetchTeethConditions = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('teeth_conditions')
        .select('*')
        .eq('patient_id', patientId);

      if (error) throw error;
      setTeethConditions(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load teeth conditions');
    }
  };

  const fetchProgressNotes = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('progress_notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) throw error;
      setProgressNotes(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load progress notes');
    }
  };

  const handleDesignChange = (newDesign: any) => {
    updateDesignPreference(newDesign);
    toast.success(`Switched to ${newDesign} design`);
  };

  const addProgressNote = () => {
    if (!newNote.trim()) return;
    const note: ProgressNote = {
      id: Date.now().toString(),
      patient_id: selectedPatient,
      date: new Date().toISOString(),
      note: newNote,
      written_by: profile?.full_name || 'Current User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProgressNotes([note, ...progressNotes]);
    setNewNote('');
    toast.success('Progress note added');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={swiftCareLogo} alt="SwiftCare" className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Interactive Dental Chart</h1>
          </div>

          {/* Patient Selector */}
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDesignSelector(!showDesignSelector)}
          >
            <Palette className="h-4 w-4 mr-2" />
            Chart Style
          </Button>
        </div>
      </div>

      {/* Design Selector */}
      {showDesignSelector && (
        <Card>
          <CardHeader>
            <CardTitle>Select Chart Design</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['traditional', 'anatomical', 'interactive', 'minimalist', 'clinical'].map((design) => (
                <Button
                  key={design}
                  variant={selectedDesign === design ? 'default' : 'outline'}
                  onClick={() => handleDesignChange(design)}
                  className="h-20"
                >
                  <div className="text-center">
                    <div className="text-sm font-medium capitalize">{design}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Dental Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Interactive Dental Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InteractiveDentalChart teethConditions={teethConditions} />
        </CardContent>
      </Card>

      {/* Patient Info & Notes */}
      {currentPatientData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Name:</strong> {currentPatientData.full_name}</div>
              <div><strong>Email:</strong> {currentPatientData.email}</div>
              <div><strong>Contact:</strong> {currentPatientData.contact_number}</div>
              <div><strong>Date of Birth:</strong> {currentPatientData.date_of_birth}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Progress Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a progress note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addProgressNote}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {progressNotes.map((note) => (
                  <div key={note.id} className="p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500 mb-1">
                      {new Date(note.date).toLocaleDateString()} - {note.written_by}
                    </div>
                    <div className="text-sm">{note.note}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
