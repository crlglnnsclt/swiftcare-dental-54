import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/Layout";

import { PatientProvider } from "@/lib/PatientContext";

// Core Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientRegistration from "./pages/PatientRegistration";
import ProfileSwitcher from "./pages/ProfileSwitcher";
import UserSettings from "./pages/UserSettings";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Enhanced Role-Based Pages
import EnhancedDentistDashboard from "./pages/EnhancedDentistDashboard";
import EnhancedStaffDashboard from "./pages/EnhancedStaffDashboard";
import EnhancedPatientPortal from "./pages/EnhancedPatientPortal";
import EnhancedAdminDashboard from "./pages/EnhancedAdminDashboard";
import EnhancedAnalytics from "./pages/EnhancedAnalytics";

// Legacy fallback (for backward compatibility)
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, profile } = useAuth();

  // Role-based dashboard routing
  const getDashboardComponent = () => {
    switch (profile?.role) {
      case 'super_admin':
      case 'clinic_admin':
        return <EnhancedAdminDashboard />;
      case 'dentist':
        return <EnhancedDentistDashboard />;
      case 'staff':
        return <EnhancedStaffDashboard />;
      case 'patient':
        return <EnhancedPatientPortal />;
      default:
        return <Dashboard />; // Legacy fallback
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <PatientRegistration />} />
      <Route path="/profile-switcher" element={<ProfileSwitcher />} />

      {/* Protected routes with layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Main Dashboard - Role-based routing */}
        <Route path="dashboard" element={getDashboardComponent()} />
        
        {/* User Settings - Available for all roles */}
        <Route path="settings" element={<UserSettings />} />
        
        {/* Enhanced Analytics - Admin & Super Admin only */}
        <Route path="analytics" element={
          <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
            <EnhancedAnalytics />
          </ProtectedRoute>
        } />

        {/* Role-specific enhanced dashboards (direct access) */}
        <Route path="dentist-dashboard" element={
          <ProtectedRoute requiredRole={['dentist']}>
            <EnhancedDentistDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="staff-dashboard" element={
          <ProtectedRoute requiredRole={['staff']}>
            <EnhancedStaffDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="patient-portal" element={
          <ProtectedRoute requiredRole={['patient']}>
            <EnhancedPatientPortal />
          </ProtectedRoute>
        } />
        
        <Route path="admin-dashboard" element={
          <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
            <EnhancedAdminDashboard />
          </ProtectedRoute>
        } />

        {/* Legacy dashboard fallback */}
        <Route path="legacy-dashboard" element={<Dashboard />} />
      </Route>

      {/* Special routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PatientProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </PatientProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
