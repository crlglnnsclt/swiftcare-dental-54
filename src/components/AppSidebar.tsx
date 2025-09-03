import { useState } from "react";
import { 
  Building2, 
  Users, 
  Calendar, 
  Clock,
  Settings,
  BarChart3,
  Stethoscope,
  FileText,
  MessageSquare,
  CreditCard,
  UserCheck,
  Shield,
  Palette,
  Database,
  Activity,
  FileEdit,
  ClipboardCheck,
  Package,
  Bell,
  QrCode,
  User,
  Smartphone
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: string[];
  enhancedRoles?: string[];
}

const navigationItems: NavItem[] = [
  // General Settings - Available to all users
  {
    title: "Account Settings",
    url: "/settings",
    icon: Settings,
    roles: ["patient", "dentist", "staff", "admin"],
    enhancedRoles: ["patient", "dentist", "staff", "admin", "super_admin"]
  },
  
  // Super Admin Only
  {
    title: "System Overview",
    url: "/super-admin",
    icon: Shield,
    roles: ["super_admin"],
    enhancedRoles: ["super_admin"]
  },
  {
    title: "Branch Management",
    url: "/branches",
    icon: Building2,
    roles: ["super_admin"],
    enhancedRoles: ["super_admin"]
  },
  {
    title: "System Analytics",
    url: "/system-analytics",
    icon: Database,
    roles: ["super_admin"],
    enhancedRoles: ["super_admin"]
  },
  
  // Admin & Super Admin
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    roles: ["admin", "staff", "dentist", "super_admin"],
    enhancedRoles: ["admin", "super_admin", "staff", "dentist"]
  },
  {
    title: "Users & Staff",
    url: "/users",
    icon: Users,
    roles: ["admin", "super_admin"],
    enhancedRoles: ["admin", "super_admin"]
  },
  {
    title: "Branch Settings",
    url: "/branch-settings",
    icon: Settings,
    roles: ["admin", "super_admin"],
    enhancedRoles: ["admin", "super_admin"]
  },
  
  // Staff & Admin
  {
    title: "Appointments", 
    url: "/appointments",
    icon: Calendar,
    roles: ["admin", "staff", "dentist", "super_admin"],
    enhancedRoles: ["admin", "super_admin", "staff", "dentist"]
  },
  {
    title: "Queue Management",
    url: "/queue",
    icon: Clock,
    roles: ["admin", "staff", "dentist", "super_admin"],
    enhancedRoles: ["admin", "super_admin", "staff", "dentist"]
  },
  {
    title: "Patient Check-in",
    url: "/staff-checkin",
    icon: UserCheck,
    roles: ["staff", "admin"],
    enhancedRoles: ["staff", "admin", "super_admin"]
  },
  {
    title: "Messaging",
    url: "/messages",
    icon: MessageSquare,
    roles: ["admin", "staff", "dentist"],
    enhancedRoles: ["admin", "super_admin", "staff", "dentist"]
  },
  
  // Dentist Specific
  {
    title: "Dental Charts",
    url: "/charts",
    icon: Stethoscope,
    roles: ["dentist", "admin"],
    enhancedRoles: ["dentist", "admin", "super_admin"]
  },
  {
    title: "Patient Records",
    url: "/patient-records",
    icon: FileText,
    roles: ["dentist", "admin", "staff"],
    enhancedRoles: ["dentist", "admin", "super_admin", "staff"]
  },
  
  // Digital Forms & Paperless
  {
    title: "Paperless System",
    url: "/paperless",
    icon: Smartphone,
    roles: ["admin", "staff", "dentist", "patient"],
    enhancedRoles: ["admin", "super_admin", "staff", "dentist", "patient"]
  },
  {
    title: "Form Management",
    url: "/digital-forms",
    icon: FileEdit,
    roles: ["admin", "staff"],
    enhancedRoles: ["admin", "super_admin", "staff"]
  },
  {
    title: "Form Responses",
    url: "/form-responses",
    icon: ClipboardCheck,
    roles: ["admin", "staff"],
    enhancedRoles: ["admin", "super_admin", "staff"]
  },
  
  // Inventory & Staff
  {
    title: "Inventory Management",
    url: "/inventory",
    icon: Package,
    roles: ["admin", "staff"],
    enhancedRoles: ["admin", "super_admin", "staff"]
  },
  {
    title: "Staff Management",
    url: "/staff-management",
    icon: Users,
    roles: ["admin", "super_admin"],
    enhancedRoles: ["admin", "super_admin"]
  },
  
  {
    title: "Billing & Payments",
    url: "/billing",
    icon: CreditCard,
    roles: ["admin", "super_admin"],
    enhancedRoles: ["admin", "super_admin"]
  },
  {
    title: "Patient Engagement",
    url: "/patient-engagement", 
    icon: MessageSquare,
    roles: ["admin", "staff"],
    enhancedRoles: ["admin", "super_admin", "staff"]
  },
  {
    title: "Analytics & Reports",
    url: "/analytics",
    icon: Activity,
    roles: ["admin", "super_admin"],
    enhancedRoles: ["admin", "super_admin"]
  },
  
  // Patient Only
  {
    title: "My Appointments",
    url: "/my-appointments",
    icon: Calendar,
    roles: ["patient"],
    enhancedRoles: ["patient"]
  },
  {
    title: "My Profile", 
    url: "/my-profile",
    icon: User,
    roles: ["patient"],
    enhancedRoles: ["patient"]
  },
  {
    title: "My Results",
    url: "/my-results",
    icon: FileText,
    roles: ["patient"],
    enhancedRoles: ["patient"]
  },
  {
    title: "My Notifications",
    url: "/my-notifications", 
    icon: Bell,
    roles: ["patient"],
    enhancedRoles: ["patient"]
  },
  {
    title: "Quick Check-In",
    url: "/checkin",
    icon: QrCode,
    roles: ["patient"],
    enhancedRoles: ["patient"]
  },
  {
    title: "Patient Forms",
    url: "/patient-forms",
    icon: FileEdit,
    roles: ["patient"],
    enhancedRoles: ["patient"]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Filter navigation items based on user role
  const allowedItems = navigationItems.filter(item => {
    const hasRole = profile?.role && item.roles.includes(profile.role);
    // Since enhanced_role doesn't exist in DB, just use regular role
    const hasEnhancedRole = profile?.role && 
      item.enhancedRoles?.includes(profile.role);
    return hasRole || hasEnhancedRole;
  });

  // Group items by category
  const generalItems = allowedItems.filter(item => 
    item.title === "Account Settings"
  );
  
  const superAdminItems = allowedItems.filter(item => 
    (item.enhancedRoles?.includes("super_admin") || item.roles.includes("super_admin")) && 
    profile?.role === "super_admin"
  );
  
  const managementItems = allowedItems.filter(item => 
    (item.roles.includes("admin") || item.enhancedRoles?.includes("admin")) &&
    !superAdminItems.includes(item) && !generalItems.includes(item)
  );
  
  const operationsItems = allowedItems.filter(item => 
    (item.roles.includes("staff") || item.roles.includes("dentist")) &&
    !managementItems.includes(item) && !superAdminItems.includes(item) && !generalItems.includes(item)
  );
  
  const patientItems = allowedItems.filter(item => 
    item.roles.includes("patient") && !generalItems.includes(item)
  );

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  const renderNavGroup = (items: NavItem[], label: string) => {
    if (items.length === 0) return null;
    
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="h-10">
                  <NavLink 
                    to={item.url} 
                    end 
                    className={({ isActive }) => getNavCls({ isActive })}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span className="ml-3">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="bg-card">
        {/* User Info Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-medical-blue to-dental-mint flex items-center justify-center text-white font-semibold text-sm">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile?.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Groups */}
        {renderNavGroup(generalItems, "Account")}
        {renderNavGroup(superAdminItems, "System Administration")}
        {renderNavGroup(managementItems, "Management")}
        {renderNavGroup(operationsItems, "Operations")}
        {renderNavGroup(patientItems, "Patient Portal")}
      </SidebarContent>
    </Sidebar>
  );
}