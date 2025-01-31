import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getChatResponse } from "./gemini-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Rate limiting configuration
const WINDOW_MS = 60000; // 1 minute window
const MAX_REQUESTS = 30; // Requests per window
const CLEANUP_INTERVAL = 300000; // Clean up every 5 minutes

const ipRequests = new Map<string, { count: number; timestamp: number }>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequests.entries()) {
    if (now - data.timestamp > WINDOW_MS) {
      ipRequests.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

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
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    console.log('Client IP:', clientIP);
    
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
      .select('id, name, url, description')
      .limit(10);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    if (!products || products.length === 0) {
      console.warn('No products found');
      throw new Error('No products found in the database');
    }

    console.log(`Found ${products.length} products`);

    let context = products
      .map(p => `Product: ${p.name}\nDescription: ${p.description}\nProduct URL: ${p.url}\n`)
      .join('\n');

    console.log('Generated context length:', context.length);

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
    
    if (error.message?.includes('Too many requests')) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded",
          details: "Please wait a minute before trying again"
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
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