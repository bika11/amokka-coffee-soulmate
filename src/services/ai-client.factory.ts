
import { AIClient, Message } from "@/interfaces/ai-client.interface";
import { supabase } from "@/integrations/supabase/client";
import { COFFEES } from "@/lib/coffee-data";

/**
 * OpenAI Client implementation for server-side usage
 */
export class OpenAIClient implements AIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompletion(messages: Message[]): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error in OpenAI API call:", error);
      throw error;
    }
  }
}

/**
 * Gemini Client implementation for server-side usage
 */
export class GeminiClient implements AIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompletion(messages: Message[]): Promise<string> {
    // Convert chat history to Gemini format
    const prompt = messages.map(msg => {
      return msg.role === 'user' ? 
        `Human: ${msg.content}` : 
        msg.role === 'assistant' ? 
          `Assistant: ${msg.content}` : 
          msg.content;
    }).join('\n');

    try {
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
        console.error(`Gemini API error details: ${errorText}`);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      
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
}

/**
 * Client-side AI implementation that uses embedded knowledge about coffees
 */
class LocalAIClient implements AIClient {
  async getCompletion(messages: Message[]): Promise<string> {
    const userMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Create a context based on our coffee data
    const coffeeContext = COFFEES.map(coffee => 
      `${coffee.name}: ${coffee.description} (Roast Level: ${coffee.roastLevel}/6, Flavors: ${coffee.flavorNotes.join(', ')})`
    ).join('\n\n');
    
    // Generate a prompt that uses our embedded coffee knowledge
    const prompt = `
You are a helpful assistant for Amokka Coffee. Respond to the customer query using information about our available coffees:

${coffeeContext}

Customer query: ${userMessage}

Provide a helpful, concise response about our coffees based on this information. If appropriate, recommend specific coffees from our selection. If you don't know the answer to a specific question, suggest the customer contact us directly.

Your response should be friendly and conversational, but focus on providing accurate information about our coffees.
`;

    try {
      // Try to use the Supabase edge function
      const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
        body: { 
          message: prompt,
          isDirectPrompt: true 
        }
      });
      
      if (error) {
        console.error("Supabase edge function error:", error);
        // Fall back to local processing
        return this.generateLocalResponse(userMessage);
      }
      
      if (data && data.response) {
        return data.response;
      } else {
        console.warn("No valid response from edge function, using local processing");
        return this.generateLocalResponse(userMessage);
      }
    } catch (error) {
      console.error("Error calling edge function:", error);
      return this.generateLocalResponse(userMessage);
    }
  }
  
  private generateLocalResponse(userMessage: string): string {
    // Look for specific keywords and provide relevant responses
    if (userMessage.includes('recommend') || userMessage.includes('suggest')) {
      const topCoffees = COFFEES.filter(c => c.priority <= 3);
      return `Based on popularity, I'd recommend trying these coffees:\n\n${topCoffees.map(c => `**${c.name}**: ${c.description}`).join('\n\n')}`;
    }
    
    // Check for mentions of specific coffees
    for (const coffee of COFFEES) {
      if (userMessage.includes(coffee.name.toLowerCase())) {
        return `**${coffee.name}** is a great choice! ${coffee.description}\n\nIt has flavor notes of ${coffee.flavorNotes.join(', ')} with a ${coffee.roastLevel <= 2 ? 'light' : coffee.roastLevel <= 4 ? 'medium' : 'dark'} roast profile.`;
      }
    }
    
    // Check for flavor preferences
    const flavorMentions: Record<string, boolean> = {};
    for (const coffee of COFFEES) {
      for (const flavor of coffee.flavorNotes) {
        if (userMessage.includes(flavor.toLowerCase())) {
          flavorMentions[flavor] = true;
        }
      }
    }
    
    if (Object.keys(flavorMentions).length > 0) {
      const flavors = Object.keys(flavorMentions);
      const matchingCoffees = COFFEES.filter(coffee => 
        flavors.some(flavor => coffee.flavorNotes.includes(flavor as any))
      );
      
      if (matchingCoffees.length > 0) {
        return `For ${flavors.join(' and ')} flavors, these coffees would be perfect:\n\n${matchingCoffees.slice(0, 3).map(c => `**${c.name}**: ${c.description}`).join('\n\n')}`;
      }
    }
    
    // Default welcoming response
    return "Welcome to Amokka Coffee! We offer a range of specialty coffees with unique flavor profiles. You can ask about specific coffees, flavors you enjoy, or request recommendations based on your preferences. How can I help you find your perfect coffee?";
  }
}

/**
 * Factory function to create the appropriate AI client
 */
export function createAIClient(): AIClient {
  // In browser context, always use the local client
  if (typeof window !== 'undefined') {
    return new LocalAIClient();
  }
  
  // Server-side context (Edge Functions)
  if (process.env.GEMINI_API_KEY) {
    return new GeminiClient(process.env.GEMINI_API_KEY);
  } else if (process.env.OPENAI_API_KEY) {
    return new OpenAIClient(process.env.OPENAI_API_KEY);
  } else {
    throw new Error("No API keys found for AI services");
  }
}
