
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";
import { corsHeaders } from "../_shared/cors.ts";
import { getCoffeeContext, optimizeContext } from "./context-builder.ts";
import { formatPromptWithContext, getPrompt } from "./prompt-manager.ts";
import { ChatCompletionRequestMessage } from "./types.ts";

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
    const { 
      messages, 
      model = 'gemini', 
      temperature = 0.7, 
      maxTokens,
      promptId = 'coffee-expert'
    } = requestData;
    
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
    
    // Get coffee context for product information
    const coffeeContext = await getCoffeeContext(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get system prompt from prompt manager
    const systemPrompt = formatPromptWithContext(promptId, coffeeContext);
    
    // Optimize context if needed
    const optimizedPrompt = optimizeContext(systemPrompt, 2000);
    
    // Prepare messages with system prompt
    const systemMessageExists = messages.some(msg => msg.role === 'system');
    const messagesWithContext = systemMessageExists ? messages : [
      {
        role: 'system',
        content: optimizedPrompt
      },
      ...messages
    ];
    
    // Get AI completion based on selected model
    let completionResult;
    if (geminiApiKey) {
      console.log("Using Gemini API");
      completionResult = await getGeminiCompletion(messagesWithContext, temperature, maxTokens);
    } else if (model === 'openai' && openaiApiKey) {
      console.log("Using OpenAI API");
      completionResult = await getOpenAICompletion(messagesWithContext, temperature, maxTokens);
    } else {
      throw new Error("No API keys available for selected AI model");
    }

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

// Gemini API client implementation
async function getGeminiCompletion(
  messages: ChatCompletionRequestMessage[], 
  temperature = 0.7,
  maxTokens?: number
): Promise<{completion: string, model: string, tokens?: {prompt: number, completion: number, total: number}}> {
  try {
    // Build the prompt differently for Gemini
    let prompt = '';
    
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
          temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: maxTokens || 1024,
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
    
    // Extract token usage if available
    const tokens = data.usageMetadata ? {
      prompt: data.usageMetadata.promptTokenCount || 0,
      completion: data.usageMetadata.candidatesTokenCount || 0,
      total: data.usageMetadata.totalTokens || 0
    } : undefined;
    
    return {
      completion: data.candidates[0].content.parts[0].text,
      model: 'gemini-pro',
      tokens
    };
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    throw error;
  }
}

// OpenAI API client implementation with performance optimizations
async function getOpenAICompletion(
  messages: ChatCompletionRequestMessage[],
  temperature = 0.7,
  maxTokens?: number
): Promise<{completion: string, model: string, tokens?: {prompt: number, completion: number, total: number}}> {
  try {
    console.log("Sending request to OpenAI API");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenAI response received successfully");
    
    // Extract token usage
    const tokens = data.usage ? {
      prompt: data.usage.prompt_tokens,
      completion: data.usage.completion_tokens,
      total: data.usage.total_tokens
    } : undefined;
    
    return {
      completion: data.choices[0].message.content,
      model: data.model,
      tokens
    };
  } catch (error) {
    console.error("Error in OpenAI API call:", error);
    throw error;
  }
}
