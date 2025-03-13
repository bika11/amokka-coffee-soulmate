
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
    console.log(`EdgeFunctionProxyClient created with model type: ${modelType}`);
  }
  
  getClientType(): string {
    return `edge-function-${this.modelType}`;
  }
  
  protected async getCompletionImpl(params: AICompletionParams): Promise<AICompletionResult> {
    try {
      console.log(`Edge Function Proxy: Sending request to chat-about-coffee function, model type: ${this.modelType}`);
      
      // Verify the function exists first
      try {
        const { data: functions, error: listError } = await supabase.functions.list();
        
        if (listError) {
          console.error("Error listing functions:", listError);
        } else {
          const functionExists = functions.some(f => f.name === 'chat-about-coffee');
          console.log(`Function chat-about-coffee exists: ${functionExists}`);
          
          if (!functionExists) {
            throw new Error("The chat-about-coffee edge function does not exist. Please deploy it in your Supabase project.");
          }
        }
      } catch (listError) {
        console.warn("Could not verify function existence:", listError);
        // Continue anyway as the function might still be accessible
      }
      
      // Call the edge function
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
          throw new Error(`Authentication error: The ${this.modelType} API key is not configured correctly in Supabase Edge Function secrets. Please check your API settings.`);
        } else if (error.status === 403) {
          throw new Error("Permission denied: You don't have access to this resource.");
        } else if (error.status === 404) {
          throw new Error(`Edge Function not found: The chat-about-coffee edge function is not deployed. Please deploy it in your Supabase project.`);
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
