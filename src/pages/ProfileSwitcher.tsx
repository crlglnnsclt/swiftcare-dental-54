import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileSwitcher() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    navigate('/auth');
  };

  const handleSwitchProfile = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/20 via-dental-mint/20 to-professional-navy/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-medical-gradient bg-clip-text text-transparent">
            Profile Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-medical-blue/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-medical-blue" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">{profile?.full_name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge className="mt-2 bg-medical-blue/10 text-medical-blue">
                  {profile?.role || 'user'}
                </Badge>
              </div>
              
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={handleSwitchProfile}
                  className="w-full medical-gradient text-white hover:shadow-glow smooth-transition"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Switch Profile
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full hover:bg-destructive hover:text-destructive-foreground smooth-transition"
                >
                  {isSigningOut ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Signing Out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}