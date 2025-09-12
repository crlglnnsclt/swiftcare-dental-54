import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

export default function StaffCheckIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Check-In</h1>
          <p className="text-muted-foreground mt-2">Process patient arrivals</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Check-In Terminal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Check-in functionality coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}