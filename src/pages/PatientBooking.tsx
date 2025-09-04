import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Heart } from 'lucide-react';
import { AppointmentBookingForm } from '@/components/AppointmentBookingForm';

function PatientBooking() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Check authentication - redirect if not logged in
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
            <CardTitle className="text-2xl font-bold">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Please log in to your SwiftCare account to book appointments.
            </p>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate('/auth')}>
                Login to SwiftCare
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is a patient
  if (profile.role !== 'patient') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto text-destructive mb-4" />
            <CardTitle className="text-2xl font-bold">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              This page is only accessible to patients.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="bg-card/60 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-xl font-bold">Book Appointment</h1>
              <div className="flex items-center gap-2 justify-center mt-1">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Welcome, {profile.first_name || profile.full_name?.split(' ')[0] || 'Patient'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Patient Portal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <AppointmentBookingForm />
      </div>
    </div>
  );
}

export default PatientBooking;