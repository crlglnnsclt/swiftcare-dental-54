import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Workflow, 
  Settings, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFeatureToggle } from "@/hooks/useFeatureToggle";

const N8nIntegrationControl = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const hookResult = useFeatureToggle('n8n_integration');
  const { 
    isEnabled: n8nEnabled, 
    loading, 
    toggleFeature, 
    refresh 
  } = hookResult as { isEnabled: boolean; loading: boolean; toggleFeature: any; refresh: any };

  const handleToggleN8n = async (enabled: boolean) => {
    setIsUpdating(true);
    
    try {
      const success = await toggleFeature('n8n_integration', enabled);
      
      if (success) {
        toast({
          title: `n8n Integration ${enabled ? 'Enabled' : 'Disabled'}`,
          description: enabled 
            ? "Advanced workflow automation is now available across all clinics"
            : "n8n integration has been disabled system-wide",
        });
        
        // Refresh to get latest state
        await refresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to update n8n integration status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading feature status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Workflow className="h-6 w-6 text-primary" />
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              n8n Workflow Integration
              <Badge variant={n8nEnabled ? "default" : "secondary"}>
                {n8nEnabled ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Advanced AI automation workflows using n8n platform
            </CardDescription>
          </div>
          <Switch
            checked={n8nEnabled}
            onCheckedChange={handleToggleN8n}
            disabled={isUpdating}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          {n8nEnabled ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-medium mb-1">
              {n8nEnabled ? "Integration Active" : "Integration Disabled"}
            </h4>
            <p className="text-sm text-muted-foreground">
              {n8nEnabled 
                ? "Clinics can access advanced n8n workflow automation features including real-time monitoring, custom triggers, and complex automation chains."
                : "n8n features are hidden from all clinic interfaces. Only basic AI automation flows are available."
              }
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Available Features
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• AI Automation Dashboard (Always Available)</li>
              <li>• Process Flow Documentation</li>
              <li>• User Journey Mapping</li>
              <li className={n8nEnabled ? "text-green-600" : "text-muted-foreground/60"}>
                • n8n Workflow Builder {!n8nEnabled && "(Disabled)"}
              </li>
              <li className={n8nEnabled ? "text-green-600" : "text-muted-foreground/60"}>
                • Real-time Workflow Monitoring {!n8nEnabled && "(Disabled)"}
              </li>
              <li className={n8nEnabled ? "text-green-600" : "text-muted-foreground/60"}>
                • Advanced Automation Triggers {!n8nEnabled && "(Disabled)"}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Impact & Security
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• No data is lost when toggling</li>
              <li>• Existing workflows continue running</li>
              <li>• UI elements hide/show dynamically</li>
              <li>• HIPAA compliance maintained</li>
              <li>• Audit trail preserved</li>
            </ul>
          </div>
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refresh}
            disabled={isUpdating}
          >
            Refresh Status
          </Button>
          
          {isUpdating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default N8nIntegrationControl;