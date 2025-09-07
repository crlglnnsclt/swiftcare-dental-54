import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useOdontogramPreference } from '@/hooks/useOdontogramPreference';
import { OdontogramRenderer } from '@/components/OdontogramRenderer';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { DrawableSwiftChart } from '@/components/DrawableSwiftChart';
import InteractiveDentalChart from '@/components/InteractiveDentalChart';
import { toast } from 'sonner';
import swiftCareLogo from '@/assets/swift-care-logo-correct.png';
import { Plus, Save, Palette, Stethoscope, Settings2, Activity, Calendar, CheckCircle, Clock, Eye, FileText } from 'lucide-react';

interface ToothCondition {
  toothNumber: number;
  condition: 'healthy' | 'cavity' | 'filled' | 'crown' | 'missing' | 'root_canal' | 'implant';
  notes?: string;
  treatment?: string;
  date?: string;
}

interface TreatmentPlan {
  id: string;
  patientName: string;
  procedure: string;
  status: 'planned' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  scheduledDate?: string;
  estimatedCost: number;
  notes: string;
}

interface ProgressNote {
  id: string;
  date: string;
  note: string;
  writtenBy: string;
}

const TOOTH_CONDITIONS = [
  { value: 'healthy', label: 'Healthy', color: 'bg-green-500', code: '' },
  { value: 'cavity', label: 'Caries', color: 'bg-red-500', code: 'C' },
  { value: 'extraction', label: 'Extraction', color: 'bg-gray-700', code: 'Ex' },
  { value: 'root_fragment', label: 'Root Fragment', color: 'bg-gray-500', code: 'RF' },
  { value: 'missing', label: 'Missing', color: 'bg-gray-400', code: 'M' },
  { value: 'unerupted', label: 'Unerupted Tooth', color: 'bg-blue-400', code: 'Un' },
  { value: 'impacted', label: 'Impacted Tooth', color: 'bg-purple-400', code: 'Im' },
  { value: 'jacket', label: 'Jacket', color: 'bg-yellow-500', code: 'J' },
  { value: 'amalgam', label: 'Amalgam', color: 'bg-gray-600', code: 'Am' },
  { value: 'abutment', label: 'Abutment', color: 'bg-orange-500', code: 'Ab' },
  { value: 'pontic', label: 'Pontic', color: 'bg-pink-500', code: 'P' },
  { value: 'inlay', label: 'Inlay', color: 'bg-indigo-500', code: 'I' },
  { value: 'fixed_bridge', label: 'Fixed Bridge', color: 'bg-teal-500', code: 'Fx' },
  { value: 'sealant', label: 'Sealant', color: 'bg-green-600', code: 'S' },
  { value: 'removable_denture', label: 'Removable Denture', color: 'bg-rose-500', code: 'Rm' }
];

export default function DentalCharts() {
  const { user, profile } = useAuth();
  const { selectedDesign, updateDesignPreference } = useOdontogramPreference();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [currentPatientData, setCurrentPatientData] = useState<any>(null);
  const [showDesignSelector, setShowDesignSelector] = useState(false);
  const [odontogramKey, setOdontogramKey] = useState(0);
  const [teethConditions, setTeethConditions] = useState<ToothCondition[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => { fetchPatients(); }, []);
  useEffect(() => { if (selectedPatient) fetchPatientData(selectedPatient); }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const clinicId = profile?.clinic_id;
      if (!clinicId) return;
      const { data, error } = await supabase.from('patients').select('id, full_name, email');
      if (error) throw error;
      setPatients(data || []);
      if (data && data.length > 0 && !selectedPatient) setSelectedPatient(data[0].id);
    } catch (error) {
      console.error(error); toast.error('Failed to load patients');
    }
  };

  const fetchPatientData = async (patientId: string) => {
    try {
      const { data, error } = await supabase.from('patients').select('*').eq('id', patientId).single();
      if (error) throw error;
      setCurrentPatientData(data);
    } catch (error) {
      console.error(error); toast.error('Failed to load patient data');
    }
  };

  const handleDesignChange = (newDesign: any) => {
    updateDesignPreference(newDesign);
    setOdontogramKey(prev => prev + 1);
    setShowDesignSelector(false);
    toast.success(`Switched to ${newDesign} design`);
  };

  const addProgressNote = () => {
    if (!newNote.trim()) return;
    const note: ProgressNote = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      note: newNote,
      writtenBy: profile?.full_name || 'Current User'
    };
    setProgressNotes([note, ...progressNotes]);
    setNewNote('');
    toast.success('Progress note added');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'planned': return <Calendar className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dental Charts</h1>
          <p className="text-muted-foreground">Digital odontogram and treatment planning</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowDesignSelector(!showDesignSelector)} className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Design: {selectedDesign}
          </Button>
        </div>
      </div>

      {/* Design Selector */}
      {showDesignSelector && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Choose Odontogram Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: 'traditional', name: 'Traditional', icon: '⬜' },
                { id: 'anatomical', name: 'Anatomical', icon: '🦷' },
                { id: 'interactive', name: 'Interactive', icon: '🎯' },
                { id: 'minimalist', name: 'Minimalist', icon: '⚪' },
                { id: 'clinical', name: 'Clinical', icon: '📋' }
              ].map((design) => (
                <Button key={design.id} variant={selectedDesign === design.id ? 'default' : 'outline'} size="sm" onClick={() => handleDesignChange(design.id)} className="flex flex-col items-center gap-1 h-auto py-3">
                  <span className="text-lg">{design.icon}</span>
                  <span className="text-xs">{design.name}</span>
                  {selectedDesign === design.id && <Badge variant="secondary" className="text-xs px-1">Active</Badge>}
                </Button>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" size="sm" onClick={() => setShowDesignSelector(false)}>Close</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="interactive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="interactive">Interactive Chart</TabsTrigger>
          {/* Other tabs hidden */}
          <TabsTrigger value="chart" className="hidden">Digital Chart</TabsTrigger>
          <TabsTrigger value="swift-template" className="hidden">Swift Care Template</TabsTrigger>
          <TabsTrigger value="drawing" className="hidden">Drawing Canvas</TabsTrigger>
          <TabsTrigger value="notes" className="hidden">Progress Notes</TabsTrigger>
        </TabsList>

        {/* Interactive Chart */}
        <TabsContent value="interactive">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Dental Chart</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <InteractiveDentalChart />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hidden tabs content (kept for future use) */}
        <TabsContent value="chart" className="hidden">
          <OdontogramRenderer key={odontogramKey} />
        </TabsContent>

        <TabsContent value="swift-template" className="hidden">
          <DrawableSwiftChart 
            patientName={currentPatientData?.full_name}
            teethConditions={teethConditions}
            onToothClick={setSelectedTooth}
            onSave={() => toast.success('Swift Care chart saved!')}
          />
        </TabsContent>

        <TabsContent value="drawing" className="hidden">
          <DrawingCanvas
            patientName={currentPatientData?.full_name}
            onSave={() => toast.success('Drawing saved!')}
          />
        </TabsContent>

        <TabsContent value="notes" className="hidden">
          {/* Progress notes UI here (same as before) */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
