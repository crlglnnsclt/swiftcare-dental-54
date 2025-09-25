import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, LogIn, ArrowLeft, Shield } from 'lucide-react';
import { QuickFillButtons } from '@/components/QuickFillButtons';

export default function SimpleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || getDefaultRoute();

  function getDefaultRoute() {
    if (!profile) return '/admin/dashboard';
    
    switch (profile.role) {
      case 'super_admin':
      case 'clinic_admin':
        return '/admin/dashboard';
      case 'dentist':
        return '/dentist/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'patient':
        return '/patient/dashboard';
      case 'manager':
        return '/manager/dashboard';
      default:
        return '/admin/dashboard';
    }
  }

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) return;
    
    setIsLoading(true);
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (!error) {
      navigate(from, { replace: true });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/20 via-dental-mint/20 to-professional-navy/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-medical-blue hover:text-dental-mint transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        
        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-medical-gradient rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-medical-gradient bg-clip-text text-transparent">
              SwiftCare Admin
            </CardTitle>
            <p className="text-muted-foreground">Secure staff and admin access</p>
          </CardHeader>
          <CardContent>
            <QuickFillButtons 
              onFillForm={setLoginData} 
              type="signin" 
            />
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your work email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full medical-gradient text-white hover:shadow-glow transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>For patient access, please use the</p>
              <Link 
                to="/auth" 
                className="text-medical-blue hover:text-dental-mint transition-colors font-medium"
              >
                Patient Portal Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}