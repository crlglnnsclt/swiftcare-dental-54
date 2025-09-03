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
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface PatientNotification {
  id: string;
  title: string;
  message: string;
  type: 'appointment_reminder' | 'appointment_ready' | 'appointment_start' | 'results_ready' | 'payment_due' | 'info' | 'urgent';
  is_read: boolean;
  created_at: string;
  appointment_id?: string;
}

const notificationIcons = {
  appointment_reminder: Calendar,
  appointment_ready: Calendar,
  appointment_start: User,
  results_ready: Heart,
  payment_due: CreditCard,
  info: Info,
  urgent: AlertTriangle
};

const notificationColors = {
  appointment_reminder: 'bg-blue-100 text-blue-800',
  appointment_ready: 'bg-green-100 text-green-800',
  appointment_start: 'bg-purple-100 text-purple-800', 
  results_ready: 'bg-pink-100 text-pink-800',
  payment_due: 'bg-orange-100 text-orange-800',
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
    }
  }, [profile]);

  const fetchNotifications = async () => {
    try {
      // Mock notifications since table doesn't exist
      const mockNotifications = [
        {
          id: '1',
          title: 'Appointment Reminder',
          message: 'Your dental cleaning appointment is tomorrow at 2:00 PM',
          type: 'appointment_reminder' as const,
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          id: '2',
          title: 'Lab Results Ready',
          message: 'Your recent lab results are now available for review',
          type: 'results_ready' as const,
          is_read: false,
          created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
        },
        {
          id: '3',
          title: 'Payment Due',
          message: 'You have an outstanding balance of $150.00 for your recent visit',
          type: 'payment_due' as const,
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: '4',
          title: 'Welcome to DentalCare+',
          message: 'Thank you for choosing our dental practice. We look forward to serving you!',
          type: 'info' as const,
          is_read: true,
          created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Mock update since table doesn't exist
      console.log('Marking notification as read:', notificationId);
      
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
      // Mock update since table doesn't exist
      console.log('Marking all notifications as read');

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
            <p>• <strong>Appointment Reminders:</strong> Get notified 24 hours before your scheduled appointments</p>
            <p>• <strong>Appointment Ready:</strong> You'll be notified when it's your turn to see the dentist</p>
            <p>• <strong>Results Available:</strong> Notifications when your test results are ready for review</p>
            <p>• <strong>Payment Due:</strong> Updates on payment status and billing information</p>
            <p>• <strong>General Info:</strong> Clinic updates and important announcements</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}