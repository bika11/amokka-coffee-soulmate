
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { ChatService } from "./chat-service.ts";
import { ChatCompletionRequestMessage } from "./types.ts";
import { formatPromptWithContext } from "./prompt-manager.ts";
import { getCoffeeContext } from "./context-builder.ts";

const chatService = new ChatService();

serve(async (req) => {
  const origin = req.headers.get('origin') || '*';
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { ...corsHeaders, 'Access-Control-Allow-Origin': origin }
    });
  }

  try {
    const { messages } = await req.json();
    
    if (!Array.isArray(messages)) {
      throw new Error("Invalid request: messages must be an array");
    }

    // Get coffee context
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    // Get coffee context for product information
    const coffeeContext = await getCoffeeContext(supabaseUrl, supabaseKey);
    
    // Format the system prompt with context
    const systemPrompt = formatPromptWithContext('coffee-expert', coffeeContext);
    
    // Prepare messages with system prompt
    const messagesWithContext: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    
    // Get completion from Gemini
    const completion = await chatService.getCompletion(messagesWithContext);
    
    return new Response(
      JSON.stringify({ completion, model: 'gemini-1.5-pro' }),
      { 
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
