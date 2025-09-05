import { useState } from "react";
import { 
  Calendar, 
  Clock,
  Users,
  FileText,
  CreditCard,
  Package,
  BarChart3,
  Settings,
  Shield,
  Building2,
  QrCode,
  UserCheck,
  Smartphone,
  FileEdit,
  Stethoscope,
  ClipboardCheck,
  Activity,
  Database,
  MessageSquare,
  Bell,
  User,
  Eye,
  Tv,
  HelpCircle,
  Home,
  HeartHandshake,
  Receipt,
  Palette,
  FileCheck,
  Layers,
  Share2,
  Bot
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
  module: string;
}

// 📦 Module-Based Navigation (Organized by SwiftCare System Modules)
const moduleNavigation: NavItem[] = [
  // 🏠 Dashboard
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["clinic_admin", "staff", "dentist", "super_admin", "patient"],
    module: "dashboard"
  },

  // 📅 Module 1: Appointments & Queueing
  {
    title: "Appointments",
    url: "/appointments",
    icon: Calendar,
    roles: ["clinic_admin", "staff", "dentist", "super_admin"],
    module: "appointments"
  },
  {
    title: "Queue Dashboard",
    url: "/queue",
    icon: Clock,
    roles: ["clinic_admin", "staff", "dentist", "super_admin"],
    module: "appointments"
  },
  {
    title: "Walk-ins",
    url: "/walk-ins",
    icon: UserCheck,
    roles: ["staff", "clinic_admin", "super_admin"],
    module: "appointments"
  },
  {
    title: "Queue Monitor",
    url: "/queue-monitor",
    icon: Tv,
    roles: ["staff", "clinic_admin", "super_admin"],
    module: "appointments"
  },
  {
    title: "Appointment Settings",
    url: "/appointment-settings",
    icon: Settings,
    roles: ["clinic_admin", "super_admin"],
    module: "appointments"
  },

  // 👤 Module 2: Patient Management
  {
    title: "Patient Profiles",
    url: "/patient-records",
    icon: Users,
    roles: ["dentist", "clinic_admin", "staff", "super_admin"],
    module: "patients"
  },
  {
    title: "Family Accounts",
    url: "/family-management",
    icon: HeartHandshake,
    roles: ["clinic_admin", "staff", "super_admin"],
    module: "patients"
  },
  {
    title: "Insurance / HMO",
    url: "/insurance",
    icon: Shield,
    roles: ["clinic_admin", "staff", "super_admin"],
    module: "patients"
  },
  {
    title: "Verification Queue",
    url: "/verification-queue",
    icon: Eye,
    roles: ["staff", "clinic_admin", "super_admin"],
    module: "patients"
  },

  // 📝 Module 3: Paperless Records
  {
    title: "E-Sign Forms",
    url: "/esign-forms",
    icon: FileEdit,
    roles: ["clinic_admin", "staff", "dentist", "super_admin"],
    module: "paperless"
  },
  {
    title: "Documents & Uploads",
    url: "/documents-uploads",
    icon: FileText,
    roles: ["clinic_admin", "staff", "dentist", "patient", "super_admin"],
    module: "paperless"
  },
  {
    title: "Dental Charts",
    url: "/charts",
    icon: Stethoscope,
    roles: ["dentist", "clinic_admin", "super_admin"],
    module: "paperless"
  },
  {
    title: "Dentist/Staff Signatures",
    url: "/dentist-signatures",
    icon: FileCheck,
    roles: ["dentist", "clinic_admin", "staff", "super_admin"],
    module: "paperless"
  },

  // 💉 Module 4: Treatment & Billing
  {
    title: "Treatment Notes",
    url: "/treatment-notes",
    icon: ClipboardCheck,
    roles: ["dentist", "clinic_admin", "super_admin"],
    module: "treatment"
  },
  {
    title: "Services Management",
    url: "/services-management",
    icon: Settings,
    roles: ["clinic_admin", "super_admin"],
    module: "treatment"
  },
  {
    title: "Billing & Invoices",
    url: "/billing",
    icon: CreditCard,
    roles: ["clinic_admin", "staff", "super_admin"],
    module: "treatment"
  },
  {
    title: "Payment Tracking",
    url: "/payment-tracking",
    icon: Receipt,
    roles: ["clinic_admin", "staff", "super_admin"],
    module: "treatment"
  },
  {
    title: "Consumables / Inventory",
    url: "/inventory",
    icon: Package,
    roles: ["clinic_admin", "staff", "super_admin"],
    module: "treatment"
  },

  // 📊 Module 5: Reports & Analytics
  {
    title: "Queue Reports",
    url: "/queue-reports",
    icon: BarChart3,
    roles: ["clinic_admin", "super_admin"],
    module: "reports"
  },
  {
    title: "Revenue Reports",
    url: "/revenue-reports",
    icon: Receipt,
    roles: ["clinic_admin", "super_admin"],
    module: "reports"
  },
  {
    title: "Dentist Workload",
    url: "/workload-reports",
    icon: Activity,
    roles: ["clinic_admin", "super_admin"],
    module: "reports"
  },
  {
    title: "Export",
    url: "/analytics",
    icon: Database,
    roles: ["clinic_admin", "super_admin"],
    module: "reports"
  },

  // ⚙️ Module 6: Administration
  {
    title: "Staff Management",
    url: "/staff-management",
    icon: Users,
    roles: ["clinic_admin", "super_admin"],
    module: "administration"
  },
  {
    title: "Role Permissions",
    url: "/user-roles",
    icon: Shield,
    roles: ["clinic_admin", "super_admin"],
    module: "administration"
  },
  {
    title: "Branch Data Sharing",
    url: "/branch-sharing",
    icon: Share2,
    roles: ["clinic_admin"],
    module: "administration"
  },
  {
    title: "Data Sharing Audit",
    url: "/data-sharing-audit",
    icon: Shield,
    roles: ["clinic_admin", "super_admin"],
    module: "administration"
  },
  {
    title: "Feature Toggles",
    url: "/feature-toggles",
    icon: Layers,
    roles: ["super_admin"],
    module: "super_admin"
  },
  {
    title: "Audit Logs",
    url: "/audit-logs",
    icon: FileText,
    roles: ["clinic_admin", "super_admin"],
    module: "administration"
  },

  // 🌍 Super Admin Only
  {
    title: "Multi-Clinic Management",
    url: "/super-admin",
    icon: Building2,
    roles: ["super_admin"],
    module: "super_admin"
  },
  {
    title: "User-to-Clinic Assignment",
    url: "/branches",
    icon: Users,
    roles: ["super_admin"],
    module: "super_admin"
  },
  {
    title: "System Analytics",
    url: "/system-analytics",
    icon: Database,
    roles: ["super_admin"],
    module: "super_admin"
  },
  {
    title: "System Health Check",
    url: "/system-health",
    icon: Activity,
    roles: ["super_admin"],
    module: "super_admin"
  },
  {
    title: "Enhanced Analytics",
    url: "/enhanced-analytics",
    icon: BarChart3,
    roles: ["clinic_admin", "super_admin"],
    module: "reports"
  },
  {
    title: "AI Automation Flows",
    url: "/ai-automation-flows",
    icon: Bot,
    roles: ["clinic_admin", "super_admin"],
    module: "reports"
  },

  // 👨‍⚕️ Patient Portal
  {
    title: "My Appointments",
    url: "/my-appointments",
    icon: Calendar,
    roles: ["patient"],
    module: "patient_portal"
  },
  {
    title: "My Profile",
    url: "/my-profile",
    icon: User,
    roles: ["patient"],
    module: "patient_portal"
  },
  {
    title: "My Documents",
    url: "/paperless",
    icon: FileText,
    roles: ["patient"],
    module: "patient_portal"
  },
  {
    title: "My Billing",
    url: "/my-billing",
    icon: CreditCard,
    roles: ["patient"],
    module: "patient_portal"
  },
  {
    title: "QR Check-In",
    url: "/checkin",
    icon: QrCode,
    roles: ["patient"],
    module: "patient_portal"
  },

  // ⚙️ Settings (All Users)
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["patient", "dentist", "staff", "clinic_admin", "super_admin"],
    module: "settings"
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Filter navigation items based on user role
  const allowedItems = moduleNavigation.filter(item => {
    return profile?.role && item.roles.includes(profile.role);
  });

  // Group items by modules
  const dashboardItems = allowedItems.filter(item => item.module === "dashboard");
  const appointmentItems = allowedItems.filter(item => item.module === "appointments");
  const patientItems = allowedItems.filter(item => item.module === "patients");
  const paperlessItems = allowedItems.filter(item => item.module === "paperless");
  const treatmentItems = allowedItems.filter(item => item.module === "treatment");
  const reportsItems = allowedItems.filter(item => item.module === "reports");
  const adminItems = allowedItems.filter(item => item.module === "administration");
  const superAdminItems = allowedItems.filter(item => item.module === "super_admin");
  const patientPortalItems = allowedItems.filter(item => item.module === "patient_portal");
  const settingsItems = allowedItems.filter(item => item.module === "settings");

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

        {/* Module-Based Navigation Groups */}
        {renderNavGroup(dashboardItems, "🏠 Dashboard")}
        {renderNavGroup(appointmentItems, "📅 Appointments & Queueing")}
        {renderNavGroup(patientItems, "👤 Patient Management")}
        {renderNavGroup(paperlessItems, "📝 Paperless Records")}
        {renderNavGroup(treatmentItems, "💉 Treatment & Billing")}
        {renderNavGroup(reportsItems, "📊 Reports & Analytics")}
        {renderNavGroup(adminItems, "⚙️ Administration")}
        {renderNavGroup(superAdminItems, "🌍 Super Admin")}
        {renderNavGroup(patientPortalItems, "👨‍⚕️ Patient Portal")}
        {renderNavGroup(settingsItems, "⚙️ Settings")}
      </SidebarContent>
    </Sidebar>
  );
}