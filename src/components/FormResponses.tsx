import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function FormResponses() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role && ['admin', 'staff', 'dentist', 'super_admin'].includes(profile.role)) {
      fetchFormResponses();
    }
  }, [profile]);

  const fetchFormResponses = async () => {
    try {
      setLoading(true);
      // Since we don't have patient_form_responses table, we'll show an empty state
      setResponses([]);
    } catch (error) {
      console.error('Error fetching form responses:', error);
      toast({
        title: "Error",
        description: "Failed to load form responses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResponse = async (responseId: string, status: 'approved' | 'rejected') => {
    try {
      // Since we don't have patient_form_responses table, this is a no-op
      toast({
        title: "Feature Not Available",
        description: "Form response verification is not available in this version",
        variant: "default"
      });
    } catch (error) {
      console.error('Error verifying response:', error);
      toast({
        title: "Error",
        description: "Failed to verify response",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive">Rejected</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
    }
  };

  const filteredResponses = responses.filter(response => {
    const matchesSearch = !searchTerm || 
      response.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.digital_forms?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || response.verification_status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Loading form responses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card card-3d">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 float-gentle" />
            Form Responses
          </CardTitle>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredResponses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No form responses found</p>
          ) : (
            filteredResponses.map((response) => (
              <div key={response.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-medical-blue/10 flex items-center justify-center">
                    {getStatusIcon(response.verification_status)}
                  </div>
                  <div>
                    <p className="font-medium">{response.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{response.digital_forms?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(response.submitted_at).toLocaleString()}
                    </p>
                    {response.signature_data && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Digitally Signed
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(response.verification_status)}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedResponse(response)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Form Response - {response.digital_forms?.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Patient Info */}
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Patient Information</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Name:</span> {response.profiles?.full_name}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {response.profiles?.email}
                            </div>
                            <div>
                              <span className="font-medium">Submitted:</span> {new Date(response.submitted_at).toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span> {getStatusBadge(response.verification_status)}
                            </div>
                          </div>
                        </div>

                        {/* Form Responses */}
                        <div>
                          <h3 className="font-medium mb-3">Form Responses</h3>
                          <div className="space-y-3">
                            {response.responses && typeof response.responses === 'object' ? 
                              Object.entries(response.responses).map(([key, value]) => (
                                <div key={key} className="border rounded-lg p-3">
                                  <p className="font-medium text-sm mb-1">{key}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {String(value)}
                                  </p>
                                </div>
                              )) :
                              <p className="text-muted-foreground">No response data available</p>
                            }
                          </div>
                        </div>

                        {/* Digital Signature */}
                        {response.signature_data && (
                          <div>
                            <h3 className="font-medium mb-3">Digital Signature</h3>
                            <div className="border rounded-lg p-4 bg-muted/50">
                              <p className="text-sm text-muted-foreground mb-2">
                                Signed on: {new Date(response.signature_timestamp).toLocaleString()}
                              </p>
                              <div className="bg-white border rounded p-2">
                                <img 
                                  src={response.signature_data} 
                                  alt="Digital Signature" 
                                  className="max-w-full h-20 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Verification Section */}
                        {response.verification_status === 'pending' && (
                          <div className="border-t pt-4">
                            <h3 className="font-medium mb-3">Verification</h3>
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Add verification notes (optional)..."
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  className="bg-success text-white"
                                  onClick={() => handleVerifyResponse(response.id, 'approved')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleVerifyResponse(response.id, 'rejected')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Existing Verification */}
                        {response.verification_status !== 'pending' && (
                          <div className="border-t pt-4">
                            <h3 className="font-medium mb-3">Verification Details</h3>
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="text-sm">
                                <span className="font-medium">Status:</span> {response.verification_status}
                              </p>
                              {response.verified_at && (
                                <p className="text-sm">
                                  <span className="font-medium">Verified:</span> {new Date(response.verified_at).toLocaleString()}
                                </p>
                              )}
                              {response.verification_notes && (
                                <p className="text-sm mt-2">
                                  <span className="font-medium">Notes:</span> {response.verification_notes}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
