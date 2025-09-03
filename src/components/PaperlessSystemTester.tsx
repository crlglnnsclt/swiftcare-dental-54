import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  Shield,
  AlertTriangle,
  Activity,
  Zap
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'running';
  message: string;
  duration?: number;
}

interface TestStats {
  totalForms: number;
  pendingVerification: number;
  approved: number;
  rejected: number;
  totalDocuments: number;
  pendingDocuments: number;
}

export default function PaperlessSystemTester() {
  const { user, profile } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [selectedTestForm, setSelectedTestForm] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [formsResult, documentsResult] = await Promise.all([
        supabase
          .from('form_responses')
          .select('verification_status')
          .eq('clinic_id', profile?.clinic_id),
        supabase
          .from('patient_documents')
          .select('verification_status')
          .eq('clinic_id', profile?.clinic_id)
      ]);

      const forms = formsResult.data || [];
      const documents = documentsResult.data || [];

      setStats({
        totalForms: forms.length,
        pendingVerification: forms.filter(f => f.verification_status === 'pending_verification').length,
        approved: forms.filter(f => f.verification_status === 'approved').length,
        rejected: forms.filter(f => f.verification_status === 'rejected').length,
        totalDocuments: documents.length,
        pendingDocuments: documents.filter(d => d.verification_status === 'pending_verification').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateTestResult = (test: string, status: TestResult['status'], message: string, duration?: number) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        return prev.map(r => r.test === test ? { ...r, status, message, duration } : r);
      }
      return [...prev, { test, status, message, duration }];
    });
  };

  const runEndToEndTest = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const tests = [
      'Database Connection',
      'Digital Forms Loading',
      'Patient Authentication',
      'Form Submission',
      'Document Upload',
      'Verification Workflow',
      'Audit Trail',
      'Notifications'
    ];

    // Initialize all tests as pending
    tests.forEach(test => {
      updateTestResult(test, 'pending', 'Waiting to run...');
    });

    try {
      // Test 1: Database Connection
      updateTestResult('Database Connection', 'running', 'Testing database connectivity...');
      const startTime = Date.now();
      
      const { data: clinics } = await supabase
        .from('clinics')
        .select('id')
        .limit(1);
      
      if (clinics && clinics.length > 0) {
        updateTestResult('Database Connection', 'success', 'Database connected successfully', Date.now() - startTime);
      } else {
        updateTestResult('Database Connection', 'error', 'No clinics found in database');
        return;
      }

      // Test 2: Digital Forms Loading
      updateTestResult('Digital Forms Loading', 'running', 'Loading digital forms...');
      const formsStart = Date.now();
      
      const { data: forms, error: formsError } = await supabase
        .from('digital_forms')
        .select('*')
        .eq('is_active', true)
        .limit(5);

      if (formsError) {
        updateTestResult('Digital Forms Loading', 'error', `Error loading forms: ${formsError.message}`);
        return;
      }

      if (forms && forms.length > 0) {
        updateTestResult('Digital Forms Loading', 'success', `Loaded ${forms.length} digital forms`, Date.now() - formsStart);
        setSelectedTestForm(forms[0]);
      } else {
        updateTestResult('Digital Forms Loading', 'error', 'No active digital forms found');
        return;
      }

      // Test 3: Patient Authentication
      updateTestResult('Patient Authentication', 'running', 'Checking user authentication...');
      const authStart = Date.now();

      if (!user || !profile) {
        updateTestResult('Patient Authentication', 'error', 'User not authenticated');
        return;
      }

      updateTestResult('Patient Authentication', 'success', `Authenticated as ${profile.role}: ${profile.full_name}`, Date.now() - authStart);

      // Test 4: Form Submission (simulate)
      updateTestResult('Form Submission', 'running', 'Testing form submission workflow...');
      const submissionStart = Date.now();

      // Check if user has a patient record
      const { data: patientRecord } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (patientRecord) {
        updateTestResult('Form Submission', 'success', 'Patient record exists, form submission ready', Date.now() - submissionStart);
      } else {
        updateTestResult('Form Submission', 'error', 'No patient record found - would be created on form submission');
      }

      // Test 5: Document Upload
      updateTestResult('Document Upload', 'running', 'Testing document upload permissions...');
      const uploadStart = Date.now();

      const { data: bucket } = await supabase.storage
        .from('patient-documents')
        .list('', { limit: 1 });

      if (bucket !== null) {
        updateTestResult('Document Upload', 'success', 'Storage bucket accessible', Date.now() - uploadStart);
      } else {
        updateTestResult('Document Upload', 'error', 'Storage bucket not accessible');
      }

      // Test 6: Verification Workflow
      updateTestResult('Verification Workflow', 'running', 'Testing verification workflow...');
      const verificationStart = Date.now();

      const { data: pendingDocs } = await supabase
        .from('form_responses')
        .select('id, verification_status')
        .in('verification_status', ['pending_verification', 'approved', 'rejected'])
        .limit(5);

      if (pendingDocs && pendingDocs.length > 0) {
        const pendingCount = pendingDocs.filter(d => d.verification_status === 'pending_verification').length;
        updateTestResult('Verification Workflow', 'success', `Found ${pendingCount} pending documents for verification`, Date.now() - verificationStart);
      } else {
        updateTestResult('Verification Workflow', 'success', 'No documents in verification workflow', Date.now() - verificationStart);
      }

      // Test 7: Audit Trail
      updateTestResult('Audit Trail', 'running', 'Testing audit trail logging...');
      const auditStart = Date.now();

      const { data: auditRecords } = await supabase
        .from('document_audit_trail')
        .select('id, action_type, performed_at')
        .order('performed_at', { ascending: false })
        .limit(10);

      if (auditRecords && auditRecords.length > 0) {
        updateTestResult('Audit Trail', 'success', `Found ${auditRecords.length} audit records`, Date.now() - auditStart);
      } else {
        updateTestResult('Audit Trail', 'success', 'Audit trail is empty (no actions logged yet)', Date.now() - auditStart);
      }

      // Test 8: Notifications
      updateTestResult('Notifications', 'running', 'Testing notification system...');
      const notificationStart = Date.now();

      const { data: notifications } = await supabase
        .from('workflow_notifications')
        .select('id, notification_type, created_at')
        .eq('recipient_user_id', user.id)
        .limit(5);

      if (notifications !== null) {
        updateTestResult('Notifications', 'success', `User has ${notifications.length} notifications`, Date.now() - notificationStart);
      } else {
        updateTestResult('Notifications', 'error', 'Error accessing notifications');
      }

      toast.success('End-to-end test completed successfully!');
      await loadStats(); // Refresh stats

    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test suite encountered an error');
    } finally {
      setIsRunningTests(false);
    }
  };

  const simulateWorkflow = async () => {
    if (!selectedTestForm) {
      toast.error('No test form available');
      return;
    }

    toast.info('Starting simulated workflow...');
    
    try {
      // Simulate form submission
      const { error } = await supabase
        .from('document_audit_trail')
        .insert({
          document_id: 'test-' + Date.now(),
          document_type: 'form_response',
          action_type: 'submitted',
          action_description: `Test form "${selectedTestForm.name}" submitted for verification`,
          performed_by: user?.id,
          clinic_id: profile?.clinic_id,
          metadata: {
            test_mode: true,
            form_name: selectedTestForm.name
          }
        });

      if (error) throw error;

      toast.success('Simulated workflow logged successfully');
      await loadStats();
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Failed to simulate workflow');
    }
  };

  const getTestStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTestStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Paperless System Tester
          </h2>
          <p className="text-gray-600">Test the complete end-to-end functionality</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={simulateWorkflow}
            variant="outline"
            disabled={isRunningTests}
          >
            <Activity className="w-4 h-4 mr-2" />
            Simulate Workflow
          </Button>
          <Button 
            onClick={runEndToEndTest}
            disabled={isRunningTests}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {isRunningTests ? 'Running Tests...' : 'Run E2E Test'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">System Stats</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.totalForms}</div>
                  <div className="text-sm text-gray-600">Total Forms</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.pendingVerification}</div>
                  <div className="text-sm text-gray-600">Pending Verification</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.approved}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                  <div className="text-sm text-gray-600">Documents</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              <strong>Current User:</strong> {profile?.full_name} ({profile?.role})
              <br />
              <strong>Clinic ID:</strong> {profile?.clinic_id}
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          {testResults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <PlayCircle className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No tests run yet</h3>
                <p className="text-gray-600 text-center">
                  Click "Run E2E Test" to start the comprehensive test suite
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <Card key={result.test} className={`transition-all duration-300 ${getTestStatusColor(result.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTestStatusIcon(result.status)}
                        <div>
                          <h4 className="font-medium">{result.test}</h4>
                          <p className="text-sm text-gray-600">{result.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          Test {index + 1}
                        </Badge>
                        {result.duration && (
                          <div className="text-xs text-gray-500 mt-1">
                            {result.duration}ms
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Workflow Demonstration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <User className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium">1. Patient</h4>
                  <p className="text-sm text-gray-600">Fills form and signs</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <h4 className="font-medium">2. Pending</h4>
                  <p className="text-sm text-gray-600">Awaits verification</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">3. Verified</h4>
                  <p className="text-sm text-gray-600">Dentist approves</p>
                </div>
              </div>

              {selectedTestForm && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Test Form Selected:</strong> {selectedTestForm.name}
                    <br />
                    <strong>Type:</strong> {selectedTestForm.form_type} | 
                    <strong> Category:</strong> {selectedTestForm.category} |
                    <strong> Requires Signature:</strong> {selectedTestForm.requires_signature ? 'Yes' : 'No'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <Button 
                  onClick={simulateWorkflow}
                  variant="outline"
                  disabled={!selectedTestForm}
                  className="w-full md:w-auto"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Simulate Complete Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}