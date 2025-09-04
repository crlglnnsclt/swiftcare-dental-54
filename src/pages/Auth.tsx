import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuickFillButtons } from '@/components/QuickFillButtons';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    fullName: '', 
    role: 'patient' 
  });
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      console.log('Missing email or password');
      return;
    }
    
    console.log('Form submitted for sign in');
    setIsLoading(true);
    
    const { error } = await signIn(signInData.email, signInData.password);
    
    if (!error) {
      console.log('Sign in successful, navigating to dashboard');
      navigate(from, { replace: true });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpData.email || !signUpData.password || !signUpData.fullName) {
      console.log('Missing required fields');
      return;
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      console.log('Passwords do not match');
      return;
    }
    
    console.log('Form submitted for sign up');
    setIsLoading(true);
    
    const { error } = await signUp(
      signUpData.email, 
      signUpData.password, 
      signUpData.fullName, 
      signUpData.role
    );
    
    if (!error) {
      console.log('Sign up successful');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/20 via-dental-mint/20 to-professional-navy/20 flex items-center justify-center p-4 page-container">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-medical-blue hover:text-dental-mint smooth-transition btn-3d">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        
        <Card className="glass-card card-3d interactive-3d">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-medical-gradient bg-clip-text text-transparent float-gentle">
              SwiftCare Dental
            </CardTitle>
            <p className="text-muted-foreground">Welcome to your digital dental experience</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-6">
                <QuickFillButtons 
                  onFillForm={setSignInData} 
                  type="signin" 
                />
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full medical-gradient text-white hover:shadow-glow smooth-transition btn-3d"
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
              </TabsContent>
              
              <TabsContent value="signup" className="mt-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">Staff accounts are created by administrators</p>
                  <Link 
                    to="/register" 
                    className="inline-flex items-center gap-2 px-6 py-3 medical-gradient text-white rounded-lg hover:shadow-glow smooth-transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register as Patient
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Need a staff account? Contact your clinic administrator
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}