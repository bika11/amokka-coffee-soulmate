
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Fetch coffee products data
async function getCoffeeContext(): Promise<string> {
  try {
    const { data: products, error } = await supabaseAdmin
      .from('amokka_products')
      .select('*')
      .eq('is_verified', true);

    if (error) {
      console.error('Failed to fetch coffee products:', error);
      throw new Error('Failed to fetch coffee products');
    }
    
    if (!products?.length) {
      console.warn('No coffee products found');
      return "No coffee products found in our database.";
    }

    return products.map(product => `
Product: ${product.name}
Description: ${product.overall_description || product.description || ''}
Roast Level: ${product.roast_level || 'Not specified'}
Origin: ${product.origin || 'Not specified'}
Processing Method: ${product.processing_method || 'Not specified'}
Flavor Notes: ${product.flavor_notes?.join(', ') || 'Not specified'}
URL: ${product.url}
---`).join('\n');
  } catch (error) {
    console.error('Error in getCoffeeContext:', error);
    return "Unable to retrieve coffee information at this time.";
  }
}

serve(async (req) => {
  console.log(`${req.method} request to ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Parse request body
    const { message, history } = await req.json();
    console.log("Request received:", { messageLength: message?.length, historyLength: history?.length });
    
    // Get coffee context
    console.log("Fetching coffee context...");
    const coffeeContext = await getCoffeeContext();
    console.log("Coffee context fetched, length:", coffeeContext.length);
    
    // Mock response for testing
    const response = "I'm a coffee chatbot! I'm currently in testing mode. You asked: " + message;
    console.log("Sending response:", response.substring(0, 50) + "...");

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in chat-about-coffee function:', error);
    console.error('Detailed error:', error.stack);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});
