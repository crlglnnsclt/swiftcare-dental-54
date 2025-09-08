import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Check, X, Search, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentProof {
  id: string;
  invoice_id: string;
  patient_id: string;
  clinic_id: string;
  payment_method: string;
  amount: number;
  proof_file_url: string;
  notes: string | null;
  status: string;
  submitted_at: string;
  verified_at: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
  patients?: {
    full_name: string;
  } | null;
}

export default function PaymentVerificationManager() {
  const { toast } = useToast();
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchPaymentProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_proofs')
        .select(`
          *,
          patients!inner (
            full_name
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setPaymentProofs((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching payment proofs:', error);
      toast({
        title: "Error Loading Payment Proofs",
        description: "Failed to load payment proofs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentProofs();
  }, []);

  const handleVerification = async (proofId: string, action: 'approve' | 'reject') => {
    setIsVerifying(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('payment_proofs')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          verification_notes: verificationNotes || null,
        })
        .eq('id', proofId);

      if (error) throw error;

      toast({
        title: `Payment ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `Payment proof has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });

      // Refresh the list
      fetchPaymentProofs();
      setSelectedProof(null);
      setVerificationNotes("");
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getFileUrl = (filePath: string) => {
    return `https://ojytxmiuitrjtrocfgei.supabase.co/storage/v1/object/public/payment-proofs/${filePath}`;
  };

  const filteredProofs = paymentProofs.filter(proof =>
    proof.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proof.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proof.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading payment proofs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Verification</h2>
          <p className="text-muted-foreground">Review and verify patient payment submissions</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by invoice ID, patient name, or payment method..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Payment Proofs List */}
      <div className="space-y-4">
        {filteredProofs.map((proof) => (
          <Card key={proof.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">Invoice {proof.invoice_id}</CardTitle>
                    <CardDescription>
                      Patient: {proof.patients?.full_name} • 
                      Submitted: {new Date(proof.submitted_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(proof.status)}>
                    {proof.status.charAt(0).toUpperCase() + proof.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${(Number(proof.amount) || 0).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{proof.payment_method}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(proof.submitted_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{proof.payment_method}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedProof(proof)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Payment Proof Details</DialogTitle>
                        <DialogDescription>
                          Review payment submission for invoice {proof.invoice_id}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedProof && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Patient</Label>
                              <p className="font-medium">{selectedProof.patients?.full_name}</p>
                            </div>
                            <div>
                              <Label>Invoice ID</Label>
                              <p className="font-medium">{selectedProof.invoice_id}</p>
                            </div>
                            <div>
                              <Label>Amount</Label>
                              <p className="font-medium">${(Number(selectedProof.amount) || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <Label>Payment Method</Label>
                              <p className="font-medium">{selectedProof.payment_method}</p>
                            </div>
                          </div>

                          {selectedProof.notes && (
                            <div>
                              <Label>Patient Notes</Label>
                              <p className="text-sm bg-gray-50 p-2 rounded">{selectedProof.notes}</p>
                            </div>
                          )}

                          <div>
                            <Label>Payment Proof</Label>
                            <div className="mt-2">
                              <img 
                                src={getFileUrl(selectedProof.proof_file_url)} 
                                alt="Payment proof"
                                className="max-w-full h-auto rounded border"
                              />
                            </div>
                          </div>

                          {selectedProof.status === 'pending' && (
                            <div>
                              <Label htmlFor="verificationNotes">Verification Notes</Label>
                              <Textarea
                                id="verificationNotes"
                                placeholder="Add notes about the verification..."
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                rows={3}
                              />
                            </div>
                          )}

                          {selectedProof.verification_notes && (
                            <div>
                              <Label>Verification Notes</Label>
                              <p className="text-sm bg-gray-50 p-2 rounded">{selectedProof.verification_notes}</p>
                            </div>
                          )}

                          {selectedProof.status === 'pending' && (
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => handleVerification(selectedProof.id, 'reject')}
                                disabled={isVerifying}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleVerification(selectedProof.id, 'approve')}
                                disabled={isVerifying}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProofs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Eye className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Payment Proofs Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "No payment proofs match your search." : "No payment proofs have been submitted yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}