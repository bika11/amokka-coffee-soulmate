
import { AIClient } from "@/interfaces/ai-client.interface";
import { OpenAIClient } from "./ai-clients/openai-client";
import { GeminiClient } from "./ai-clients/gemini-client";
import { EdgeFunctionProxyClient } from "./ai-clients/edge-function-proxy-client";

/**
 * Factory function to create the appropriate AI client with fallback mechanisms
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
      // Create primary client with user-provided API key
      console.log(`Creating direct ${clientType} client with user-provided API key`);
      
      // Create the primary client
      const primaryClient = clientType === 'gemini' ? 
        new GeminiClient(clientApiKey) : 
        new OpenAIClient(clientApiKey);
      
      // Create a fallback client using edge function
      const fallbackClient = new EdgeFunctionProxyClient(clientType);
      
      // Set the fallback client for the primary client
      primaryClient.setFallbackClient(fallbackClient);
      
      return primaryClient;
    } else {
      // No API key available, use proxy to Edge Function with an internal fallback
      console.log(`No user API key available, will use Supabase Edge Function`);
      
      // Create primary edge function client
      const primaryClient = new EdgeFunctionProxyClient(clientType);
      
      // Create fallback edge function client with the alternative model
      const fallbackClient = new EdgeFunctionProxyClient(
        clientType === 'gemini' ? 'openai' : 'gemini'
      );
      
      // Set the fallback client
      primaryClient.setFallbackClient(fallbackClient);
      
      return primaryClient;
    }
  }
  
  // This code path only executes in Node.js context (not in browser)
  if (type === 'gemini' || (!type && process.env.GEMINI_API_KEY)) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    const primaryClient = new GeminiClient(key);
    
    // Try to set up a fallback if possible
    if (process.env.OPENAI_API_KEY) {
      primaryClient.setFallbackClient(new OpenAIClient(process.env.OPENAI_API_KEY));
    }
    
    return primaryClient;
  } else {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    const primaryClient = new OpenAIClient(key);
    
    // Try to set up a fallback if possible
    if (process.env.GEMINI_API_KEY) {
      primaryClient.setFallbackClient(new GeminiClient(process.env.GEMINI_API_KEY));
    }
    
    return primaryClient;
  }
}
