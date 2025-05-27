
import { AICompletionParams, AICompletionResult } from "@/shared/ai/types";
import { BaseEdgeFunctionClient } from "./base-edge-client";
import { handleEdgeFunctionError } from "./error-handler";
import { supabase } from "@/integrations/supabase/client";

/**
 * OpenAI-specific Edge Function Client
 */
export class OpenAIEdgeClient extends BaseEdgeFunctionClient {
  constructor(options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    super(options);
    console.log("OpenAIEdgeClient created");
  }
  
  getClientType(): string {
    return "edge-function-openai";
  }
  
  getModelType(): 'openai' | 'gemini' {
    return 'openai';
  }
  
  protected async callEdgeFunction(params: AICompletionParams): Promise<AICompletionResult> {
    try {
      console.log("Using Supabase client for OpenAI Edge Function call");
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
      console.error("Error in OpenAI Edge Function call:", error);
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
