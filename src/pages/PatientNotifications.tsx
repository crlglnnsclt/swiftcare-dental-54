import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  Clock, 
  User,
  AlertTriangle,
  Info,
  Heart,
  CreditCard,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface PatientNotification {
  id: string;
  title: string;
  message: string;
  type: 'appointment_ready' | 'appointment_start' | 'reminder' | 'info' | 'urgent';
  is_read: boolean;
  created_at: string;
  appointment_id?: string;
}

const notificationIcons = {
  appointment_ready: Calendar,
  appointment_start: User,
  reminder: Clock,
  info: Info,
  urgent: AlertTriangle
};

const notificationColors = {
  appointment_ready: 'bg-blue-100 text-blue-800',
  appointment_start: 'bg-green-100 text-green-800', 
  reminder: 'bg-yellow-100 text-yellow-800',
  info: 'bg-gray-100 text-gray-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function PatientNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchNotifications();
      
      // Set up real-time subscription for new notifications
      const channel = supabase
        .channel('patient-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'patient_notifications',
            filter: `patient_id=eq.${profile.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new as PatientNotification, ...prev]);
            
            // Show toast for new notification
            const notification = payload.new as PatientNotification;
            toast.info(notification.title, {
              description: notification.message
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_notifications')
        .select('*')
        .eq('patient_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data || []).map(item => ({
        ...item,
        type: item.type as 'appointment_ready' | 'appointment_start' | 'reminder' | 'info' | 'urgent'
      })));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('patient_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('patient_notifications')
        .update({ is_read: true })
        .eq('patient_id', profile?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 page-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Bell className="w-8 h-8 float-gentle" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white float-gentle">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Stay updated with your appointments and important messages</p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" className="btn-3d">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="text-center p-12 card-3d interactive-3d">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 float-gentle" />
            <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              You'll receive notifications about your appointments and important updates here.
            </p>
          </Card>
        ) : (
          notifications.map((notification, index) => {
            const IconComponent = notificationIcons[notification.type] || Info;
            const colorClass = notificationColors[notification.type];
            
            return (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-all duration-200 card-3d interactive-3d card-stagger-${(index % 4) + 1} ${
                  notification.is_read 
                    ? 'opacity-75 hover:opacity-100' 
                    : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${colorClass} float-gentle`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200 card-3d interactive-3d">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Info className="w-5 h-5 float-gentle" />
            About Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• <strong>Appointment Ready:</strong> You'll be notified when it's your turn to see the dentist</p>
            <p>• <strong>Reminders:</strong> Important appointment and treatment reminders</p>
            <p>• <strong>Results:</strong> Notifications when your test results are available</p>
            <p>• <strong>Payment:</strong> Updates on payment status and billing information</p>
            <p>• <strong>General Info:</strong> Clinic updates and important announcements</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}