import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { scrapeProductPage } from "./product-scraper.ts";
import { getChatResponse } from "./openai-client.ts";

// Rate limiting implementation
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
    // Reset if window has passed
    ipRequests.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (requestData.count >= MAX_REQUESTS) {
    return false;
  }

  requestData.count++;
  return true;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
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

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { message } = await req.json();
    
    if (!message) {
      throw new Error('No message provided');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    const { data: products, error: dbError } = await supabase
      .from('amokka_products')
      .select('*')
      .eq('is_verified', true);

    if (dbError) throw dbError;

    const messageWords = message.toLowerCase().split(' ');
    
    for (const product of products || []) {
      if (messageWords.includes(product.name.toLowerCase()) && !product.is_verified) {
        const scrapedData = await scrapeProductPage(product.url);
        
        if (scrapedData) {
          const { error: updateError } = await supabase
            .from('amokka_products')
            .update(scrapedData)
            .eq('id', product.id);

          if (!updateError) {
            console.log(`Successfully updated product: ${product.name}`);
          }
        }
      }
    }

    if (!products || products.length === 0) {
      throw new Error('No verified products found in the database');
    }

    const context = products
      .map(p => `Product: ${p.name}\nDescription: ${p.description}\nRoast Level: ${p.roast_level}\nFlavor Notes: ${p.flavor_notes.join(', ')}\nBrewing Methods: ${p.brewing_methods.join(', ')}\nOrigin: ${p.origin || 'Unknown'}\nProduct URL: ${p.url}\n\n`)
      .join('\n');

    const response = await getChatResponse(context, message);

    // Store the recommendation with the user's ID
    await supabase
      .from('coffee_recommendations')
      .insert([
        {
          input_preferences: message,
          recommendation: response,
          user_id: user.id
        }
      ]);

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-about-coffee function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing your request.'
      }),
      { 
        status: error.message.includes('authorization') ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});