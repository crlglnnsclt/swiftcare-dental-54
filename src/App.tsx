import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/Layout";

import { PatientProvider } from "@/lib/PatientContext";
import { coreModules } from "@/lib/coreModules";

// Core Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientRegistration from "./pages/PatientRegistration";
import ProfileSwitcher from "./pages/ProfileSwitcher";
import UserSettings from "./pages/UserSettings";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Simple Login
import SimpleLogin from "./pages/SimpleLogin";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminTreatment from "./pages/admin/AdminTreatment";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminForms from "./pages/admin/AdminForms";
import AdminAIDiagnostics from "./pages/admin/AdminAIDiagnostics";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientTreatment from "./pages/patient/PatientTreatment";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientBilling from "./pages/patient/PatientBilling";
import PatientForms from "./pages/patient/PatientForms";
import PatientQueue from "./pages/patient/PatientQueue";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientAIDiagnostics from "./pages/patient/PatientAIDiagnostics";

// Dentist Pages
import DentistDashboard from "./pages/dentist/DentistDashboard";
import DentistPatients from "./pages/dentist/DentistPatients";
import DentistTreatment from "./pages/dentist/DentistTreatment";
import DentistChart from "./pages/dentist/DentistChart";
import DentistAppointments from "./pages/dentist/DentistAppointments";
import DentistAIDiagnostics from "./pages/dentist/DentistAIDiagnostics";
import DentistQueue from "./pages/dentist/DentistQueue";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffCheckIn from "./pages/staff/StaffCheckIn";
import StaffAppointments from "./pages/staff/StaffAppointments";
import StaffPatients from "./pages/staff/StaffPatients";
import StaffBilling from "./pages/staff/StaffBilling";
import StaffInventory from "./pages/staff/StaffInventory";
import StaffQueue from "./pages/staff/StaffQueue";

// Manager Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerStaff from "./pages/manager/ManagerStaff";
import ManagerReports from "./pages/manager/ManagerReports";
import ManagerInventory from "./pages/manager/ManagerInventory";
import ManagerPatients from "./pages/manager/ManagerPatients";
import ManagerForms from "./pages/manager/ManagerForms";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, profile } = useAuth();

  // Role-based dashboard routing
  const getDefaultDashboard = () => {
    switch (profile?.role) {
      case 'super_admin':
      case 'clinic_admin':
        return '/admin/dashboard';
      case 'dentist':
        return '/dentist/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'patient':
        return '/patient/dashboard';
      case 'manager':
        return '/manager/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to={getDefaultDashboard()} replace /> : <Index />} />
      <Route path="/auth" element={user ? <Navigate to={getDefaultDashboard()} replace /> : <Auth />} />
      <Route path="/simple-login" element={user ? <Navigate to={getDefaultDashboard()} replace /> : <SimpleLogin />} />
      <Route path="/admin" element={user ? <Navigate to={getDefaultDashboard()} replace /> : <SimpleLogin />} />
      <Route path="/register" element={user ? <Navigate to={getDefaultDashboard()} replace /> : <PatientRegistration />} />
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
        {/* Legacy dashboard redirect */}
        <Route path="dashboard" element={<Navigate to={getDefaultDashboard()} replace />} />
        
        {/* User Settings - Available for all roles */}
        <Route path="settings" element={<UserSettings />} />

        {/* Admin Routes */}
        <Route path="admin/*" element={
          <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="treatment" element={<AdminTreatment />} />
              <Route path="billing" element={<AdminBilling />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="forms" element={<AdminForms />} />
              <Route path="ai-diagnostics" element={<AdminAIDiagnostics />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Patient Routes */}
        <Route path="patient/*" element={
          <ProtectedRoute requiredRole={['patient']}>
            <Routes>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="treatment" element={<PatientTreatment />} />
              <Route path="records" element={<PatientRecords />} />
              <Route path="billing" element={<PatientBilling />} />
              <Route path="forms" element={<PatientForms />} />
              <Route path="queue" element={<PatientQueue />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="ai-diagnostics" element={<PatientAIDiagnostics />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Dentist Routes */}
        <Route path="dentist/*" element={
          <ProtectedRoute requiredRole={['dentist']}>
            <Routes>
              <Route path="dashboard" element={<DentistDashboard />} />
              <Route path="patients" element={<DentistPatients />} />
              <Route path="treatment" element={<DentistTreatment />} />
              <Route path="chart" element={<DentistChart />} />
              <Route path="appointments" element={<DentistAppointments />} />
              <Route path="ai-diagnostics" element={<DentistAIDiagnostics />} />
              <Route path="queue" element={<DentistQueue />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Staff Routes */}
        <Route path="staff/*" element={
          <ProtectedRoute requiredRole={['staff']}>
            <Routes>
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="checkin" element={<StaffCheckIn />} />
              <Route path="appointments" element={<StaffAppointments />} />
              <Route path="patients" element={<StaffPatients />} />
              <Route path="billing" element={<StaffBilling />} />
              <Route path="inventory" element={<StaffInventory />} />
              <Route path="queue" element={<StaffQueue />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Manager Routes */}
        <Route path="manager/*" element={
          <ProtectedRoute requiredRole={['manager']}>
            <Routes>
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="staff" element={<ManagerStaff />} />
              <Route path="reports" element={<ManagerReports />} />
              <Route path="inventory" element={<ManagerInventory />} />
              <Route path="patients" element={<ManagerPatients />} />
              <Route path="forms" element={<ManagerForms />} />
            </Routes>
          </ProtectedRoute>
        } />
      </Route>

      {/* Special routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  // Initialize SwiftCare Core Modules on app start
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        await coreModules.initialize();
        console.log('🚀 SwiftCare Dental System - All core modules initialized');
        console.log('✅ Appointment Management - Always running');
        console.log('✅ Queueing System - Always running');
        console.log('✅ Paperless Workflow - Always running'); 
        console.log('✅ Analytics - Always running');
      } catch (error) {
        console.error('❌ Failed to initialize core modules:', error);
      }
    };

    initializeSystem();
  }, []);

  return (
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
};

export default App;