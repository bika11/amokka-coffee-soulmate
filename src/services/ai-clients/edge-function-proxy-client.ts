
import { AICompletionParams, AICompletionResult } from "@/interfaces/ai-client.interface";
import { BaseAIClient } from "./base-client";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_TABLES } from "@/integrations/supabase/constants";

/**
 * Edge Function Proxy Client that calls Supabase Edge Function
 */
export class EdgeFunctionProxyClient extends BaseAIClient {
  private modelType: 'openai' | 'gemini';
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 2000; // 2 seconds
  
  constructor(modelType: 'openai' | 'gemini' = 'gemini', options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    super(options);
    this.modelType = modelType;
    console.log(`EdgeFunctionProxyClient created with model type: ${modelType}`);
  }
  
  getClientType(): string {
    return `edge-function-${this.modelType}`;
  }
  
  protected async getCompletionImpl(params: AICompletionParams): Promise<AICompletionResult> {
    try {
      console.log(`Edge Function Proxy: Sending request to chat-about-coffee function, model type: ${this.modelType}`);
      
      // Call the edge function directly - we've disabled JWT verification
      console.log(`Attempting to call chat-about-coffee edge function...`);
      
      const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
        body: {
          messages: params.messages,
          model: this.modelType,
          temperature: params.temperature,
          maxTokens: params.maxTokens
        }
      });
      
      if (error) {
        console.error("Supabase Edge Function error:", error);
        
        // Handle rate limiting (429 errors)
        if (error.status === 429 && this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`Rate limit exceeded. Retrying in ${this.retryDelay}ms... (Attempt ${this.retryCount} of ${this.maxRetries})`);
          
          // Implement exponential backoff
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          this.retryDelay *= 2; // Double delay for next retry
          
          return this.getCompletionImpl(params);
        }
        
        // Reset retry counter after processing
        this.retryCount = 0;
        
        // Check if this is an API key error for the requested model
        if (error.status === 401 && this.modelType === 'openai') {
          console.log("OpenAI API key error, falling back to Gemini model");
          
          // Try gemini model instead if we're currently using OpenAI
          const fallbackClient = new EdgeFunctionProxyClient('gemini');
          return fallbackClient.getCompletion(params);
        }
        
        // Check for specific error types and provide more detailed error messages
        if (error.status === 401) {
          throw new Error(`Authentication error: The service cannot authenticate with the ${this.modelType} API. Please try a different model.`);
        } else if (error.status === 403) {
          throw new Error("Permission denied: You don't have access to this resource.");
        } else if (error.status === 404) {
          throw new Error(`Edge Function not found: The chat-about-coffee edge function is not deployed or correctly configured. Please ensure it's properly deployed in your Supabase project.`);
        } else if (error.status === 429) {
          throw new Error(`Rate limit exceeded for ${this.modelType} API. Please wait a few minutes and try again later.`);
        }
        
        throw new Error(`Error calling Supabase Edge Function: ${error.message}`);
      }
      
      if (!data || !data.completion) {
        console.error("Unexpected response format from Edge Function:", data);
        
        // If data contains an error field, show that to the user
        if (data && data.error) {
          throw new Error(`Error from AI service: ${data.error}`);
        }
        
        throw new Error("Unexpected response format from Edge Function");
      }
      
      const result: AICompletionResult = {
        completion: data.completion,
        model: data.model || `edge-${this.modelType}`,
        tokens: data.tokens
      };
      
      // Track model prediction in Supabase if enabled
      try {
        this.trackModelPrediction(result.completion);
      } catch (trackError) {
        console.warn("Error tracking model prediction (non-critical):", trackError);
      }
      
      return result;
    } catch (error) {
      console.error("Error in Edge Function Proxy:", error);
      
      // Fall back to alternative model if available
      if (this.fallbackClient) {
        console.log(`Attempting to use fallback client after error with ${this.modelType}`);
        return this.fallbackClient.getCompletion(params);
      }
      
      throw error;
    }
  }
  
  protected async trackModelPrediction(completion: string): Promise<void> {
    try {
      await supabase.from(SUPABASE_TABLES.MODEL_PREDICTIONS).insert({
        model_version: this.modelType,
        coffee_name: this.extractCoffeeName(completion),
        prediction_score: 0.75 // Fixed score for simplicity
      });
    } catch (error) {
      // Just log the error and continue - tracking failure shouldn't stop the application
      console.error("Error tracking model prediction:", error);
    }
  }
  
  protected extractCoffeeName(text: string): string {
    // Simple extraction - get the first term that looks like a coffee name
    // This is a simplistic approach and might need refinement
    const sentences = text.split(/[.!?]/);
    for (const sentence of sentences) {
      const words = sentence.split(' ');
      for (let i = 0; i < words.length - 1; i++) {
        // Look for sequences that might be coffee names (2-3 words with some capitalization)
        const term = words.slice(i, i + 3).join(' ').trim();
        if (/[A-Z]/.test(term) && term.length > 4) {
          return term;
        }
      }
    }
    return "Unknown Coffee";
  }
}
