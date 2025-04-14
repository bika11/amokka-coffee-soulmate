
import { supabase } from "@/integrations/supabase/client";
import { COFFEES } from "@/shared/coffee/models";

/**
 * Utility class for building coffee context for AI models
 */
export class CoffeeContextBuilder {
  /**
   * Builds coffee context from Supabase data or falls back to local data
   */
  static async buildContext(): Promise<string> {
    try {
      // Try to get coffee data from Supabase, focusing on description column
      const { data: products, error } = await supabase
        .from('amokka_products')
        .select('name, description, overall_description, roast_level, flavor_notes, url')
        .eq('is_verified', true);
      
      if (error) {
        console.error("Error fetching from Supabase:", error);
        return this.buildLocalContext();
      }
      
      if (!products || products.length === 0) {
        console.warn("No products found in Supabase, using local data");
        return this.buildLocalContext();
      }
      
      console.log(`Found ${products.length} products in Supabase`);
      
      // Build context from Supabase data, emphasizing the description
      return this.formatProductsContext(products);
    } catch (error) {
      console.error("Error in buildContext:", error);
      return this.buildLocalContext();
    }
  }
  
  /**
   * Formats Supabase product data into AI context
   */
  private static formatProductsContext(products: any[]): string {
    return `You are a helpful and knowledgeable coffee expert for Amokka Coffee. Use only the following product information to answer questions:

${products.map(coffee => `
Coffee: ${coffee.name}
Description: ${coffee.description || coffee.overall_description || ''}
Roast Level: ${coffee.roast_level || 'Not specified'}
Flavor Notes: ${Array.isArray(coffee.flavor_notes) ? coffee.flavor_notes.join(', ') : 'Not specified'}
URL: ${coffee.url}
---`).join('\n')}

When discussing coffees, always refer to specific products from the list above. If asked about a coffee or feature not in the list, politely explain that you can only discuss the coffees we currently offer. Don't make up information that's not in the product list. Be especially accurate about which coffees are organic - only mention a coffee as organic if it's explicitly stated in the description. If you don't know the answer, simply say so.`;
  }
  
  /**
   * Builds context from local coffee data
   */
  static buildLocalContext(): string {
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
