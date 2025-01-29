import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.7";
import * as http from 'http';

config({ export: true });

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

if (!supabaseUrl || !supabaseKey || !openAIApiKey) {
  throw new Error('Environment variables SUPABASE_URL, SUPABASE_ANON_KEY, or OPENAI_API_KEY are not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Processing chat message:', message);

    // Add rate limiting here if needed
    const { data, error } = await supabase
      .from('messages')
      .insert([{ content: message }]);

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    return new Response(JSON.stringify({ 
      reply: `Received: ${message} (Stored in DB#${data[0].id})`
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};

console.log("Starting server...");
serve(handler, { port: 8000 });

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:3000/');
});

