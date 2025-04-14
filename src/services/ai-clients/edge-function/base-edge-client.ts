
import { AICompletionParams, AICompletionResult } from "@/interfaces/ai-client.interface";
import { BaseAIClient } from "../base-client";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_TABLES } from "@/integrations/supabase/constants";
import { handleEdgeFunctionError } from "./error-handler";
import { extractCoffeeName } from "./utils";

/**
 * Base Edge Function Client class that provides common functionality
 * for edge function API calls
 */
export abstract class BaseEdgeFunctionClient extends BaseAIClient {
  protected retryCount: number = 0;
  protected maxRetries: number = 3;
  protected retryDelay: number = 2000; // 2 seconds
  
  constructor(options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    super(options);
  }
  
  /**
   * Template method for model-specific implementation to get completions
   */
  protected abstract callEdgeFunction(params: AICompletionParams): Promise<AICompletionResult>;
  
  /**
   * Returns the model type being used
   */
  abstract getModelType(): 'openai' | 'gemini';
  
  /**
   * Common implementation of getCompletionImpl for all edge function clients
   */
  protected async getCompletionImpl(params: AICompletionParams): Promise<AICompletionResult> {
    try {
      console.log(`Edge Function Proxy: Sending request to chat-about-coffee function, model type: ${this.getModelType()}`);
      
      const result = await this.callEdgeFunction(params);
      
      // Track model prediction in Supabase if enabled
      try {
        this.trackModelPrediction(result.completion);
      } catch (trackError) {
        console.warn("Error tracking model prediction (non-critical):", trackError);
      }
      
      return result;
    } catch (error) {
      console.error("Error in Edge Function Proxy:", error);
      
      // Handle retries or fallback logic in derived classes
      throw error;
    }
  }
  
  protected async trackModelPrediction(completion: string): Promise<void> {
    try {
      await supabase.from(SUPABASE_TABLES.MODEL_PREDICTIONS).insert({
        model_version: this.getModelType(),
        coffee_name: extractCoffeeName(completion),
        prediction_score: 0.75 // Fixed score for simplicity
      });
    } catch (error) {
      // Just log the error and continue - tracking failure shouldn't stop the application
      console.error("Error tracking model prediction:", error);
    }
  }
}
