import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export default function DentistAIDiagnostics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Diagnostic Tools</h1>
          <p className="text-muted-foreground mt-2">AI-powered clinical assistance</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Diagnostic Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              AI diagnostic tools coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}