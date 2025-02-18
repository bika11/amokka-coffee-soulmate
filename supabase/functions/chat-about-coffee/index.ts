
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, currentCoffee, history } = await req.json();
    console.log('Received request:', { message, currentCoffee, history });

    // Get coffee details from database if available
    let coffeeDetails = "";
    if (currentCoffee) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: products, error: dbError } = await supabase
          .from('amokka_products')
          .select('description, roast_level, flavor_notes, brewing_methods')
          .eq('name', currentCoffee)
          .single();

        if (!dbError && products) {
          coffeeDetails = `
            Description: ${products.description || 'Not available'}
            Roast Level: ${products.roast_level || 'Not specified'}
            Flavor Notes: ${products.flavor_notes?.join(', ') || 'Not specified'}
            Recommended Brewing Methods: ${products.brewing_methods?.join(', ') || 'Not specified'}
          `;
        }
      }
    }

    let response;
    if (currentCoffee) {
      if (message.toLowerCase().includes('roast') || 
          message.toLowerCase().includes('flavor') || 
          message.toLowerCase().includes('brew')) {
        response = `Here's what I know about ${currentCoffee}:${coffeeDetails}`;
      } else {
        response = `I'd be happy to tell you more about ${currentCoffee}! Would you like to know about its flavor profile, roast level, or brewing recommendations?`;
      }
    } else {
      response = "I can help you learn about our different coffee options. Would you like to know about flavor profiles, roast levels, or brewing methods?";
    }

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
        error: error.message,
        details: 'An error occurred while processing your request.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
