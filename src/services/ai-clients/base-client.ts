
import { AIClient, AICompletionParams, AICompletionResult, Message } from "@/interfaces/ai-client.interface";
import { PromptManager } from "./prompt-manager";
import { getCachedData, cacheData, measureQueryPerformance } from "@/utils/performance";

export abstract class BaseAIClient implements AIClient {
  protected enableCache: boolean = true;
  protected cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  protected fallbackClient: AIClient | null = null;
  
  constructor(options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    if (options.enableCache !== undefined) {
      this.enableCache = options.enableCache;
    }
    
    if (options.cacheTTL !== undefined) {
      this.cacheTTL = options.cacheTTL;
    }
  }
  
  /**
   * Sets a fallback client to use if this client fails
   */
  setFallbackClient(client: AIClient): void {
    this.fallbackClient = client;
  }
  
  abstract getClientType(): string;
  
  /**
   * Implementation-specific completion method to be overridden by subclasses
   */
  protected abstract getCompletionImpl(params: AICompletionParams): Promise<AICompletionResult>;
  
  /**
   * Public method for getting completions with caching, error handling, and fallbacks
   */
  async getCompletion(params: AICompletionParams): Promise<AICompletionResult> {
    try {
      // Generate a cache key based on messages and model type
      const cacheKey = this.getCacheKey(params);
      
      // Check if we have a cached response
      if (this.enableCache) {
        const cachedCompletion = getCachedData<AICompletionResult>(cacheKey);
        if (cachedCompletion) {
          console.log(`Using cached ${this.getClientType()} completion`);
          return cachedCompletion;
        }
      }
      
      // Optimize context tokens if needed
      const optimizedParams = this.optimizeParams(params);
      
      // Start measuring performance
      const endMeasure = measureQueryPerformance(`ai:${this.getClientType()}`);
      
      // Get completion from implementation
      const result = await this.getCompletionImpl(optimizedParams);
      
      // End performance measurement
      const duration = endMeasure();
      
      // Add duration to result
      const completionResult: AICompletionResult = {
        ...result,
        duration
      };
      
      // Cache the result if caching is enabled
      if (this.enableCache) {
        cacheData(cacheKey, completionResult, this.cacheTTL);
      }
      
      return completionResult;
    } catch (error) {
      console.error(`Error in ${this.getClientType()} client:`, error);
      
      // Try fallback client if available
      if (this.fallbackClient) {
        console.log(`Attempting fallback to ${this.fallbackClient.getClientType()}`);
        return this.fallbackClient.getCompletion(params);
      }
      
      throw error;
    }
  }
  
  /**
   * Creates a deterministic cache key from the completion parameters
   */
  protected getCacheKey(params: AICompletionParams): string {
    // Create a deterministic string representation of the messages
    const messagesString = JSON.stringify(params.messages.map(m => ({
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
    
    return `ai:${this.getClientType()}:${params.model || 'default'}:${hashCode(messagesString)}`;
  }
  
  /**
   * Optimizes completion parameters to reduce token usage
   */
  protected optimizeParams(params: AICompletionParams): AICompletionParams {
    if (!params.contextLimit) {
      return params;
    }
    
    // Find and optimize system messages
    const optimizedMessages: Message[] = params.messages.map(message => {
      if (message.role === 'system' && message.content.length > 500) {
        // Optimize long system messages
        return {
          role: 'system',
          content: PromptManager.optimizeContext(message.content, params.contextLimit)
        };
      }
      return message;
    });
    
    return {
      ...params,
      messages: optimizedMessages
    };
  }
  
  /**
   * Extracts a coffee name from a completion
   */
  protected extractCoffeeName(completion: string): string {
    // Simple heuristic to extract coffee name from completion
    const coffeeNameMatches = completion.match(/(?:recommend|suggest|try) (?:the )?([\w\s]+)(?: coffee| blend)/i);
    return coffeeNameMatches ? coffeeNameMatches[1].trim() : "Unknown";
  }
}
