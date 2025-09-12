import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Plus } from 'lucide-react';

export default function AdminTreatment() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Treatment Management</h1>
            <p className="text-muted-foreground mt-2">Manage treatments and procedures</p>
          </div>
          <Button className="medical-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Treatment
          </Button>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Treatment Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Treatment management functionality coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}