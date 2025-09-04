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
import { toast } from 'sonner';
import swiftCareLogo from '@/assets/swift-care-logo.png';
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

// Swift Care Dental Clinic Chart Legend
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
  const [teethConditions, setTeethConditions] = useState<ToothCondition[]>([
    { toothNumber: 8, condition: 'cavity', notes: 'Small cavity on occlusal surface' },
    { toothNumber: 14, condition: 'filled', treatment: 'Composite filling', date: '2024-01-15' },
    { toothNumber: 18, condition: 'crown', treatment: 'Porcelain crown', date: '2023-11-20' },
    { toothNumber: 26, condition: 'missing' }
  ]);

  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([
    {
      id: '1',
      patientName: 'John Smith',
      procedure: 'Composite filling - Tooth #8',
      status: 'planned',
      priority: 'high',
      scheduledDate: '2024-01-25',
      estimatedCost: 150,
      notes: 'Patient reported sensitivity to cold'
    },
    {
      id: '2',
      patientName: 'Sarah Johnson',
      procedure: 'Root canal - Tooth #15',
      status: 'in_progress',
      priority: 'medium',
      estimatedCost: 800,
      notes: 'Second appointment scheduled'
    }
  ]);

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([
    {
      id: '1',
      date: '2024-01-15',
      note: 'Patient reported sensitivity in upper left molars. Recommended fluoride treatment.',
      writtenBy: 'Dr. Smith'
    }
  ]);
  const [newNote, setNewNote] = useState('');
  const [showSwiftTemplate, setShowSwiftTemplate] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, email')
        .eq('clinic_id', profile?.clinic_id)
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
      
      // Auto-select first patient if available
      if (data && data.length > 0 && !selectedPatient) {
        setSelectedPatient(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const fetchPatientData = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      setCurrentPatientData(data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    }
  };

  const handleDesignChange = (newDesign: any) => {
    updateDesignPreference(newDesign);
    setOdontogramKey(prev => prev + 1); // Force re-render
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

  // Swift Care Dental Chart Template
  const renderSwiftCareChart = () => {
    return (
      <div className="bg-white p-6 border rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            <img 
              src={swiftCareLogo} 
              alt="Swift Care Dental Clinic" 
              className="h-12 w-auto"
            />
            <div>
              <h2 className="text-xl font-bold text-amber-800">Swift Care</h2>
              <p className="text-sm text-amber-700">DENTAL CLINIC</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Sicangco Building, San Rafael, Mac Arthur Hi-way,</p>
            <p>Tarlac City, Tarlac, Philippines 2300</p>
            <p className="text-blue-600">www.facebook.com/swiftcaredentalclinic</p>
          </div>
        </div>

        {/* Chart Info */}
        <div className="flex justify-between mb-4">
          <div>
            <span className="font-semibold">Chart #: ________</span>
          </div>
          <div>
            <span className="font-semibold">Date: ________</span>
          </div>
        </div>

        <h3 className="text-center text-xl font-bold mb-6">PATIENT'S CHART</h3>

        {/* Dental Chart */}
        <div className="space-y-4">
          {/* Upper Teeth */}
          <div className="text-center">
            <div className="flex justify-between text-xs mb-2">
              <span>Maxillary right</span>
              <span>Maxillary left</span>
              <span>Primary maxillary right</span>
              <span>Primary maxillary left</span>
            </div>
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((toothNumber) => {
                const condition = teethConditions.find(t => t.toothNumber === toothNumber);
                const conditionConfig = TOOTH_CONDITIONS.find(c => c.value === condition?.condition);
                
                return (
                  <div
                    key={toothNumber}
                    onClick={() => setSelectedTooth(toothNumber)}
                    className="w-8 h-12 border border-gray-400 cursor-pointer hover:bg-blue-100 flex flex-col items-center justify-center relative"
                  >
                    <div className="w-6 h-8 border border-gray-300 bg-white flex items-center justify-center">
                      {conditionConfig?.code && (
                        <span className="text-xs font-bold">{conditionConfig.code}</span>
                      )}
                    </div>
                    <span className="text-xs mt-1">{toothNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lower Teeth */}
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-2">
              {Array.from({ length: 16 }, (_, i) => i + 17).map((toothNumber) => {
                const condition = teethConditions.find(t => t.toothNumber === toothNumber);
                const conditionConfig = TOOTH_CONDITIONS.find(c => c.value === condition?.condition);
                
                return (
                  <div
                    key={toothNumber}
                    onClick={() => setSelectedTooth(toothNumber)}
                    className="w-8 h-12 border border-gray-400 cursor-pointer hover:bg-blue-100 flex flex-col items-center justify-center relative"
                  >
                    <span className="text-xs mb-1">{toothNumber}</span>
                    <div className="w-6 h-8 border border-gray-300 bg-white flex items-center justify-center">
                      {conditionConfig?.code && (
                        <span className="text-xs font-bold">{conditionConfig.code}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs">
              <span>Mandibular right</span>
              <span>Mandibular left</span>
              <span>Primary mandibular right</span>
              <span>Primary mandibular left</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div><strong>C – Caries</strong></div>
            <div><strong>Ex – Extraction</strong></div>
            <div><strong>RF – Root Fragment</strong></div>
          </div>
          <div className="space-y-1">
            <div><strong>M – Missing</strong></div>
            <div><strong>Un – Unerupted Tooth</strong></div>
            <div><strong>Im – Impacted Tooth</strong></div>
          </div>
          <div className="space-y-1">
            <div><strong>J – Jacket</strong></div>
            <div><strong>Am – Amalgam</strong></div>
            <div><strong>Ab – Abutment</strong></div>
          </div>
          <div className="space-y-1">
            <div><strong>P – Pontic</strong></div>
            <div><strong>I – Inlay</strong></div>
            <div><strong>Fx – Fixed Bridge</strong></div>
          </div>
          <div className="space-y-1">
            <div><strong>S – Sealant</strong></div>
            <div><strong>Rm – Removable Denture</strong></div>
          </div>
        </div>
      </div>
    );
  };

  // Create odontogram (simplified version - 32 adult teeth)
  const renderOdontogram = () => {
    const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
    const lowerTeeth = Array.from({ length: 16 }, (_, i) => i + 17);

    const getToothCondition = (toothNumber: number) => {
      return teethConditions.find(t => t.toothNumber === toothNumber);
    };

    const getToothColor = (condition?: string) => {
      const conditionConfig = TOOTH_CONDITIONS.find(c => c.value === condition);
      return conditionConfig?.color || 'bg-gray-200';
    };

    const renderTooth = (toothNumber: number) => {
      const condition = getToothCondition(toothNumber);
      const colorClass = getToothColor(condition?.condition);
      
      return (
        <div
          key={toothNumber}
          onClick={() => setSelectedTooth(toothNumber)}
          className={`w-8 h-10 ${colorClass} border-2 border-gray-300 cursor-pointer hover:border-medical-blue transition-colors relative group`}
          title={`Tooth #${toothNumber}`}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            {toothNumber}
          </span>
          {condition && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 border border-white rounded-full opacity-75"></div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-8">
        {/* Upper Teeth */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-center">Upper Jaw</h4>
          <div className="flex justify-center gap-1">
            {upperTeeth.map(renderTooth)}
          </div>
        </div>

        {/* Lower Teeth */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-center">Lower Jaw</h4>
          <div className="flex justify-center gap-1">
            {lowerTeeth.map(renderTooth)}
          </div>
        </div>
      </div>
    );
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
          <Button 
            variant="outline" 
            onClick={() => setShowDesignSelector(!showDesignSelector)}
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Design: {selectedDesign}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowSwiftTemplate(!showSwiftTemplate)}
            className="flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            Swift Care Template
          </Button>
          <Button className="medical-gradient text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Chart
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
                <Button
                  key={design.id}
                  variant={selectedDesign === design.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDesignChange(design.id)}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <span className="text-lg">{design.icon}</span>
                  <span className="text-xs">{design.name}</span>
                  {selectedDesign === design.id && (
                    <Badge variant="secondary" className="text-xs px-1">Active</Badge>
                  )}
                </Button>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" size="sm" onClick={() => window.open('/odontogram-designs', '_blank')}>
                View All Designs
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDesignSelector(false)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="chart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">Digital Chart</TabsTrigger>
          <TabsTrigger value="swift-template">Swift Care Template</TabsTrigger>
          <TabsTrigger value="notes">Progress Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Odontogram */}
            <Card className="glass-card xl:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Digital Odontogram
                    {currentPatientData && (
                      <span className="text-lg font-normal text-primary">
                        - {currentPatientData.full_name}
                      </span>
                    )}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {selectedDesign} layout
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Render the selected odontogram design with key for force re-render */}
                <OdontogramRenderer key={odontogramKey} />
            
            {/* Legend */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Legend</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TOOTH_CONDITIONS.map((condition) => (
                  <div key={condition.value} className="flex items-center gap-2">
                    <div className={`w-4 h-4 ${condition.color} border border-gray-300`}></div>
                    <span className="text-sm">{condition.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Tooth Details */}
            {selectedTooth && (
              <Card className="border-medical-blue">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Tooth #{selectedTooth}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const condition = teethConditions.find(t => t.toothNumber === selectedTooth);
                    return condition ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Condition</Label>
                          <p className="text-sm">
                            <Badge variant="outline">
                              {TOOTH_CONDITIONS.find(c => c.value === condition.condition)?.label}
                            </Badge>
                          </p>
                        </div>
                        {condition.notes && (
                          <div>
                            <Label className="text-sm font-medium">Notes</Label>
                            <p className="text-sm text-muted-foreground">{condition.notes}</p>
                          </div>
                        )}
                        {condition.treatment && (
                          <div>
                            <Label className="text-sm font-medium">Treatment</Label>
                            <p className="text-sm text-muted-foreground">{condition.treatment}</p>
                          </div>
                        )}
                        {condition.date && (
                          <div>
                            <Label className="text-sm font-medium">Date</Label>
                            <p className="text-sm text-muted-foreground">{condition.date}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">No condition recorded for this tooth</p>
                        <Button size="sm" variant="outline">
                          Add Condition
                        </Button>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
              )}
            </CardContent>
          </Card>

          {/* Treatment Plans */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Treatment Plans
                </CardTitle>
                <Dialog open={isAddingTreatment} onOpenChange={setIsAddingTreatment}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Treatment Plan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="procedure">Procedure</Label>
                        <Input id="procedure" placeholder="e.g., Composite filling" />
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cost">Estimated Cost</Label>
                        <Input id="cost" type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label htmlFor="treatment-notes">Notes</Label>
                        <Textarea id="treatment-notes" rows={3} />
                      </div>
                      <Button className="w-full medical-gradient text-white">
                        Add Treatment Plan
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {treatmentPlans.map((plan) => (
                <Card key={plan.id} className="border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(plan.status)}
                        <span className="font-medium text-sm">{plan.procedure}</span>
                      </div>
                      <Badge variant={getPriorityColor(plan.priority)}>
                        {plan.priority}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Patient:</span>
                        <span>{plan.patientName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium">${plan.estimatedCost}</span>
                      </div>
                      {plan.scheduledDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Scheduled:</span>
                          <span>{plan.scheduledDate}</span>
                        </div>
                      )}
                    </div>

                    {plan.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                        {plan.notes}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {treatmentPlans.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No treatment plans yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="swift-template">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Swift Care Dental Clinic Template
              {currentPatientData && (
                <span className="text-lg font-normal text-primary">
                  - {currentPatientData.full_name}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderSwiftCareChart()}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notes">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Progress Note */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Add Progress Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="progress-note">Note</Label>
                <Textarea
                  id="progress-note"
                  placeholder="Enter progress note..."
                  rows={4}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Written by: {profile?.full_name || 'Current User'}
                </p>
                <Button onClick={addProgressNote} disabled={!newNote.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Notes List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Progress Notes
                {currentPatientData && (
                  <span className="text-lg font-normal text-primary">
                    - {currentPatientData.full_name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {progressNotes.map((note) => (
                <Card key={note.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-muted-foreground">
                        {note.writtenBy}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {note.date}
                      </div>
                    </div>
                    <p className="text-sm">{note.note}</p>
                  </CardContent>
                </Card>
              ))}
              
              {progressNotes.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No progress notes yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
);
}