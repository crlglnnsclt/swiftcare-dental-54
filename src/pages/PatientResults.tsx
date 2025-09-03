import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  User,
  DollarSign,
  Lock,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PatientResult {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  created_at: string;
  requires_payment: boolean;
  is_visible_to_patient: boolean;
  appointment_id?: string;
  created_by?: string;
  doctor?: {
    full_name: string;
  };
}

interface PaymentProof {
  id: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  notes?: string;
  file_name: string;
  upload_date: string;
}

export default function PatientResults() {
  const { profile } = useAuth();
  const [results, setResults] = useState<PatientResult[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchResults();
      fetchPaymentProofs();
    }
  }, [profile]);

  const fetchResults = async () => {
    try {
      // Mock data since patient_results table doesn't exist
      const mockResults: PatientResult[] = [
        {
          id: '1',
          title: 'Blood Test Results',
          description: 'Complete blood count and chemistry panel',
          file_url: null,
          file_type: 'pdf',
          created_at: new Date().toISOString(),
          requires_payment: false,
          is_visible_to_patient: true,
          appointment_id: '1',
          created_by: '1',
          doctor: { full_name: 'Dr. Smith' }
        }
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentProofs = async () => {
    try {
      // Mock data since payment_proofs table doesn't exist
      const mockProofs: PaymentProof[] = [];
      setPaymentProofs(mockProofs);
    } catch (error) {
      console.error('Error fetching payment proofs:', error);
    }
  };

  const downloadResult = async (result: PatientResult) => {
    if (!result.file_url) return;

    try {
      const { data, error } = await supabase.storage
        .from('patient-results')
        .download(result.file_url);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.title + (result.file_type ? `.${result.file_type}` : '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getResultStatusBadge = (result: PatientResult) => {
    if (!result.is_visible_to_patient && result.requires_payment) {
      const paymentProof = paymentProofs.find(p => p.verification_status === 'approved');
      if (!paymentProof) {
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Lock className="w-3 h-3 mr-1" />
            Payment Required
          </Badge>
        );
      }
    }

    if (result.is_visible_to_patient) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Available
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Processing
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock, 
        label: 'Under Review' 
      },
      approved: { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle, 
        label: 'Approved' 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800', 
        icon: AlertTriangle, 
        label: 'Rejected' 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const visibleResults = results.filter(result => result.is_visible_to_patient);
  const pendingResults = results.filter(result => !result.is_visible_to_patient);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-4">Loading results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 page-container">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Results</h1>
        <p className="text-muted-foreground">View your test results, reports, and medical documents</p>
      </div>

      {/* Payment Status Section */}
      {paymentProofs.length > 0 && (
        <Card className="card-3d interactive-3d">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 float-gentle" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentProofs.map((proof) => (
                <div key={proof.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Payment Proof: {proof.file_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {format(new Date(proof.upload_date), 'MMM do, yyyy')}
                    </p>
                    {proof.verified_at && (
                      <p className="text-sm text-muted-foreground">
                        Verified: {format(new Date(proof.verified_at), 'MMM do, yyyy')}
                      </p>
                    )}
                    {proof.notes && (
                      <p className="text-sm text-blue-600 mt-1">Note: {proof.notes}</p>
                    )}
                  </div>
                  {getPaymentStatusBadge(proof.verification_status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Results */}
      {visibleResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Results</h2>
          <div className="grid gap-4">
            {visibleResults.map((result, index) => (
              <Card key={result.id} className={`hover:shadow-md transition-shadow card-3d interactive-3d card-stagger-${(index % 4) + 1}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-primary float-gentle" />
                      <div>
                        <CardTitle className="text-lg">{result.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(result.created_at), 'EEEE, MMMM do, yyyy')}
                        </p>
                      </div>
                    </div>
                    {getResultStatusBadge(result)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {result.description && (
                    <p className="text-muted-foreground">{result.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {result.doctor && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Dr. {result.doctor.full_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(result.created_at), 'MMM do, yyyy')}</span>
                    </div>
                  </div>

                  {result.file_url && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => downloadResult(result)}
                        className="flex items-center gap-2 btn-3d"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      {result.file_type === 'pdf' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(result.file_url, '_blank')}
                          className="flex items-center gap-2 btn-3d"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Results */}
      {pendingResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Processing Results</h2>
          <div className="grid gap-4">
            {pendingResults.map((result) => (
              <Card key={result.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{result.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(result.created_at), 'EEEE, MMMM do, yyyy')}
                        </p>
                      </div>
                    </div>
                    {getResultStatusBadge(result)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {result.description && (
                    <p className="text-muted-foreground mb-3">{result.description}</p>
                  )}
                  
                  {result.requires_payment && !result.is_visible_to_patient && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Payment verification required before results can be accessed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && (
        <Card className="text-center p-12 card-3d interactive-3d">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 float-gentle" />
          <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
          <p className="text-muted-foreground">
            Your test results and reports will appear here once they're available.
          </p>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200 card-3d interactive-3d">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 float-gentle" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Important Information</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Results requiring payment will be available after payment verification</p>
                <p>• You can download and keep copies of all your results</p>
                <p>• Contact the clinic if you have questions about your results</p>
                <p>• Some results may take 24-48 hours to process</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}