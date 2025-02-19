
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getChatResponse } from "./gemini-client.ts";
import { rateLimiter } from "./rate-limiter.ts";
import { config } from "./config.ts";
import { ChatError, handleError } from "./error-handler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (rateLimiter.isRateLimited(clientIP)) {
      throw new ChatError('Too many requests', 429, 'Please try again later');
    }

    const { message, history } = await req.json();
    console.log('Received message:', message);
    console.log('Chat history:', history);

    if (!message || typeof message !== 'string') {
      throw new ChatError('Invalid message format', 400, 'Message must be a string');
    }

    if (history && !Array.isArray(history)) {
      throw new ChatError('Invalid history format', 400, 'History must be an array');
    }

    // Initialize Supabase client using cached config
    const supabaseUrl = config.get('SUPABASE_URL');
    const supabaseKey = config.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch coffee data to provide as context
    const { data: coffees, error: dbError } = await supabase
      .from('coffees')
      .select('*');

    if (dbError) {
      throw new ChatError('Database error', 500, dbError.message);
    }

    if (!coffees || !coffees.length) {
      throw new ChatError('No coffee data available', 404);
    }

    // Format coffee data as context
    const context = coffees.map(coffee => `
Product: ${coffee.name}
Description: ${coffee.description}
Roast Level: ${coffee.roast_level}
Flavor Notes: ${coffee.flavor_notes?.join(', ')}
URL: ${coffee.product_link}
---
`).join('\n');

    // Get response from Gemini
    const response = await getChatResponse(context, message, history);

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    return handleError(error);
  }
});
