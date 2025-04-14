
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { ChatError } from "./error-handler.ts";
import { RequestHandler } from "./request-handler.ts";

// Initialize request handler with AI service and cache
const requestHandler = new RequestHandler();

// Initialize cache for responses (in-memory)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
    
    // Process the request
    const completionResult = await requestHandler.handleRequest(requestData);
    
    // Return the completion
    return new Response(
      JSON.stringify(completionResult),
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
    
    const status = error instanceof ChatError ? error.status : 500;
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        details: error instanceof ChatError ? error.details : undefined
      }),
      { 
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        },
        status 
      }
    );
  }
});
