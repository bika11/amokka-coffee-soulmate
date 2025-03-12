
import { AIClient, Message } from "@/interfaces/ai-client.interface";
import { supabase } from "@/integrations/supabase/client";
import { getCachedData, cacheData, measureQueryPerformance } from "@/utils/performance";
import { SUPABASE_TABLES } from "@/integrations/supabase/constants";

/**
 * Edge Function Proxy Client that calls Supabase Edge Function
 */
export class EdgeFunctionProxyClient implements AIClient {
  private modelType: 'openai' | 'gemini';
  private enableCache: boolean = true;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  
  constructor(modelType: 'openai' | 'gemini' = 'gemini', options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    this.modelType = modelType;
    
    if (options.enableCache !== undefined) {
      this.enableCache = options.enableCache;
    }
    
    if (options.cacheTTL !== undefined) {
      this.cacheTTL = options.cacheTTL;
    }
  }
  
  async getCompletion(messages: Message[]): Promise<string> {
    try {
      // Generate a cache key based on messages and model type
      const cacheKey = this.getCacheKey(messages);
      
      // Check if we have a cached response
      if (this.enableCache) {
        const cachedCompletion = getCachedData<string>(cacheKey);
        if (cachedCompletion) {
          console.log('Using cached AI completion');
          return cachedCompletion;
        }
      }
      
      console.log(`Edge Function Proxy: Sending request to chat-about-coffee function, model type: ${this.modelType}`);
      
      // Start measuring performance
      const endMeasure = measureQueryPerformance(`edgeFunction:chat-about-coffee:${this.modelType}`);
      
      const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
        body: {
          messages,
          model: this.modelType
        }
      });
      
      // End performance measurement
      const duration = endMeasure();
      
      if (error) {
        console.error("Supabase Edge Function error:", error);
        throw new Error(`Error calling Supabase Edge Function: ${error.message}`);
      }
      
      if (!data || !data.completion) {
        console.error("Unexpected response format from Edge Function:", data);
        throw new Error("Unexpected response format from Edge Function");
      }
      
      const completion = data.completion;
      
      // Track model prediction in Supabase if enabled
      this.trackModelPrediction(completion, duration);
      
      // Cache the result if caching is enabled
      if (this.enableCache) {
        cacheData(cacheKey, completion, this.cacheTTL);
      }
      
      return completion;
    } catch (error) {
      console.error("Error in Edge Function Proxy:", error);
      throw error;
    }
  }
  
  private getCacheKey(messages: Message[]): string {
    // Create a deterministic string representation of the messages
    const messagesString = JSON.stringify(messages.map(m => ({
      role: m.role,
      content: m.content
    })));
    
    // Create a hash for the cache key
    const hashCode = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    return `ai:${this.modelType}:${hashCode(messagesString)}`;
  }
  
  private async trackModelPrediction(completion: string, durationMs: number): Promise<void> {
    try {
      await supabase.from(SUPABASE_TABLES.MODEL_PREDICTIONS).insert({
        model_version: this.modelType,
        coffee_name: this.extractCoffeeName(completion),
        prediction_score: this.calculatePredictionScore(durationMs)
      });
    } catch (error) {
      console.error("Error tracking model prediction:", error);
    }
  }
  
  private extractCoffeeName(completion: string): string {
    // Simple heuristic to extract coffee name from completion
    // This is just a placeholder - you'd want to use a more robust method
    const coffeeNameMatches = completion.match(/(?:recommend|suggest|try) (?:the )?([\w\s]+)(?: coffee| blend)/i);
    return coffeeNameMatches ? coffeeNameMatches[1].trim() : "Unknown";
  }
  
  private calculatePredictionScore(durationMs: number): number {
    // Simple scoring based on performance - faster is better
    // Scale: 0 to 1 (higher is better)
    // Base score of 0.7, with penalty for slow responses
    const baseScore = 0.7;
    const performancePenalty = Math.min(0.3, durationMs / 10000); // Max penalty of 0.3 for responses > 10s
    return Math.max(0.1, baseScore - performancePenalty);
  }
}
