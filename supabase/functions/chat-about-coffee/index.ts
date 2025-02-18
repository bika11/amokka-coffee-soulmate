
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    let context = "You are a coffee expert helping customers learn about coffee. ";
    if (currentCoffee) {
      context += `The user is currently viewing ${currentCoffee}. `;
    }
    context += "Keep responses friendly and informative, but relatively brief (2-3 sentences).";

    let response;
    if (currentCoffee) {
      response = `I'd be happy to tell you more about ${currentCoffee}! What would you like to know specifically - its flavor profile, roast level, or brewing recommendations?`;
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
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
