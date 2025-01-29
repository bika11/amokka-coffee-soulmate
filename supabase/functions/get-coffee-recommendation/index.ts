/// <reference lib="deno.ns" />
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

config({ export: true });

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    const { message } = await req.json();
    
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Processing chat message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a coffee expert chatbot for Amokka Coffee. Only provide information that is available on amokka.com. 
            If asked about something not related to Amokka's products or services, politely redirect the conversation back to Amokka's offerings.
            Keep responses concise and friendly. If unsure about specific details, recommend visiting amokka.com for the most up-to-date information.`
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json().catch(() => {
      throw new Error('Failed to parse JSON response from OpenAI API');
    });

    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(error.message, { status: 400, headers: corsHeaders });
  }
});

console.log("Listening on http://localhost:8000/");