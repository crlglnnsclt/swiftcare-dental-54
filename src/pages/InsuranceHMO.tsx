import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Shield, Plus, FileText, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Insurance {
  id: string;
  patient_name: string;
  patient_id: string;
  provider_name: string;
  provider_type: 'hmo' | 'insurance' | 'government';
  member_id: string;
  group_number?: string;
  coverage_type: string;
  coverage_percentage: number;
  annual_limit?: number;
  deductible?: number;
  status: 'active' | 'expired' | 'pending_verification';
  expiry_date?: string;
  uploaded_documents: string[];
  last_verified: string;
}

interface Claim {
  id: string;
  claim_number: string;
  patient_name: string;
  insurance_provider: string;
  treatment_date: string;
  claim_amount: number;
  approved_amount?: number;
  status: 'submitted' | 'processing' | 'approved' | 'denied' | 'paid';
  submission_date: string;
  notes?: string;
}

export default function InsuranceHMO() {
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newInsurance, setNewInsurance] = useState({
    patient_id: '',
    provider_name: '',
    provider_type: 'insurance',
    member_id: '',
    group_number: '',
    coverage_type: '',
    coverage_percentage: 80,
    annual_limit: '',
    deductible: '',
    expiry_date: ''
  });
  const { profile } = useAuth();

  useEffect(() => {
    fetchInsuranceData();
    fetchClaims();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      // Mock insurance data
      const mockInsurances: Insurance[] = [
        {
          id: '1',
          patient_name: 'Maria Santos',
          patient_id: '1',
          provider_name: 'PhilHealth',
          provider_type: 'government',
          member_id: 'PH-123456789',
          coverage_type: 'Basic Coverage',
          coverage_percentage: 60,
          annual_limit: 50000,
          deductible: 1000,
          status: 'active',
          expiry_date: '2024-12-31',
          uploaded_documents: ['philhealth-card.jpg', 'mdr.pdf'],
          last_verified: '2024-01-15'
        },
        {
          id: '2',
          patient_name: 'Carlos Mendoza',
          patient_id: '2',
          provider_name: 'Maxicare',
          provider_type: 'hmo',
          member_id: 'MC-987654321',
          group_number: 'GRP-001',
          coverage_type: 'Premier Plan',
          coverage_percentage: 100,
          annual_limit: 150000,
          deductible: 0,
          status: 'active',
          expiry_date: '2024-08-30',
          uploaded_documents: ['maxicare-card.jpg'],
          last_verified: '2024-02-01'
        },
        {
          id: '3',
          patient_name: 'Ana Lopez',
          patient_id: '3',
          provider_name: 'Medicard',
          provider_type: 'hmo',
          member_id: 'MD-456789123',
          coverage_type: 'Gold Plan',
          coverage_percentage: 90,
          annual_limit: 100000,
          deductible: 500,
          status: 'pending_verification',
          expiry_date: '2025-01-15',
          uploaded_documents: ['medicard-card.jpg'],
          last_verified: '2024-01-01'
        }
      ];

      setInsurances(mockInsurances);
    } catch (error) {
      console.error('Error fetching insurance data:', error);
      toast.error('Failed to load insurance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      // Mock claims data
      const mockClaims: Claim[] = [
        {
          id: '1',
          claim_number: 'CLM-2024-001',
          patient_name: 'Maria Santos',
          insurance_provider: 'PhilHealth',
          treatment_date: '2024-01-20',
          claim_amount: 5000,
          approved_amount: 3000,
          status: 'approved',
          submission_date: '2024-01-21',
          notes: 'Routine cleaning and filling'
        },
        {
          id: '2',
          claim_number: 'CLM-2024-002',
          patient_name: 'Carlos Mendoza',
          insurance_provider: 'Maxicare',
          treatment_date: '2024-01-25',
          claim_amount: 15000,
          approved_amount: 15000,
          status: 'paid',
          submission_date: '2024-01-26',
          notes: 'Root canal treatment'
        },
        {
          id: '3',
          claim_number: 'CLM-2024-003',
          patient_name: 'Ana Lopez',
          insurance_provider: 'Medicard',
          treatment_date: '2024-02-01',
          claim_amount: 8000,
          status: 'processing',
          submission_date: '2024-02-02',
          notes: 'Dental extraction and crown'
        }
      ];

      setClaims(mockClaims);
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const addInsurance = async () => {
    if (!newInsurance.patient_id || !newInsurance.provider_name || !newInsurance.member_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // In real implementation, this would save to database
      toast.success('Insurance information added successfully');
      setShowAddDialog(false);
      setNewInsurance({
        patient_id: '',
        provider_name: '',
        provider_type: 'insurance',
        member_id: '',
        group_number: '',
        coverage_type: '',
        coverage_percentage: 80,
        annual_limit: '',
        deductible: '',
        expiry_date: ''
      });
      fetchInsuranceData();
    } catch (error) {
      console.error('Error adding insurance:', error);
      toast.error('Failed to add insurance information');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'government': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'hmo': return <Shield className="h-4 w-4 text-green-600" />;
      case 'insurance': return <Shield className="h-4 w-4 text-purple-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredInsurances = insurances.filter(insurance =>
    insurance.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insurance.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insurance.member_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClaims = claims.filter(claim =>
    claim.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.insurance_provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Insurance & HMO Management</h1>
          <p className="text-muted-foreground">Manage patient insurance information and claims</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Insurance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Insurance Information</DialogTitle>
              <DialogDescription>
                Add new insurance or HMO coverage for a patient
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient_id">Patient *</Label>
                <Select value={newInsurance.patient_id} onValueChange={(value) => setNewInsurance(prev => ({ ...prev, patient_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Maria Santos</SelectItem>
                    <SelectItem value="2">Carlos Mendoza</SelectItem>
                    <SelectItem value="3">Ana Lopez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="provider_type">Provider Type *</Label>
                <Select value={newInsurance.provider_type} onValueChange={(value) => setNewInsurance(prev => ({ ...prev, provider_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insurance">Private Insurance</SelectItem>
                    <SelectItem value="hmo">HMO</SelectItem>
                    <SelectItem value="government">Government (PhilHealth)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="provider_name">Provider Name *</Label>
                <Input
                  id="provider_name"
                  value={newInsurance.provider_name}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, provider_name: e.target.value }))}
                  placeholder="e.g., Maxicare, PhilHealth"
                />
              </div>
              <div>
                <Label htmlFor="member_id">Member ID *</Label>
                <Input
                  id="member_id"
                  value={newInsurance.member_id}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, member_id: e.target.value }))}
                  placeholder="Insurance member ID"
                />
              </div>
              <div>
                <Label htmlFor="group_number">Group Number</Label>
                <Input
                  id="group_number"
                  value={newInsurance.group_number}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, group_number: e.target.value }))}
                  placeholder="Group/Plan number"
                />
              </div>
              <div>
                <Label htmlFor="coverage_type">Coverage Type</Label>
                <Input
                  id="coverage_type"
                  value={newInsurance.coverage_type}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, coverage_type: e.target.value }))}
                  placeholder="e.g., Basic, Premier, Gold"
                />
              </div>
              <div>
                <Label htmlFor="coverage_percentage">Coverage Percentage</Label>
                <Input
                  id="coverage_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={newInsurance.coverage_percentage}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, coverage_percentage: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="annual_limit">Annual Limit (₱)</Label>
                <Input
                  id="annual_limit"
                  type="number"
                  value={newInsurance.annual_limit}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, annual_limit: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="deductible">Deductible (₱)</Label>
                <Input
                  id="deductible"
                  type="number"
                  value={newInsurance.deductible}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, deductible: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={newInsurance.expiry_date}
                  onChange={(e) => setNewInsurance(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addInsurance}>
                Add Insurance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="insurance" className="w-full">
        <TabsList>
          <TabsTrigger value="insurance">Insurance Records ({filteredInsurances.length})</TabsTrigger>
          <TabsTrigger value="claims">Claims ({filteredClaims.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Input
                placeholder="Search by patient name, provider, or member ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance & HMO Records</CardTitle>
              <CardDescription>
                Patient insurance and HMO coverage information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInsurances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No insurance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInsurances.map((insurance) => (
                      <TableRow key={insurance.id}>
                        <TableCell className="font-medium">
                          {insurance.patient_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getProviderIcon(insurance.provider_type)}
                            <div>
                              <div className="font-medium">{insurance.provider_name}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {insurance.provider_type}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{insurance.member_id}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{insurance.coverage_percentage}% coverage</div>
                            {insurance.annual_limit && (
                              <div className="text-muted-foreground">
                                Limit: ₱{insurance.annual_limit.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(insurance.status)}>
                            {insurance.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {insurance.expiry_date ? (
                            <div className="text-sm">
                              {new Date(insurance.expiry_date).toLocaleDateString()}
                              {new Date(insurance.expiry_date) < new Date() && (
                                <AlertCircle className="h-3 w-3 text-red-500 inline ml-1" />
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No expiry</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Input
                placeholder="Search by patient name, claim number, or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Claims</CardTitle>
              <CardDescription>
                Track insurance claim submissions and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim Number</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Treatment Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No claims found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-mono">{claim.claim_number}</TableCell>
                        <TableCell className="font-medium">{claim.patient_name}</TableCell>
                        <TableCell>{claim.insurance_provider}</TableCell>
                        <TableCell>{new Date(claim.treatment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>₱{claim.claim_amount.toLocaleString()}</div>
                            {claim.approved_amount && (
                              <div className="text-green-600">
                                Approved: ₱{claim.approved_amount.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {claim.status === 'submitted' && (
                              <Button variant="outline" size="sm">
                                Track
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
        </TabsContent>
      </Tabs>
    </div>
  );
}