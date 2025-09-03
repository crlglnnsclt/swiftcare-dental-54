import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Bell, Settings, User, Shield } from "lucide-react";

export function Layout() {
  const { signOut, profile, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleProfileClick = () => {
    // Navigate to role-based dashboard
    const role = profile?.enhanced_role || profile?.role;
    switch (role) {
      case 'super_admin':
        navigate('/super-admin');
        break;
      case 'admin':
        navigate('/dashboard');
        break;
      case 'dentist':
        navigate('/dashboard');
        break;
      case 'staff':
        navigate('/dashboard');
        break;
      case 'patient':
        navigate('/my-appointments');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-full px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hover:bg-muted/50" />
                <div className="h-6 w-px bg-border" />
                <h1 className="text-lg font-semibold text-foreground">
                  SmileFlow 3D Dental
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="btn-3d">
                  <Bell className="h-4 w-4" />
                </Button>
                
                {/* Profile Avatar - Clickable Home Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 btn-3d hover:bg-medical-blue/10" 
                  onClick={handleProfileClick}
                  title="Go to Home Dashboard"
                >
                  <Avatar className="w-6 h-6 cursor-pointer">
                    <AvatarFallback className="bg-medical-blue text-white text-xs">
                      {profile?.full_name 
                        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                        : user?.email?.charAt(0).toUpperCase() || 'U'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">
                    {profile?.full_name || user?.email || 'User'}
                  </span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="btn-3d">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        {profile?.enhanced_role && (
                          <p className="text-xs leading-none text-muted-foreground capitalize">
                            {profile.enhanced_role.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}