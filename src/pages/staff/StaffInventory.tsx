import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StaffInventory() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
        <Card className="glass-card">
          <CardHeader><CardTitle>Supply Management</CardTitle></CardHeader>
          <CardContent><div className="text-center py-8 text-muted-foreground">Functionality coming soon...</div></CardContent>
        </Card>
      </div>
    </div>
  );
}