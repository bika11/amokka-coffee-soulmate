
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";
import { corsHeaders } from "../_shared/cors.ts";
import { ChatCompletionRequestMessage } from "./types.ts";
import { OpenAIClient } from "./openai-client.ts";
import { GeminiClient } from "./gemini-client.ts";

// Initialize Supabase client with admin privileges
const supabaseClient = createClient(
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
  const { data: products, error } = await supabaseClient
    .from('amokka_products')
    .select('*')
    .eq('is_verified', true);

  if (error) throw new Error('Failed to fetch coffee products');
  if (!products?.length) throw new Error('No coffee products found');

  return products.map(product => `
Product: ${product.name}
Description: ${product.overall_description || product.description || ''}
Roast Level: ${product.roast_level || 'Not specified'}
Origin: ${product.origin || 'Not specified'}
Processing Method: ${product.processing_method || 'Not specified'}
Flavor Notes: ${product.flavor_notes?.join(', ') || 'Not specified'}
URL: ${product.url}
---`).join('\n');
}

serve(async (req) => {
  // Always include CORS headers in the response
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  try {
    // Parse the request body
    const { message, history } = await req.json();

    // Get coffee products context
    const coffeeContext = await getCoffeeContext();

    // Initialize the AI client (prefer Gemini, fallback to OpenAI)
    const aiClient = Deno.env.get("GEMINI_API_KEY") 
      ? new GeminiClient() 
      : new OpenAIClient();

    // Prepare conversation history with coffee context
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `You are a friendly and knowledgeable coffee expert. Use the following product information to answer questions:

${coffeeContext}

When discussing coffees, always refer to specific products from the list above. Be concise but informative, and maintain a helpful and positive tone. If asked about a coffee not in the list, politely explain that you can only discuss the coffees we currently offer.`
      },
      ...history,
      { role: "user", content: message },
    ];

    // Get AI response
    const response = await aiClient.getCompletion(messages);

    return new Response(
      JSON.stringify({ response }),
      { headers }
    );

  } catch (error) {
    console.error("Error in chat-about-coffee function:", error);

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      }),
      { 
        status: 500,
        headers 
      }
    );
  }
});
