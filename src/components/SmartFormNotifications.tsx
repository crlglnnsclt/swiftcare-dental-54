import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Clock, 
  Send, 
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  Settings,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface FormNotification {
  id: string;
  patient_id: string;
  form_id: string;
  appointment_id?: string;
  notification_type: 'email' | 'sms' | 'portal' | 'push';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  content: {
    subject?: string;
    message?: string;
    form_url?: string;
  };
  metadata: {
    reminder_count?: number;
    scheduled_for?: string;
    patient_name?: string;
    form_name?: string;
  };
  created_at: string;
}

interface NotificationTemplate {
  id: string;
  type: 'reminder' | 'initial' | 'overdue' | 'completion';
  notification_method: 'email' | 'sms' | 'portal' | 'push';
  subject_template: string;
  message_template: string;
  is_active: boolean;
}

interface SmartFormNotificationsProps {
  patientId?: string;
  formId?: string;
}

export const SmartFormNotifications: React.FC<SmartFormNotificationsProps> = ({
  patientId,
  formId
}) => {
  const [notifications, setNotifications] = useState<FormNotification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<FormNotification | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotification, setNewNotification] = useState<{
    patient_id: string;
    form_id: string;
    notification_type: 'email' | 'sms' | 'portal' | 'push';
    subject: string;
    message: string;
    scheduled_for: string;
  }>({
    patient_id: patientId || '',
    form_id: formId || '',
    notification_type: 'email',
    subject: '',
    message: '',
    scheduled_for: '',
  });

  const defaultTemplates: NotificationTemplate[] = [
    {
      id: '1',
      type: 'initial',
      notification_method: 'email',
      subject_template: 'Please Complete Your Digital Forms - {{clinic_name}}',
      message_template: `Dear {{patient_name}},

We hope this message finds you well. To ensure the best possible care during your upcoming appointment for {{treatment_name}} on {{appointment_date}}, please complete the following digital form(s):

{{form_name}}

This form will help us:
- Understand your medical history
- Ensure your safety during treatment
- Provide personalized care

Please click the link below to access and complete your form:
{{form_url}}

Estimated completion time: 5-10 minutes

If you have any questions or need assistance, please don't hesitate to contact us at {{clinic_phone}} or reply to this email.

Thank you for choosing {{clinic_name}} for your dental care.

Best regards,
{{clinic_name}} Team`,
      is_active: true
    },
    {
      id: '2',
      type: 'reminder',
      notification_method: 'email',
      subject_template: 'Reminder: Digital Forms Required - {{clinic_name}}',
      message_template: `Hello {{patient_name}},

This is a friendly reminder that we still need you to complete your digital forms before your appointment.

Appointment: {{treatment_name}} on {{appointment_date}}
Form required: {{form_name}}

Complete your form here: {{form_url}}

Completing these forms in advance helps us:
✓ Reduce your wait time at the clinic
✓ Ensure we have all necessary information
✓ Provide better, more personalized care

If you're experiencing any technical difficulties, please call us at {{clinic_phone}}.

Thank you,
{{clinic_name}}`,
      is_active: true
    },
    {
      id: '3',
      type: 'overdue',
      notification_method: 'email',
      subject_template: 'Urgent: Forms Required for Your Appointment - {{clinic_name}}',
      message_template: `Dear {{patient_name}},

Your appointment for {{treatment_name}} is scheduled for {{appointment_date}}, and we still need you to complete the required digital forms.

⚠️ Important: These forms are mandatory for your treatment and must be completed before your appointment.

Complete now: {{form_url}}

If these forms are not completed by {{deadline_date}}, we may need to reschedule your appointment to ensure we can provide the safest and most effective care.

Need help? Call us immediately at {{clinic_phone}}.

{{clinic_name}}`,
      is_active: true
    },
    {
      id: '4',
      type: 'completion',
      notification_method: 'email',
      subject_template: 'Thank You - Forms Completed Successfully',
      message_template: `Dear {{patient_name}},

Thank you for completing your digital forms! We have received all the required information for your upcoming appointment.

✅ Form completed: {{form_name}}
📅 Your appointment: {{treatment_name}} on {{appointment_date}}

What's next:
- Your forms have been securely stored in our system
- Our team will review your information before your visit
- You'll receive an appointment reminder 24 hours before your visit

If you need to make any changes or have questions, please contact us at {{clinic_phone}}.

We look forward to seeing you soon!

{{clinic_name}} Team`,
      is_active: true
    }
  ];

  useEffect(() => {
    setTemplates(defaultTemplates);
    fetchNotifications();
  }, [patientId, formId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('form_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      if (formId) {
        query = query.eq('form_id', formId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      
      // Type the data properly
      const typedNotifications: FormNotification[] = data?.map(notification => ({
        id: notification.id,
        patient_id: notification.patient_id,
        form_id: notification.form_id,
        appointment_id: notification.appointment_id,
        notification_type: notification.notification_type as 'email' | 'sms' | 'portal' | 'push',
        status: notification.status as 'pending' | 'sent' | 'delivered' | 'failed',
        sent_at: notification.sent_at,
        opened_at: notification.opened_at,
        clicked_at: notification.clicked_at,
        content: notification.content as { subject?: string; message?: string; form_url?: string },
        metadata: notification.metadata as { reminder_count?: number; scheduled_for?: string; patient_name?: string; form_name?: string },
        created_at: notification.created_at
      })) || [];
      
      setNotifications(typedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (notificationData: any) => {
    try {
      const { error } = await supabase
        .from('form_notifications')
        .insert({
          patient_id: notificationData.patient_id,
          form_id: notificationData.form_id,
          notification_type: notificationData.notification_type,
          content: {
            subject: notificationData.subject,
            message: notificationData.message,
            form_url: `${window.location.origin}/patient-forms?form=${notificationData.form_id}`
          },
          metadata: {
            scheduled_for: notificationData.scheduled_for || new Date().toISOString(),
            reminder_count: 0
          },
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Notification sent successfully');
      setShowCreateDialog(false);
      setNewNotification({
        patient_id: patientId || '',
        form_id: formId || '',
        notification_type: 'email',
        subject: '',
        message: '',
        scheduled_for: '',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const useTemplate = (template: NotificationTemplate) => {
    setNewNotification(prev => ({
      ...prev,
      notification_type: template.notification_method,
      subject: template.subject_template,
      message: template.message_template
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'push': return <Smartphone className="w-4 h-4" />;
      case 'portal': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Smart Form Notifications
          </h2>
          <p className="text-muted-foreground">
            Automated patient communication for form completion
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Form Notification</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="compose" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compose">Compose</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="compose" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient ID</Label>
                    <Input
                      value={newNotification.patient_id}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, patient_id: e.target.value }))}
                      placeholder="Enter patient ID"
                    />
                  </div>
                  
                  <div>
                    <Label>Form ID</Label>
                    <Input
                      value={newNotification.form_id}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, form_id: e.target.value }))}
                      placeholder="Enter form ID"
                    />
                  </div>
                </div>

                <div>
                  <Label>Notification Type</Label>
                  <Select
                    value={newNotification.notification_type}
                    onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, notification_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          SMS
                        </div>
                      </SelectItem>
                      <SelectItem value="portal">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          Patient Portal
                        </div>
                      </SelectItem>
                      <SelectItem value="push">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          Push Notification
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Subject</Label>
                  <Input
                    value={newNotification.subject}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter notification subject"
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter notification message"
                    rows={6}
                  />
                </div>

                <div>
                  <Label>Schedule For (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={newNotification.scheduled_for}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, scheduled_for: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => sendNotification(newNotification)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="templates" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Click on a template to use it as a starting point for your notification.
                  You can then customize the content as needed.
                </div>
                
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4" onClick={() => useTemplate(template)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getNotificationTypeIcon(template.notification_method)}
                          <span className="font-medium capitalize">{template.type} Notification</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {template.notification_method}
                        </Badge>
                      </div>
                      
                      <h4 className="font-medium text-sm mb-1">{template.subject_template}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.message_template.substring(0, 100)}...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.status === 'sent' || n.status === 'delivered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.status === 'delivered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications sent yet</h3>
              <p className="text-gray-500">
                Start sending automated form notifications to improve patient engagement
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            {getNotificationTypeIcon(notification.notification_type)}
                            <span className="font-medium capitalize">{notification.notification_type}</span>
                          </div>
                          
                          <Badge className={getStatusColor(notification.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(notification.status)}
                              {notification.status.toUpperCase()}
                            </div>
                          </Badge>

                          {notification.metadata.patient_name && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="w-3 h-3" />
                              {notification.metadata.patient_name}
                            </div>
                          )}

                          {notification.metadata.form_name && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <FileText className="w-3 h-3" />
                              {notification.metadata.form_name}
                            </div>
                          )}
                        </div>

                        <div className="mb-2">
                          <h4 className="font-medium">{notification.content.subject}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.content.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created: {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                          
                          {notification.sent_at && (
                            <div className="flex items-center gap-1">
                              <Send className="w-3 h-3" />
                              Sent: {format(new Date(notification.sent_at), 'MMM dd, yyyy HH:mm')}
                            </div>
                          )}

                          {notification.opened_at && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Eye className="w-3 h-3" />
                              Opened: {format(new Date(notification.opened_at), 'MMM dd, yyyy HH:mm')}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedNotification(notification)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Detail Dialog */}
      {selectedNotification && (
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Notification Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getNotificationTypeIcon(selectedNotification.notification_type)}
                    <span className="capitalize">{selectedNotification.notification_type}</span>
                  </div>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Badge className={`${getStatusColor(selectedNotification.status)} mt-1`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedNotification.status)}
                      {selectedNotification.status.toUpperCase()}
                    </div>
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Subject</Label>
                <p className="mt-1 font-medium">{selectedNotification.content.subject}</p>
              </div>

              <div>
                <Label>Message</Label>
                <div className="mt-1 p-3 border rounded-lg bg-gray-50">
                  <pre className="whitespace-pre-wrap text-sm">{selectedNotification.content.message}</pre>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Created</Label>
                  <p className="mt-1">{format(new Date(selectedNotification.created_at), 'PPpp')}</p>
                </div>
                
                {selectedNotification.sent_at && (
                  <div>
                    <Label>Sent</Label>
                    <p className="mt-1">{format(new Date(selectedNotification.sent_at), 'PPpp')}</p>
                  </div>
                )}
              </div>

              {selectedNotification.opened_at && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Patient Engagement Tracked</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Opened on {format(new Date(selectedNotification.opened_at), 'PPpp')}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};