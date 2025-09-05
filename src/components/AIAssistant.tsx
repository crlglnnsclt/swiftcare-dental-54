import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Bot, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Eye,
  Settings
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface AIAssistantProps {
  type: 'form_autofill' | 'treatment_draft' | 'invoice_draft' | 'insurance_extract' | 'document_analyze' | 'queue_optimize' | 'reminder_draft';
  data: any;
  onSuggestion?: (suggestion: any) => void;
  className?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  type, 
  data, 
  onSuggestion,
  className = ""
}) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const getAssistantTitle = () => {
    const titles = {
      form_autofill: 'Smart Form Assistant',
      treatment_draft: 'Treatment Note Assistant', 
      invoice_draft: 'Billing Assistant',
      insurance_extract: 'Insurance Processor',
      document_analyze: 'Document Analyzer',
      queue_optimize: 'Queue Optimizer',
      reminder_draft: 'Communication Assistant'
    };
    return titles[type] || 'AI Assistant';
  };

  const getAssistantDescription = () => {
    const descriptions = {
      form_autofill: 'AI suggests form field values based on patient history',
      treatment_draft: 'AI drafts treatment notes and prescriptions for dentist review',
      invoice_draft: 'AI prepares invoice based on treatments performed',
      insurance_extract: 'AI extracts insurance information from uploaded documents',
      document_analyze: 'AI analyzes and categorizes uploaded documents',
      queue_optimize: 'AI suggests optimal queue arrangements',
      reminder_draft: 'AI drafts personalized patient communications'
    };
    return descriptions[type] || 'AI-powered assistance';
  };

  const requestAIAssistance = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type,
          data: {
            ...data,
            user_id: profile?.id,
            patient_id: data.patient_id
          },
          user_role: profile?.role
        }
      });

      if (error) throw error;
      
      setSuggestion(result);
      if (onSuggestion) {
        onSuggestion(result);
      }

      toast.success('AI assistant has provided suggestions', {
        description: result.message || 'Review the AI suggestions and apply as needed.'
      });

    } catch (error) {
      console.error('AI Assistant Error:', error);
      toast.error('AI Assistant Unavailable', {
        description: 'Please proceed manually. AI suggestions will be available shortly.'
      });
    } finally {
      setLoading(false);
    }
  };

  const copySuggestion = () => {
    if (suggestion) {
      navigator.clipboard.writeText(JSON.stringify(suggestion, null, 2));
      toast.success('Suggestion copied to clipboard');
    }
  };

  const sendFeedback = async (rating: 'positive' | 'negative') => {
    try {
      await supabase.from('audit_logs').insert({
        action_type: 'ai_feedback',
        action_description: `AI assistance feedback: ${rating}`,
        user_id: profile?.id,
        entity_type: 'ai_assistant',
        new_values: { 
          type, 
          rating, 
          feedback,
          suggestion_id: suggestion?.id 
        }
      });

      toast.success('Feedback sent', {
        description: 'Thank you for helping improve our AI assistant!'
      });
      setFeedback('');
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  return (
    <Card className={`border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bot className="h-5 w-5" />
          {getAssistantTitle()}
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {getAssistantDescription()}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {!suggestion ? (
          <Button 
            onClick={requestAIAssistance}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                AI is analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get AI Suggestions
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                AI Suggestions Ready
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySuggestion}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="p-3 bg-white/50 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">
                {suggestion.message}
              </p>
              
              {suggestion.type === 'form_autofill' && (
                <div className="text-xs text-green-700">
                  ✓ {Object.keys(suggestion.suggestions || {}).length} fields suggested
                </div>
              )}
              
              {suggestion.type === 'treatment_draft' && (
                <div className="text-xs text-blue-700">
                  ✓ Treatment notes and prescriptions drafted
                </div>
              )}
              
              {suggestion.type === 'invoice_draft' && (
                <div className="text-xs text-purple-700">
                  ✓ Invoice itemized with {suggestion.invoice?.items?.length || 0} items
                </div>
              )}

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary/10">
                <span className="text-xs text-muted-foreground">Was this helpful?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sendFeedback('positive')}
                  className="h-6 px-2"
                >
                  <ThumbsUp className="h-3 w-3 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sendFeedback('negative')}
                  className="h-6 px-2"
                >
                  <ThumbsDown className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={requestAIAssistance}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-xs text-yellow-800">
            <p className="font-medium">AI Assistant Notice</p>
            <p>AI suggestions require professional review and approval. Always verify accuracy before implementation.</p>
          </div>
        </div>
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Suggestion Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(suggestion, null, 2)}
            </pre>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  copySuggestion();
                  setShowPreview(false);
                }}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy & Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};