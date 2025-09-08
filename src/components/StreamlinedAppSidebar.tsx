
import { useMemo } from "react";
import { 
  Home,
  Stethoscope,
  Users,
  User,
  Settings,
  BarChart3,
  Shield,
  Clock,
  QrCode,
  UserCheck,
  Package,
  DollarSign,
  FileText,
  Calendar,
  Activity
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: string[];
  description?: string;
}

// Streamlined navigation based on enhanced workflows
const getNavigationByRole = (role: string | undefined): NavItem[] => {
  const baseNav: NavItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      roles: ["super_admin", "clinic_admin", "dentist", "staff", "patient"],
      description: "Main dashboard"
    }
  ];

  const roleSpecificNav: Record<string, NavItem[]> = {
    super_admin: [
      {
        title: "System Admin",
        url: "/admin-dashboard",
        icon: Shield,
        roles: ["super_admin"],
        description: "Global system oversight"
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
        roles: ["super_admin"],
        description: "System-wide analytics"
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ["super_admin"],
        description: "User settings"
      }
    ],
    
    clinic_admin: [
      {
        title: "Admin Panel",
        url: "/admin-dashboard",
        icon: Shield,
        roles: ["clinic_admin"],
        description: "Clinic management"
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
        roles: ["clinic_admin"],
        description: "Clinic analytics"
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ["clinic_admin"],
        description: "User settings"
      }
    ],
    
    dentist: [
      {
        title: "My Practice",
        url: "/dentist-dashboard",
        icon: Stethoscope,
        roles: ["dentist"],
        description: "Patient care and treatment"
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ["dentist"],
        description: "User settings"
      }
    ],
    
    staff: [
      {
        title: "Operations",
        url: "/staff-dashboard",
        icon: Users,
        roles: ["staff"],
        description: "Queue and patient management"
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ["staff"],
        description: "User settings"
      }
    ],
    
    patient: [
      {
        title: "My Portal",
        url: "/patient-portal",
        icon: User,
        roles: ["patient"],
        description: "Appointments and health records"
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ["patient"],
        description: "User settings"
      }
    ]
  };

  return [...baseNav, ...(roleSpecificNav[role || ''] || [])];
};

export function AppSidebar() {
  const { profile } = useAuth();
  
  const navigationItems = useMemo(() => {
    return getNavigationByRole(profile?.role);
  }, [profile?.role]);

  const getRoleDisplayName = (role: string | undefined) => {
    switch (role) {
      case 'super_admin': return 'System Admin';
      case 'clinic_admin': return 'Clinic Admin';
      case 'dentist': return 'Dentist';
      case 'staff': return 'Staff';
      case 'patient': return 'Patient';
      default: return 'User';
    }
  };

  const getRoleDescription = (role: string | undefined) => {
    switch (role) {
      case 'super_admin': return 'Global system oversight';
      case 'clinic_admin': return 'Clinic management & administration';
      case 'dentist': return 'Patient care & treatment planning';
      case 'staff': return 'Operations & patient support';
      case 'patient': return 'Personal health portal';
      default: return 'SwiftCare user';
    }
  };

  return (
    <Sidebar variant="sidebar" className="border-r bg-card/50">
      <SidebarContent className="gap-0">
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Activity className="h-3 w-3" />
            </div>
            SwiftCare
          </div>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3 border-b bg-muted/20">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {getRoleDisplayName(profile?.role)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {getRoleDescription(profile?.role)}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions based on role */}
        {(profile?.role === 'dentist' || profile?.role === 'staff') && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {profile?.role === 'dentist' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="flex items-center gap-3 px-4 py-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Today's Schedule</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="flex items-center gap-3 px-4 py-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>Patient Queue</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
                {profile?.role === 'staff' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="flex items-center gap-3 px-4 py-2 text-sm">
                        <UserCheck className="h-4 w-4" />
                        <span>Check-In Patients</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="flex items-center gap-3 px-4 py-2 text-sm">
                        <Package className="h-4 w-4" />
                        <span>Inventory Alerts</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Patient Portal Quick Actions */}
        {profile?.role === 'patient' && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center gap-3 px-4 py-2 text-sm">
                    <QrCode className="h-4 w-4" />
                    <span>QR Check-In</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center gap-3 px-4 py-2 text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span>Pay Bills</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center gap-3 px-4 py-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>My Documents</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Footer */}
        <div className="mt-auto border-t px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>System Online</span>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
