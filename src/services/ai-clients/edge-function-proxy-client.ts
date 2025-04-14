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
      
      // Call the edge function directly without authentication
      console.log(`Attempting to call chat-about-coffee edge function...`);
      
      // Check if Gemini is being used but OpenAI is requested
      if (this.modelType === 'openai') {
        try {
          // Use direct fetch for more control over the request
          const supabaseEndpoint = import.meta.env.VITE_SUPABASE_URL || 'https://htgacpgppyjonzwkkntl.supabase.co';
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2FjcGdwcHlqb256d2trbbnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNDIwOTAsImV4cCI6MjA1MzcxODA5MH0.7cubJomcCG2eF0rv79m67XVQedZQ_NIYbYrY4IbSI2Y';
          
          const edgeFunctionUrl = `${supabaseEndpoint}/functions/v1/chat-about-coffee`;
          const response = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnonKey
            },
            body: JSON.stringify({
              messages: params.messages,
              model: this.modelType,
              temperature: params.temperature,
              maxTokens: params.maxTokens
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response from Edge Function (${response.status}):`, errorText);
            
            // If OpenAI is not configured, automatically fall back to Gemini
            if (response.status === 401 || response.status === 500) {
              console.log("Attempting fallback to edge-function-gemini");
              const fallbackClient = new EdgeFunctionProxyClient('gemini');
              return fallbackClient.getCompletion(params);
            }
            
            throw new Error(`Edge Function returned status ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          return this.processResponse(data);
        } catch (error) {
          console.error("Error in direct fetch to Edge Function:", error);
          
          // Fall back to Gemini
          console.log("Attempting fallback to edge-function-gemini after error");
          const fallbackClient = new EdgeFunctionProxyClient('gemini');
          return fallbackClient.getCompletion(params);
        }
      }
      
      // For Gemini or as a fallback mechanism, use the Supabase client
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
        // Fix for type error - use string comparison instead of type comparison
        if ((error.status === 401 || error.status === 500) && this.modelType === 'openai' as const) {
          console.log("OpenAI API key error, falling back to Gemini model");
          
          // Try gemini model instead if we're currently using OpenAI
          const fallbackClient = new EdgeFunctionProxyClient('gemini');
          return fallbackClient.getCompletion(params);
        }
        
        // Provide more detailed error messages
        let errorMessage = `Error calling Supabase Edge Function: ${error.message}`;
        
        if (error.message.includes("Edge Function returned a non-2xx status code")) {
          errorMessage = "The Edge Function failed to process the request. This may be due to authentication issues or an API key configuration problem.";
        }
        
        throw new Error(errorMessage);
      }
      
      return this.processResponse(data);
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
  
  private processResponse(data: any): AICompletionResult {
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
