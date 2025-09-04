import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Users,
  FileText,
  Settings,
  Bell,
  Activity,
  Plus,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";

export function QuickActions() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  interface QuickAction {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    action: () => void;
    variant: "default" | "outline";
    badge: string | null;
    adminOnly?: boolean;
  }

  const actions: QuickAction[] = [
    {
      title: "Schedule Appointment",
      description: "Book new patient visit",
      icon: Calendar,
      action: () => navigate("/appointment-scheduling"),
      variant: "default",
      badge: null
    },
    {
      title: "Patient Check-in",
      description: "Process arriving patients",
      icon: Users,
      action: () => navigate("/smart-check-in"),
      variant: "outline",
      badge: null
    },
    {
      title: "View Queue",
      description: "Monitor waiting patients",
      icon: Activity,
      action: () => navigate("/queue-monitor"),
      variant: "outline",
      badge: "Live"
    },
    {
      title: "Patient Records",
      description: "Access medical history",
      icon: FileText,
      action: () => navigate("/patient-records"),
      variant: "outline",
      badge: null
    },
    {
      title: "Quick Search",
      description: "Find patients, appointments",
      icon: Search,
      action: () => navigate("/patient-app"),
      variant: "outline",
      badge: null
    },
    {
      title: "System Settings",
      description: "Configure clinic preferences",
      icon: Settings,
      action: () => navigate("/feature-toggles"),
      variant: "outline",
      badge: null,
      adminOnly: true
    }
  ];

  const roleBasedActions: QuickAction[] = [
    ...(profile?.role === 'dentist' ? [
      {
        title: "Treatment Notes",
        description: "Update patient treatments",
        icon: FileText,
        action: () => navigate("/treatment-notes"),
        variant: "outline" as const,
        badge: null
      }
    ] : []),
    ...(profile?.role === 'staff' || profile?.role === 'receptionist' ? [
      {
        title: "Walk-in Registration",
        description: "Register walk-in patients",
        icon: Plus,
        action: () => navigate("/walk-ins"),
        variant: "outline" as const,
        badge: null
      }
    ] : []),
    ...(profile?.role === 'clinic_admin' || profile?.role === 'super_admin' ? [
      {
        title: "Staff Management",
        description: "Manage clinic staff",
        icon: Users,
        action: () => navigate("/staff-management"),
        variant: "outline" as const,
        badge: null
      }
    ] : [])
  ];

  const allActions = [...actions, ...roleBasedActions].filter(action => 
    !action.adminOnly || ['clinic_admin', 'super_admin'].includes(profile?.role || '')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>
          Common tasks and shortcuts for your workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={action.action}
            >
              <div className="flex items-center justify-between w-full">
                <action.icon className="h-5 w-5" />
                {action.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}