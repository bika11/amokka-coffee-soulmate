
import { AICompletionParams, AICompletionResult } from "@/interfaces/ai-client.interface";
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
          model: this.getModelType(),
          temperature: params.temperature,
          maxTokens: params.maxTokens
        })
      });
      
      if (!response.ok) {
        // This function throws an error rather than returning a result
        throw await handleEdgeFunctionError(response, this.getModelType());
      }
      
      const data = await response.json();
      return this.processResponse(data);
    } catch (error) {
      console.error("Error in direct fetch to Edge Function:", error);
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
    
    return {
      completion: data.completion,
      model: data.model || `edge-${this.getModelType()}`,
      tokens: data.tokens
    };
  }
}
