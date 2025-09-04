import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReminderSettings {
  enable_reminders: boolean;
  reminder_24h_enabled: boolean;
  reminder_1h_enabled: boolean;
  reminder_channels: string[];
  custom_reminder_text: string;
}

interface PendingReminder {
  id: string;
  appointment_id: string;
  patient_id: string;
  scheduled_time: string;
  reminder_type: '24h' | '1h';
  status: 'pending' | 'sent' | 'failed';
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
}

export function useAutomatedReminders() {
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [pendingReminders, setPendingReminders] = useState<PendingReminder[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadReminderSettings();
    checkPendingReminders();
    
    // Set up interval to check for reminders every 5 minutes
    const interval = setInterval(checkPendingReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadReminderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_feature_toggles')
        .select('description')
        .eq('feature_name', 'appointment_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.description) {
        const allSettings = JSON.parse(data.description);
        setSettings({
          enable_reminders: allSettings.enable_reminders || false,
          reminder_24h_enabled: allSettings.reminder_24h_enabled || false,
          reminder_1h_enabled: allSettings.reminder_1h_enabled || false,
          reminder_channels: allSettings.reminder_channels || ['email'],
          custom_reminder_text: allSettings.custom_reminder_text || 'Your appointment is scheduled for {date} at {time}'
        });
      }
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  };

  const checkPendingReminders = async () => {
    if (!settings?.enable_reminders) return;

    setIsProcessing(true);
    try {
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Get appointments that need reminders
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          scheduled_time,
          patients!inner(full_name, email, contact_number)
        `)
        .eq('status', 'booked')
        .gte('scheduled_time', now.toISOString())
        .lte('scheduled_time', twentyFourHoursFromNow.toISOString());

      if (error) throw error;

      const reminders: PendingReminder[] = [];

      appointments?.forEach(apt => {
        const aptTime = new Date(apt.scheduled_time);
        const timeDiff = aptTime.getTime() - now.getTime();
        const hoursUntil = timeDiff / (1000 * 60 * 60);

        // 24-hour reminder
        if (settings.reminder_24h_enabled && hoursUntil <= 24 && hoursUntil > 23) {
          reminders.push({
            id: `${apt.id}-24h`,
            appointment_id: apt.id,
            patient_id: apt.patient_id,
            scheduled_time: apt.scheduled_time,
            reminder_type: '24h',
            status: 'pending',
            patient_name: apt.patients?.full_name || 'Patient',
            patient_email: apt.patients?.email,
            patient_phone: apt.patients?.contact_number
          });
        }

        // 1-hour reminder
        if (settings.reminder_1h_enabled && hoursUntil <= 1 && hoursUntil > 0.5) {
          reminders.push({
            id: `${apt.id}-1h`,
            appointment_id: apt.id,
            patient_id: apt.patient_id,
            scheduled_time: apt.scheduled_time,
            reminder_type: '1h',
            status: 'pending',
            patient_name: apt.patients?.full_name || 'Patient',
            patient_email: apt.patients?.email,
            patient_phone: apt.patients?.contact_number
          });
        }
      });

      setPendingReminders(reminders);

      // Process reminders
      for (const reminder of reminders) {
        await sendReminder(reminder);
      }

    } catch (error) {
      console.error('Error checking pending reminders:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendReminder = async (reminder: PendingReminder) => {
    try {
      const appointmentDate = new Date(reminder.scheduled_time).toLocaleDateString();
      const appointmentTime = new Date(reminder.scheduled_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      const message = settings?.custom_reminder_text
        ?.replace('{date}', appointmentDate)
        ?.replace('{time}', appointmentTime) || 
        `Your appointment is scheduled for ${appointmentDate} at ${appointmentTime}`;

      // Send email reminder
      if (settings?.reminder_channels.includes('email') && reminder.patient_email) {
        await sendEmailReminder(reminder, message);
      }

      // Send SMS reminder
      if (settings?.reminder_channels.includes('sms') && reminder.patient_phone) {
        await sendSMSReminder(reminder, message);
      }

      // Log reminder sent
      await logReminderSent(reminder);

      toast.success(`${reminder.reminder_type} reminder sent to ${reminder.patient_name}`);

    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error(`Failed to send reminder to ${reminder.patient_name}`);
    }
  };

  const sendEmailReminder = async (reminder: PendingReminder, message: string) => {
    // In a real implementation, this would call an email service
    console.log('Sending email reminder:', {
      to: reminder.patient_email,
      subject: `Appointment Reminder - ${reminder.reminder_type}`,
      message
    });
    
    // Simulate email API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const sendSMSReminder = async (reminder: PendingReminder, message: string) => {
    // In a real implementation, this would call an SMS service
    console.log('Sending SMS reminder:', {
      to: reminder.patient_phone,
      message
    });
    
    // Simulate SMS API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const logReminderSent = async (reminder: PendingReminder) => {
    try {
      await supabase
        .from('communication_logs')
        .insert({
          patient_id: reminder.patient_id,
          appointment_id: reminder.appointment_id,
          subject: `${reminder.reminder_type} Appointment Reminder`,
          content: `Automated reminder sent for appointment on ${reminder.scheduled_time}`,
          status: 'sent',
          recipient_email: reminder.patient_email || '',
          clinic_id: 'default-clinic' // In real app, get from context
        });
    } catch (error) {
      console.error('Error logging reminder:', error);
    }
  };

  const processNoShows = async () => {
    if (!settings) return;

    try {
      const now = new Date();
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'booked')
        .lt('scheduled_time', now.toISOString());

      if (error) throw error;

      const noShowUpdates = appointments
        ?.filter(apt => {
          const aptTime = new Date(apt.scheduled_time);
          const minutesLate = (now.getTime() - aptTime.getTime()) / (1000 * 60);
          return minutesLate > 15; // Default grace period
        })
        .map(apt => apt.id) || [];

      if (noShowUpdates.length > 0) {
        await supabase
          .from('appointments')
          .update({ status: 'no_show' })
          .in('id', noShowUpdates);

        toast.info(`Marked ${noShowUpdates.length} appointments as no-show`);
      }

    } catch (error) {
      console.error('Error processing no-shows:', error);
    }
  };

  return {
    settings,
    pendingReminders,
    isProcessing,
    checkPendingReminders,
    processNoShows,
    loadReminderSettings
  };
}