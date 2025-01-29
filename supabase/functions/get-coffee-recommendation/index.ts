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

    const validCoffeeNames = [
      "Amokka Crema",
      "Sombra Dark Roast",
      "Treehugger Organic Blend",
      "Ethiopia Haji Suleiman",
      "Peru",
      "Gorgona Dark Roast Italian Blend",
      "Portofino Dark Roast",
      "City Roast",
      "Indonesia Mandheling"
    ];

    const systemPrompt = `You are a coffee expert. Based on the user's preferences, recommend ONE coffee from this exact list:
${validCoffeeNames.map(name => `- ${name}`).join('\n')}

IMPORTANT: Your response must contain ONLY the exact name of ONE coffee from the list above, nothing else. Do not add any explanations or additional text.`;

    console.log('Sending request to OpenAI with system prompt:', systemPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: preferences }
        ],
        temperature: 0.7,
        max_tokens: 50
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to get response from OpenAI API');
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI API');
    }

    const recommendation = data.choices[0].message.content.trim();
    console.log('Generated recommendation:', recommendation);

    if (!validCoffeeNames.includes(recommendation)) {
      console.error('Invalid coffee recommendation:', recommendation);
      throw new Error('Invalid coffee recommendation received');
    }

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