
import { AICompletionParams, AICompletionResult } from "@/interfaces/ai-client.interface";
import { BaseAIClient } from "./base-client";
import { supabase } from "@/integrations/supabase/client";
import { PromptManager } from "./prompt-manager";
import { SUPABASE_TABLES } from "@/integrations/supabase/constants";

/**
 * OpenAI Client implementation
 */
export class OpenAIClient extends BaseAIClient {
  private apiKey: string;
  private coffeeContext: string | null = null;

  constructor(apiKey: string, options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    super(options);
    this.apiKey = apiKey;
  }

  getClientType(): string {
    return 'openai';
  }

  protected async getCompletionImpl(params: AICompletionParams): Promise<AICompletionResult> {
    try {
      console.log("OpenAI Client: Processing messages:", params.messages.length);
      
      // Set up the request to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: params.model || 'gpt-3.5-turbo',
          messages: params.messages,
          temperature: params.temperature ?? 0.7,
          max_tokens: params.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (${response.status}):`, errorText);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("OpenAI response received successfully");
      
      // Extract usage statistics if available
      const tokens = data.usage ? {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens
      } : undefined;
      
      // Track model prediction in Supabase
      this.trackModelPrediction(data.choices[0].message.content);
      
      return {
        completion: data.choices[0].message.content,
        model: data.model,
        tokens
      };
    } catch (error) {
      console.error("Error in OpenAI API call:", error);
      throw error;
    }
  }
  
  private async trackModelPrediction(completion: string): Promise<void> {
    try {
      await supabase.from(SUPABASE_TABLES.MODEL_PREDICTIONS).insert({
        model_version: 'openai',
        coffee_name: this.extractCoffeeName(completion),
        prediction_score: 0.8 // Fixed score for simplicity
      });
    } catch (error) {
      console.error("Error tracking model prediction:", error);
    }
  }
  
  /**
   * Helper to load coffee context for system messages
   */
  async getCoffeeContext(): Promise<string> {
    if (this.coffeeContext) {
      return this.coffeeContext;
    }
    
    try {
      // Try to get coffee data from Supabase
      const { data: products, error } = await supabase
        .from(SUPABASE_TABLES.ACTIVE_COFFEES)
        .select('name, description, roast_level, flavor_notes, product_link')
        .order('interaction_count', { ascending: false })
        .limit(20);
      
      if (error || !products || products.length === 0) {
        throw new Error("No coffee data available");
      }
      
      // Format coffee data
      const context = products.map(coffee => `
Coffee: ${coffee.name}
Description: ${coffee.description || ''}
Roast Level: ${coffee.roast_level || 'Not specified'}
Flavor Notes: ${Array.isArray(coffee.flavor_notes) ? coffee.flavor_notes.join(', ') : 'Not specified'}
URL: ${coffee.product_link}
---`).join('\n');
      
      this.coffeeContext = context;
      return context;
    } catch (error) {
      console.error("Failed to get coffee context:", error);
      throw error;
    }
  }
}
