/**
 * Unified context builder for AI models that works across environments
 */
import { COFFEES } from "@/lib/coffee-data";

export class ContextBuilder {
  /**
   * Builds coffee context for AI from data source
   * @param dataSource Optional data source to use instead of default coffee data
   * @returns Formatted context string
   */
  static buildCoffeeContext(dataSource?: any[]): string {
    try {
      if (dataSource && Array.isArray(dataSource) && dataSource.length > 0) {
        return this.formatProductsContext(dataSource);
      }
      
      // Fall back to local coffee data
      return this.buildLocalContext();
    } catch (error) {
      console.error("Error in buildContext:", error);
      return this.buildLocalContext();
    }
  }
  
  /**
   * Formats product data into AI context
   * @param products Array of coffee products
   * @returns Formatted context string
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
   * @returns Formatted context string from local data
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
  
  /**
   * Optimizes context to reduce token usage
   * @param context The full context to optimize
   * @param maxTokens Maximum tokens to allow (approximate)
   * @returns Optimized context
   */
  static optimizeContext(context: string, maxTokens: number = 2000): string {
    // Simple estimation: ~4 chars per token
    const estimatedMaxChars = maxTokens * 4;
    
    if (context.length <= estimatedMaxChars) {
      return context;
    }
    
    // For product lists, we need to keep the structure but reduce the items
    if (context.includes('Coffee:') && context.includes('---')) {
      const products = context.split('---').filter(p => p.trim().length > 0);
      
      // Keep a subset of products that fit within our token budget
      const bufferChars = 200;
      const availableChars = estimatedMaxChars - bufferChars;
      
      let optimizedProducts: string[] = [];
      let currentLength = 0;
      
      for (const product of products) {
        if (currentLength + product.length + 3 <= availableChars) {
          optimizedProducts.push(product);
          currentLength += product.length + 3;
        } else {
          break;
        }
      }
      
      return optimizedProducts.join('---') + '---';
    }
    
    // For other contexts, truncate with a note
    return context.substring(0, estimatedMaxChars - 100) + 
      "\n\n[Note: Some content has been truncated to optimize performance]";
  }
}
