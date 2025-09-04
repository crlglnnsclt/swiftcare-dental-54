import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Lock, 
  Phone, 
  Mail, 
  Save,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  CheckCircle,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function UserSettings() {
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (profile && user) {
      setProfileData({
        full_name: profile.full_name || '',
        email: user.email || '',
        phone: profile.phone || ''
      });
    }
  }, [profile, user]);

  const handleProfileUpdate = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Update profile table
      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (profileData.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email
        });

        if (emailError) throw emailError;
        
        toast.success('Profile updated! Please check your email to confirm the new email address.');
      } else {
        toast.success('Profile updated successfully!');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Mobile-First Glassmorphism Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-5 w-64 h-64 bg-primary/15 rounded-full blur-3xl opacity-60 animate-float"></div>
        <div className="absolute bottom-20 right-5 w-48 h-48 bg-secondary/10 rounded-full blur-3xl opacity-40 animate-float-gentle"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-accent/8 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 space-y-6 relative z-10 max-w-md sm:max-w-2xl animate-fade-in">
        {/* Mobile Header with Glass Card */}
        <div className="glass-card-3d p-6 sm:p-8 rounded-2xl backdrop-blur-xl bg-background/20 border border-white/20 shadow-elegant hover-scale">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                  <Settings className="w-6 h-6 text-primary animate-float-gentle" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Settings
                </h1>
              </div>
              <p className="text-muted-foreground/80 text-sm sm:text-base">Manage your account</p>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Verified</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          {/* Mobile-Optimized Tab List */}
          <TabsList className="glass-card-3d grid w-full grid-cols-3 bg-background/30 backdrop-blur-xl border border-white/20 p-1 rounded-xl h-12 sm:h-14">
            <TabsTrigger 
              value="profile" 
              className="glass-tab-3d data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 text-xs sm:text-sm"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Profile</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="glass-tab-3d data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 text-xs sm:text-sm"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Security</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="account"
              className="glass-tab-3d data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 text-xs sm:text-sm"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Account</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Card className="glass-card-3d backdrop-blur-xl bg-background/20 border border-white/20 shadow-elegant rounded-2xl overflow-hidden hover-scale transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-float-gentle" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium text-foreground/80">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground/80">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                    className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                  <p className="text-xs text-muted-foreground/70">
                    Changing your email will require verification of the new email address.
                  </p>
                </div>

                <Separator className="bg-white/10" />

                <div className="flex items-center justify-between p-4 rounded-xl bg-background/30 backdrop-blur-sm border border-white/20">
                  <div>
                    <p className="font-medium text-sm sm:text-base">Role Information</p>
                    <p className="text-xs sm:text-sm text-muted-foreground/80">
                      Current role: <span className="capitalize font-medium text-primary">{profile?.enhanced_role?.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-green-500/20">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="glass-button-3d bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 animate-fade-in">
            <Card className="glass-card-3d backdrop-blur-xl bg-background/20 border border-white/20 shadow-elegant rounded-2xl overflow-hidden hover-scale transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-float-gentle" />
                  </div>
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium text-foreground/80">New Password *</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-background/40 rounded-full"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">Confirm New Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="glass-input-3d bg-background/40 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-background/40 rounded-full"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="glass-card-3d bg-primary/5 backdrop-blur-sm border border-primary/20 rounded-xl p-4">
                  <h4 className="font-medium text-primary mb-2 text-sm sm:text-base">Password Requirements</h4>
                  <ul className="text-xs sm:text-sm text-muted-foreground/80 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Should contain a mix of letters and numbers</li>
                    <li>• Avoid using personal information</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={passwordLoading}
                    className="glass-button-3d bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6 animate-fade-in">
            <Card className="glass-card-3d backdrop-blur-xl bg-background/20 border border-white/20 shadow-elegant rounded-2xl overflow-hidden hover-scale transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-float-gentle" />
                  </div>
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-4 glass-card-3d bg-background/30 backdrop-blur-sm border border-white/20 rounded-xl">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base">Account Status</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground/80">Your account is active and verified</p>
                    </div>
                    <div className="p-2 rounded-full bg-green-500/20">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card-3d bg-background/30 backdrop-blur-sm border border-white/20 rounded-xl">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base">Email Verification</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground/80">
                        {user?.email_confirmed_at ? 'Email verified' : 'Email not verified'}
                      </p>
                    </div>
                    {user?.email_confirmed_at ? (
                      <div className="p-2 rounded-full bg-green-500/20">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="glass-button-3d">
                        Verify Email
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card-3d bg-background/30 backdrop-blur-sm border border-white/20 rounded-xl">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base">Member Since</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground/80">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-4">
                  <h4 className="font-medium text-destructive text-sm sm:text-base">Danger Zone</h4>
                  <div className="glass-card-3d border border-destructive/20 bg-destructive/5 backdrop-blur-sm rounded-xl p-4 space-y-4">
                    <div>
                      <h5 className="font-medium text-sm sm:text-base">Sign Out</h5>
                      <p className="text-xs sm:text-sm text-muted-foreground/80 mb-3">
                        Sign out of your account on this device.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={handleSignOut}
                        className="glass-button-3d bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20 w-full sm:w-auto"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}