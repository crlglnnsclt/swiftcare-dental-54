
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Save,
  FileText,
  DollarSign,
  Package,
  Calendar,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Signature,
  Download
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostProcedureFormProps {
  appointmentId: string;
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface UsedItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

interface CompletedProcedure {
  id: string;
  name: string;
  tooth_number?: string;
  cost: number;
  notes?: string;
}

const PostProcedureForm: React.FC<PostProcedureFormProps> = ({
  appointmentId,
  patientId,
  patientName,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dentist_name: '',
    completed_procedures: [] as CompletedProcedure[],
    wire_type: '',
    items_used: [] as UsedItem[],
    total_amount: 0,
    balance_due: 0,
    payment_mode: '',
    next_visit_date: '',
    next_visit_notes: '',
    patient_signature: false,
    dentist_signature: false,
    procedure_notes: ''
  });

  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<UsedItem[]>([]);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureType, setSignatureType] = useState<'patient' | 'dentist'>('patient');

  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Auto-fill dentist name and date
      setFormData(prev => ({
        ...prev,
        dentist_name: profile?.full_name || '',
        date: new Date().toISOString().split('T')[0]
      }));
      
      fetchAvailableItems();
    }
  }, [isOpen, profile]);

  const fetchAvailableItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .gt('current_stock', 0)
        .order('item_name');

      if (error) throw error;
      setAvailableItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const addItemUsed = (item: any, quantity: number) => {
    const totalCost = item.unit_cost * quantity;
    const usedItem: UsedItem = {
      id: item.id,
      item_name: item.item_name,
      quantity,
      unit_cost: item.unit_cost,
      total_cost: totalCost
    };

    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + quantity, total_cost: (i.quantity + quantity) * i.unit_cost }
            : i
        );
      }
      return [...prev, usedItem];
    });

    // Update total amount
    setFormData(prev => ({
      ...prev,
      total_amount: prev.total_amount + totalCost,
      balance_due: prev.balance_due + totalCost
    }));
  };

  const removeItemUsed = (itemId: string) => {
    const item = selectedItems.find(i => i.id === itemId);
    if (!item) return;

    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
    setFormData(prev => ({
      ...prev,
      total_amount: prev.total_amount - item.total_cost,
      balance_due: prev.balance_due - item.total_cost
    }));
  };

  const addCompletedProcedure = () => {
    const newProcedure: CompletedProcedure = {
      id: Date.now().toString(),
      name: 'Root Canal Treatment',
      tooth_number: '14',
      cost: 850,
      notes: 'Procedure completed successfully'
    };

    setFormData(prev => ({
      ...prev,
      completed_procedures: [...prev.completed_procedures, newProcedure],
      total_amount: prev.total_amount + newProcedure.cost,
      balance_due: prev.balance_due + newProcedure.cost
    }));
  };

  const handleSignature = (type: 'patient' | 'dentist') => {
    setSignatureType(type);
    setShowSignatureDialog(true);
  };

  const confirmSignature = () => {
    setFormData(prev => ({
      ...prev,
      [signatureType === 'patient' ? 'patient_signature' : 'dentist_signature']: true
    }));
    setShowSignatureDialog(false);
    
    toast({
      title: "Signature Captured",
      description: `${signatureType === 'patient' ? 'Patient' : 'Dentist'} signature recorded successfully`,
    });
  };

  const handleSave = async () => {
    try {
      // 1. Update patient record and dental chart
      const patientUpdateData = {
        last_visit_date: formData.date,
        treatment_notes: formData.procedure_notes
      };

      await supabase
        .from('patients')
        .update(patientUpdateData)
        .eq('id', patientId);

      // 2. Create treatment history record
      const treatmentHistory = {
        patient_id: patientId,
        appointment_id: appointmentId,
        dentist_id: profile?.id,
        procedures: formData.completed_procedures,
        items_used: selectedItems,
        total_cost: formData.total_amount,
        treatment_date: formData.date,
        notes: formData.procedure_notes,
        wire_type: formData.wire_type,
        patient_signature: formData.patient_signature,
        dentist_signature: formData.dentist_signature
      };

      await supabase
        .from('treatment_history')
        .insert(treatmentHistory);

      // 3. Update billing system
      if (formData.total_amount > 0) {
        const billingData = {
          patient_id: patientId,
          appointment_id: appointmentId,
          total_amount: formData.total_amount,
          balance_due: formData.balance_due,
          payment_method: formData.payment_mode,
          invoice_date: formData.date,
          status: formData.balance_due > 0 ? 'pending' : 'paid'
        };

        await supabase
          .from('billing')
          .insert(billingData);
      }

      // 4. Auto-deduct inventory
      for (const item of selectedItems) {
        await supabase
          .from('inventory')
          .update({
            current_stock: supabase.raw(`current_stock - ${item.quantity}`)
          })
          .eq('id', item.id);
      }

      // 5. Update analytics system
      const analyticsData = {
        date: formData.date,
        dentist_id: profile?.id,
        patient_id: patientId,
        revenue: formData.total_amount,
        procedures_count: formData.completed_procedures.length,
        items_consumed: selectedItems.length
      };

      await supabase
        .from('analytics_daily')
        .insert(analyticsData);

      // 6. Mark appointment as completed
      await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      // 7. Schedule next appointment if specified
      if (formData.next_visit_date) {
        await supabase
          .from('appointments')
          .insert({
            patient_id: patientId,
            dentist_id: profile?.id,
            scheduled_time: formData.next_visit_date,
            appointment_type: 'follow_up',
            reason_for_visit: formData.next_visit_notes || 'Follow-up appointment',
            status: 'scheduled'
          });
      }

      toast({
        title: "Procedure Completed",
        description: "All systems have been updated successfully",
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving post-procedure form:', error);
      toast({
        title: "Error",
        description: "Failed to save procedure data",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Post-Procedure Form - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auto-filled Basic Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Date</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
              />
            </div>
            <div>
              <Label>Dentist Name</Label>
              <Input value={formData.dentist_name} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Patient Name</Label>
              <Input value={patientName} readOnly className="bg-gray-50" />
            </div>
          </div>

          {/* Completed Procedures */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Completed Procedures</CardTitle>
              <Button size="sm" onClick={addCompletedProcedure}>
                <Stethoscope className="w-4 h-4 mr-2" />
                Add Procedure
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formData.completed_procedures.map((procedure) => (
                  <div key={procedure.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{procedure.name}</span>
                      {procedure.tooth_number && (
                        <span className="text-sm text-muted-foreground ml-2">
                          Tooth #{procedure.tooth_number}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">${procedure.cost.toFixed(2)}</span>
                  </div>
                ))}
                {formData.completed_procedures.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No procedures added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Wire Selection */}
          <div>
            <Label>Wire Type (if applicable)</Label>
            <Select value={formData.wire_type} onValueChange={(value) => setFormData(prev => ({...prev, wire_type: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select wire type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stainless_steel">Stainless Steel</SelectItem>
                <SelectItem value="nickel_titanium">Nickel Titanium</SelectItem>
                <SelectItem value="ceramic">Ceramic Coated</SelectItem>
                <SelectItem value="none">No Wire Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Used */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Items Used (Auto-deduct Inventory)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select onValueChange={(value) => {
                    const item = availableItems.find(i => i.id === value);
                    if (item) addItemUsed(item, 1);
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select item to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.item_name} - ${item.unit_cost.toFixed(2)} (Stock: {item.current_stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.item_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ${item.unit_cost.toFixed(2)} × {item.quantity} = ${item.total_cost.toFixed(2)}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => removeItemUsed(item.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount and Payment */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Total Amount</Label>
              <Input
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({...prev, total_amount: parseFloat(e.target.value) || 0}))}
              />
            </div>
            <div>
              <Label>Balance Due</Label>
              <Input
                type="number"
                value={formData.balance_due}
                onChange={(e) => setFormData(prev => ({...prev, balance_due: parseFloat(e.target.value) || 0}))}
              />
            </div>
            <div>
              <Label>Payment Mode</Label>
              <Select value={formData.payment_mode} onValueChange={(value) => setFormData(prev => ({...prev, payment_mode: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="financing">Financing</SelectItem>
                  <SelectItem value="pending">Payment Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Next Visit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Next Visit Date (Optional)</Label>
              <Input
                type="date"
                value={formData.next_visit_date}
                onChange={(e) => setFormData(prev => ({...prev, next_visit_date: e.target.value}))}
              />
            </div>
            <div>
              <Label>Next Visit Notes</Label>
              <Input
                value={formData.next_visit_notes}
                onChange={(e) => setFormData(prev => ({...prev, next_visit_notes: e.target.value}))}
                placeholder="Reason for next visit"
              />
            </div>
          </div>

          {/* Procedure Notes */}
          <div>
            <Label>Procedure Notes</Label>
            <Textarea
              value={formData.procedure_notes}
              onChange={(e) => setFormData(prev => ({...prev, procedure_notes: e.target.value}))}
              placeholder="Detailed notes about the procedure performed..."
              rows={3}
            />
          </div>

          {/* Digital Signatures */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Digital Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Label>Patient Signature</Label>
                  {formData.patient_signature ? (
                    <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                      <span className="text-green-800">Signed</span>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleSignature('patient')}
                    >
                      <Signature className="w-4 h-4 mr-2" />
                      Capture Signature
                    </Button>
                  )}
                </div>
                <div className="text-center">
                  <Label>Dentist Signature</Label>
                  {formData.dentist_signature ? (
                    <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                      <span className="text-green-800">Signed</span>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleSignature('dentist')}
                    >
                      <Signature className="w-4 h-4 mr-2" />
                      Sign Document
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.patient_signature || !formData.dentist_signature}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Complete & Save
            </Button>
          </div>
        </div>

        {/* Signature Dialog */}
        <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {signatureType === 'patient' ? 'Patient' : 'Dentist'} Digital Signature
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <div className="mx-auto w-80 h-48 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Signature className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Signature capture area</p>
                  <p className="text-sm text-gray-400">
                    In real implementation, this would capture actual signatures
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmSignature}>
                  Confirm Signature
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default PostProcedureForm;
