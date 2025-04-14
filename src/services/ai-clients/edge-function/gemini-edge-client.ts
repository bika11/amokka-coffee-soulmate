
import { AICompletionParams, AICompletionResult } from "@/interfaces/ai-client.interface";
import { BaseEdgeFunctionClient } from "./base-edge-client";
import { handleEdgeFunctionError } from "./error-handler";
import { supabase } from "@/integrations/supabase/client";

/**
 * Gemini-specific Edge Function Client
 */
export class GeminiEdgeClient extends BaseEdgeFunctionClient {
  constructor(options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    super(options);
    console.log("GeminiEdgeClient created");
  }
  
  getClientType(): string {
    return "edge-function-gemini";
  }
  
  getModelType(): 'openai' | 'gemini' {
    return 'gemini';
  }
  
  protected async callEdgeFunction(params: AICompletionParams): Promise<AICompletionResult> {
    try {
      console.log("Using Supabase client for Gemini Edge Function call");
      const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
        body: {
          messages: params.messages,
          model: this.getModelType(),
          temperature: params.temperature,
          maxTokens: params.maxTokens
        }
      });
      
      if (error) {
        console.error("Supabase Edge Function error:", error);
        
        // Handle rate limiting (429 errors)
        if (error.status === 429 && this.retryCount < this.maxRetries) {
          return this.handleRateLimiting(params);
        }
        
        // Reset retry counter after processing
        this.retryCount = 0;
        
        throw new Error(`Error calling Supabase Edge Function: ${error.message}`);
      }
      
      return this.processResponse(data);
    } catch (error) {
      console.error("Error in Gemini Edge Function call:", error);
      throw error;
    }
  }
  
  private async handleRateLimiting(params: AICompletionParams): Promise<AICompletionResult> {
    this.retryCount++;
    console.log(`Rate limit exceeded. Retrying in ${this.retryDelay}ms... (Attempt ${this.retryCount} of ${this.maxRetries})`);
    
    // Implement exponential backoff
    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
    this.retryDelay *= 2; // Double delay for next retry
    
    return this.callEdgeFunction(params);
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
    
    return {
      completion: data.completion,
      model: data.model || `edge-${this.getModelType()}`,
      tokens: data.tokens
    };
  }
}
