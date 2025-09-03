import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  current_stock: number;
  minimum_stock: number;
  unit_cost: number;
  sku?: string;
}

interface UsedItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

interface InventoryAutoDeductProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function InventoryAutoDeduct({ appointmentId, isOpen, onClose, onComplete }: InventoryAutoDeductProps) {
  const { profile } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [usedItems, setUsedItems] = useState<UsedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchInventoryItems();
    }
  }, [isOpen]);

  const fetchInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('is_active', true)
        .eq('branch_id', profile?.branch_id)
        .order('name');

      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const addUsedItem = (item: InventoryItem) => {
    const existingItem = usedItems.find(used => used.item_id === item.id);
    
    if (existingItem) {
      setUsedItems(usedItems.map(used => 
        used.item_id === item.id 
          ? { 
              ...used, 
              quantity: used.quantity + 1,
              total_cost: (used.quantity + 1) * used.unit_cost
            }
          : used
      ));
    } else {
      setUsedItems([...usedItems, {
        item_id: item.id,
        item_name: item.name,
        quantity: 1,
        unit_cost: item.unit_cost || 0,
        total_cost: item.unit_cost || 0
      }]);
    }
  };

  const updateUsedItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setUsedItems(usedItems.filter(item => item.item_id !== itemId));
    } else {
      setUsedItems(usedItems.map(item => 
        item.item_id === itemId 
          ? { 
              ...item, 
              quantity: newQuantity,
              total_cost: newQuantity * item.unit_cost
            }
          : item
      ));
    }
  };

  const removeUsedItem = (itemId: string) => {
    setUsedItems(usedItems.filter(item => item.item_id !== itemId));
  };

  const completeWithInventoryDeduction = async () => {
    setSubmitting(true);
    try {
      // Create inventory transactions for used items
      const transactions = usedItems.map(item => ({
        item_id: item.item_id,
        clinic_id: profile?.clinic_id || '',
        created_by: profile?.id || '',
        transaction_type: 'usage',
        quantity: -item.quantity, // Negative for deduction
        unit_cost: item.unit_cost,
        total_cost: -item.total_cost, // Negative for deduction
        reference_id: appointmentId,
        notes: `Used in appointment completion`
      }));

      if (transactions.length > 0) {
        const { error: transactionError } = await supabase
          .from('inventory_transactions')
          .insert(transactions);

        if (transactionError) throw transactionError;

        // Update current stock for each item
        for (const item of usedItems) {
          const currentItem = inventoryItems.find(inv => inv.id === item.item_id);
          if (currentItem) {
            const newStock = currentItem.current_stock - item.quantity;
            const { error: stockError } = await supabase
              .from('inventory_items')
              .update({ current_stock: newStock })
              .eq('id', item.item_id);

            if (stockError) throw stockError;
          }
        }
      }

      // Update appointment status to completed
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          actual_end_time: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (appointmentError) throw appointmentError;

      toast.success('Appointment completed and inventory updated');
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error completing appointment with inventory deduction:', error);
      toast.error('Failed to complete appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalCost = () => {
    return usedItems.reduce((total, item) => total + item.total_cost, 0);
  };

  const isLowStock = (item: InventoryItem) => {
    return item.current_stock <= item.minimum_stock;
  };

  const hasEnoughStock = (item: InventoryItem, requestedQuantity: number = 1) => {
    return item.current_stock >= requestedQuantity;
  };

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Complete Appointment - Inventory Usage
          </DialogTitle>
          <DialogDescription>
            Select items used during this appointment. Inventory will be automatically deducted.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Inventory */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Available Inventory</h3>
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">Loading inventory...</div>
              ) : (
                filteredItems.map((item) => (
                  <Card key={item.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.name}</p>
                            {isLowStock(item) && (
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Stock: {item.current_stock}</span>
                            {item.sku && <span>SKU: {item.sku}</span>}
                            <span>${item.unit_cost?.toFixed(2) || '0.00'}</span>
                          </div>
                          {isLowStock(item) && (
                            <Badge variant="destructive" className="mt-1">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addUsedItem(item)}
                          disabled={!hasEnoughStock(item)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Used Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Items Used</h3>
            
            {usedItems.length > 0 ? (
              <div className="space-y-2">
                {usedItems.map((item) => (
                  <Card key={item.item_id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.item_name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${item.unit_cost.toFixed(2)} × {item.quantity} = ${item.total_cost.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUsedItemQuantity(item.item_id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUsedItemQuantity(item.item_id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeUsedItem(item.item_id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Separator />
                
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Cost:</span>
                  <span>${getTotalCost().toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No items selected</p>
                <p className="text-sm">Add items from the inventory list</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={completeWithInventoryDeduction}
            disabled={submitting}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {submitting ? 'Completing...' : 'Complete Appointment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}