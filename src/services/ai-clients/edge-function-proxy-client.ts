
import { AICompletionParams, AICompletionResult } from "@/interfaces/ai-client.interface";
import { BaseAIClient } from "./base-client";
import { OpenAIEdgeClient } from "./edge-function/openai-edge-client";
import { GeminiEdgeClient } from "./edge-function/gemini-edge-client";

/**
 * Edge Function Proxy Client that calls Supabase Edge Function
 * This is a facade that delegates to model-specific edge clients
 */
export class EdgeFunctionProxyClient extends BaseAIClient {
  private modelType: 'openai' | 'gemini';
  private edgeClient: OpenAIEdgeClient | GeminiEdgeClient;
  
  constructor(modelType: 'openai' | 'gemini' = 'gemini', options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    super(options);
    this.modelType = modelType;
    
    // Create the appropriate edge client based on model type
    this.edgeClient = this.modelType === 'openai' 
      ? new OpenAIEdgeClient(options)
      : new GeminiEdgeClient(options);
      
    console.log(`EdgeFunctionProxyClient created with model type: ${modelType}`);
  }
  
  getClientType(): string {
    return `edge-function-${this.modelType}`;
  }
  
  protected async getCompletionImpl(params: AICompletionParams): Promise<AICompletionResult> {
    try {
      // Delegate to the appropriate edge client
      return await this.edgeClient.getCompletion(params);
    } catch (error) {
      console.error(`Error in ${this.modelType} Edge Function:`, error);
      
      // If we get an error and we're using OpenAI, try Gemini instead
      if (this.modelType === 'openai' && error instanceof Error && error.message.includes("Falling back to Gemini")) {
        console.log("Creating new Gemini edge client for fallback");
        const fallbackClient = new GeminiEdgeClient();
        return fallbackClient.getCompletion(params);
      }
      
      // Fall back to alternative model if available
      if (this.fallbackClient) {
        console.log(`Attempting to use fallback client after error with ${this.modelType}`);
        return this.fallbackClient.getCompletion(params);
      }
      
      throw error;
    }
  }
}
