import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { OdontogramRenderer } from '@/components/OdontogramRenderer';
import { useOdontogramPreference } from '@/hooks/useOdontogramPreference';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { DrawableSwiftChart } from '@/components/DrawableSwiftChart';
import InteractiveDentalChart from '@/components/InteractiveDentalChart';
import { toast } from 'sonner';
import swiftCareLogo from '@/assets/swift-care-logo-correct.png';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Filter, 
  Search, 
  Calendar,
  User,
  FileText,
  AlertCircle,
  Settings2,
  Palette,
  Activity,
  CheckCircle,
  Clock,
  Eye,
  Stethoscope
} from 'lucide-react';

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
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showSwiftTemplate, setShowSwiftTemplate] = useState(false);

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
        fetchTreatmentPlans(patientId),
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

  const fetchTreatmentPlans = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('patient_id', patientId)
        .order('scheduledDate', { ascending: true });
      if (error) throw error;
      setTreatmentPlans(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load treatment plans');
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

  // --- Remainder of your UI code (OdontogramRenderer, Tabs, Cards) ---
  // ... Keep all the UI code exactly as in your original `DentalCharts.tsx`
  // All components like InteractiveDentalChart, DrawableSwiftChart, and DrawingCanvas
  // will now receive the correct teethConditions and patient data dynamically

  return (
    <div className="p-6 space-y-6">
      {/* HEADER, DESIGN SELECTOR, TABS */}
      {/* Keep all JSX code the same as before */}
    </div>
  );
}
