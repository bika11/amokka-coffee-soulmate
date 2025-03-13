
import { AICompletionParams, AICompletionResult } from "@/interfaces/ai-client.interface";
import { BaseAIClient } from "./base-client";
import { supabase } from "@/integrations/supabase/client";
import { PromptManager } from "./prompt-manager";
import { SUPABASE_TABLES } from "@/integrations/supabase/constants";

/**
 * Gemini Client implementation
 */
export class GeminiClient extends BaseAIClient {
  private apiKey: string;
  private coffeeContext: string | null = null;

  constructor(apiKey: string, options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    super(options);
    this.apiKey = apiKey;
  }

  getClientType(): string {
    return 'gemini';
  }

  protected async getCompletionImpl(params: AICompletionParams): Promise<AICompletionResult> {
    try {
      console.log("Gemini Client: Processing messages:", params.messages.length);
      
      // Build prompt for Gemini in the format it expects
      let prompt = '';
      
      // Convert chat history to Gemini format
      params.messages.forEach(msg => {
        if (msg.role === 'system') {
          prompt += `System: ${msg.content}\n\n`;
        } else if (msg.role === 'user') {
          prompt += `Human: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistant: ${msg.content}\n`;
        }
      });

      console.log("Gemini prompt prepared, sending request...");
      // Updated to use the latest Gemini API endpoint
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: params.temperature ?? 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: params.maxTokens ?? 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error (${response.status}):`, errorText);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Gemini response received successfully");
      
      // Updated to match the expected response structure for the current API version
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error("Unexpected response structure from Gemini API:", JSON.stringify(data));
        throw new Error("Unexpected response structure from Gemini API");
      }
      
      const completion = data.candidates[0].content.parts[0].text;
      
      // Track model prediction in Supabase
      this.trackModelPrediction(completion);
      
      // Extract token usage if available (Gemini may not provide this)
      const tokens = data.usageMetadata?.totalTokens ? {
        prompt: data.usageMetadata.promptTokenCount || 0,
        completion: data.usageMetadata.candidatesTokenCount || 0,
        total: data.usageMetadata.totalTokens
      } : undefined;
      
      return {
        completion,
        model: 'gemini-1.0-pro',
        tokens
      };
    } catch (error) {
      console.error("Error in Gemini API call:", error);
      throw error;
    }
  }
  
  private async trackModelPrediction(completion: string): Promise<void> {
    try {
      await supabase.from(SUPABASE_TABLES.MODEL_PREDICTIONS).insert({
        model_version: 'gemini',
        coffee_name: this.extractCoffeeName(completion),
        prediction_score: 0.7 // Fixed score for simplicity
      });
    } catch (error) {
      console.error("Error tracking model prediction:", error);
    }
  }
  
  /**
   * Helper to extract coffee name from completion
   */
  protected extractCoffeeName(text: string): string {
    // Simple extraction - get the first term that looks like a coffee name
    const sentences = text.split(/[.!?]/);
    for (const sentence of sentences) {
      const words = sentence.split(' ');
      for (let i = 0; i < words.length - 1; i++) {
        // Look for sequences that might be coffee names (2-3 words with some capitalization)
        const term = words.slice(i, i + 3).join(' ').trim();
        if (/[A-Z]/.test(term) && term.length > 4) {
          return term;
        }
      }
    }
    return "Unknown Coffee";
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
