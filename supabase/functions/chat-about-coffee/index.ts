
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();
    console.log('Received message:', message);
    console.log('Chat history:', history);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Analyze the message to determine the type of question
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('roast')) {
      // Query for roast information
      const { data: coffees } = await supabase
        .from('coffees')
        .select('name, roast_level')
        .order('roast_level');

      if (coffees && coffees.length > 0) {
        response = "Here's what I know about our roast levels:\n\n";
        const roastLevels = coffees.reduce((acc: Record<string, string[]>, coffee) => {
          const level = coffee.roast_level.toString();
          if (!acc[level]) acc[level] = [];
          acc[level].push(coffee.name);
          return acc;
        }, {});

        Object.entries(roastLevels).forEach(([level, names]) => {
          response += `Roast Level ${level}: ${names.join(', ')}\n`;
        });
      }
    } else if (lowerMessage.includes('flavor') || lowerMessage.includes('taste')) {
      // Query for flavor information
      const { data: coffees } = await supabase
        .from('coffees')
        .select('name, flavor_notes')
        .order('name');

      if (coffees && coffees.length > 0) {
        response = "Here are our coffees and their flavor profiles:\n\n";
        coffees.forEach(coffee => {
          if (coffee.flavor_notes && coffee.flavor_notes.length > 0) {
            response += `${coffee.name}: ${coffee.flavor_notes.join(', ')}\n`;
          }
        });
      }
    } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
      const { data: coffees } = await supabase
        .from('coffees')
        .select('*')
        .limit(3);

      if (coffees && coffees.length > 0) {
        response = "Here are some popular recommendations:\n\n";
        coffees.forEach(coffee => {
          response += `${coffee.name}: ${coffee.description}\n`;
        });
      }
    } else {
      response = "I can help you learn about our coffee selection! Would you like to know about:\n" +
                "- Roast levels of our coffees\n" +
                "- Flavor profiles and taste notes\n" +
                "- Personalized recommendations\n\n" +
                "Just ask me about any of these topics!";
    }

    if (!response) {
      response = "I apologize, but I couldn't find the specific information you're looking for. " +
                "Could you try rephrasing your question? You can ask about roast levels, flavor profiles, or get recommendations.";
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
