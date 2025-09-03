import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Package, Search, AlertTriangle, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { InventoryItem, InventoryCategory, InventoryTransaction } from '@/lib/types';

const InventoryManagement = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    sku: '',
    category_id: '',
    current_stock: 0,
    minimum_stock: 0,
    unit_cost: 0,
    unit_type: 'pieces',
    supplier_name: '',
    supplier_contact: '',
    expiry_date: '',
    clinic_id: '',
    is_active: true
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    clinic_id: '',
    is_active: true
  });

  const [newTransaction, setNewTransaction] = useState({
    item_id: '',
    transaction_type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    unit_cost: 0,
    total_cost: 0,
    notes: '',
    clinic_id: '',
    created_by: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories with mock data since the schema has issues
      const mockCategories: InventoryCategory[] = [
        { id: '1', name: 'Dental Supplies', description: 'Basic dental supplies', clinic_id: '1', is_active: true },
        { id: '2', name: 'Equipment', description: 'Dental equipment', clinic_id: '1', is_active: true },
        { id: '3', name: 'Medications', description: 'Pharmaceutical supplies', clinic_id: '1', is_active: true }
      ];
      setCategories(mockCategories);

      // Fetch items with mock data
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          name: 'Dental Gloves',
          description: 'Disposable latex gloves',
          sku: 'DG001',
          current_stock: 500,
          minimum_stock: 100,
          unit_cost: 0.25,
          unit_type: 'pieces',
          category_id: '1',
          clinic_id: '1',
          is_active: true,
          supplier_name: 'MedSupply Co',
          supplier_contact: 'contact@medsupply.com',
          category_name: 'Dental Supplies'
        },
        {
          id: '2',
          name: 'Dental Composite',
          description: 'Tooth-colored filling material',
          sku: 'DC002',
          current_stock: 25,
          minimum_stock: 10,
          unit_cost: 45.00,
          unit_type: 'tubes',
          category_id: '1',
          clinic_id: '1',
          is_active: true,
          supplier_name: 'DentalTech Ltd',
          supplier_contact: 'orders@dentaltech.com',
          category_name: 'Dental Supplies'
        }
      ];
      setItems(mockItems);

      // Fetch transactions with mock data
      const mockTransactions: InventoryTransaction[] = [
        {
          id: '1',
          item_id: '1',
          clinic_id: '1',
          transaction_type: 'in',
          quantity: 100,
          unit_cost: 0.25,
          total_cost: 25.00,
          notes: 'Monthly restock',
          created_by: 'user1',
          created_at: new Date().toISOString(),
          performed_by: 'user1',
          item_name: 'Dental Gloves',
          performer_name: 'Staff Member'
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.unit_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Mock implementation - in real app would insert to database
      const mockItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...newItem,
        category_name: categories.find(c => c.id === newItem.category_id)?.name
      };

      if (editingItem) {
        setItems(items.map(item => item.id === editingItem.id ? mockItem : item));
        toast.success('Item updated successfully');
      } else {
        setItems([...items, mockItem]);
        toast.success('Item added successfully');
      }

      setShowAddItem(false);
      resetNewItem();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      // Mock implementation
      const mockCategory: InventoryCategory = {
        id: Math.random().toString(36).substr(2, 9),
        ...newCategory
      };

      setCategories([...categories, mockCategory]);
      setShowAddCategory(false);
      setNewCategory({ name: '', description: '', clinic_id: '', is_active: true });
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleTransaction = async () => {
    if (!newTransaction.item_id || !newTransaction.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Mock implementation
      const mockTransaction: InventoryTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        ...newTransaction,
        created_at: new Date().toISOString(),
        performed_by: newTransaction.created_by,
        item_name: items.find(i => i.id === newTransaction.item_id)?.name,
        performer_name: 'Current User'
      };

      setTransactions([...transactions, mockTransaction]);
      
      // Update item stock
      setItems(items.map(item => {
        if (item.id === newTransaction.item_id) {
          const stockChange = newTransaction.transaction_type === 'in' ? 
            newTransaction.quantity : -newTransaction.quantity;
          return { ...item, current_stock: item.current_stock + stockChange };
        }
        return item;
      }));

      setShowTransaction(false);
      setNewTransaction({
        item_id: '',
        transaction_type: 'in',
        quantity: 0,
        unit_cost: 0,
        total_cost: 0,
        notes: '',
        clinic_id: '',
        created_by: ''
      });
      toast.success('Transaction recorded successfully');
    } catch (error) {
      console.error('Error recording transaction:', error);
      toast.error('Failed to record transaction');
    }
  };

  const resetNewItem = () => {
    setNewItem({
      name: '',
      description: '',
      sku: '',
      category_id: '',
      current_stock: 0,
      minimum_stock: 0,
      unit_cost: 0,
      unit_type: 'pieces',
      supplier_name: '',
      supplier_contact: '',
      expiry_date: '',
      clinic_id: '',
      is_active: true
    });
    setEditingItem(null);
  };

  const handleEditItem = (item: InventoryItem) => {
    setNewItem({
      name: item.name,
      description: item.description || '',
      sku: item.sku || '',
      category_id: item.category_id || '',
      current_stock: item.current_stock,
      minimum_stock: item.minimum_stock,
      unit_cost: item.unit_cost,
      unit_type: item.unit_type,
      supplier_name: item.supplier_name || '',
      supplier_contact: item.supplier_contact || '',
      expiry_date: item.expiry_date || '',
      clinic_id: item.clinic_id,
      is_active: item.is_active
    });
    setEditingItem(item);
    setShowAddItem(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setItems(items.filter(item => item.id !== itemId));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = items.filter(item => item.current_stock <= item.minimum_stock);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-600">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your clinic's inventory and supplies</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Input
                    id="categoryDescription"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="Enter category description"
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full">
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showTransaction} onOpenChange={setShowTransaction}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Record Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Inventory Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transactionItem">Item</Label>
                  <Select value={newTransaction.item_id} onValueChange={(value) => setNewTransaction({...newTransaction, item_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (Current: {item.current_stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select value={newTransaction.transaction_type} onValueChange={(value: 'in' | 'out' | 'adjustment') => setNewTransaction({...newTransaction, transaction_type: value})}>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newTransaction.quantity}
                      onChange={(e) => setNewTransaction({...newTransaction, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitCost">Unit Cost</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      value={newTransaction.unit_cost}
                      onChange={(e) => setNewTransaction({...newTransaction, unit_cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="transactionNotes">Notes</Label>
                  <Input
                    id="transactionNotes"
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                    placeholder="Optional notes"
                  />
                </div>
                <Button onClick={handleTransaction} className="w-full">
                  Record Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
            <DialogTrigger asChild>
              <Button onClick={() => resetNewItem()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemSku">SKU</Label>
                    <Input
                      id="itemSku"
                      value={newItem.sku}
                      onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                      placeholder="Enter SKU"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="itemDescription">Description</Label>
                  <Input
                    id="itemDescription"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Enter item description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemCategory">Category</Label>
                    <Select value={newItem.category_id} onValueChange={(value) => setNewItem({...newItem, category_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="itemUnit">Unit Type</Label>
                    <Select value={newItem.unit_type} onValueChange={(value) => setNewItem({...newItem, unit_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="tubes">Tubes</SelectItem>
                        <SelectItem value="bottles">Bottles</SelectItem>
                        <SelectItem value="kilograms">Kilograms</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={newItem.current_stock}
                      onChange={(e) => setNewItem({...newItem, current_stock: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStock">Minimum Stock</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={newItem.minimum_stock}
                      onChange={(e) => setNewItem({...newItem, minimum_stock: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitCost">Unit Cost</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      value={newItem.unit_cost}
                      onChange={(e) => setNewItem({...newItem, unit_cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierName">Supplier Name</Label>
                    <Input
                      id="supplierName"
                      value={newItem.supplier_name}
                      onChange={(e) => setNewItem({...newItem, supplier_name: e.target.value})}
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierContact">Supplier Contact</Label>
                    <Input
                      id="supplierContact"
                      value={newItem.supplier_contact}
                      onChange={(e) => setNewItem({...newItem, supplier_contact: e.target.value})}
                      placeholder="Enter supplier contact"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newItem.expiry_date}
                    onChange={(e) => setNewItem({...newItem, expiry_date: e.target.value})}
                  />
                </div>

                <Button onClick={handleAddItem} className="w-full">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="font-medium text-destructive">
                {lowStockItems.length} item(s) are running low on stock
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search items by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`hover:shadow-lg transition-shadow ${
            item.current_stock <= item.minimum_stock ? 'border-destructive' : ''
          }`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.sku}</p>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stock Level</span>
                  <Badge variant={item.current_stock <= item.minimum_stock ? "destructive" : "default"}>
                    {item.current_stock} {item.unit_type}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Min Stock</span>
                  <span className="text-sm">{item.minimum_stock} {item.unit_type}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unit Cost</span>
                  <span className="text-sm font-medium">${item.unit_cost.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <span className="text-sm">{item.category_name || 'Uncategorized'}</span>
                </div>
                
                {item.supplier_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Supplier</span>
                    <span className="text-sm">{item.supplier_name}</span>
                  </div>
                )}
                
                {item.expiry_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expires</span>
                    <span className="text-sm">{new Date(item.expiry_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            {searchTerm || selectedCategory !== 'all' ? 'No matching items found' : 'No inventory items yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search filters' 
              : 'Add your first inventory item to get started'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <Button onClick={() => setShowAddItem(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;