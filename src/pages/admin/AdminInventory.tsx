import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

export default function AdminInventory() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground mt-2">Track supplies and equipment</p>
          </div>
          <Button className="medical-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Inventory management functionality coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}