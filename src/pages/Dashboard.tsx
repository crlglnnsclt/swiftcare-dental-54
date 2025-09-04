import { useAuth } from '@/components/auth/AuthContext';
import { PatientDashboard } from '@/pages/PatientDashboard';
import AdminDashboard from '@/pages/AdminDashboard';  
import DentistDashboard from '@/pages/DentistDashboard';
import { StaffDashboard } from '@/pages/StaffDashboard';
import SuperAdmin from '@/pages/SuperAdmin';

const Dashboard = () => {
  const { profile } = useAuth();

  // Route to the appropriate dashboard based on user role
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  switch (profile.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'clinic_admin':
      return <AdminDashboard />;
    case 'dentist':
      return <DentistDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'super_admin':
      return <SuperAdmin />;
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;