import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function PatientBilling() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Payments</h1>
          <p className="text-muted-foreground mt-2">Manage your bills and payment history</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Outstanding Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Billing functionality coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}