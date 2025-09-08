import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FeatureProtectedRoute } from "@/components/auth/FeatureProtectedRoute";
import { Layout } from "@/components/Layout";

import { PatientProvider } from "@/lib/PatientContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientRegistration from "./pages/PatientRegistration";
import ProfileSwitcher from "./pages/ProfileSwitcher";
import Dashboard from "./pages/Dashboard";
import UserSettings from "./pages/UserSettings";
import SuperAdmin from "./pages/SuperAdmin";
import SystemAnalytics from "./pages/SystemAnalytics";
import SystemHealth from "./pages/SystemHealth";
import SystemTestSuite from "./pages/SystemTestSuite";
import EnhancedAnalytics from "./pages/EnhancedAnalytics";
import AIAutomationFlows from "./pages/AIAutomationFlows";
import UsersStaff from "./pages/UsersStaff";
import AppointmentsHub from "./pages/AppointmentsHub";
import QueueManagement from "./pages/QueueManagement";
import { PatientCheckIn } from "./pages/PatientCheckIn";
import SmartCheckIn from "./pages/SmartCheckIn";
import PaperlessSystem from "./pages/PaperlessSystem";
import DigitalForms from "./pages/DigitalForms";
import PatientForms from "./pages/PatientForms";
import FormResponses from "./pages/FormResponses";
import Messaging from "./pages/Messaging";
import DentalCharts from "./pages/DentalCharts";
import OdontogramDesigns from "./pages/OdontogramDesigns";
import { PatientRecords } from "./pages/PatientRecords";
import Billing from "./pages/Billing";
import PaymentTracking from "./pages/PaymentTracking";
import PatientEngagement from "./pages/PatientEngagement";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// ... import other pages as needed

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

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
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<UserSettings />} />
        <Route path="super-admin" element={
          <ProtectedRoute requiredRole={['super_admin']}>
            <SuperAdmin />
          </ProtectedRoute>
        } />
        <Route path="system-analytics" element={
          <ProtectedRoute requiredRole={['super_admin']}>
            <SystemAnalytics />
          </ProtectedRoute>
        } />
        <Route path="system-health" element={
          <ProtectedRoute requiredRole={['super_admin']}>
            <SystemHealth />
          </ProtectedRoute>
        } />
        <Route path="system-test-suite" element={
          <ProtectedRoute requiredRole={['super_admin']}>
            <SystemTestSuite />
          </ProtectedRoute>
        } />
        <Route path="enhanced-analytics" element={
          <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
            <EnhancedAnalytics />
          </ProtectedRoute>
        } />
        <Route path="ai-automation-flows" element={
          <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
            <AIAutomationFlows />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
            <UsersStaff />
          </ProtectedRoute>
        } />
        <Route path="appointments" element={
          <FeatureProtectedRoute requiredFeature="appointment_booking">
            <AppointmentsHub />
          </FeatureProtectedRoute>
        } />
        <Route path="queue" element={
          <FeatureProtectedRoute requiredFeature="queue_management">
            <QueueManagement />
          </FeatureProtectedRoute>
        } />
        <Route path="checkin" element={
          <FeatureProtectedRoute requiredFeature="queue_management">
            <ProtectedRoute requiredRole={['patient']}>
              <PatientCheckIn />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="staff-checkin" element={
          <FeatureProtectedRoute requiredFeature="queue_management">
            <SmartCheckIn />
          </FeatureProtectedRoute>
        } />
        <Route path="paperless" element={
          <FeatureProtectedRoute requiredFeature="document_management">
            <PaperlessSystem />
          </FeatureProtectedRoute>
        } />
        <Route path="digital-forms" element={
          <FeatureProtectedRoute requiredFeature="digital_forms">
            <DigitalForms />
          </FeatureProtectedRoute>
        } />
        <Route path="patient-forms" element={
          <FeatureProtectedRoute requiredFeature="digital_forms">
            <PatientForms />
          </FeatureProtectedRoute>
        } />
        <Route path="form-responses" element={
          <FeatureProtectedRoute requiredFeature="digital_forms">
            <FormResponses />
          </FeatureProtectedRoute>
        } />
        <Route path="messages" element={
          <FeatureProtectedRoute requiredFeature="patient_engagement">
            <Messaging />
          </FeatureProtectedRoute>
        } />
        <Route path="charts" element={
          <FeatureProtectedRoute requiredFeature="dental_charts">
            <DentalCharts />
          </FeatureProtectedRoute>
        } />
        <Route path="odontogram-designs" element={
          <FeatureProtectedRoute requiredFeature="dental_charts">
            <OdontogramDesigns />
          </FeatureProtectedRoute>
        } />
        <Route path="patients" element={
          <FeatureProtectedRoute requiredFeature="patient_records">
            <PatientRecords />
          </FeatureProtectedRoute>
        } />
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
