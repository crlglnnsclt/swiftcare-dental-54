import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 flex items-center justify-center p-4">
      <Card className="glass-card max-w-md w-full">
        <CardContent className="p-8 text-center">
          <Shield className="w-16 h-16 text-medical-blue mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Restricted
          </h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page. Your current role is{' '}
            <span className="font-medium text-foreground">
              {profile?.enhanced_role || profile?.role || 'unknown'}
            </span>
            .
          </p>
          <div className="space-y-3">
            <Button 
              onClick={handleGoBack}
              className="w-full medical-gradient text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}