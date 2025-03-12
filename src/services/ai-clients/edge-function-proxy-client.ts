
import { AIClient, Message } from "@/interfaces/ai-client.interface";
import { supabase } from "@/integrations/supabase/client";

/**
 * Edge Function Proxy Client that calls Supabase Edge Function
 */
export class EdgeFunctionProxyClient implements AIClient {
  private modelType: 'openai' | 'gemini';
  
  constructor(modelType: 'openai' | 'gemini' = 'gemini') {
    this.modelType = modelType;
  }
  
  async getCompletion(messages: Message[]): Promise<string> {
    try {
      console.log(`Edge Function Proxy: Sending request to chat-about-coffee function, model type: ${this.modelType}`);
      
      const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
        body: {
          messages,
          model: this.modelType
        }
      });
      
      if (error) {
        console.error("Supabase Edge Function error:", error);
        throw new Error(`Error calling Supabase Edge Function: ${error.message}`);
      }
      
      if (!data || !data.completion) {
        console.error("Unexpected response format from Edge Function:", data);
        throw new Error("Unexpected response format from Edge Function");
      }
      
      return data.completion;
    } catch (error) {
      console.error("Error in Edge Function Proxy:", error);
      throw error;
    }
  }
}
