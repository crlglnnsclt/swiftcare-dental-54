import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function DentistChart() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Digital Dental Charts</h1>
          <p className="text-muted-foreground mt-2">Interactive tooth charting</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Dental Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Digital charting functionality coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}