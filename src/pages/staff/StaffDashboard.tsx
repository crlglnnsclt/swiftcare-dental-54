import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Clock, Plus } from 'lucide-react';

export default function StaffDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
            <p className="text-muted-foreground mt-2">Front desk operations overview</p>
          </div>
          <Button className="medical-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Quick Action
          </Button>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Today's Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Staff dashboard functionality coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}