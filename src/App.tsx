import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FeatureProtectedRoute } from "@/components/auth/FeatureProtectedRoute";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientBooking from "./pages/PatientBooking";
import BookingConfirmation from "./pages/BookingConfirmation";
import PatientApp from "./pages/PatientApp";
import Dashboard from "./pages/Dashboard";
import UserSettings from "./pages/UserSettings";

import QueueManagement from "./pages/QueueManagement";
import SmartCheckIn from "./pages/SmartCheckIn";
import PatientAppointments from "./pages/PatientAppointments";
import PatientProfile from "./pages/PatientProfile";
import PatientResults from "./pages/PatientResults";
import PatientNotifications from "./pages/PatientNotifications";
import QRCheckIn from "./components/QRCheckIn";
import DigitalForms from "./pages/DigitalForms";
import PatientForms from "./pages/PatientForms";
import FormResponses from "./pages/FormResponses";
import InventoryManagement from "./pages/InventoryManagement";
import StaffManagement from "./pages/StaffManagement";
import { PatientRecords } from "./pages/PatientRecords";
import { Analytics } from "./pages/Analytics";
import AppointmentScheduling from "./pages/AppointmentScheduling";
import ProfileSwitcher from "./pages/ProfileSwitcher";
import NotFound from "./pages/NotFound";

import SuperAdmin from "./pages/SuperAdmin";
import PaperlessSystem from "./pages/PaperlessSystem";
import SystemAnalytics from "./pages/SystemAnalytics";
import Billing from "./pages/Billing";
import PatientEngagement from "./pages/PatientEngagement";
import UsersStaff from "./pages/UsersStaff";

import Messaging from "./pages/Messaging";
import DentalCharts from "./pages/DentalCharts";
import OdontogramDesigns from "./pages/OdontogramDesigns";
import Unauthorized from "./pages/Unauthorized";
import AuditLogs from "./pages/AuditLogs";
import VerificationQueue from "./pages/VerificationQueue";
import QueueMonitor from "./pages/QueueMonitor";
import WalkIns from "./pages/WalkIns";
import FamilyManagement from "./pages/FamilyManagement";
import InsuranceHMO from "./pages/InsuranceHMO";
import QueueReports from "./pages/QueueReports";
import RevenueReports from "./pages/RevenueReports";
import WorkloadReports from "./pages/WorkloadReports";
import TreatmentNotes from "./pages/TreatmentNotes";
import ServicesManagement from "./pages/ServicesManagement";
import PaymentTracking from "./pages/PaymentTracking";
import ClinicBranding from "./pages/ClinicBranding";
import FeatureToggles from "./pages/FeatureToggles";
import UserRoles from "./pages/UserRoles";
import MyBilling from "./pages/MyBilling";
import AppointmentSettings from "./pages/AppointmentSettings";
import DentistStaffSignatures from "./pages/DentistStaffSignatures";
import ESignForms from "./pages/ESignForms";
import DocumentsUploads from "./pages/DocumentsUploads";
import SystemHealth from "./pages/SystemHealth";
import EnhancedAnalytics from "./pages/EnhancedAnalytics";
import AIAutomationFlows from "./pages/AIAutomationFlows";
import PatientRegistration from "./pages/PatientRegistration";
import AppointmentsHub from "./pages/AppointmentsHub";
import { PatientCheckIn } from "./pages/PatientCheckIn";

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
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
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
        <Route path="analytics" element={
          <FeatureProtectedRoute requiredFeature="basic_analytics">
            <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
              <Analytics />
            </ProtectedRoute>
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
            <ProtectedRoute requiredRole={['clinic_admin', 'staff', 'super_admin']}>
              <DigitalForms />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="patient-forms" element={
          <FeatureProtectedRoute requiredFeature="digital_forms">
            <ProtectedRoute requiredRole={['patient']}>
              <PatientForms />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="form-responses" element={
          <FeatureProtectedRoute requiredFeature="digital_forms">
            <ProtectedRoute requiredRole={['clinic_admin', 'staff', 'super_admin']}>
              <FormResponses />
            </ProtectedRoute>
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
            <ProtectedRoute requiredRole={['clinic_admin', 'staff', 'dentist']}>
              <PatientRecords />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="inventory" element={
          <FeatureProtectedRoute requiredFeature="inventory_management">
            <ProtectedRoute requiredRole={['clinic_admin', 'staff']}>
              <InventoryManagement />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="staff-management" element={
          <FeatureProtectedRoute requiredFeature="user_management">
            <ProtectedRoute requiredRole={['clinic_admin']}>
              <StaffManagement />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="patient-records" element={
          <FeatureProtectedRoute requiredFeature="patient_records">
            <ProtectedRoute requiredRole={['clinic_admin', 'staff', 'dentist']}>
              <PatientRecords />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        
        {/* Patient-specific routes */}
        <Route path="my-appointments" element={
          <FeatureProtectedRoute requiredFeature="appointment_booking">
            <ProtectedRoute requiredRole={['patient']}>
              <PatientAppointments />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="my-profile" element={
          <FeatureProtectedRoute requiredFeature="patient_portal">
            <ProtectedRoute requiredRole={['patient']}>
              <PatientProfile />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="my-results" element={
          <FeatureProtectedRoute requiredFeature="patient_portal">
            <ProtectedRoute requiredRole={['patient']}>
              <PatientResults />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="my-notifications" element={
          <FeatureProtectedRoute requiredFeature="appointment_reminders">
            <ProtectedRoute requiredRole={['patient']}>
              <PatientNotifications />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        
        {/* New Business Features */}
        <Route path="billing" element={
          <FeatureProtectedRoute requiredFeature="billing_system">
            <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
              <Billing />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="payment-tracking" element={
          <FeatureProtectedRoute requiredFeature="payment_processing">
            <ProtectedRoute requiredRole={['clinic_admin', 'staff', 'super_admin']}>
              <PaymentTracking />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="patient-engagement" element={
          <FeatureProtectedRoute requiredFeature="patient_portal">
            <ProtectedRoute requiredRole={['clinic_admin', 'staff', 'super_admin']}>
              <PatientEngagement />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        
        <Route path="audit-logs" element={
          <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
            <AuditLogs />
          </ProtectedRoute>
        } />
        <Route path="verification-queue" element={
          <ProtectedRoute requiredRole={['staff', 'clinic_admin', 'super_admin']}>
            <VerificationQueue />
          </ProtectedRoute>
        } />
        <Route path="queue-monitor" element={
          <FeatureProtectedRoute requiredFeature="queue_management">
            <QueueMonitor />
          </FeatureProtectedRoute>
        } />
        <Route path="walk-ins" element={
          <FeatureProtectedRoute requiredFeature="appointment_booking">
            <ProtectedRoute requiredRole={['staff', 'clinic_admin', 'super_admin']}>
              <WalkIns />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="appointment-settings" element={
          <FeatureProtectedRoute requiredFeature="appointment_settings">
            <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
              <AppointmentSettings />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="family-management" element={
          <FeatureProtectedRoute requiredFeature="family_accounts">
            <ProtectedRoute requiredRole={['clinic_admin', 'staff', 'super_admin']}>
              <FamilyManagement />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="insurance" element={
          <FeatureProtectedRoute requiredFeature="insurance_management">
            <ProtectedRoute requiredRole={['clinic_admin', 'staff', 'super_admin']}>
              <InsuranceHMO />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        
        {/* Additional Pages */}
        <Route path="queue-reports" element={
          <FeatureProtectedRoute requiredFeature="basic_analytics">
            <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
              <QueueReports />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="revenue-reports" element={
          <FeatureProtectedRoute requiredFeature="billing_system">
            <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
              <RevenueReports />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="workload-reports" element={
          <FeatureProtectedRoute requiredFeature="basic_analytics">
            <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
              <WorkloadReports />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="treatment-notes" element={
          <FeatureProtectedRoute requiredFeature="dental_charts">
            <ProtectedRoute requiredRole={['dentist', 'clinic_admin', 'super_admin']}>
              <TreatmentNotes />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="services-management" element={
          <FeatureProtectedRoute requiredFeature="user_management">
            <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
              <ServicesManagement />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        <Route path="clinic-branding" element={
          <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
            <ClinicBranding />
          </ProtectedRoute>
        } />
        <Route path="feature-toggles" element={
          <ProtectedRoute requiredRole={['super_admin']}>
            <FeatureToggles />
          </ProtectedRoute>
        } />
        <Route path="user-roles" element={
          <ProtectedRoute requiredRole={['clinic_admin', 'super_admin']}>
            <UserRoles />
          </ProtectedRoute>
        } />
        <Route path="my-billing" element={
          <FeatureProtectedRoute requiredFeature="billing_system">
            <ProtectedRoute requiredRole={['patient']}>
              <MyBilling />
            </ProtectedRoute>
          </FeatureProtectedRoute>
        } />
        
        {/* Paperless Records Routes */}
        <Route path="esign-forms" element={
          <FeatureProtectedRoute requiredFeature="digital_forms">
            <ESignForms />
          </FeatureProtectedRoute>
        } />
        <Route path="documents-uploads" element={
          <FeatureProtectedRoute requiredFeature="document_management">
            <DocumentsUploads />
          </FeatureProtectedRoute>
        } />
        <Route path="dentist-signatures" element={
          <FeatureProtectedRoute requiredFeature="digital_forms">
            <ProtectedRoute requiredRole={['dentist', 'clinic_admin', 'staff']}>
              <DentistStaffSignatures />
            </ProtectedRoute>
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
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
