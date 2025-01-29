import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { createClient } from "https://deno.land/x/supabase@1.0.0/mod.ts";

config({ export: true });

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

if (!supabaseUrl || !supabaseKey || !openAIApiKey) {
  throw new Error('Environment variables SUPABASE_URL, SUPABASE_KEY, or OPENAI_API_KEY are not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Processing chat message:', message);

    // Fetch coffee recommendations from Supabase
    const { data: coffeeRecommendations, error } = await supabase
      .from('coffee_recommendations')
      .select('*');

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    console.log('Coffee recommendations:', coffeeRecommendations);

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
};

console.log("Starting server...");
try {
  serve(handler, { port: 8000 });
} catch (error) {
  console.error("Failed to start server:", error);
}