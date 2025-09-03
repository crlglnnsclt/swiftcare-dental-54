import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface FeatureTest {
  name: string;
  status: 'pending' | 'success' | 'error' | 'loading';
  message: string;
  test: () => Promise<{ success: boolean; message: string }>;
}

export default function FeatureTester() {
  const { profile } = useAuth();
  const [features, setFeatures] = useState<FeatureTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const initializeTests = () => {
    const tests: FeatureTest[] = [
      {
        name: 'Users & Staff Management',
        status: 'pending',
        message: 'Not tested',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('users')
              .select('*, clinics(clinic_name)')
              .limit(5);
            
            if (error) throw error;
            return { 
              success: true, 
              message: `Successfully fetched ${data?.length || 0} users with clinic data`
            };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Appointments System',
        status: 'pending',
        message: 'Not tested',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('appointments')
              .select('*, patients(full_name)')
              .limit(5);
            
            if (error) throw error;
            return { 
              success: true, 
              message: `Successfully fetched ${data?.length || 0} appointments with patient data`
            };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Queue Management',
        status: 'pending',
        message: 'Not tested',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('queue')
              .select('*, appointments(*, patients(full_name))')
              .limit(5);
            
            if (error) throw error;
            return { 
              success: true, 
              message: `Queue system accessible with ${data?.length || 0} items`
            };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Digital Forms',
        status: 'pending',
        message: 'Not tested',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('communication_templates')
              .select('*')
              .limit(5);
            
            if (error) throw error;
            return { 
              success: true, 
              message: `Digital forms system accessible with ${data?.length || 0} templates`
            };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Patient Records',
        status: 'pending',
        message: 'Not tested',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('patients')
              .select('*')
              .limit(5);
            
            if (error) throw error;
            return { 
              success: true, 
              message: `Successfully accessed ${data?.length || 0} patient records`
            };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Clinic Management',
        status: 'pending',
        message: 'Not tested',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('clinics')
              .select('*')
              .limit(5);
            
            if (error) throw error;
            return { 
              success: true, 
              message: `Successfully accessed ${data?.length || 0} clinic records`
            };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Inventory Management',
        status: 'pending',
        message: 'Not tested',
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('inventory_items')
              .select('*')
              .limit(5);
            
            if (error) throw error;
            return { 
              success: true, 
              message: `Inventory system accessible with ${data?.length || 0} items`
            };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'Dashboard Statistics',
        status: 'pending',
        message: 'Not tested',
        test: async () => {
          try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
              .from('appointments')
              .select('*')
              .gte('scheduled_time', `${today}T00:00:00`)
              .lt('scheduled_time', `${today}T23:59:59`);
            
            if (error) throw error;
            return { 
              success: true, 
              message: `Dashboard stats working with ${data?.length || 0} today's appointments`
            };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      }
    ];

    setFeatures(tests);
  };

  const runSingleTest = async (index: number) => {
    setFeatures(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'loading' as const } : f
    ));

    const result = await features[index].test();
    
    setFeatures(prev => prev.map((f, i) => 
      i === index ? { 
        ...f, 
        status: result.success ? 'success' : 'error',
        message: result.message
      } : f
    ));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    for (let i = 0; i < features.length; i++) {
      await runSingleTest(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setIsRunning(false);
  };

  useEffect(() => {
    initializeTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'loading':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700">Working</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'loading':
        return <Badge className="bg-blue-100 text-blue-700">Testing...</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Testing Dashboard</h1>
          <p className="text-muted-foreground">Test all core features to ensure they're working correctly</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={initializeTests} 
            variant="outline"
            disabled={isRunning}
          >
            Reset Tests
          </Button>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="medical-gradient text-white"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Card key={feature.name} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{feature.name}</CardTitle>
                {getStatusIcon(feature.status)}
              </div>
              {getStatusBadge(feature.status)}
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                {feature.message}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => runSingleTest(index)}
                disabled={feature.status === 'loading' || isRunning}
                className="w-full"
              >
                Test Feature
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {profile?.role === 'super_admin' && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Super Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              As a super admin, you have access to all features across all clinics. 
              All data queries should return results from the entire system.
            </p>
            <Badge className="bg-purple-100 text-purple-700">Super Admin Active</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}