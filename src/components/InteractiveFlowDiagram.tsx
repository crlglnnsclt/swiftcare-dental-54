import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Bot,
  Calendar,
  Heart,
  Shield,
  DollarSign
} from "lucide-react";

interface FlowStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'completed' | 'active' | 'pending' | 'error';
  type: 'manual' | 'automated' | 'ai';
  improvement?: string;
}

interface FlowDiagramProps {
  title: string;
  description: string;
  type: 'patient-journey' | 'workflow' | 'user-experience';
  beforeSteps: FlowStep[];
  afterSteps: FlowStep[];
  metrics: {
    timeReduction: string;
    efficiencyGain: string;
    satisfactionIncrease: string;
  };
}

const InteractiveFlowDiagram = ({ 
  title, 
  description, 
  type, 
  beforeSteps, 
  afterSteps, 
  metrics 
}: FlowDiagramProps) => {
  const [activeView, setActiveView] = useState<'before' | 'after'>('before');
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const getStepIcon = (stepType: string, status: string) => {
    const baseClasses = "h-5 w-5";
    
    if (stepType === 'ai') {
      return <Bot className={`${baseClasses} text-purple-600`} />;
    }
    if (stepType === 'automated') {
      return <CheckCircle className={`${baseClasses} text-green-600`} />;
    }
    
    return status === 'completed' ? 
      <CheckCircle className={`${baseClasses} text-green-600`} /> :
      status === 'error' ? 
      <AlertCircle className={`${baseClasses} text-red-600`} /> :
      <Clock className={`${baseClasses} text-orange-400`} />;
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700';
      case 'active': return 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700';
      case 'error': return 'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700';
      default: return 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600';
    }
  };

  const currentSteps = activeView === 'before' ? beforeSteps : afterSteps;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {type === 'patient-journey' && <Users className="h-5 w-5" />}
            {type === 'workflow' && <Bot className="h-5 w-5" />}
            {type === 'user-experience' && <Heart className="h-5 w-5" />}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics.timeReduction}</div>
              <div className="text-sm text-muted-foreground">Time Reduction</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.efficiencyGain}</div>
              <div className="text-sm text-muted-foreground">Efficiency Gain</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{metrics.satisfactionIncrease}</div>
              <div className="text-sm text-muted-foreground">Satisfaction Increase</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Button
            variant={activeView === 'before' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('before')}
          >
            Current Process
          </Button>
          <Button
            variant={activeView === 'after' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('after')}
          >
            AI-Enhanced Process
          </Button>
        </div>
      </div>

      {/* Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeView === 'before' ? 'Current Process Flow' : 'AI-Enhanced Process Flow'}
          </CardTitle>
          <CardDescription>
            {activeView === 'before' 
              ? 'Traditional manual processes with current limitations' 
              : 'Optimized automated processes with AI intelligence'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentSteps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Step Card */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    getStepStatusColor(step.status)
                  } ${selectedStep === step.id ? 'scale-105 shadow-lg' : 'hover:shadow-md'}`}
                  onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getStepIcon(step.type, step.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{step.title}</h3>
                          <Badge variant={step.type === 'ai' ? 'default' : step.type === 'automated' ? 'secondary' : 'outline'}>
                            {step.type}
                          </Badge>
                          {step.improvement && (
                            <Badge variant="outline" className="text-green-600">
                              {step.improvement}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {step.duration}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedStep === step.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Type:</span>
                          <div className="mt-1">
                            {step.type === 'ai' && 'AI-Powered Process'}
                            {step.type === 'automated' && 'Automated System'}
                            {step.type === 'manual' && 'Manual Process'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <div className="mt-1 capitalize">{step.status}</div>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <div className="mt-1">{step.duration}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow to next step */}
                {index < currentSteps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Process Comparison */}
      {activeView === 'after' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Process Comparison & Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Before (Manual Process)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Steps:</span>
                    <span className="font-medium">{beforeSteps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Manual Steps:</span>
                    <span className="font-medium text-red-600">
                      {beforeSteps.filter(s => s.type === 'manual').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Total Time:</span>
                    <span className="font-medium">
                      {beforeSteps.reduce((total, step) => {
                        const time = parseInt(step.duration);
                        return total + (isNaN(time) ? 0 : time);
                      }, 0)} min
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">After (AI-Enhanced)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Steps:</span>
                    <span className="font-medium">{afterSteps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>AI/Automated Steps:</span>
                    <span className="font-medium text-green-600">
                      {afterSteps.filter(s => s.type === 'ai' || s.type === 'automated').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Total Time:</span>
                    <span className="font-medium text-green-600">
                      {afterSteps.reduce((total, step) => {
                        const time = parseInt(step.duration);
                        return total + (isNaN(time) ? 0 : time);
                      }, 0)} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveFlowDiagram;