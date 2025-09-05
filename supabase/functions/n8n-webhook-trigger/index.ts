import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookRequest {
  webhookUrl?: string;
  workflowData: any;
  workflowType: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhookUrl, workflowData, workflowType }: WebhookRequest = await req.json();
    
    // If no webhook URL provided, return success for testing
    if (!webhookUrl) {
      return new Response(JSON.stringify({
        success: true,
        message: 'n8n workflow simulation completed',
        workflowType,
        timestamp: new Date().toISOString(),
        testMode: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Trigger real n8n webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'swiftcare-ai-automation',
        workflowType,
        data: workflowData,
        timestamp: new Date().toISOString(),
        clinic: 'SwiftCare Dental',
      }),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook request failed: ${webhookResponse.status}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'n8n webhook triggered successfully',
      workflowType,
      webhookStatus: webhookResponse.status,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('n8n webhook error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});