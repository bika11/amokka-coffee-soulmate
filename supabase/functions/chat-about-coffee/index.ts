
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { ChatCompletionRequestMessage } from "./types.ts";
import { OpenAIClient } from "./openai-client.ts";
import { GeminiClient } from "./gemini-client.ts";
import { ChatError } from "./error-handler.ts";
import { validateChatRequest } from "./request-validator.ts";
import { RateLimiter } from "./rate-limiter.ts";
import { ERROR_MESSAGES, HTTP_STATUS } from "./constants.ts";

const rateLimiter = new RateLimiter();

serve(async (req) => {
  // Always include CORS headers in the response
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { ...corsHeaders }
    });
  }

  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || null;

    // Check if we have either a valid token or an anonymous key
    const isAnonymousRequest = req.headers.get('apikey') !== null;
    if (!token && !isAnonymousRequest) {
      throw new ChatError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        'No authentication token or API key provided'
      );
    }
/*
    const { message, history } = await validateChatRequest(req);

    // Apply rate limiting
    const clientIp = req.headers.get("x-real-ip") || "unknown";
    await rateLimiter.checkRateLimit(clientIp);
*/

    // Initialize the AI client (prefer Gemini, fallback to OpenAI)
    const aiClient = Deno.env.get("GEMINI_API_KEY") 
      ? new GeminiClient() 
      : new OpenAIClient();

    // Prepare conversation history
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: "You are a friendly and knowledgeable coffee expert. Your goal is to help users learn about different coffee types, brewing methods, and find the perfect coffee match for their taste. Be concise but informative, and always maintain a helpful and positive tone.",
      },
      ...(history as ChatCompletionRequestMessage[] || []),
      { role: "user", content: message },
    ];

    // Get AI response
    const response = await aiClient.getCompletion(messages);

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );

  } catch (error) {
    console.error("Error in chat-about-coffee function:", error);

    if (error instanceof ChatError) {
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: error.details 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: error.status,
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: ERROR_MESSAGES.GENERAL_ERROR,
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      }
    );
  }
});
