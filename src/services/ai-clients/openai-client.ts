
import { AIClient, Message } from "@/interfaces/ai-client.interface";
import { supabase } from "@/integrations/supabase/client";
import { COFFEES } from "@/lib/coffee-data";
import { cacheData, getCachedData, measureQueryPerformance } from "@/utils/performance";

/**
 * OpenAI Client implementation
 */
export class OpenAIClient implements AIClient {
  private apiKey: string;
  private coffeeContext: string | null = null;
  private enableCache: boolean = true;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor(apiKey: string, options: { enableCache?: boolean, cacheTTL?: number } = {}) {
    this.apiKey = apiKey;
    
    if (options.enableCache !== undefined) {
      this.enableCache = options.enableCache;
    }
    
    if (options.cacheTTL !== undefined) {
      this.cacheTTL = options.cacheTTL;
    }
  }

  async getCompletion(messages: Message[]): Promise<string> {
    try {
      console.log("OpenAI Client: Sending request with messages:", messages.length);
      
      // Generate a cache key based on messages
      const cacheKey = this.getCacheKey(messages);
      
      // Check if we have a cached response
      if (this.enableCache) {
        const cachedCompletion = getCachedData<string>(cacheKey);
        if (cachedCompletion) {
          console.log('Using cached OpenAI completion');
          return cachedCompletion;
        }
      }
      
      // Get coffee context from Supabase or fallback to local data
      if (!this.coffeeContext) {
        this.coffeeContext = await this.getCoffeeContext();
      }
      
      // Add system message with coffee context if not already present
      const systemMessageExists = messages.some(msg => msg.role === 'system');
      const messagesWithContext = systemMessageExists ? messages : [
        {
          role: 'system',
          content: this.coffeeContext
        },
        ...messages
      ];
      
      // Measure API call performance
      const endMeasure = measureQueryPerformance('openai-api-call');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messagesWithContext,
          temperature: 0.7,
        }),
      });

      // End performance measurement
      endMeasure();

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (${response.status}):`, errorText);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("OpenAI response received successfully");
      const completion = data.choices[0].message.content;
      
      // Cache the result if caching is enabled
      if (this.enableCache) {
        cacheData(cacheKey, completion, this.cacheTTL);
      }
      
      return completion;
    } catch (error) {
      console.error("Error in OpenAI API call:", error);
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
    
    return `openai:${hashCode(messagesString)}`;
  }
  
  private async getCoffeeContext(): Promise<string> {
    // Measure database query performance
    const endMeasure = measureQueryPerformance('get-coffee-context');
    
    try {
      // Check if we have a cached context
      const cachedContext = getCachedData<string>('coffee-context');
      if (cachedContext) {
        endMeasure();
        return cachedContext;
      }
      
      // Try to get coffee data from Supabase, focusing on description column
      const { data: products, error } = await supabase
        .from('amokka_products')
        .select('name, description, overall_description, roast_level, flavor_notes, url')
        .eq('is_verified', true);
      
      endMeasure();
      
      if (error) {
        console.error("Error fetching from Supabase:", error);
        return this.buildLocalCoffeeContext();
      }
      
      if (!products || products.length === 0) {
        console.warn("No products found in Supabase, using local data");
        return this.buildLocalCoffeeContext();
      }
      
      console.log(`Found ${products.length} products in Supabase`);
      
      // Build context from Supabase data, emphasizing the description
      const context = `You are a helpful and knowledgeable coffee expert for Amokka Coffee. Use only the following product information to answer questions:

${products.map(coffee => `
Coffee: ${coffee.name}
Description: ${coffee.description || coffee.overall_description || ''}
Roast Level: ${coffee.roast_level || 'Not specified'}
Flavor Notes: ${Array.isArray(coffee.flavor_notes) ? coffee.flavor_notes.join(', ') : 'Not specified'}
URL: ${coffee.url}
---`).join('\n')}

When discussing coffees, always refer to specific products from the list above. If asked about a coffee or feature not in the list, politely explain that you can only discuss the coffees we currently offer. Don't make up information that's not in the product list. Be especially accurate about which coffees are organic - only mention a coffee as organic if it's explicitly stated in the description. If you don't know the answer, simply say so.`;
      
      // Cache the context for 1 hour
      cacheData('coffee-context', context, 60 * 60 * 1000);
      
      return context;
    } catch (error) {
      console.error("Error in getCoffeeContext:", error);
      endMeasure();
      return this.buildLocalCoffeeContext();
    }
  }
  
  private buildLocalCoffeeContext(): string {
    // Fallback to local coffee data
    console.log("Using local coffee data as fallback");
    return `You are a helpful and knowledgeable coffee expert for Amokka Coffee. Use only the following product information to answer questions:

${COFFEES.map(coffee => `
Coffee: ${coffee.name}
Description: ${coffee.description}
Roast Level: ${coffee.roastLevel}/6 (where 1 is lightest, 6 is darkest)
Flavor Notes: ${coffee.flavorNotes.join(', ')}
URL: ${coffee.url}
---`).join('\n')}

When discussing coffees, always refer to specific products from the list above. If asked about a coffee or feature not in the list, politely explain that you can only discuss the coffees we currently offer. Don't make up information that's not in the product list. Be especially accurate about which coffees are organic - only mention the Treehugger Organic Blend as organic since it's our only certified organic coffee. If you don't know the answer, simply say so.

Important facts:
- Treehugger Organic Blend is our only certified organic coffee
- Roast levels range from 1 (lightest) to 6 (darkest)
- The Ethiopia Haji Suleiman is our lightest roast (level 2), with bright fruity and floral notes
- The Gorgona and Sombra are our darkest roasts (level 6)`;
  }
}
