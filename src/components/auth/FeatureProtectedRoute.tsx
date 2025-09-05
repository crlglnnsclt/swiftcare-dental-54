import { useFeatureToggle } from '@/hooks/useFeatureToggle';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface FeatureProtectedRouteProps {
  children: React.ReactNode;
  requiredFeature: string;
  fallbackRoute?: string;
}

export function FeatureProtectedRoute({ 
  children, 
  requiredFeature, 
  fallbackRoute = '/dashboard' 
}: FeatureProtectedRouteProps) {
  const featureToggle = useFeatureToggle();
  
  if ('loading' in featureToggle && featureToggle.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-medical-blue" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isFeatureEnabled = 'isFeatureEnabled' in featureToggle ? 
    featureToggle.isFeatureEnabled(requiredFeature) : false;

  console.log(`FeatureProtectedRoute: Checking feature '${requiredFeature}':`, isFeatureEnabled);

  if (!isFeatureEnabled) {
    console.log(`FeatureProtectedRoute: Feature '${requiredFeature}' disabled, redirecting to ${fallbackRoute}`);
    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
}