import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientBooking from "./pages/PatientBooking";
import BookingConfirmation from "./pages/BookingConfirmation";
import PatientApp from "./pages/PatientApp";
import Dashboard from "./pages/Dashboard";
import UserSettings from "./pages/UserSettings";
import BranchManagementMerged from "./pages/BranchManagementMerged";
import QueueManagement from "./pages/QueueManagement";
import { PatientCheckIn } from "./pages/PatientCheckIn";
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
import BranchSelection from "./pages/BranchSelection";
import SuperAdmin from "./pages/SuperAdmin";
import PaperlessSystem from "./pages/PaperlessSystem";
import SystemAnalytics from "./pages/SystemAnalytics";
import Billing from "./pages/Billing";
import PatientEngagement from "./pages/PatientEngagement";
import UsersStaff from "./pages/UsersStaff";
import BranchSettings from "./pages/BranchSettings";
import Messaging from "./pages/Messaging";
import DentalCharts from "./pages/DentalCharts";
import OdontogramDesigns from "./pages/OdontogramDesigns";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/branch-selection" element={user ? <BranchSelection /> : <Navigate to="/auth" replace />} />
      <Route path="/profile-switcher" element={<ProfileSwitcher />} />
      <Route path="/checkin" element={<PatientCheckIn />} />
      
      {/* Protected routes with layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<UserSettings />} />
        <Route path="branches" element={
          <ProtectedRoute requiredRole={['super_admin']}>
            <BranchManagementMerged />
          </ProtectedRoute>
        } />
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
        <Route path="users" element={
          <ProtectedRoute requiredRole={['admin', 'super_admin']}>
            <UsersStaff />
          </ProtectedRoute>
        } />
        <Route path="branch-settings" element={
          <ProtectedRoute requiredRole={['super_admin']}>
            <BranchManagementMerged />
          </ProtectedRoute>
        } />
        <Route path="appointments" element={
          <ProtectedRoute requiredRole={['admin', 'staff', 'dentist', 'super_admin']}>
            <AppointmentScheduling />
          </ProtectedRoute>
        } />
        <Route path="analytics" element={
          <ProtectedRoute requiredRole={['admin', 'super_admin']}>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="queue" element={<QueueManagement />} />
        <Route path="staff-checkin" element={<PatientCheckIn />} />
        <Route path="paperless" element={<PaperlessSystem />} />
        <Route path="digital-forms" element={
          <ProtectedRoute requiredRole={['admin', 'staff', 'super_admin']}>
            <DigitalForms />
          </ProtectedRoute>
        } />
        <Route path="patient-forms" element={
          <ProtectedRoute requiredRole={['patient']}>
            <PatientForms />
          </ProtectedRoute>
        } />
        <Route path="form-responses" element={
          <ProtectedRoute requiredRole={['admin', 'staff', 'super_admin']}>
            <FormResponses />
          </ProtectedRoute>
        } />
        <Route path="messages" element={<Messaging />} />
        <Route path="charts" element={<DentalCharts />} />
        <Route path="odontogram-designs" element={<OdontogramDesigns />} />
        <Route path="patients" element={
          <ProtectedRoute requiredRole={['admin', 'staff', 'dentist']}>
            <PatientRecords />
          </ProtectedRoute>
        } />
        <Route path="inventory" element={
          <ProtectedRoute requiredRole={['admin', 'staff']}>
            <InventoryManagement />
          </ProtectedRoute>
        } />
        <Route path="staff-management" element={
          <ProtectedRoute requiredRole={['admin']}>
            <StaffManagement />
          </ProtectedRoute>
        } />
        <Route path="patient-records" element={
          <ProtectedRoute requiredRole={['admin', 'staff', 'dentist']}>
            <PatientRecords />
          </ProtectedRoute>
        } />
        
        {/* Patient-specific routes */}
        <Route path="my-appointments" element={
          <ProtectedRoute requiredRole={['patient']}>
            <PatientAppointments />
          </ProtectedRoute>
        } />
        <Route path="my-profile" element={
          <ProtectedRoute requiredRole={['patient']}>
            <PatientProfile />
          </ProtectedRoute>
        } />
        <Route path="my-results" element={
          <ProtectedRoute requiredRole={['patient']}>
            <PatientResults />
          </ProtectedRoute>
        } />
        <Route path="my-notifications" element={
          <ProtectedRoute requiredRole={['patient']}>
            <PatientNotifications />
          </ProtectedRoute>
        } />
        
        {/* New Business Features */}
        <Route path="billing" element={
          <ProtectedRoute requiredRole={['admin', 'super_admin']}>
            <Billing />
          </ProtectedRoute>
        } />
        <Route path="patient-engagement" element={
          <ProtectedRoute requiredRole={['admin', 'staff', 'super_admin']}>
            <PatientEngagement />
          </ProtectedRoute>
        } />
        
        <Route path="payments" element={<div className="p-8"><h1 className="text-2xl font-bold">Payments</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
        <Route path="reports" element={<div className="p-8"><h1 className="text-2xl font-bold">Reports</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
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
