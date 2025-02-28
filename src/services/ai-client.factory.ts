
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
  private conversationContext: Message[] = [];
  
  // Analyze the conversation to maintain context and provide relevant responses
  private analyzeConversation(messages: Message[]): string {
    // Store the conversation for context tracking
    this.conversationContext = messages;
    
    // Get latest user message
    const userMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Check for organic coffee questions
    if (userMessage.includes('organic')) {
      // Find organic coffees in our inventory
      const organicCoffees = COFFEES.filter(coffee => 
        coffee.name.toLowerCase().includes('organic') ||
        coffee.description.toLowerCase().includes('organic')
      );
      
      if (organicCoffees.length > 0) {
        return `Yes, we do have organic coffee options! Here are our organic offerings:\n\n${organicCoffees.map(c => `**${c.name}**: ${c.description}`).join('\n\n')}\n\nOur Treehugger Organic Blend is especially popular among customers who prefer organic coffee.`;
      } else {
        return "Yes, we have the Treehugger Organic Blend which is certified organic. It features nutty and chocolate notes with a medium roast profile that makes it perfect for both espresso and filter brewing methods.";
      }
    }
    
    // Check for roast level questions
    if (userMessage.includes('light roast') || (userMessage.includes('light') && userMessage.includes('roast'))) {
      const lightRoasts = COFFEES.filter(coffee => coffee.roastLevel <= 2);
      return `For light roasts, we recommend:\n\n${lightRoasts.map(c => `**${c.name}**: ${c.description} (Roast Level: ${c.roastLevel}/6)`).join('\n\n')}`;
    }
    
    if (userMessage.includes('medium roast') || (userMessage.includes('medium') && userMessage.includes('roast'))) {
      const mediumRoasts = COFFEES.filter(coffee => coffee.roastLevel > 2 && coffee.roastLevel <= 4);
      return `For medium roasts, we recommend:\n\n${mediumRoasts.map(c => `**${c.name}**: ${c.description} (Roast Level: ${c.roastLevel}/6)`).join('\n\n')}`;
    }
    
    if (userMessage.includes('dark roast') || (userMessage.includes('dark') && userMessage.includes('roast'))) {
      const darkRoasts = COFFEES.filter(coffee => coffee.roastLevel > 4);
      return `For dark roasts, we recommend:\n\n${darkRoasts.map(c => `**${c.name}**: ${c.description} (Roast Level: ${c.roastLevel}/6)`).join('\n\n')}`;
    }
    
    // Check for origins questions
    if (userMessage.includes('ethiopia') || userMessage.includes('ethiopian')) {
      const ethiopianCoffees = COFFEES.filter(coffee => 
        coffee.name.toLowerCase().includes('ethiopia') || 
        coffee.description.toLowerCase().includes('ethiopia')
      );
      
      if (ethiopianCoffees.length > 0) {
        return `We offer these Ethiopian coffees:\n\n${ethiopianCoffees.map(c => `**${c.name}**: ${c.description}`).join('\n\n')}`;
      } else {
        return "Our Ethiopia Haji Suleiman is a light roast with bright fruity notes and floral characteristics, typical of high-quality Ethiopian coffees.";
      }
    }
    
    if (userMessage.includes('peru') || userMessage.includes('peruvian')) {
      const peruvianCoffees = COFFEES.filter(coffee => 
        coffee.name.toLowerCase().includes('peru') || 
        coffee.description.toLowerCase().includes('peru')
      );
      
      if (peruvianCoffees.length > 0) {
        return `We offer these Peruvian coffees:\n\n${peruvianCoffees.map(c => `**${c.name}**: ${c.description}`).join('\n\n')}`;
      }
    }
    
    if (userMessage.includes('indonesia') || userMessage.includes('indonesian') || userMessage.includes('mandheling')) {
      const indonesianCoffees = COFFEES.filter(coffee => 
        coffee.name.toLowerCase().includes('indonesia') || 
        coffee.description.toLowerCase().includes('indonesia')
      );
      
      if (indonesianCoffees.length > 0) {
        return `We offer these Indonesian coffees:\n\n${indonesianCoffees.map(c => `**${c.name}**: ${c.description}`).join('\n\n')}`;
      }
    }
    
    // Check for flavor questions
    if (userMessage.includes('flavor') || userMessage.includes('flavour') || 
        userMessage.includes('taste') || userMessage.includes('notes')) {
      // Check previous context to see if a specific coffee was mentioned
      let specificCoffee = null;
      
      for (let i = messages.length - 2; i >= 0; i--) {
        const prevMsg = messages[i].content.toLowerCase();
        for (const coffee of COFFEES) {
          if (prevMsg.includes(coffee.name.toLowerCase())) {
            specificCoffee = coffee;
            break;
          }
        }
        if (specificCoffee) break;
      }
      
      if (specificCoffee) {
        return `**${specificCoffee.name}** features flavor notes of ${specificCoffee.flavorNotes.join(', ')}. ${specificCoffee.description}`;
      }
    }
    
    // Check for greetings
    if (userMessage.includes('hi') || userMessage.includes('hello') || 
        userMessage.includes('hey') || userMessage.includes('morning') || 
        userMessage.includes('afternoon') || userMessage.includes('evening')) {
      return "Hello! I'm your Amokka Coffee assistant. I can help you find the perfect coffee based on your taste preferences. Are you looking for something specific like light roasts, dark roasts, or coffees with particular flavor notes?";
    }
    
    // Check for recommended/popular coffees
    if (userMessage.includes('recommend') || userMessage.includes('popular') || 
        userMessage.includes('best seller') || userMessage.includes('bestseller')) {
      const popularCoffees = COFFEES.filter(c => c.priority <= 3);
      return `Our most popular coffees are:\n\n${popularCoffees.map(c => `**${c.name}**: ${c.description}`).join('\n\n')}\n\nWould you like more details about any of these?`;
    }
    
    // Check for specific coffee mentions
    for (const coffee of COFFEES) {
      if (userMessage.includes(coffee.name.toLowerCase())) {
        return `**${coffee.name}** is a ${coffee.roastLevel <= 2 ? 'light' : coffee.roastLevel <= 4 ? 'medium' : 'dark'} roast with flavor notes of ${coffee.flavorNotes.join(', ')}. ${coffee.description}`;
      }
    }
    
    // Check for flavor profile mentions
    for (const coffee of COFFEES) {
      for (const flavor of coffee.flavorNotes) {
        if (userMessage.includes(flavor.toLowerCase())) {
          const matchingCoffees = COFFEES.filter(c => c.flavorNotes.includes(flavor));
          if (matchingCoffees.length > 0) {
            return `For ${flavor} flavor notes, I recommend:\n\n${matchingCoffees.map(c => `**${c.name}**: ${c.description}`).join('\n\n')}`;
          }
        }
      }
    }
    
    // Default response if no specific pattern is matched
    return "I'd be happy to help you find the perfect coffee! You can ask about our different roast levels (light, medium, dark), specific flavor profiles (chocolate, fruity, nutty, etc.), or our most popular options. What kind of coffee experience are you looking for?";
  }
  
  async getCompletion(messages: Message[]): Promise<string> {
    console.log("LocalAIClient processing messages:", messages.length);
    
    try {
      // First try the edge function
      const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
        body: { 
          messages: messages
        }
      });
      
      if (!error && data && data.response) {
        console.log("Edge function response received");
        return data.response;
      }
      
      // If edge function fails, fall back to local analysis
      console.log("Using local analysis fallback");
      return this.analyzeConversation(messages);
      
    } catch (error) {
      console.error("Error in AI processing:", error);
      // Fall back to local analysis
      console.log("Error occurred, using local analysis fallback");
      return this.analyzeConversation(messages);
    }
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
