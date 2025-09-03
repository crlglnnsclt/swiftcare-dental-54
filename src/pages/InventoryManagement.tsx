import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Edit, Trash2, AlertTriangle, TrendingDown, TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  branch_id?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category_id?: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit_cost?: number;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branch_id?: string;
  supplier_info?: any;
  // Joined data
  category_name?: string;
}

interface InventoryTransaction {
  id: string;
  item_id: string;
  transaction_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  performed_by: string;
  created_at: string;
  branch_id?: string;
  // Joined data
  item_name?: string;
  performer_name?: string;
}

export function InventoryManagement() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('items');
  
  // Items state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);

  // Form state
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    sku: '',
    category_id: '',
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: '',
    unit_cost: '',
    expiry_date: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const [transactionForm, setTransactionForm] = useState<{
    item_id: string;
    transaction_type: 'in' | 'out' | 'adjustment';
    quantity: number;
    unit_cost: string;
    notes: string;
  }>({
    item_id: '',
    transaction_type: 'in',
    quantity: 0,
    unit_cost: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('inventory_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch items with category names
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories(name)
        `)
        .eq('is_active', true)
        .order('name');

      if (itemsError) throw itemsError;
      
      const formattedItems = itemsData?.map(item => ({
        ...item,
        category_name: item.inventory_categories?.name,
        supplier_info: item.supplier_info as any,
      })) || [];
      
      setItems(formattedItems);

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          inventory_items(name),
          profiles(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;
      
      const formattedTransactions = transactionsData?.map(transaction => ({
        ...transaction,
        transaction_type: transaction.transaction_type as 'in' | 'out' | 'adjustment',
        item_name: transaction.inventory_items?.name,
        performer_name: transaction.profiles?.full_name,
      })) || [];
      
      setTransactions(formattedTransactions);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const resetItemForm = () => {
    setItemForm({
      name: '',
      description: '',
      sku: '',
      category_id: '',
      current_stock: 0,
      minimum_stock: 0,
      maximum_stock: '',
      unit_cost: '',
      expiry_date: '',
    });
    setEditingItem(null);
  };

  const openItemModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || '',
        sku: item.sku || '',
        category_id: item.category_id || '',
        current_stock: item.current_stock,
        minimum_stock: item.minimum_stock,
        maximum_stock: item.maximum_stock?.toString() || '',
        unit_cost: item.unit_cost?.toString() || '',
        expiry_date: item.expiry_date || '',
      });
    } else {
      resetItemForm();
    }
    setIsItemModalOpen(true);
  };

  const saveItem = async () => {
    if (!itemForm.name.trim()) {
      toast.error('Item name is required');
      return;
    }

    try {
      const itemData = {
        name: itemForm.name,
        description: itemForm.description || null,
        sku: itemForm.sku || null,
        category_id: itemForm.category_id || null,
        current_stock: itemForm.current_stock,
        minimum_stock: itemForm.minimum_stock,
        maximum_stock: itemForm.maximum_stock ? parseInt(itemForm.maximum_stock) : null,
        unit_cost: itemForm.unit_cost ? parseFloat(itemForm.unit_cost) : null,
        expiry_date: itemForm.expiry_date || null,
        branch_id: profile?.branch_id,
        is_active: true,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('inventory_items')
          .update(itemData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        toast.success('Item updated successfully');
      } else {
        const { error } = await supabase
          .from('inventory_items')
          .insert(itemData);
        
        if (error) throw error;
        toast.success('Item created successfully');
      }

      setIsItemModalOpen(false);
      resetItemForm();
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description || null,
        branch_id: profile?.branch_id,
        is_active: true,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('inventory_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('inventory_categories')
          .insert(categoryData);
        
        if (error) throw error;
        toast.success('Category created successfully');
      }

      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', description: '' });
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const recordTransaction = async () => {
    if (!transactionForm.item_id || !transactionForm.quantity) {
      toast.error('Item and quantity are required');
      return;
    }

    try {
      const transactionData = {
        item_id: transactionForm.item_id,
        transaction_type: transactionForm.transaction_type,
        quantity: transactionForm.quantity,
        unit_cost: transactionForm.unit_cost ? parseFloat(transactionForm.unit_cost) : null,
        total_cost: transactionForm.unit_cost ? parseFloat(transactionForm.unit_cost) * transactionForm.quantity : null,
        notes: transactionForm.notes || null,
        performed_by: profile?.id,
        branch_id: profile?.branch_id,
      };

      const { error } = await supabase
        .from('inventory_transactions')
        .insert(transactionData);
      
      if (error) throw error;

      // Update item stock
      const item = items.find(i => i.id === transactionForm.item_id);
      if (item) {
        let newStock = item.current_stock;
        
        if (transactionForm.transaction_type === 'in') {
          newStock += transactionForm.quantity;
        } else if (transactionForm.transaction_type === 'out') {
          newStock -= transactionForm.quantity;
        } else if (transactionForm.transaction_type === 'adjustment') {
          newStock = transactionForm.quantity;
        }

        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({ current_stock: Math.max(0, newStock) })
          .eq('id', transactionForm.item_id);

        if (updateError) throw updateError;
      }

      toast.success('Transaction recorded successfully');
      setIsTransactionModalOpen(false);
      setTransactionForm({
        item_id: '',
        transaction_type: 'in',
        quantity: 0,
        unit_cost: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error recording transaction:', error);
      toast.error('Failed to record transaction');
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= 0) {
      return { status: 'out-of-stock', color: 'destructive', icon: AlertTriangle };
    } else if (item.current_stock <= item.minimum_stock) {
      return { status: 'low-stock', color: 'secondary', icon: TrendingDown };
    } else {
      return { status: 'in-stock', color: 'default', icon: TrendingUp };
    }
  };

  const lowStockItems = items.filter(item => item.current_stock <= item.minimum_stock);
  const outOfStockItems = items.filter(item => item.current_stock <= 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track supplies, equipment, and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsTransactionModalOpen(true)} variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Record Transaction
          </Button>
        </div>
      </div>

      {/* Stock Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {outOfStockItems.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Out of Stock ({outOfStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {outOfStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="text-sm">{item.name}</div>
                  ))}
                  {outOfStockItems.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{outOfStockItems.length - 3} more items
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockItems.length > 0 && (
            <Card className="border-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <TrendingDown className="w-5 h-5" />
                  Low Stock ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {lowStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="text-sm">
                      {item.name} ({item.current_stock} left)
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{lowStockItems.length - 3} more items
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inventory Items</h2>
            <Button onClick={() => openItemModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const stockStatus = getStockStatus(item);
              const StatusIcon = stockStatus.icon;

              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          {item.name}
                        </CardTitle>
                        <CardDescription>{item.category_name}</CardDescription>
                      </div>
                      <Badge variant={stockStatus.color as any} className="flex items-center gap-1">
                        <StatusIcon className="w-3 h-3" />
                        {item.current_stock}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-1">
                      {item.sku && <p><strong>SKU:</strong> {item.sku}</p>}
                      <p><strong>Min Stock:</strong> {item.minimum_stock}</p>
                      {item.unit_cost && <p><strong>Unit Cost:</strong> ${item.unit_cost}</p>}
                      {item.expiry_date && (
                        <p><strong>Expires:</strong> {new Date(item.expiry_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openItemModal(item)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {items.length === 0 && (
            <Card className="text-center p-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Inventory Items</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first inventory item.
              </p>
              <Button onClick={() => openItemModal()}>Add First Item</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Categories</h2>
            <Button onClick={() => setIsCategoryModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {items.filter(item => item.category_id === category.id).length} items
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{transaction.item_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.transaction_type === 'in' ? '+' : transaction.transaction_type === 'out' ? '-' : '='}{transaction.quantity} units
                        {transaction.notes && ` • ${transaction.notes}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        transaction.transaction_type === 'in' ? 'default' : 
                        transaction.transaction_type === 'out' ? 'secondary' : 'outline'
                      }>
                        {transaction.transaction_type}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Modal */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update item information' : 'Add a new item to your inventory'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  value={itemForm.name}
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Dental Composite"
                />
              </div>
              <div>
                <Label htmlFor="itemSku">SKU</Label>
                <Input
                  id="itemSku"
                  value={itemForm.sku}
                  onChange={(e) => setItemForm(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="e.g., DC-001"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea
                id="itemDescription"
                value={itemForm.description}
                onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Item description"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="itemCategory">Category</Label>
                <Select
                  value={itemForm.category_id}
                  onValueChange={(value) => setItemForm(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="itemUnitCost">Unit Cost</Label>
                <Input
                  id="itemUnitCost"
                  type="number"
                  step="0.01"
                  value={itemForm.unit_cost}
                  onChange={(e) => setItemForm(prev => ({ ...prev, unit_cost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="itemCurrentStock">Current Stock *</Label>
                <Input
                  id="itemCurrentStock"
                  type="number"
                  value={itemForm.current_stock}
                  onChange={(e) => setItemForm(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="itemMinStock">Minimum Stock *</Label>
                <Input
                  id="itemMinStock"
                  type="number"
                  value={itemForm.minimum_stock}
                  onChange={(e) => setItemForm(prev => ({ ...prev, minimum_stock: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="itemMaxStock">Maximum Stock</Label>
                <Input
                  id="itemMaxStock"
                  type="number"
                  value={itemForm.maximum_stock}
                  onChange={(e) => setItemForm(prev => ({ ...prev, maximum_stock: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="itemExpiry">Expiry Date</Label>
              <Input
                id="itemExpiry"
                type="date"
                value={itemForm.expiry_date}
                onChange={(e) => setItemForm(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsItemModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveItem}>
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for organizing inventory items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Dental Materials"
              />
            </div>

            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Category description"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveCategory}>Add Category</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Transaction Modal */}
      <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Transaction</DialogTitle>
            <DialogDescription>
              Record inventory movement (stock in, out, or adjustment)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="transactionItem">Item *</Label>
              <Select
                value={transactionForm.item_id}
                onValueChange={(value) => setTransactionForm(prev => ({ ...prev, item_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Current: {item.current_stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="transactionType">Transaction Type</Label>
                <Select
                  value={transactionForm.transaction_type}
                  onValueChange={(value: 'in' | 'out' | 'adjustment') => 
                    setTransactionForm(prev => ({ ...prev, transaction_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In</SelectItem>
                    <SelectItem value="out">Stock Out</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transactionQuantity">Quantity *</Label>
                <Input
                  id="transactionQuantity"
                  type="number"
                  value={transactionForm.quantity}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="transactionCost">Unit Cost</Label>
              <Input
                id="transactionCost"
                type="number"
                step="0.01"
                value={transactionForm.unit_cost}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, unit_cost: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="transactionNotes">Notes</Label>
              <Textarea
                id="transactionNotes"
                value={transactionForm.notes}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional transaction notes"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsTransactionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={recordTransaction}>Record Transaction</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}