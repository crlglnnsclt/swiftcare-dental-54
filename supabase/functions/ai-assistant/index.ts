import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssistantRequest {
  type: 'form_autofill' | 'treatment_draft' | 'invoice_draft' | 'insurance_extract' | 'document_analyze' | 'queue_optimize' | 'reminder_draft';
  data: any;
  user_role: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, user_role }: AssistantRequest = await req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    let response;
    
    switch (type) {
      case 'form_autofill':
        response = await handleFormAutofill(data, openaiApiKey);
        break;
      case 'treatment_draft':
        response = await handleTreatmentDraft(data, openaiApiKey);
        break;
      case 'invoice_draft':
        response = await handleInvoiceDraft(data, openaiApiKey);
        break;
      case 'insurance_extract':
        response = await handleInsuranceExtract(data, openaiApiKey);
        break;
      case 'document_analyze':
        response = await handleDocumentAnalyze(data, openaiApiKey);
        break;
      case 'queue_optimize':
        response = await handleQueueOptimize(data, openaiApiKey);
        break;
      case 'reminder_draft':
        response = await handleReminderDraft(data, openaiApiKey);
        break;
      default:
        throw new Error(`Unknown assistant type: ${type}`);
    }

    // Log the AI assistance usage
    await supabase.from('audit_logs').insert({
      action_type: 'ai_assistance',
      action_description: `AI assistant used: ${type}`,
      user_id: data.user_id,
      patient_id: data.patient_id,
      entity_type: 'ai_assistant',
      new_values: { type, user_role, timestamp: new Date().toISOString() }
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Assistant Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      suggestion: 'AI assistant temporarily unavailable. Please proceed manually.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleFormAutofill(data: any, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are a dental assistant AI that helps autofill patient forms. Analyze the provided patient data and suggest appropriate form field values. Always maintain medical accuracy and suggest only when confident. Return JSON with field suggestions and confidence levels.`
        },
        {
          role: 'user',
          content: `Patient data: ${JSON.stringify(data.patientData)}
          Form fields: ${JSON.stringify(data.formFields)}
          Please suggest autofill values with confidence scores.`
        }
      ],
      max_completion_tokens: 1000,
    }),
  });

  const result = await response.json();
  return {
    type: 'form_autofill',
    suggestions: JSON.parse(result.choices[0].message.content),
    message: 'AI has suggested form values. Please review and confirm.'
  };
}

async function handleTreatmentDraft(data: any, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are a dental AI assistant that helps draft treatment notes and prescriptions. Based on the examination findings and treatment performed, create professional medical documentation. Always include disclaimers that this is a draft requiring dentist review.`
        },
        {
          role: 'user',
          content: `Treatment details: ${JSON.stringify(data.treatmentDetails)}
          Patient history: ${JSON.stringify(data.patientHistory)}
          Examination findings: ${JSON.stringify(data.examFindings)}
          Please draft treatment notes and any necessary prescriptions.`
        }
      ],
      max_completion_tokens: 1500,
    }),
  });

  const result = await response.json();
  return {
    type: 'treatment_draft',
    draft: JSON.parse(result.choices[0].message.content),
    message: 'AI has drafted treatment notes. Dentist review and approval required.'
  };
}

async function handleInvoiceDraft(data: any, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are a dental billing AI assistant. Create accurate invoice drafts based on treatments performed. Include appropriate dental codes, calculate totals, and suggest insurance coverage estimates. Return structured invoice data.`
        },
        {
          role: 'user',
          content: `Treatments performed: ${JSON.stringify(data.treatments)}
          Patient insurance: ${JSON.stringify(data.insurance)}
          Clinic pricing: ${JSON.stringify(data.pricing)}
          Please draft an invoice with itemized costs.`
        }
      ],
      max_completion_tokens: 1000,
    }),
  });

  const result = await response.json();
  return {
    type: 'invoice_draft',
    invoice: JSON.parse(result.choices[0].message.content),
    message: 'AI has drafted invoice. Staff review and approval required.'
  };
}

async function handleInsuranceExtract(data: any, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are an insurance document processing AI. Extract key information from insurance documents including policy numbers, coverage details, deductibles, and claim procedures. Return structured data for staff review.`
        },
        {
          role: 'user',
          content: `Insurance document text: ${data.documentText}
          Please extract relevant insurance information and identify any missing required fields.`
        }
      ],
      max_completion_tokens: 1000,
    }),
  });

  const result = await response.json();
  return {
    type: 'insurance_extract',
    extracted: JSON.parse(result.choices[0].message.content),
    message: 'AI has extracted insurance data. Staff verification required.'
  };
}

async function handleDocumentAnalyze(data: any, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are a document analysis AI for dental clinics. Analyze uploaded documents for completeness, categorize them, and suggest appropriate filing categories. Flag any concerning findings that require staff attention.`
        },
        {
          role: 'user',
          content: `Document type: ${data.documentType}
          Document content: ${data.content}
          Please analyze and categorize this document.`
        }
      ],
      max_completion_tokens: 800,
    }),
  });

  const result = await response.json();
  return {
    type: 'document_analyze',
    analysis: JSON.parse(result.choices[0].message.content),
    message: 'AI has analyzed document. Staff review recommended.'
  };
}

async function handleQueueOptimize(data: any, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are a queue optimization AI for dental clinics. Analyze current queue status, appointment durations, and patient priorities to suggest optimal queue arrangements. Consider emergency cases, treatment complexity, and estimated durations.`
        },
        {
          role: 'user',
          content: `Current queue: ${JSON.stringify(data.queue)}
          Available dentists: ${JSON.stringify(data.dentists)}
          Emergency cases: ${JSON.stringify(data.emergencies)}
          Please suggest queue optimizations.`
        }
      ],
      max_completion_tokens: 1000,
    }),
  });

  const result = await response.json();
  return {
    type: 'queue_optimize',
    optimization: JSON.parse(result.choices[0].message.content),
    message: 'AI has suggested queue optimizations. Staff can apply changes.'
  };
}

async function handleReminderDraft(data: any, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are a patient communication AI that drafts personalized appointment reminders and follow-up messages. Create professional, friendly, and informative messages based on patient history and upcoming appointments.`
        },
        {
          role: 'user',
          content: `Patient info: ${JSON.stringify(data.patient)}
          Appointment details: ${JSON.stringify(data.appointment)}
          Message type: ${data.messageType}
          Please draft an appropriate message.`
        }
      ],
      max_completion_tokens: 500,
    }),
  });

  const result = await response.json();
  return {
    type: 'reminder_draft',
    message: result.choices[0].message.content,
    note: 'AI has drafted message. Staff review and approval required before sending.'
  };
}