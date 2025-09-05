import { useState, useMemo } from "react";
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
import { useFeatureToggle } from "@/hooks/useFeatureToggle";
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
    title: "Users & Staff",
    url: "/users-staff",
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
    title: "Clinic Branding",
    url: "/clinic-branding",
    icon: Palette,
    roles: ["super_admin"],
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
    title: "System Test Suite",
    url: "/system-test-suite",
    icon: Bot,
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
    roles: ["super_admin"],
    module: "super_admin"
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
  const featureToggle = useFeatureToggle();
  
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  
  // Extract loading state and feature checking function safely
  const loading = 'loading' in featureToggle ? featureToggle.loading : false;
  const isFeatureEnabled = 'isFeatureEnabled' in featureToggle ? featureToggle.isFeatureEnabled : () => false;
  
  // Wait for features to load
  if (loading) {
    return (
      <Sidebar className="w-64 border-r">
        <SidebarContent className="bg-card p-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Map routes to required features
  const getFeatureRequirement = (url: string): string | null => {
    const featureMap: Record<string, string> = {
      // Appointments & Scheduling
      '/appointments': 'appointment_booking',
      '/my-appointments': 'appointment_booking', 
      '/walk-ins': 'appointment_booking',
      '/appointment-settings': 'appointment_settings',
      
      // Queue Management
      '/queue': 'queue_management',
      '/queue-monitor': 'queue_management',
      '/checkin': 'qr_checkin',
      
      // Patient Management
      '/patient-records': 'patient_records',
      '/family-management': 'family_accounts',
      '/insurance': 'insurance_management',
      '/verification-queue': 'patient_records',
      
      // Digital Forms & Documents
      '/esign-forms': 'digital_forms',
      '/dentist-signatures': 'digital_forms',
      '/documents-uploads': 'document_management',
      '/paperless': 'document_management',
      
      // Dental Charts & Treatment
      '/charts': 'dental_charts',
      '/treatment-notes': 'dental_charts',
      
      // Billing & Payments
      '/billing': 'billing_system',
      '/my-billing': 'billing_system',
      '/payment-tracking': 'payment_processing',
      '/revenue-reports': 'billing_system',
      
      // Analytics & Reports
      '/analytics': 'basic_analytics',
      '/queue-reports': 'basic_analytics',
      '/workload-reports': 'advanced_analytics',
      '/enhanced-analytics': 'advanced_analytics',
      
      // Inventory & Operations
      '/inventory': 'inventory_management',
      '/services-management': 'user_management',
      
      // Patient Portal & Engagement - FIXED MAPPING
      '/my-profile': 'patient_portal',
      '/patient-engagement': 'patient_engagement',
      
      // Staff & User Management
      '/users-staff': 'user_management',
      '/user-roles': 'role_based_access',
      
      // Administration
      '/clinic-branding': 'clinic_customization',
      '/audit-logs': 'audit_logging'
    };
    return featureMap[url] || null;
  };

  // Filter items based on role AND feature toggles
  const getVisibleItems = () => {
    console.log('🔍 Sidebar Debug - Current user role:', profile?.role);
    console.log('🔍 Total navigation items to check:', moduleNavigation.length);
    console.log('🔍 Patient Portal items exist:', moduleNavigation.filter(item => item.module === "patient_portal"));
    console.log('🔍 Feature toggle object:', featureToggle);
    console.log('🔍 isFeatureEnabled function:', typeof isFeatureEnabled);
    
    const visibleItems = moduleNavigation.filter(item => {
      // Check role permission
      const hasRole = profile?.role && item.roles.includes(profile.role);
      
      // Check feature requirement
      const requiredFeature = getFeatureRequirement(item.url);
      let featureEnabled = true;
      
      if (requiredFeature) {
        featureEnabled = isFeatureEnabled(requiredFeature);
        console.log(`🎯 Feature Check: ${item.title} requires '${requiredFeature}' = ${featureEnabled}`);
        if (!featureEnabled) {
          console.log(`🚫 HIDING: ${item.title} - feature '${requiredFeature}' is disabled`);
        }
      }
      
      const shouldShow = hasRole && featureEnabled;
      
      console.log(`📝 Item: ${item.title} | Role: ${hasRole} (needs: [${item.roles.join(', ')}]) | Feature: ${requiredFeature || 'none'} = ${featureEnabled} | Show: ${shouldShow}`);
      
      return shouldShow;
    });
    
    console.log('🔍 Final visible items count:', visibleItems.length);
    console.log('🔍 Visible items:', visibleItems.map(item => item.title));
    
    return visibleItems;
  };

  const visibleItems = getVisibleItems();

  // Group visible items by modules
  const dashboardItems = visibleItems.filter(item => item.module === "dashboard");
  const appointmentItems = visibleItems.filter(item => item.module === "appointments");
  const patientItems = visibleItems.filter(item => item.module === "patients");
  const paperlessItems = visibleItems.filter(item => item.module === "paperless");
  const treatmentItems = visibleItems.filter(item => item.module === "treatment");
  const reportsItems = visibleItems.filter(item => item.module === "reports");
  const adminItems = visibleItems.filter(item => item.module === "administration");
  const superAdminItems = visibleItems.filter(item => item.module === "super_admin");
  const patientPortalItems = visibleItems.filter(item => item.module === "patient_portal");
  const settingsItems = visibleItems.filter(item => item.module === "settings");

  console.log('🔍 Debug Module Filtering:');
  console.log('  visibleItems modules:', visibleItems.map(item => `${item.title}: ${item.module}`));
  console.log('  patientPortalItems filtered:', patientPortalItems.map(item => item.title));
  console.log('🔍 Module Groups:');
  console.log('  patientPortalItems:', patientPortalItems.map(item => item.title));
  console.log('  paperlessItems:', paperlessItems.map(item => item.title));
  console.log('  dashboardItems:', dashboardItems.map(item => item.title));
  console.log('  settingsItems:', settingsItems.map(item => item.title));

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

        {/* Module-Based Navigation Groups - Super Admin sees ALL features */}
        {profile?.role === 'super_admin' ? (
          <>
            {renderNavGroup(dashboardItems, "🏠 Dashboard")}
            {renderNavGroup(superAdminItems, "🌍 System Management")}
            {renderNavGroup(appointmentItems, "📅 Appointments & Queueing")}
            {renderNavGroup(patientItems, "👤 Patient Management")}
            {renderNavGroup(paperlessItems, "📝 Paperless Records")}
            {renderNavGroup(treatmentItems, "💉 Treatment & Billing")}
            {renderNavGroup(reportsItems, "📊 Reports & Analytics")}
            {renderNavGroup(adminItems, "⚙️ Administration")}
            {renderNavGroup(settingsItems, "⚙️ Settings")}
          </>
        ) : (
          <>
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
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}