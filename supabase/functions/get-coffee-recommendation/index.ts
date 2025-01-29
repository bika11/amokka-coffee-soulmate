import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { preferences } = await req.json();
    console.log('Received preferences:', preferences);

    if (!preferences) {
      throw new Error('No preferences provided');
    }

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
            content: `You are a coffee expert. Given user preferences, recommend one of these coffees:
              1. Amokka Crema - balanced espresso with chocolate and nutty notes
              2. Sombra Dark Roast - dark roast with fruity notes and spices
              3. Treehugger Organic Blend - organic blend with spicy and nutty notes
              4. Ethiopia Haji Suleiman - light and floral with fruit notes
              5. Peru - light roast with fruity notes and chocolate finish
              6. Gorgona Dark Roast Italian Blend - bold Italian-style with chocolate
              7. Portofino Dark Roast - rich dark roast with spices and chocolate
              8. City Roast - medium roast with balanced sweetness and nuts
              9. Indonesia Mandheling - complex with dried fruits and spices
              
              Respond with ONLY the name of the coffee that best matches their preferences.`
          },
          { role: 'user', content: preferences }
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const recommendation = data.choices[0].message.content.trim();
    console.log('Generated recommendation:', recommendation);

    return new Response(JSON.stringify({ recommendation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-coffee-recommendation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing your request'
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});