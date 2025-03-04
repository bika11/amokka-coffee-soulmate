
import { AIClient } from "@/interfaces/ai-client.interface";
import { OpenAIClient } from "./ai-clients/openai-client";
import { GeminiClient } from "./ai-clients/gemini-client";
import { EdgeFunctionProxyClient } from "./ai-clients/edge-function-proxy-client";

/**
 * Factory function to create the appropriate AI client
 * @param type Optional: Force a specific client type
 * @param apiKey Optional: Provide an API key directly instead of using environment variables
 * @returns An instance of AIClient
 */
export function createAIClient(type?: 'openai' | 'gemini', apiKey?: string): AIClient {
  // When running in browser context, we need to handle API keys differently
  if (typeof window !== 'undefined') {
    // For direct API calls, we need to check for API keys in localStorage or use default edge function
    const savedApiKey = localStorage.getItem('aiApiKey');
    const savedApiType = localStorage.getItem('aiApiType') as 'openai' | 'gemini' | null;
    
    // Use provided params, saved preferences, or default to Gemini
    const clientType = type || savedApiType || 'gemini';
    const clientApiKey = apiKey || savedApiKey;
    
    if (clientApiKey) {
      // Use the saved or provided API key
      console.log(`Creating direct ${clientType} client with user-provided API key`);
      return clientType === 'gemini' ? 
        new GeminiClient(clientApiKey) : 
        new OpenAIClient(clientApiKey);
    } else {
      // No API key available, use proxy to Edge Function
      console.log(`No user API key available, will use Supabase Edge Function`);
      return new EdgeFunctionProxyClient(clientType || 'gemini');
    }
  }
  
  // This code path only executes in Node.js context (not in browser)
  if (type === 'gemini' || (!type && process.env.GEMINI_API_KEY)) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    return new GeminiClient(key);
  } else {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    return new OpenAIClient(key);
  }
}
