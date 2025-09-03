import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function BranchSelection() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBranches();
    checkExistingSelection();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSelection = async () => {
    if (!user) return;
    
    // Check if user already has a branch selection stored
    const stored = localStorage.getItem(`selected_branch_${user.id}`);
    if (stored) {
      setSelectedBranch(stored);
    }
  };

  const selectBranch = async (branchId: string) => {
    if (!user) return;

    try {
      // Store branch selection
      localStorage.setItem(`selected_branch_${user.id}`, branchId);
      setSelectedBranch(branchId);

      // Update user profile with selected branch if needed
      const { error } = await supabase
        .from('profiles')
        .update({ 
          branch_id: branchId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.warn('Failed to update profile branch:', error);
      }

      toast({
        title: "Success",
        description: "Branch selected successfully",
      });

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      console.error('Error selecting branch:', error);
      toast({
        title: "Error",
        description: "Failed to select branch",
        variant: "destructive"
      });
    }
  };

  const continueToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading branches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-medical-blue" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Select Your Branch
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the clinic branch you'll be working with. You can change this selection at any time from your dashboard.
            </p>
          </div>

          {/* User Info */}
          {profile && (
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-medical-blue text-white rounded-full flex items-center justify-center font-semibold">
                  {profile.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Welcome, {profile.full_name || user?.email}
                  </h3>
                  <p className="text-muted-foreground">
                    Role: <Badge variant="outline">{profile.role}</Badge>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {branches.map((branch) => (
              <Card 
                key={branch.id} 
                className={`glass-card cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  selectedBranch === branch.id 
                    ? 'ring-2 ring-medical-blue shadow-lg bg-medical-50/50' 
                    : 'hover:bg-white/70'
                }`}
                onClick={() => selectBranch(branch.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg"
                        style={{ backgroundColor: branch.primary_color }}
                      >
                        {branch.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{branch.name}</CardTitle>
                        <Badge variant="default" className="mt-1">
                          Active
                        </Badge>
                      </div>
                    </div>
                    {selectedBranch === branch.id && (
                      <CheckCircle className="w-6 h-6 text-medical-blue" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Branch Info */}
                  <div className="space-y-3">
                    {branch.address && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground leading-relaxed">
                          {branch.address}
                        </span>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{branch.phone}</span>
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{branch.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Color Preview */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-sm text-muted-foreground">Theme:</span>
                    <div 
                      className="w-6 h-6 rounded border-2 border-border"
                      style={{ backgroundColor: branch.primary_color }}
                    />
                    <div 
                      className="w-6 h-6 rounded border-2 border-border"
                      style={{ backgroundColor: branch.secondary_color }}
                    />
                  </div>

                  {/* Select Button */}
                  <Button 
                    className="w-full mt-4 medical-gradient text-white"
                    variant={selectedBranch === branch.id ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectBranch(branch.id);
                    }}
                  >
                    {selectedBranch === branch.id ? 'Selected' : 'Select Branch'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Branches */}
          {branches.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Branches</h3>
                <p className="text-muted-foreground mb-4">
                  There are currently no active branches available. Please contact your administrator.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Continue Button */}
          {selectedBranch && (
            <div className="text-center">
              <Button 
                onClick={continueToDashboard}
                size="lg"
                className="medical-gradient text-white px-8 py-3 text-lg"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}

          {/* Skip Option for Admins */}
          {profile?.role === 'admin' && (
            <div className="text-center mt-6">
              <Button 
                variant="ghost" 
                onClick={continueToDashboard}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for now (Admin Access)
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}