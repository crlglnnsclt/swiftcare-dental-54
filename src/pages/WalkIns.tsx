import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { UserPlus, Clock, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

interface WalkInPatient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  priority: 'emergency' | 'urgent' | 'normal';
  reason: string;
  estimated_wait: number;
  status: 'waiting' | 'called' | 'in_treatment' | 'completed';
  checked_in_at: string;
  position: number;
}

export default function WalkIns() {
  const [walkIns, setWalkIns] = useState<WalkInPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWalkIn, setNewWalkIn] = useState({
    name: '',
    phone: '',
    email: '',
    priority: 'normal',
    reason: ''
  });
  const { profile } = useAuth();

  useEffect(() => {
    fetchWalkIns();
    // Simulate real-time updates
    const interval = setInterval(fetchWalkIns, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWalkIns = async () => {
    try {
      // Mock data for now - in real implementation, this would fetch from queue table
      const mockWalkIns: WalkInPatient[] = [
        {
          id: '1',
          name: 'John Doe',
          phone: '(555) 123-4567',
          priority: 'normal',
          reason: 'Tooth pain',
          estimated_wait: 25,
          status: 'waiting',
          checked_in_at: new Date(Date.now() - 30 * 60000).toISOString(),
          position: 1
        },
        {
          id: '2',
          name: 'Jane Smith',
          phone: '(555) 987-6543',
          priority: 'urgent',
          reason: 'Broken tooth',
          estimated_wait: 10,
          status: 'waiting',
          checked_in_at: new Date(Date.now() - 15 * 60000).toISOString(),
          position: 2
        },
        {
          id: '3',
          name: 'Emergency Case',
          phone: '(555) 111-2222',
          priority: 'emergency',
          reason: 'Severe dental pain, swelling',
          estimated_wait: 0,
          status: 'called',
          checked_in_at: new Date(Date.now() - 5 * 60000).toISOString(),
          position: 0
        }
      ];
      
      setWalkIns(mockWalkIns);
    } catch (error) {
      console.error('Error fetching walk-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWalkIn = async () => {
    if (!newWalkIn.name.trim() || !newWalkIn.reason.trim()) {
      toast.error('Please fill in name and reason for visit');
      return;
    }

    try {
      const walkIn: WalkInPatient = {
        id: Date.now().toString(),
        name: newWalkIn.name,
        phone: newWalkIn.phone,
        email: newWalkIn.email,
        priority: newWalkIn.priority as any,
        reason: newWalkIn.reason,
        estimated_wait: calculateEstimatedWait(newWalkIn.priority as any),
        status: 'waiting',
        checked_in_at: new Date().toISOString(),
        position: walkIns.filter(w => w.status === 'waiting').length + 1
      };

      setWalkIns(prev => [...prev, walkIn]);
      setShowAddDialog(false);
      setNewWalkIn({ name: '', phone: '', email: '', priority: 'normal', reason: '' });
      toast.success('Walk-in patient added to queue');
    } catch (error) {
      console.error('Error adding walk-in:', error);
      toast.error('Failed to add walk-in patient');
    }
  };

  const calculateEstimatedWait = (priority: 'emergency' | 'urgent' | 'normal'): number => {
    const baseWait = walkIns.filter(w => w.status === 'waiting').length * 20; // 20 min per patient
    
    switch (priority) {
      case 'emergency': return 0;
      case 'urgent': return Math.max(5, baseWait * 0.3);
      case 'normal': return baseWait;
      default: return baseWait;
    }
  };

  const updatePatientStatus = async (patientId: string, newStatus: string) => {
    try {
      setWalkIns(prev => prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, status: newStatus as any }
          : patient
      ));
      toast.success(`Patient status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating patient status:', error);
      toast.error('Failed to update patient status');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'called': return 'bg-blue-100 text-blue-800';
      case 'in_treatment': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeWaiting = (checkedInAt: string) => {
    const minutes = Math.floor((Date.now() - new Date(checkedInAt).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const waitingCount = walkIns.filter(w => w.status === 'waiting').length;
  const inTreatmentCount = walkIns.filter(w => w.status === 'in_treatment').length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Walk-in Patients</h1>
          <p className="text-muted-foreground">Manage patients without appointments</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Walk-in
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Walk-in Patient</DialogTitle>
              <DialogDescription>
                Register a new walk-in patient to the queue
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Patient Name *</Label>
                <Input
                  id="name"
                  value={newWalkIn.name}
                  onChange={(e) => setNewWalkIn(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newWalkIn.phone}
                  onChange={(e) => setNewWalkIn(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newWalkIn.email}
                  onChange={(e) => setNewWalkIn(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="patient@email.com"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={newWalkIn.priority} onValueChange={(value) => setNewWalkIn(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reason">Reason for Visit *</Label>
                <Input
                  id="reason"
                  value={newWalkIn.reason}
                  onChange={(e) => setNewWalkIn(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addWalkIn}>
                Add to Queue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitingCount}</div>
            <p className="text-xs text-muted-foreground">
              patients in queue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Treatment</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTreatmentCount}</div>
            <p className="text-xs text-muted-foreground">
              being treated now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(walkIns.reduce((acc, w) => acc + w.estimated_wait, 0) / walkIns.length || 0)}m
            </div>
            <p className="text-xs text-muted-foreground">
              estimated wait
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Walk-in Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Walk-in Queue</CardTitle>
          <CardDescription>
            Manage walk-in patients and their priority status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wait Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {walkIns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No walk-in patients currently
                  </TableCell>
                </TableRow>
              ) : (
                walkIns
                  .sort((a, b) => {
                    // Sort by priority first (emergency first), then by position
                    const priorityOrder = { emergency: 3, urgent: 2, normal: 1 };
                    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                      return priorityOrder[b.priority] - priorityOrder[a.priority];
                    }
                    return a.position - b.position;
                  })
                  .map((patient, index) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        {patient.priority === 'emergency' ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-red-600 font-bold">NEXT</span>
                          </div>
                        ) : (
                          `#${index + 1}`
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {patient.phone && <div>{patient.phone}</div>}
                          {patient.email && <div className="text-muted-foreground">{patient.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{patient.reason}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(patient.priority)}>
                          {patient.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Waited: {getTimeWaiting(patient.checked_in_at)}</div>
                          <div className="text-muted-foreground">
                            Est: {patient.estimated_wait}m
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {patient.status === 'waiting' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePatientStatus(patient.id, 'called')}
                            >
                              Call
                            </Button>
                          )}
                          {patient.status === 'called' && (
                            <Button
                              size="sm"
                              onClick={() => updatePatientStatus(patient.id, 'in_treatment')}
                            >
                              Start
                            </Button>
                          )}
                          {patient.status === 'in_treatment' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updatePatientStatus(patient.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}