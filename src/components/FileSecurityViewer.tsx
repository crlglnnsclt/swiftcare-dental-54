import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Eye, 
  Lock, 
  Unlock, 
  Shield, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileSecurityViewerProps {
  entityType: 'patient' | 'appointment' | 'medical';
  entityId: string;
  requiresPayment?: boolean;
}

export function FileSecurityViewer({ entityType, entityId, requiresPayment = false }: FileSecurityViewerProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
    if (requiresPayment) {
      checkPaymentStatus();
    }
  }, [entityType, entityId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      // Fetch documents for this entity
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', entityId);

      if (error) throw error;

      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      // Since we don't have a payment_proofs table, we'll check payments table
      const { data } = await supabase
        .from('payments')
        .select('payment_status')
        .eq('patient_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setPaymentStatus(data[0].payment_status === 'completed' ? 'approved' : 'pending');
      } else {
        setPaymentStatus('none');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const canViewFile = (file: any) => {
    // Staff and admin can always view files
    if (profile?.role && ['clinic_admin', 'staff', 'dentist', 'super_admin'].includes(profile.role)) {
      return true;
    }

    // For patients, check payment requirements if needed
    if (requiresPayment && paymentStatus !== 'approved') {
      return false;
    }

    return true; // Default to accessible for patients
  };

  const handleDownload = async (file: any) => {
    if (!canViewFile(file)) {
      toast({
        title: "Access Denied",
        description: "Payment approval required to access this file",
        variant: "destructive"
      });
      return;
    }

    try {
      if (file.file_url) {
        const a = document.createElement('a');
        a.href = file.file_url;
        a.download = `document_${file.id}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const getSecurityIcon = (file: any) => {
    if (requiresPayment) {
      return paymentStatus === 'approved' ? 
        <CheckCircle className="w-4 h-4 text-success" /> :
        <Lock className="w-4 h-4 text-warning" />;
    }
    
    return <Unlock className="w-4 h-4 text-success" />;
  };

  const getSecurityBadge = (file: any) => {
    if (requiresPayment) {
      if (paymentStatus === 'approved') {
        return <Badge className="bg-success/10 text-success">Payment Verified</Badge>;
      } else if (paymentStatus === 'pending') {
        return <Badge className="bg-warning/10 text-warning">Payment Pending</Badge>;
      } else {
        return <Badge className="bg-destructive/10 text-destructive">Payment Required</Badge>;
      }
    }

    return <Badge className="bg-success/10 text-success">Accessible</Badge>;
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card card-3d">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 float-gentle" />
          Secure File Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requiresPayment && paymentStatus !== 'approved' && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {paymentStatus === 'none' ? 
                'Payment is required to access protected files. Please submit payment proof.' :
                'Your payment is being verified. Access will be granted once approved.'
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {files.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No files available</p>
          ) : (
            files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-medical-blue/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-medical-blue" />
                  </div>
                  <div>
                    <p className="font-medium">Document #{file.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.document_type || 'General Document'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getSecurityIcon(file)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getSecurityBadge(file)}
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!canViewFile(file)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Document #{file.id}</DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                          {canViewFile(file) ? (
                            <div className="text-center">
                              <p className="text-muted-foreground">File preview would appear here</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Type: {file.document_type || 'General Document'}
                              </p>
                            </div>
                          ) : (
                            <Alert>
                              <Lock className="h-4 w-4" />
                              <AlertDescription>
                                Access to this file requires payment approval.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(file)}
                      disabled={!canViewFile(file)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}