import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Receipt, Download, Search, Calendar, DollarSign, AlertCircle, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PaymentProofUpload from "@/components/PaymentProofUpload";
import PaymentVerificationManager from "@/components/PaymentVerificationManager";
import { useFeatureToggle } from "@/hooks/useFeatureToggle";
import { Navigate } from "react-router-dom";

export default function MyBilling() {
  const { toast } = useToast();
  const featureToggle = useFeatureToggle();
  const isFeatureEnabled = 'isFeatureEnabled' in featureToggle ? featureToggle.isFeatureEnabled : () => false;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if billing feature is enabled
  console.log('MyBilling: Checking billing feature toggle...', isFeatureEnabled('billing_system'));
  if (!isFeatureEnabled('billing_system')) {
    console.log('MyBilling: Billing feature disabled, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const getCurrentUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          setUserRole(userData?.role || 'patient');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('patient');
      }
    };

    getCurrentUserRole();
  }, []);

  const handlePaymentProofSuccess = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Payment Proof Submitted",
      description: "Your payment proof has been submitted and is pending verification.",
    });
  };

  // Demo patient billing data
  const billingData = {
    totalBalance: 1250.00,
    paidThisYear: 3240.00,
    pendingClaims: 650.00,
    nextPaymentDue: "2025-01-15",
    invoices: [
      {
        id: "INV-2025-001",
        date: "2025-01-02",
        services: [
          { name: "Root Canal Treatment", amount: 850.00, covered: 425.00 },
          { name: "Temporary Crown", amount: 200.00, covered: 100.00 }
        ],
        subtotal: 1050.00,
        insurance: 525.00,
        patientPortion: 525.00,
        paid: 0.00,
        status: "pending",
        dueDate: "2025-01-17",
        dentist: "Dr. Michael Chen"
      },
      {
        id: "INV-2024-045",
        date: "2024-12-20",
        services: [
          { name: "Dental Cleaning", amount: 180.00, covered: 144.00 },
          { name: "Fluoride Treatment", amount: 45.00, covered: 36.00 }
        ],
        subtotal: 225.00,
        insurance: 180.00,
        patientPortion: 45.00,
        paid: 45.00,
        status: "paid",
        dueDate: "2025-01-04",
        dentist: "Dr. Sarah Johnson",
        paidDate: "2024-12-22"
      },
      {
        id: "INV-2024-043",
        date: "2024-12-15",
        services: [
          { name: "Crown Placement", amount: 950.00, covered: 475.00 }
        ],
        subtotal: 950.00,
        insurance: 475.00,
        patientPortion: 475.00,
        paid: 475.00,
        status: "paid",
        dueDate: "2024-12-30",
        dentist: "Dr. Lisa Rodriguez",
        paidDate: "2024-12-18"
      },
      {
        id: "INV-2024-038",
        date: "2024-11-10",
        services: [
          { name: "Tooth Filling (2 teeth)", amount: 320.00, covered: 256.00 },
          { name: "X-Ray", amount: 75.00, covered: 60.00 }
        ],
        subtotal: 395.00,
        insurance: 316.00,
        patientPortion: 79.00,
        paid: 79.00,
        status: "paid",
        dueDate: "2024-11-25",
        dentist: "Dr. Sarah Johnson",
        paidDate: "2024-11-12"
      }
    ],
    insuranceInfo: {
      provider: "Delta Dental",
      memberId: "DD123456789",
      groupNumber: "GRP-4567",
      coverage: "80% Basic, 50% Major",
      deductible: 50.00,
      maxBenefit: 2000.00,
      usedBenefit: 1240.00,
      remainingBenefit: 760.00
    },
    paymentMethods: [
      {
        id: 1,
        type: "Visa",
        last4: "4242",
        default: true,
        expires: "12/27"
      },
      {
        id: 2,
        type: "Mastercard",
        last4: "8888",
        default: false,
        expires: "08/26"
      }
    ]
  };

  const filteredInvoices = billingData.invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.services.some(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    invoice.dentist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePayInvoice = (invoiceId: string) => {
    toast({
      title: "Payment Processing",
      description: "Redirecting to secure payment portal...",
    });
    // In real app, redirect to payment processor
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Downloading Invoice",
      description: `Invoice ${invoiceId} is being downloaded.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Billing</h1>
          <p className="text-muted-foreground">View invoices, payments, and insurance information</p>
        </div>
        <Button>
          <CreditCard className="w-4 h-4 mr-2" />
          Make Payment
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${billingData.totalBalance}</div>
            <p className="text-xs text-muted-foreground">
              Due by {billingData.nextPaymentDue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Year</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData.paidThisYear}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">All payments current</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Claims</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData.pendingClaims}</div>
            <p className="text-xs text-muted-foreground">
              Pending processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingData.insuranceInfo.remainingBenefit}</div>
            <p className="text-xs text-muted-foreground">
              2025 benefits available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="insurance">Insurance Info</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          {(userRole === 'clinic_admin' || userRole === 'dentist' || userRole === 'staff' || userRole === 'receptionist') && (
            <TabsTrigger value="verification">Payment Verification</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <CardTitle className="text-lg">{invoice.id}</CardTitle>
                        <CardDescription>
                          {new Date(invoice.date).toLocaleDateString()} • {invoice.dentist}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        ${invoice.patientPortion.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.status === "paid" ? `Paid ${invoice.paidDate}` : `Due ${invoice.dueDate}`}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Services */}
                    <div>
                      <h4 className="font-medium mb-2">Services</h4>
                      <div className="space-y-2">
                        {invoice.services.map((service, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{service.name}</span>
                            <div className="text-right">
                              <span className="font-medium">${service.amount.toFixed(2)}</span>
                              {service.covered > 0 && (
                                <span className="text-muted-foreground ml-2">
                                  (Insurance: ${service.covered.toFixed(2)})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Subtotal</p>
                          <p className="font-medium">${invoice.subtotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Insurance Coverage</p>
                          <p className="font-medium text-green-600">-${invoice.insurance.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Your Portion</p>
                          <p className="font-medium">${invoice.patientPortion.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      {invoice.status === "pending" && userRole === 'patient' && (
                        <>
                          <PaymentProofUpload 
                            invoice={invoice} 
                            onSuccess={handlePaymentProofSuccess}
                          />
                          <Button size="sm" onClick={() => handlePayInvoice(invoice.id)}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Online
                          </Button>
                        </>
                      )}
                      {invoice.status === "pending" && userRole !== 'patient' && (
                        <Button size="sm" onClick={() => handlePayInvoice(invoice.id)}>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Process Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "No invoices match your search." : "You don't have any invoices yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>Your current dental insurance coverage details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Insurance Provider</p>
                    <p className="font-medium">{billingData.insuranceInfo.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member ID</p>
                    <p className="font-medium">{billingData.insuranceInfo.memberId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Group Number</p>
                    <p className="font-medium">{billingData.insuranceInfo.groupNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coverage</p>
                    <p className="font-medium">{billingData.insuranceInfo.coverage}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Deductible</p>
                    <p className="font-medium">${billingData.insuranceInfo.deductible}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Maximum</p>
                    <p className="font-medium">${billingData.insuranceInfo.maxBenefit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Used This Year</p>
                    <p className="font-medium">${billingData.insuranceInfo.usedBenefit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining Benefits</p>
                    <p className="font-medium text-green-600">${billingData.insuranceInfo.remainingBenefit}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Benefit Usage Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: ${billingData.insuranceInfo.usedBenefit}</span>
                    <span>Remaining: ${billingData.insuranceInfo.remainingBenefit}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${(billingData.insuranceInfo.usedBenefit / billingData.insuranceInfo.maxBenefit) * 100}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((billingData.insuranceInfo.usedBenefit / billingData.insuranceInfo.maxBenefit) * 100)}% of annual maximum used
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your saved payment methods</CardDescription>
                </div>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingData.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{method.type} •••• {method.last4}</p>
                        <p className="text-sm text-muted-foreground">Expires {method.expires}</p>
                      </div>
                      {method.default && (
                        <Badge variant="default">Default</Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      {!method.default && (
                        <Button variant="outline" size="sm">Remove</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recent payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {billingData.invoices
                  .filter(inv => inv.status === "paid")
                  .slice(0, 5)
                  .map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.paidDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${invoice.patientPortion.toFixed(2)}</p>
                        <p className="text-sm text-green-600">Paid</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <PaymentVerificationManager key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}