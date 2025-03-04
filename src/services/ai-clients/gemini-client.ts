
import { AIClient, Message } from "@/interfaces/ai-client.interface";
import { supabase } from "@/integrations/supabase/client";
import { COFFEES } from "@/lib/coffee-data";

/**
 * Gemini Client implementation
 */
export class GeminiClient implements AIClient {
  private apiKey: string;
  private coffeeContext: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompletion(messages: Message[]): Promise<string> {
    try {
      console.log("Gemini Client: Processing messages:", messages.length);
      
      // Get coffee context from Supabase or fallback to local data
      if (!this.coffeeContext) {
        this.coffeeContext = await this.getCoffeeContext();
      }
      
      // Build the prompt differently for Gemini
      let prompt = '';
      
      // Add system message with context first
      const systemMessageExists = messages.some(msg => msg.role === 'system');
      if (!systemMessageExists) {
        prompt += `System: ${this.coffeeContext}\n\n`;
      }
      
      // Convert chat history to Gemini format
      messages.forEach(msg => {
        if (msg.role === 'system') {
          prompt += `System: ${msg.content}\n\n`;
        } else if (msg.role === 'user') {
          prompt += `Human: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistant: ${msg.content}\n`;
        }
      });

      console.log("Gemini prompt prepared, sending request...");
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKey}`, {
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
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
      
      // Check if the response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error("Unexpected response structure from Gemini API:", JSON.stringify(data));
        throw new Error("Unexpected response structure from Gemini API");
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error in Gemini API call:", error);
      throw error;
    }
  }
  
  private async getCoffeeContext(): Promise<string> {
    try {
      // Try to get coffee data from Supabase, focusing on description column
      const { data: products, error } = await supabase
        .from('amokka_products')
        .select('name, description, overall_description, roast_level, flavor_notes, url')
        .eq('is_verified', true);
      
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
      return `You are a helpful and knowledgeable coffee expert for Amokka Coffee. Use only the following product information to answer questions:

${products.map(coffee => `
Coffee: ${coffee.name}
Description: ${coffee.description || coffee.overall_description || ''}
Roast Level: ${coffee.roast_level || 'Not specified'}
Flavor Notes: ${Array.isArray(coffee.flavor_notes) ? coffee.flavor_notes.join(', ') : 'Not specified'}
URL: ${coffee.url}
---`).join('\n')}

When discussing coffees, always refer to specific products from the list above. If asked about a coffee or feature not in the list, politely explain that you can only discuss the coffees we currently offer. Don't make up information that's not in the product list. Be especially accurate about which coffees are organic - only mention a coffee as organic if it's explicitly stated in the description. If you don't know the answer, simply say so.`;
    } catch (error) {
      console.error("Error in getCoffeeContext:", error);
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
