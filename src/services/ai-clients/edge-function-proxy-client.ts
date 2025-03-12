
import { AIClient, Message } from "@/interfaces/ai-client.interface";
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/error-handler";
import { requestCache } from "@/utils/request-cache";

/**
 * Edge Function Proxy Client that calls Supabase Edge Function
 * Implements caching, request deduplication, and centralized error handling
 */
export class EdgeFunctionProxyClient implements AIClient {
  private modelType: 'openai' | 'gemini';
  private static pendingRequests = new Map<string, Promise<string>>();
  
  constructor(modelType: 'openai' | 'gemini' = 'gemini') {
    this.modelType = modelType;
  }
  
  async getCompletion(messages: Message[]): Promise<string> {
    try {
      console.log(`Edge Function Proxy: Sending request to chat-about-coffee function, model type: ${this.modelType}`);
      
      // Create a cache key based on the messages and model type
      const requestKey = `${this.modelType}:${JSON.stringify(messages)}`;
      
      // Deduplicate identical in-flight requests
      return requestCache.deduplicate(requestKey, async () => {
        const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
          body: {
            messages,
            model: this.modelType
          }
        });
        
        if (error) {
          console.error("Supabase Edge Function error:", error);
          
          // Use centralized error handling
          handleError(
            error, 
            `Error calling Supabase Edge Function: ${error.message}`, 
            { 
              title: "AI Service Error",
              showToast: true 
            }
          );
          
          throw new Error(`Error calling Supabase Edge Function: ${error.message}`);
        }
        
        if (!data || !data.completion) {
          console.error("Unexpected response format from Edge Function:", data);
          
          const formatError = new Error("Unexpected response format from Edge Function");
          handleError(formatError, "Unable to process AI response");
          throw formatError;
        }
        
        return data.completion;
      });
    } catch (error) {
      console.error("Error in Edge Function Proxy:", error);
      
      // Catch and rethrow to ensure error is properly handled upstream
      handleError(error, "Unable to get AI response", {
        showToast: false // Let the parent handle toast display
      });
      
      throw error;
    }
  }
}
