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
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('No message provided');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch relevant product data
    const { data: products, error: dbError } = await supabase
      .from('amokka_products')
      .select('*')
      .eq('is_verified', true);

    if (dbError) throw dbError;

    if (!products || products.length === 0) {
      throw new Error('No verified products found in the database');
    }

    // Create context from product data
    const context = products
      .map(p => `Product: ${p.name}\nDescription: ${p.description}\nRoast Level: ${p.roast_level}\nFlavor Notes: ${p.flavor_notes.join(', ')}\nBrewing Methods: ${p.brewing_methods.join(', ')}\nOrigin: ${p.origin || 'Unknown'}\n\n`)
      .join('\n');

    // Call OpenAI with context
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a coffee expert who helps customers learn about Amokka's coffee selection. Use the following product information to provide accurate and helpful responses. Only reference products mentioned in the context. If you don't have information about something, be honest about it. Keep your responses concise and friendly.\n\nAvailable Products:\n${context}`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await openAIResponse.json();
    const response = data.choices[0].message.content;

    // Store the interaction
    await supabase
      .from('coffee_recommendations')
      .insert([
        {
          input_preferences: message,
          recommendation: response,
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
        details: 'If you see this error, please make sure there are verified products in the database.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});