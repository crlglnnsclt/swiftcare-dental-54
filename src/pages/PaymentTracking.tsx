import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, CreditCard, DollarSign, Search, Plus, Check, X, Clock, FileText } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PaymentTracking() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    invoiceId: "",
    amount: "",
    paymentMethod: "",
    notes: ""
  });

  useEffect(() => {
    if (profile?.clinic_id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch invoices with patient info
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          patients!invoices_patient_id_fkey(full_name, contact_number)
        `)
        .eq('clinic_id', profile?.clinic_id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          patients!payments_patient_id_fkey(full_name, contact_number)
        `)
        .eq('clinic_id', profile?.clinic_id)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!newPayment.invoiceId || !newPayment.amount || !newPayment.paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedInvoice = invoices.find(inv => inv.id === newPayment.invoiceId);
      const paymentAmount = parseFloat(newPayment.amount);

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          patient_id: selectedInvoice.patient_id,
          clinic_id: profile?.clinic_id,
          amount: paymentAmount,
          payment_method: newPayment.paymentMethod,
          payment_status: 'completed',
          notes: newPayment.notes,
          treatment_description: `Payment for Invoice #${selectedInvoice.invoice_number}`,
          verified_by: profile?.user_id,
          verified_at: new Date().toISOString()
        });

      if (paymentError) throw paymentError;

      // Update invoice payment status
      const newAmountPaid = selectedInvoice.amount_paid + paymentAmount;
      const newBalanceDue = selectedInvoice.total_amount - newAmountPaid;
      const newPaymentStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          balance_due: newBalanceDue,
          payment_status: newPaymentStatus,
          payment_date: newPaymentStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', newPayment.invoiceId);

      if (invoiceError) throw invoiceError;

      // Reset form and refresh data
      setNewPayment({
        invoiceId: "",
        amount: "",
        paymentMethod: "",
        notes: ""
      });
      setShowRecordPayment(false);
      fetchData();

      toast({
        title: "Payment Recorded",
        description: "Payment has been successfully recorded and invoice updated.",
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Partial</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalRevenue: payments.filter(p => p.payment_status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0),
    pendingAmount: invoices.filter(inv => inv.payment_status === 'pending').reduce((sum, inv) => sum + Number(inv.balance_due), 0),
    overdueAmount: invoices.filter(inv => inv.payment_status === 'overdue').reduce((sum, inv) => sum + Number(inv.balance_due), 0),
    totalInvoices: invoices.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Tracking</h1>
          <p className="text-muted-foreground">Track payments, manage invoices, and monitor financial status</p>
        </div>
        
        <Dialog open={showRecordPayment} onOpenChange={setShowRecordPayment}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice">Invoice</Label>
                <Select value={newPayment.invoiceId} onValueChange={(value) => {
                  const invoice = invoices.find(inv => inv.id === value);
                  setNewPayment({ 
                    ...newPayment, 
                    invoiceId: value,
                    amount: invoice?.balance_due?.toString() || ""
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.filter(inv => inv.balance_due > 0).map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number} - {invoice.patients?.full_name} (${invoice.balance_due} due)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select value={newPayment.paymentMethod} onValueChange={(value) => setNewPayment({ ...newPayment, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="gcash">GCash</SelectItem>
                      <SelectItem value="paymaya">PayMaya</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional payment details..."
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowRecordPayment(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRecordPayment}>
                  Record Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${stats.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${stats.overdueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Past due invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">All invoices</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                      <CardDescription>
                        {invoice.patients?.full_name} • {new Date(invoice.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(invoice.payment_status)}
                      <div className="text-lg font-bold">${invoice.total_amount}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Amount Paid</p>
                      <p className="text-green-600 font-semibold">${invoice.amount_paid}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Balance Due</p>
                      <p className="text-red-600 font-semibold">${invoice.balance_due}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-sm">{invoice.payment_method || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {invoice.balance_due > 0 && (
                    <div className="flex justify-end mt-4 pt-4 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setNewPayment({
                            invoiceId: invoice.id,
                            amount: invoice.balance_due.toString(),
                            paymentMethod: "",
                            notes: ""
                          });
                          setShowRecordPayment(true);
                        }}
                      >
                        <Receipt className="w-4 h-4 mr-2" />
                        Record Payment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{payment.patients?.full_name}</CardTitle>
                      <CardDescription>
                        {payment.treatment_description} • {new Date(payment.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {payment.payment_status}
                      </Badge>
                      <div className="text-lg font-bold">${payment.amount}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-sm">{payment.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Verified By</p>
                      <p className="text-sm">{payment.verified_at ? 'Verified' : 'Pending verification'}</p>
                    </div>
                  </div>
                  {payment.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Notes</p>
                      <p className="text-sm text-muted-foreground">{payment.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No invoices match your search criteria." : "No invoices have been created yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}