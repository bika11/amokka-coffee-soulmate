
import { AIClient, Message } from "@/interfaces/ai-client.interface";
import { supabase } from "@/integrations/supabase/client";

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
 * Gemini Client implementation
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
 * Mock AI client for testing without real API calls
 * This provides a fallback when edge functions aren't working
 */
class MockAIClient implements AIClient {
  async getCompletion(messages: Message[]): Promise<string> {
    console.log("Using mock AI client as fallback");
    const userMessage = messages[messages.length - 1].content;
    
    // Generate simple responses based on keywords in the user's message
    if (userMessage.toLowerCase().includes("coffee")) {
      return "I love coffee! Our Amokka Coffee Selection includes various roasts from light to dark, with options like Ethiopia Haji Suleiman for fruity notes or Indonesia Mandheling for a bold earthy flavor.";
    } else if (userMessage.toLowerCase().includes("recommend")) {
      return "Based on general preferences, I'd recommend trying our Ethiopia Haji Suleiman if you enjoy fruity notes, or Indonesia Mandheling if you prefer earthy tones. For specific recommendations, please share your taste preferences.";
    } else if (userMessage.toLowerCase().includes("price") || userMessage.toLowerCase().includes("cost")) {
      return "Our coffee prices range from $14.99 to $24.99 depending on the origin and roast level. We also offer subscription options that can save you 10-15% on recurring orders.";
    } else if (userMessage.toLowerCase().includes("hi") || userMessage.toLowerCase().includes("hello")) {
      return "Hello! I'm your Amokka Coffee assistant. How can I help you today? Would you like to learn about our coffee selection or brewing methods?";
    } else {
      return "I'm here to help with all your coffee questions! Feel free to ask about our different coffees, brewing methods, or recommendations based on your taste preferences.";
    }
  }
}

/**
 * Factory function to create the appropriate AI client
 * Defaults to using the environment configuration when running on Edge Functions
 * @param type Optional: Force a specific client type
 * @param apiKey Optional: Provide an API key directly instead of using environment variables
 * @returns An instance of AIClient
 */
export function createAIClient(type?: 'openai' | 'gemini', apiKey?: string): AIClient {
  // When running in browser context with Supabase
  if (typeof window !== 'undefined') {
    return {
      async getCompletion(messages: Message[]): Promise<string> {
        try {
          console.log("Starting AI completion request with messages:", messages.length);
          
          // Using the Supabase client directly for edge function invocation
          const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
            body: {
              message: messages[messages.length - 1].content,
              history: messages.slice(0, -1)
            }
          });
          
          if (error) {
            console.error("Supabase edge function error:", error);
            // Fall back to the mock client when the edge function fails
            const mockClient = new MockAIClient();
            return mockClient.getCompletion(messages);
          }
          
          console.log("Edge function response received:", data);
          
          if (data && data.response) {
            return data.response;
          } else {
            console.warn("No valid response from edge function, using fallback");
            const mockClient = new MockAIClient();
            return mockClient.getCompletion(messages);
          }
        } catch (error) {
          console.error("Error calling edge function:", error);
          // Fall back to the mock client when errors occur
          const mockClient = new MockAIClient();
          return mockClient.getCompletion(messages);
        }
      }
    };
  }
  
  // When running in Edge Function context
  // This code path only executes in the Edge Function
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
