import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getChatResponse } from "./openai-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ipRequests = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requestData = ipRequests.get(ip);

  if (!requestData) {
    ipRequests.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - requestData.timestamp > WINDOW_MS) {
    ipRequests.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (requestData.count >= MAX_REQUESTS) {
    return false;
  }

  requestData.count++;
  return true;
}

serve(async (req) => {
  console.log('Received request:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests",
          details: "Please wait a minute before trying again"
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { message } = await req.json();
    console.log('Processing message:', message);
    
    if (!message) {
      throw new Error('No message provided');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching products from database...');
    const { data: products, error: dbError } = await supabase
      .from('amokka_products')
      .select('*')
      .eq('is_verified', true)
      .limit(5);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    if (!products || products.length === 0) {
      console.warn('No verified products found');
      throw new Error('No verified products found in the database');
    }

    console.log(`Found ${products.length} verified products`);

    let context = products
      .map(p => `Product: ${p.name}\nDescription: ${p.description}\nRoast Level: ${p.roast_level}\nFlavor Notes: ${p.flavor_notes.join(', ')}\nBrewing Methods: ${p.brewing_methods.join(', ')}\nOrigin: ${p.origin || 'Unknown'}\nProduct URL: ${p.url}\n\n`)
      .join('\n');

    console.log('Generated context:', context);

    const response = await getChatResponse(context, message);
    console.log('Got chat response successfully');

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in chat-about-coffee function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'An error occurred while processing your request.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});