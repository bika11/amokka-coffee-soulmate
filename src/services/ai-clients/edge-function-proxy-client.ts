
import { AICompletionParams, AICompletionResult } from "@/interfaces/ai-client.interface";
import { BaseAIClient } from "./base-client";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_TABLES } from "@/integrations/supabase/constants";

/**
 * Edge Function Proxy Client that calls Supabase Edge Function
 */
export class EdgeFunctionProxyClient extends BaseAIClient {
  private modelType: 'openai' | 'gemini';
  
  constructor(modelType: 'openai' | 'gemini' = 'gemini', options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    super(options);
    this.modelType = modelType;
  }
  
  getClientType(): string {
    return `edge-function-${this.modelType}`;
  }
  
  protected async getCompletionImpl(params: AICompletionParams): Promise<AICompletionResult> {
    try {
      console.log(`Edge Function Proxy: Sending request to chat-about-coffee function, model type: ${this.modelType}`);
      
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
        
        // Check for specific error types
        if (error.status === 401) {
          throw new Error(`Authentication error: The ${this.modelType} API key is not configured. Please check your API settings.`);
        } else if (error.status === 403) {
          throw new Error("Permission denied: You don't have access to this resource.");
        } else if (error.status === 429) {
          throw new Error(`Rate limit exceeded for ${this.modelType} API. Please try again later.`);
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
      this.trackModelPrediction(result.completion);
      
      return result;
    } catch (error) {
      console.error("Error in Edge Function Proxy:", error);
      throw error;
    }
  }
  
  private async trackModelPrediction(completion: string): Promise<void> {
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
}
