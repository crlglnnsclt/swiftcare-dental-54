import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface QRCodeData {
  id: string;
  type: 'daily_checkin' | 'appointment_specific' | 'staff_timein';
  data: string;
  expires_at: string;
  clinic_id: string;
  created_at: string;
  is_active: boolean;
}

export function useQRCodeManager() {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [dailyQR, setDailyQR] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    loadQRCodes();
    generateDailyQRIfNeeded();
    
    // Check for expired QR codes every hour
    const interval = setInterval(() => {
      checkExpiredQRCodes();
      generateDailyQRIfNeeded();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadQRCodes = async () => {
    try {
      if (!profile?.clinic_id) {
        console.log('No clinic_id available, skipping QR code load');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('clinic_feature_toggles')
        .select('*')
        .eq('feature_name', 'qr_codes')
        .eq('clinic_id', profile.clinic_id);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        const qrData = data.map(item => JSON.parse(item.description || '{}'));
        setQRCodes(qrData);
        
        // Find current daily QR
        const currentDaily = qrData.find((qr: QRCodeData) => 
          qr.type === 'daily_checkin' && 
          new Date(qr.expires_at) > new Date()
        );
        setDailyQR(currentDaily || null);
      }
    } catch (error) {
      console.error('Error loading QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyQRIfNeeded = async () => {
    try {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Check if we need a new daily QR
      if (!dailyQR || new Date(dailyQR.expires_at) < now) {
        await generateDailyQR();
      }
    } catch (error) {
      console.error('Error checking daily QR:', error);
    }
  };

  const generateDailyQR = async () => {
    try {
      if (!profile?.clinic_id) {
        console.log('No clinic_id available, skipping QR generation');
        return;
      }

      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const qrId = `daily-${now.toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 9)}`;
      
      const qrData: QRCodeData = {
        id: qrId,
        type: 'daily_checkin',
        data: JSON.stringify({
          qrId,
          clinicId: profile?.clinic_id,
          type: 'daily_checkin',
          checkInUrl: `${window.location.origin}/checkin?qr=${qrId}`,
          generatedAt: now.toISOString(),
          expiresAt: endOfDay.toISOString()
        }),
        expires_at: endOfDay.toISOString(),
        clinic_id: profile?.clinic_id || '',
        created_at: now.toISOString(),
        is_active: true
      };

      // Save to database
      await supabase
        .from('clinic_feature_toggles')
        .upsert({
          feature_name: 'qr_codes',
          clinic_id: profile?.clinic_id,
          is_enabled: true,
          description: JSON.stringify(qrData),
          modified_by: profile?.id
        });

      setDailyQR(qrData);
      console.log('Daily QR code generated:', qrId);

    } catch (error) {
      console.error('Error generating daily QR:', error);
    }
  };

  const generateAppointmentQR = async (appointmentId: string) => {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      const qrId = `apt-${appointmentId}-${Math.random().toString(36).substr(2, 9)}`;
      
      const qrData: QRCodeData = {
        id: qrId,
        type: 'appointment_specific',
        data: JSON.stringify({
          qrId,
          appointmentId,
          clinicId: profile?.clinic_id,
          type: 'appointment_specific',
          checkInUrl: `${window.location.origin}/checkin?qr=${qrId}&apt=${appointmentId}`,
          generatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString()
        }),
        expires_at: expiresAt.toISOString(),
        clinic_id: profile?.clinic_id || '',
        created_at: now.toISOString(),
        is_active: true
      };

      // Save to database
      await supabase
        .from('clinic_feature_toggles')
        .insert({
          feature_name: 'qr_codes',
          clinic_id: profile?.clinic_id,
          is_enabled: true,
          description: JSON.stringify(qrData),
          modified_by: profile?.id
        });

      return qrData;

    } catch (error) {
      console.error('Error generating appointment QR:', error);
      return null;
    }
  };

  const generateStaffQR = async (staffId: string) => {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours

      const qrId = `staff-${staffId}-${Math.random().toString(36).substr(2, 9)}`;
      
      const qrData: QRCodeData = {
        id: qrId,
        type: 'staff_timein',
        data: JSON.stringify({
          qrId,
          staffId,
          clinicId: profile?.clinic_id,
          type: 'staff_timein',
          timeInUrl: `${window.location.origin}/staff-timein?qr=${qrId}&staff=${staffId}`,
          generatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString()
        }),
        expires_at: expiresAt.toISOString(),
        clinic_id: profile?.clinic_id || '',
        created_at: now.toISOString(),
        is_active: true
      };

      // Save to database
      await supabase
        .from('clinic_feature_toggles')
        .insert({
          feature_name: 'qr_codes',
          clinic_id: profile?.clinic_id,
          is_enabled: true,
          description: JSON.stringify(qrData),
          modified_by: profile?.id
        });

      return qrData;

    } catch (error) {
      console.error('Error generating staff QR:', error);
      return null;
    }
  };

  const checkExpiredQRCodes = async () => {
    try {
      const now = new Date();
      
      // Deactivate expired QR codes
      const expiredCodes = qrCodes.filter(qr => 
        new Date(qr.expires_at) < now && qr.is_active
      );

      for (const expiredCode of expiredCodes) {
        await supabase
          .from('clinic_feature_toggles')
          .update({ is_enabled: false })
          .eq('feature_name', 'qr_codes')
          .eq('description', JSON.stringify(expiredCode));
      }

      if (expiredCodes.length > 0) {
        console.log(`Deactivated ${expiredCodes.length} expired QR codes`);
        loadQRCodes(); // Refresh the list
      }

    } catch (error) {
      console.error('Error checking expired QR codes:', error);
    }
  };

  const validateQRCode = async (qrId: string) => {
    try {
      const { data, error } = await supabase
        .from('clinic_feature_toggles')
        .select('*')
        .eq('feature_name', 'qr_codes')
        .eq('is_enabled', true);

      if (error) throw error;

      const validQR = data?.find(item => {
        try {
          const qrData = JSON.parse(item.description || '{}');
          return qrData.id === qrId && new Date(qrData.expires_at) > new Date();
        } catch {
          return false;
        }
      });

      if (validQR) {
        const qrData = JSON.parse(validQR.description);
        return {
          isValid: true,
          data: qrData,
          type: qrData.type
        };
      }

      return {
        isValid: false,
        error: 'QR code is invalid or expired'
      };

    } catch (error) {
      console.error('Error validating QR code:', error);
      return {
        isValid: false,
        error: 'Failed to validate QR code'
      };
    }
  };

  return {
    qrCodes,
    dailyQR,
    loading,
    generateDailyQR,
    generateAppointmentQR,
    generateStaffQR,
    validateQRCode,
    checkExpiredQRCodes,
    refreshQRCodes: loadQRCodes
  };
}