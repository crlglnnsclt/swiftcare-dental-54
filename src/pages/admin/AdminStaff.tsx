import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Plus, UserCheck, Shield, Mail, Phone } from 'lucide-react';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground mt-2">Manage clinic staff and permissions</p>
          </div>
          <Button className="medical-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Staff management functionality coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}