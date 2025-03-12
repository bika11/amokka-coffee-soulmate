
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize AI clients based on available API keys
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

if (!geminiApiKey && !openaiApiKey) {
  console.error("No AI API keys found in environment variables");
}

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

// Memory cache for product data (5 minute TTL)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let productCache = {
  data: null,
  timestamp: 0
};

// Fetch coffee products data with caching
async function getCoffeeContext(): Promise<string> {
  try {
    // Check cache first
    const now = Date.now();
    if (productCache.data && (now - productCache.timestamp) < CACHE_TTL) {
      console.log("Using cached coffee product data");
      return productCache.data as string;
    }
    
    console.log("Fetching fresh coffee product data");
    
    // Use the optimized active_coffees view with database indexes
    const { data: products, error } = await supabaseAdmin
      .from('amokka_products')
      .select('name, description, overall_description, roast_level, flavor_notes, url')
      .eq('is_verified', true)
      .order('name');

    if (error) {
      console.error('Failed to fetch coffee products:', error);
      throw new Error('Failed to fetch coffee products');
    }
    
    if (!products?.length) {
      console.warn('No coffee products found');
      return "No coffee products found in our database.";
    }

    console.log(`Found ${products.length} products in the database`);

    const formattedData = products.map(product => `
Coffee: ${product.name}
Description: ${product.description || product.overall_description || ''}
Roast Level: ${product.roast_level || 'Not specified'}
Flavor Notes: ${Array.isArray(product.flavor_notes) ? product.flavor_notes.join(', ') : 'Not specified'}
URL: ${product.url}
---`).join('\n');
    
    // Update cache
    productCache = {
      data: formattedData,
      timestamp: now
    };
    
    return formattedData;
  } catch (error) {
    console.error('Error in getCoffeeContext:', error);
    return "Unable to retrieve coffee information at this time.";
  }
}

// Gemini API client implementation
async function getGeminiCompletion(messages: any[]): Promise<string> {
  try {
    // Get coffee context
    const coffeeContext = await getCoffeeContext();
    
    // Build the prompt differently for Gemini
    let prompt = '';
    
    // Add system message with context first
    const systemMessageExists = messages.some(msg => msg.role === 'system');
    if (!systemMessageExists) {
      prompt += `System: You are a helpful and knowledgeable coffee expert for Amokka Coffee. Use only the following product information to answer questions:
      
${coffeeContext}

When discussing coffees, always refer to specific products from the list above. If asked about a coffee or feature not in the list, politely explain that you can only discuss the coffees we currently offer. Don't make up information that's not in the product list. Be especially accurate about which coffees are organic - only mention a coffee as organic if it's explicitly stated in the description. If you don't know the answer, simply say so.\n\n`;
    }
    
    // Convert chat history to Gemini format
    messages.forEach(msg => {
      if (msg.role === 'system') {
        prompt += `System: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `Human: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n`;
      }
    });

    console.log("Sending request to Gemini API");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Gemini response received successfully");
    
    // Check if the response has the expected structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error("Unexpected response structure from Gemini API:", JSON.stringify(data));
      throw new Error("Unexpected response structure from Gemini API");
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    throw error;
  }
}

// OpenAI API client implementation with performance optimizations
async function getOpenAICompletion(messages: any[]): Promise<string> {
  try {
    // Get coffee context
    const coffeeContext = await getCoffeeContext();
    
    // Add system message with coffee context if not already present
    const systemMessageExists = messages.some(msg => msg.role === 'system');
    const messagesWithContext = systemMessageExists ? messages : [
      {
        role: 'system',
        content: `You are a helpful and knowledgeable coffee expert for Amokka Coffee. Use only the following product information to answer questions:
        
${coffeeContext}

When discussing coffees, always refer to specific products from the list above. If asked about a coffee or feature not in the list, politely explain that you can only discuss the coffees we currently offer. Don't make up information that's not in the product list. Be especially accurate about which coffees are organic - only mention a coffee as organic if it's explicitly stated in the description. If you don't know the answer, simply say so.`
      },
      ...messages
    ];
    
    console.log("Sending request to OpenAI API");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messagesWithContext,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenAI response received successfully");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in OpenAI API call:", error);
    throw error;
  }
}

serve(async (req) => {
  // Log request details
  console.log(`${req.method} request to ${req.url}`);
  const origin = req.headers.get('origin') || '*';

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': origin,
      }
    });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { messages, model = 'gemini' } = requestData;
    
    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid request format: messages array is required");
      return new Response(
        JSON.stringify({ error: "Invalid request format: messages array is required" }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log(`Processing request with ${messages.length} messages, using model: ${model}`);
    
    // Get AI completion based on selected model
    let completion;
    if (model === 'openai' && openaiApiKey) {
      console.log("Using OpenAI API");
      completion = await getOpenAICompletion(messages);
    } else if (geminiApiKey) {
      console.log("Using Gemini API");
      completion = await getGeminiCompletion(messages);
    } else {
      throw new Error("No API keys available for selected AI model");
    }

    // Return the completion
    return new Response(
      JSON.stringify({ completion }),
      { 
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in chat-about-coffee function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    );
  }
});
