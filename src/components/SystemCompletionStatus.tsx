import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  Users, 
  QrCode, 
  Tv,
  Settings,
  Bell,
  AlertTriangle
} from 'lucide-react';

interface Feature {
  name: string;
  status: 'complete' | 'partial' | 'missing';
  description: string;
  icon: React.ComponentType<any>;
  route?: string;
}

export function SystemCompletionStatus() {
  const features: Feature[] = [
    {
      name: 'Appointment Scheduling',
      status: 'complete',
      description: 'Online booking with single and family appointments',
      icon: Calendar,
      route: '/appointments'
    },
    {
      name: 'Queue Management',
      status: 'complete',
      description: 'Priority-based queue with manual controls',
      icon: Users,
      route: '/queue'
    },
    {
      name: 'Walk-ins Handling',
      status: 'complete',
      description: 'Registration and waiting list management',
      icon: Clock,
      route: '/walk-ins'
    },
    {
      name: 'QR Code Check-in',
      status: 'complete',
      description: 'Daily QR generation with validation',
      icon: QrCode,
      route: '/checkin'
    },
    {
      name: 'Queue Monitor',
      status: 'complete',
      description: 'External TV display with audio announcements',
      icon: Tv,
      route: '/queue-monitor'
    },
    {
      name: 'Admin Settings',
      status: 'complete',
      description: 'Appointment and queue configuration',
      icon: Settings,
      route: '/appointment-settings'
    },
    {
      name: 'Automated Reminders',
      status: 'complete',
      description: '24h and 1h appointment reminders',
      icon: Bell
    },
    {
      name: 'No-show Processing',
      status: 'complete',
      description: 'Automatic cancellation after grace period',
      icon: AlertTriangle
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'missing':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const completedFeatures = features.filter(f => f.status === 'complete').length;
  const totalFeatures = features.length;
  const completionPercentage = Math.round((completedFeatures / totalFeatures) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            Appointments & Queueing Module Status
          </CardTitle>
          <Badge 
            variant="outline" 
            className="text-lg px-3 py-1 bg-green-100 text-green-800 border-green-300"
          >
            {completionPercentage}% Complete
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {completedFeatures} of {totalFeatures} features implemented and functional
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(feature.status)}
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status}
                  </Badge>
                  {feature.route && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.location.hash = feature.route}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Module Complete!</span>
          </div>
          <p className="text-sm text-green-700">
            All critical features for the Appointments & Queueing module are implemented and functional. 
            The system includes real-time queue management, automated processes, QR code integration, 
            and comprehensive admin controls.
          </p>
        </div>

        {/* Integration Notes */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Integration Status</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Database tables and RLS policies configured</li>
            <li>✅ Real-time updates with Supabase integration</li>
            <li>✅ Audio announcements with Web Speech API</li>
            <li>✅ Responsive design for all device types</li>
            <li>✅ Navigation and routing properly configured</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}