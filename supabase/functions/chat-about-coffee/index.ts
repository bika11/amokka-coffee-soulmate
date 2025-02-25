
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getChatResponse } from "./gemini-client.ts";
import { rateLimiter } from "./rate-limiter.ts";
import { config } from "./config.ts";
import { handleError, ChatError } from "./error-handler.ts";
import { buildCoffeeContext } from "./context-builder.ts";
import { validateChatRequest } from "./request-validator.ts";
import { CORS_HEADERS, HTTP_STATUS, ERROR_MESSAGES } from "./constants.ts";

async function handleChatRequest(req: Request) {
  // Rate limiting check
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  if (rateLimiter.isRateLimited(clientIP)) {
    throw new ChatError(ERROR_MESSAGES.TOO_MANY_REQUESTS, HTTP_STATUS.TOO_MANY_REQUESTS, 'Please try again later');
  }

  // Parse and validate request
  const data = await req.json();
  const { message, history } = validateChatRequest(data);
  
  console.log('Received message:', message);
  console.log('Chat history:', history);

  // Get Supabase credentials from config
  const supabaseUrl = config.get('SUPABASE_URL');
  const supabaseKey = config.get('SUPABASE_SERVICE_ROLE_KEY');

  // Build context from coffee data
  const context = await buildCoffeeContext(supabaseUrl, supabaseKey);

  // Get response from Gemini
  const response = await getChatResponse(context, message, history);

  return new Response(
    JSON.stringify({ response }),
    { 
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status: HTTP_STATUS.OK
    }
  );
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    return await handleChatRequest(req);
  } catch (error) {
    return handleError(error);
  }
});
