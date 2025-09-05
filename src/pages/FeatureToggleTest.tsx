import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useFeatureToggle } from '@/hooks/useFeatureToggle';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FeatureToggleTest = () => {
  const { profile } = useAuth();
  const featureToggle = useFeatureToggle();
  const [testRole, setTestRole] = useState(profile?.role || 'patient');
  
  const isFeatureEnabled = 'isFeatureEnabled' in featureToggle ? featureToggle.isFeatureEnabled : () => false;
  const features = 'features' in featureToggle ? featureToggle.features : {};
  const toggleFeature = 'toggleFeature' in featureToggle ? featureToggle.toggleFeature : () => Promise.resolve(false);

  // Feature mapping for each role
  const roleFeatures = {
    super_admin: [
      { name: 'Multi-Clinic Management', url: '/super-admin', feature: null },
      { name: 'Feature Toggles', url: '/feature-toggles', feature: null },
      { name: 'System Analytics', url: '/system-analytics', feature: null },
      { name: 'Clinic Branding', url: '/clinic-branding', feature: 'clinic_customization' },
      { name: 'Users & Staff', url: '/users-staff', feature: 'user_management' },
      { name: 'All Clinic Admin Features', url: '', feature: null }
    ],
    clinic_admin: [
      { name: 'Appointments', url: '/appointments', feature: 'appointment_booking' },
      { name: 'Queue Dashboard', url: '/queue', feature: 'queue_management' },
      { name: 'Patient Profiles', url: '/patient-records', feature: 'patient_records' },
      { name: 'Billing & Invoices', url: '/billing', feature: 'billing_system' },
      { name: 'Dental Charts', url: '/charts', feature: 'dental_charts' },
      { name: 'Revenue Reports', url: '/revenue-reports', feature: 'billing_system' },
      { name: 'Inventory', url: '/inventory', feature: 'inventory_management' }
    ],
    dentist: [
      { name: 'Appointments', url: '/appointments', feature: 'appointment_booking' },
      { name: 'Patient Profiles', url: '/patient-records', feature: 'patient_records' },
      { name: 'Dental Charts', url: '/charts', feature: 'dental_charts' },
      { name: 'Treatment Notes', url: '/treatment-notes', feature: 'dental_charts' },
      { name: 'E-Sign Forms', url: '/esign-forms', feature: 'digital_forms' }
    ],
    staff: [
      { name: 'Appointments', url: '/appointments', feature: 'appointment_booking' },
      { name: 'Queue Dashboard', url: '/queue', feature: 'queue_management' },
      { name: 'Patient Profiles', url: '/patient-records', feature: 'patient_records' },
      { name: 'Billing & Invoices', url: '/billing', feature: 'billing_system' },
      { name: 'Walk-ins', url: '/walk-ins', feature: 'appointment_booking' }
    ],
    patient: [
      { name: 'My Appointments', url: '/my-appointments', feature: 'appointment_booking' },
      { name: 'My Profile', url: '/my-profile', feature: 'patient_portal' },
      { name: 'My Documents', url: '/paperless', feature: 'document_management' },
      { name: 'My Billing', url: '/my-billing', feature: 'billing_system' },
      { name: 'QR Check-In', url: '/checkin', feature: 'qr_checkin' }
    ]
  };

  const handleFeatureToggle = async (featureName: string, enabled: boolean) => {
    const success = await toggleFeature(featureName, enabled);
    if (success) {
      toast.success(`Feature ${featureName} ${enabled ? 'enabled' : 'disabled'}`);
    } else {
      toast.error(`Failed to toggle feature ${featureName}`);
    }
  };

  const handleRoleTest = async (role: string) => {
    try {
      await supabase
        .from('users')
        .update({ role: role as any })
        .eq('user_id', profile?.user_id);
      
      toast.success(`Role changed to ${role}. Please refresh to see changes.`);
      setTestRole(role);
    } catch (error) {
      toast.error('Failed to change role');
    }
  };

  const currentRoleFeatures = roleFeatures[testRole as keyof typeof roleFeatures] || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Feature Toggle Test Suite</CardTitle>
          <CardDescription>
            Test feature toggles across different user roles. Current role: <Badge variant="outline">{profile?.role}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔄 Role Testing</CardTitle>
                <CardDescription>Test different user roles (requires refresh)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {['super_admin', 'clinic_admin', 'dentist', 'staff', 'patient'].map((role) => (
                  <Button
                    key={role}
                    variant={testRole === role ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleRoleTest(role)}
                  >
                    {role.replace('_', ' ').toUpperCase()}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎛️ Feature Controls</CardTitle>
                <CardDescription>Toggle key features on/off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  'appointment_booking',
                  'patient_portal', 
                  'billing_system',
                  'dental_charts',
                  'queue_management'
                ].map((feature) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{feature}</span>
                    <Switch
                      checked={isFeatureEnabled(feature)}
                      onCheckedChange={(checked) => handleFeatureToggle(feature, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  👨‍⚕️ {testRole.replace('_', ' ').toUpperCase()} Features
                </CardTitle>
                <CardDescription>Features that should be visible for this role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentRoleFeatures.map((item, index) => {
                  const shouldShow = !item.feature || isFeatureEnabled(item.feature);
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className={shouldShow ? 'text-foreground' : 'text-muted-foreground line-through'}>
                        {item.name}
                      </span>
                      <Badge variant={shouldShow ? "default" : "secondary"}>
                        {shouldShow ? '✅' : '🚫'}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">📊 Feature Status Overview</CardTitle>
              <CardDescription>All available features and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                {Object.entries(features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Badge variant={enabled ? "default" : "secondary"}>
                      {enabled ? '✅' : '🚫'}
                    </Badge>
                    <span className={enabled ? 'text-foreground' : 'text-muted-foreground'}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureToggleTest;