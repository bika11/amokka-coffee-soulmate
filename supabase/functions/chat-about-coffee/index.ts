import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";
import { corsHeaders } from "../_shared/cors.ts";
import { ChatCompletionRequestMessage } from "./types.ts";
import { OpenAIClient } from "./openai-client.ts";
import { GeminiClient } from "./gemini-client.ts";

// Initialize AI clients
const aiClient = Deno.env.get("GEMINI_API_KEY")
  ? new GeminiClient()
  : new OpenAIClient();

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
    
    // Prepare messages
    console.log("Preparing messages for AI...");
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `You are a friendly and knowledgeable coffee expert. You are NOT in test mode. Use the following product information to answer questions:

${coffeeContext}

When discussing coffees, always refer to specific products from the list above. Be concise but informative, and maintain a helpful and positive tone. If asked about a coffee not in the list, politely explain that you can only discuss the coffees we currently offer.`,
      },
      ...history,
      { role: "user", content: message },
    ];
    console.log("Messages prepared, count:", messages.length);
    
    // Get AI completion
    console.log("Initializing AI client...");
    // @ts-ignore
    console.log("Using AI client type:", Deno.env.get("GEMINI_API_KEY") ? "Gemini" : "OpenAI");
    console.log("Getting AI completion...");
    const response = await aiClient.getCompletion(messages);
    console.log("AI completion received, length:", response?.length);

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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";
import { corsHeaders } from "../_shared/cors.ts";
import { ChatCompletionRequestMessage } from "./types.ts";
import { OpenAIClient } from "./openai-client.ts";
import { GeminiClient } from "./gemini-client.ts";

// Initialize AI clients
const aiClient = Deno.env.get("GEMINI_API_KEY")
  ? new GeminiClient()
  : new OpenAIClient();

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
    
    // Prepare messages
    console.log("Preparing messages for AI...");
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `You are a friendly and knowledgeable coffee expert. Use the following product information to answer questions:

${coffeeContext}

When discussing coffees, always refer to specific products from the list above. Be concise but informative, and maintain a helpful and positive tone. If asked about a coffee not in the list, politely explain that you can only discuss the coffees we currently offer.`,
      },
      ...history,
      { role: "user", content: message },
    ];
    console.log("Messages prepared, count:", messages.length);
    
    // Get AI completion
    console.log("Initializing AI client...");
    // @ts-ignore
    console.log("Using AI client type:", Deno.env.get("GEMINI_API_KEY") ? "Gemini" : "OpenAI");
    console.log("Getting AI completion...");
    const response = await aiClient.getCompletion(messages);
    console.log("AI completion received, length:", response?.length);

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
