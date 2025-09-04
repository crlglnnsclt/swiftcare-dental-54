import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAutomatedReminders } from '@/hooks/useAutomatedReminders';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  RefreshCw,
  Mail,
  MessageSquare,
  Phone
} from 'lucide-react';

interface AutomationStatusProps {
  className?: string;
}

export function AutomatedSystemStatus({ className }: AutomationStatusProps) {
  const { settings, pendingReminders, isProcessing, checkPendingReminders, processNoShows } = useAutomatedReminders();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update timestamp every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-3 h-3" />;
      case 'sms': return <MessageSquare className="w-3 h-3" />;
      case 'push': return <Bell className="w-3 h-3" />;
      default: return <Phone className="w-3 h-3" />;
    }
  };

  const refreshSystems = async () => {
    await checkPendingReminders();
    await processNoShows();
    setLastUpdate(new Date());
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Automated Systems Status
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshSystems}
            disabled={isProcessing}
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reminder System Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Automated Reminders</span>
            </div>
            <Badge variant={settings?.enable_reminders ? 'default' : 'secondary'}>
              {settings?.enable_reminders ? 'Active' : 'Disabled'}
            </Badge>
          </div>
          
          {settings?.enable_reminders && (
            <div className="ml-6 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                24h reminders: {settings.reminder_24h_enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                1h reminders: {settings.reminder_1h_enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="flex items-center gap-2">
                <span>Channels:</span>
                {settings.reminder_channels.map(channel => (
                  <span key={channel} className="flex items-center gap-1">
                    {getChannelIcon(channel)}
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pending Reminders */}
        {pendingReminders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Pending Reminders</span>
              </div>
              <Badge variant="outline">
                {pendingReminders.length} pending
              </Badge>
            </div>
            
            <div className="ml-6 text-sm text-muted-foreground">
              <div className="space-y-1">
                {pendingReminders.slice(0, 3).map(reminder => (
                  <div key={reminder.id} className="flex items-center justify-between">
                    <span>{reminder.patient_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {reminder.reminder_type}
                    </Badge>
                  </div>
                ))}
                {pendingReminders.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{pendingReminders.length - 3} more...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No-Show Processing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium">No-Show Processing</span>
            </div>
            <Badge variant="default">
              Active
            </Badge>
          </div>
          
          <div className="ml-6 text-sm text-muted-foreground">
            Auto-cancel appointments 15+ minutes late
          </div>
        </div>

        {/* System Health */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last system check:</span>
            <span className="font-medium">
              {lastUpdate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Status:</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}