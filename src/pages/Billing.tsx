import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, CreditCard, DollarSign, FileText, Plus, Search, Eye, Edit } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    overdueAmount: 0,
    paymentMethods: 3
  });
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    patient_id: '',
    service_name: '',
    amount: '',
    description: '',
    due_date: ''
  });
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.enhanced_role && ['admin', 'staff', 'super_admin'].includes(profile.enhanced_role)) {
      fetchBillingData();
      fetchStats();
    }
  }, [profile]);

  const fetchBillingData = async () => {
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          profiles!payments_patient_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      setInvoices(payments || []);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate total revenue from completed payments
      const { data: completedPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('payment_status', 'completed');

      const totalRevenue = completedPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Calculate pending payments
      const { data: pendingPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('verification_status', 'pending');

      const pendingAmount = pendingPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      setStats({
        totalRevenue,
        pendingPayments: pendingAmount,
        overdueAmount: 0, // TODO: Calculate based on due dates
        paymentMethods: 3
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.patient_id || !newInvoice.service_name || !newInvoice.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          patient_id: newInvoice.patient_id,
          appointment_id: '00000000-0000-0000-0000-000000000000', // Placeholder for invoice-only payments
          service_name: newInvoice.service_name,
          amount: Number(newInvoice.amount),
          payment_status: 'pending',
          verification_status: 'pending',
          payment_method: 'invoice'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      setIsCreateInvoiceOpen(false);
      setNewInvoice({
        patient_id: '',
        service_name: '',
        amount: '',
        description: '',
        due_date: ''
      });
      fetchBillingData();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage invoices, payments, and financial records</p>
        </div>
        <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
          <DialogTrigger asChild>
            <Button className="medical-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient-select">Patient</Label>
                <Input
                  id="patient-select"
                  placeholder="Patient ID (UUID)"
                  value={newInvoice.patient_id}
                  onChange={(e) => setNewInvoice({...newInvoice, patient_id: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  placeholder="e.g., Dental Cleaning"
                  value={newInvoice.service_name}
                  onChange={(e) => setNewInvoice({...newInvoice, service_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details..."
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                />
              </div>
              <Button onClick={handleCreateInvoice} className="w-full medical-gradient text-white">
                Create Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-blue">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total completed payments</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${stats.pendingPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$0</div>
            <p className="text-xs text-muted-foreground">0 invoices overdue</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-medical-blue">0</div>
            <p className="text-xs text-muted-foreground">Active payment options</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Manage patient invoices and payment records</CardDescription>
                </div>
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-medium">Recent Invoices</h4>
                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No invoices found. Create your first invoice to get started.</p>
                  </div>
                ) : (
                  invoices
                    .filter(invoice => 
                      !searchTerm || 
                      invoice.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      invoice.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">#{invoice.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">{invoice.profiles?.full_name}</p>
                          </div>
                          <div>
                            <p className="text-sm">{invoice.service_name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(invoice.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(invoice.verification_status)}>
                          {invoice.verification_status}
                        </Badge>
                        <p className="font-bold text-lg">${Number(invoice.amount).toFixed(2)}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure payment processing and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-medical-blue" />
                    <div>
                      <h3 className="font-medium">Credit Cards</h3>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-8 w-8 text-medical-blue" />
                    <div>
                      <h3 className="font-medium">Digital Wallets</h3>
                      <p className="text-sm text-muted-foreground">GCash, PayMaya</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-medical-blue" />
                    <div>
                      <h3 className="font-medium">Bank Transfer</h3>
                      <p className="text-sm text-muted-foreground">Direct bank deposits</p>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Insurance Integration</CardTitle>
              <CardDescription>Manage insurance claims and coverage verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Insurance Management</h3>
                <p className="text-muted-foreground mb-6">
                  Set up insurance provider integrations, manage claims, and verify coverage.
                </p>
                <Button className="medical-gradient text-white">
                  Configure Insurance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate comprehensive financial analytics and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Advanced Reports</h3>
                <p className="text-muted-foreground mb-6">
                  Generate detailed financial reports, revenue analytics, and payment summaries.
                </p>
                <Button className="medical-gradient text-white">
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}