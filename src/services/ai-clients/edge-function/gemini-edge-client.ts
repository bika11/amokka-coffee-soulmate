
import { AICompletionParams, AICompletionResult } from "@/shared/ai/types";
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
          apiType: this.getModelType(),
          temperature: params.temperature,
          maxTokens: params.maxTokens
        }
      });
      
      if (error) {
        console.error("Supabase Edge Function error:", error);
        throw new Error(`Error calling Supabase Edge Function: ${error.message}`);
      }
      
      return this.processResponse(data);
    } catch (error) {
      console.error("Error in Gemini Edge Function call:", error);
      throw error;
    }
  }
  
  private processResponse(data: any): AICompletionResult {
    if (!data || !data.completion) {
      console.error("Unexpected response format from Edge Function:", data);
      
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
