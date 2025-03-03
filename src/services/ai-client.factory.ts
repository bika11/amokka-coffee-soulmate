
import { AIClient, Message } from "@/interfaces/ai-client.interface";
import { supabase } from "@/integrations/supabase/client";
import { COFFEES } from "@/lib/coffee-data";

/**
 * OpenAI Client implementation
 */
export class OpenAIClient implements AIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompletion(messages: Message[]): Promise<string> {
    try {
      console.log("OpenAI Client: Sending request with messages:", messages.length);
      
      // Add system message with coffee context if not already present
      const systemMessageExists = messages.some(msg => msg.role === 'system');
      const messagesWithContext = systemMessageExists ? messages : [
        {
          role: 'system',
          content: this.buildCoffeeContext()
        },
        ...messages
      ];
      
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (${response.status}):`, errorText);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("OpenAI response received successfully");
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error in OpenAI API call:", error);
      throw error;
    }
  }
  
  private buildCoffeeContext(): string {
    // Build a context string containing information about all the coffees
    return `You are a helpful and knowledgeable coffee expert for Amokka Coffee. Use only the following product information to answer questions:

${COFFEES.map(coffee => `
Coffee: ${coffee.name}
Description: ${coffee.description}
Roast Level: ${coffee.roastLevel}/6 (where 1 is lightest, 6 is darkest)
Flavor Notes: ${coffee.flavorNotes.join(', ')}
URL: ${coffee.url}
---`).join('\n')}

When discussing coffees, always refer to specific products from the list above. If asked about a coffee or feature not in the list, politely explain that you can only discuss the coffees we currently offer. Don't make up information that's not in the product list. If you don't know the answer, simply say so.

Important facts:
- Treehugger Organic Blend is our only certified organic coffee
- Roast levels range from 1 (lightest) to 6 (darkest)
- The Ethiopia Haji Suleiman is our lightest roast (level 2), with bright fruity and floral notes
- The Gorgona and Sombra are our darkest roasts (level 6)`;
  }
}

/**
 * Gemini Client implementation
 */
export class GeminiClient implements AIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompletion(messages: Message[]): Promise<string> {
    try {
      console.log("Gemini Client: Processing messages:", messages.length);
      
      // Add system instructions with coffee context if not already present
      const systemMessageExists = messages.some(msg => msg.role === 'system');
      
      // Build the prompt differently for Gemini
      let prompt = '';
      
      // Add system message with context first if needed
      if (!systemMessageExists) {
        prompt += `System: ${this.buildCoffeeContext()}\n\n`;
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
  
  private buildCoffeeContext(): string {
    // Build a context string containing information about all the coffees
    return `You are a helpful and knowledgeable coffee expert for Amokka Coffee. Use only the following product information to answer questions:

${COFFEES.map(coffee => `
Coffee: ${coffee.name}
Description: ${coffee.description}
Roast Level: ${coffee.roastLevel}/6 (where 1 is lightest, 6 is darkest)
Flavor Notes: ${coffee.flavorNotes.join(', ')}
URL: ${coffee.url}
---`).join('\n')}

When discussing coffees, always refer to specific products from the list above. If asked about a coffee or feature not in the list, politely explain that you can only discuss the coffees we currently offer. Don't make up information that's not in the product list. If you don't know the answer, simply say so.

Important facts:
- Treehugger Organic Blend is our only certified organic coffee
- Roast levels range from 1 (lightest) to 6 (darkest)
- The Ethiopia Haji Suleiman is our lightest roast (level 2), with bright fruity and floral notes
- The Gorgona and Sombra are our darkest roasts (level 6)`;
  }
}

/**
 * Factory function to create the appropriate AI client
 * @param type Optional: Force a specific client type
 * @param apiKey Optional: Provide an API key directly instead of using environment variables
 * @returns An instance of AIClient
 */
export function createAIClient(type?: 'openai' | 'gemini', apiKey?: string): AIClient {
  // When running in browser context, we need to handle API keys differently
  if (typeof window !== 'undefined') {
    // For direct API calls, we need to check for API keys in localStorage
    const savedApiKey = localStorage.getItem('aiApiKey');
    const savedApiType = localStorage.getItem('aiApiType') as 'openai' | 'gemini' | null;
    
    // Use provided params, saved preferences, or default to OpenAI
    const clientType = type || savedApiType || 'openai';
    const clientApiKey = apiKey || savedApiKey || '';
    
    if (!clientApiKey) {
      console.error("No API key available for direct API calls");
      throw new Error("No API key provided for AI client. Please configure an API key in the settings.");
    }
    
    console.log(`Creating direct ${clientType} client`);
    return clientType === 'gemini' ? 
      new GeminiClient(clientApiKey) : 
      new OpenAIClient(clientApiKey);
  }
  
  // This code path only executes in Node.js context (not in browser)
  if (type === 'gemini' || (!type && process.env.GEMINI_API_KEY)) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    return new GeminiClient(key);
  } else {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    return new OpenAIClient(key);
  }
}
