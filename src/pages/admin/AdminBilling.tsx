import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus } from 'lucide-react';

export default function AdminBilling() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing Management</h1>
            <p className="text-muted-foreground mt-2">Manage invoices and payments</p>
          </div>
          <Button className="medical-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Billing Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Billing management functionality coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}