import { AIPrompt } from "@/interfaces/ai-client.interface";

// Central repository of all system prompts with versioning
const PROMPTS: Record<string, AIPrompt> = {
  'coffee-expert': {
    id: 'coffee-expert',
    version: '1.0.0',
    content: `You are a helpful and knowledgeable coffee expert for Amokka Coffee. Use only product information provided to answer questions.
When discussing coffees, always refer to specific products from the provided list. If asked about a coffee or feature not in the list, politely explain that you can only discuss the coffees we currently offer. Don't make up information. Be especially accurate about which coffees are organic - only mention a coffee as organic if it's explicitly stated in the description. If you don't know the answer, simply say so.`,
    description: 'Standard coffee expert system prompt'
  },
  'coffee-recommendation': {
    id: 'coffee-recommendation',
    version: '1.0.0',
    content: `You are a coffee recommendation assistant for Amokka Coffee. Your task is to recommend the most suitable coffee based on user preferences. Only recommend coffees from the provided product list. Focus on matching flavor profiles, roast levels, and brewing methods to user preferences. Provide brief explanations for your recommendations. If you're not confident in a recommendation, acknowledge this and suggest alternatives.`,
    description: 'Coffee recommendation system prompt'
  },
  'coffee-education': {
    id: 'coffee-education',
    version: '1.0.0',
    content: `You are a coffee education assistant for Amokka Coffee. Your purpose is to help users learn about coffee, brewing methods, and coffee terminology. Provide clear, concise, and accurate information about coffee. When discussing specific coffees, only refer to products from the Amokka Coffee catalog. Your tone should be friendly, approachable, and educational.`,
    description: 'Coffee education system prompt'
  }
};

export class PromptManager {
  /**
   * Get prompt by ID
   * @param promptId The prompt identifier
   * @returns The prompt object or undefined if not found
   */
  static getPrompt(promptId: string): AIPrompt | undefined {
    return PROMPTS[promptId];
  }
  
  /**
   * Get all available prompts
   * @returns Record of all prompts
   */
  static getAllPrompts(): Record<string, AIPrompt> {
    return {...PROMPTS};
  }
  
  /**
   * Format a context-aware system prompt by combining a base prompt with context
   * @param promptId The base prompt ID
   * @param context Additional context to append to the prompt
   * @returns Formatted prompt content
   */
  static formatContextPrompt(promptId: string, context: string): string {
    const basePrompt = this.getPrompt(promptId);
    if (!basePrompt) {
      throw new Error(`Prompt not found: ${promptId}`);
    }
    
    return `${basePrompt.content}\n\n${context}`;
  }
  
  /**
   * Optimize context to reduce token usage
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
      // We add a bit of buffer for the splitting/joining process
      const bufferChars = 200;
      const availableChars = estimatedMaxChars - bufferChars;
      
      let optimizedProducts: string[] = [];
      let currentLength = 0;
      
      for (const product of products) {
        if (currentLength + product.length + 3 <= availableChars) { // +3 for the "---"
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
