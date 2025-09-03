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
  Eye
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

const TOOTH_CONDITIONS = [
  { value: 'healthy', label: 'Healthy', color: 'bg-green-500' },
  { value: 'cavity', label: 'Cavity', color: 'bg-red-500' },
  { value: 'filled', label: 'Filled', color: 'bg-blue-500' },
  { value: 'crown', label: 'Crown', color: 'bg-yellow-500' },
  { value: 'missing', label: 'Missing', color: 'bg-gray-400' },
  { value: 'root_canal', label: 'Root Canal', color: 'bg-purple-500' },
  { value: 'implant', label: 'Implant', color: 'bg-indigo-500' }
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
    </div>
  );
}