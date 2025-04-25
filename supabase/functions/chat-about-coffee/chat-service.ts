
import { ChatCompletionRequestMessage } from "./types.ts";

interface ModelConfig {
  apiKey: string;
  endpoint: string;
  headers: Record<string, string>;
  buildRequestBody: (prompt: string) => any;
  extractCompletion: (response: any) => string;
}

export class ChatService {
  private apiKey: string;
  private modelType: 'gemini' | 'openai';

  constructor(modelType: 'gemini' | 'openai' = 'gemini') {
    this.modelType = modelType;
    
    // Get API key based on model type
    if (this.modelType === 'gemini') {
      const apiKey = Deno.env.get("GEMINI_API_KEY");
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }
      this.apiKey = apiKey;
    } else {
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set");
      }
      this.apiKey = apiKey;
    }
  }

  private getModelConfig(): ModelConfig {
    if (this.modelType === 'gemini') {
      return {
        apiKey: this.apiKey,
        endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`,
        headers: {
          "Content-Type": "application/json",
        },
        buildRequestBody: (prompt: string) => ({
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
        extractCompletion: (data: any) => {
          if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("Unexpected response structure from Gemini API");
          }
          return data.candidates[0].content.parts[0].text;
        }
      };
    } else {
      return {
        apiKey: this.apiKey,
        endpoint: "https://api.openai.com/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        buildRequestBody: (prompt: string) => ({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a coffee expert assistant." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024
        }),
        extractCompletion: (data: any) => {
          if (!data.choices?.[0]?.message?.content) {
            throw new Error("Unexpected response structure from OpenAI API");
          }
          return data.choices[0].message.content;
        }
      };
    }
  }

  async getCompletion(messages: ChatCompletionRequestMessage[]): Promise<string> {
    // Convert chat history to format compatible with both models
    const prompt = messages.map(msg => {
      if (msg.role === 'system') {
        return `Context: ${msg.content}\n\n`;
      }
      return msg.role === 'user' ? 
        `Human: ${msg.content}\n` : 
        `Assistant: ${msg.content}\n`;
    }).join('');

    try {
      console.log(`Sending request to ${this.modelType.toUpperCase()} API`);
      
      const config = this.getModelConfig();
      
      const response = await fetch(
        config.endpoint,
        {
          method: "POST",
          headers: config.headers,
          body: JSON.stringify(config.buildRequestBody(prompt)),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${this.modelType.toUpperCase()} API error (${response.status}):`, errorText);
        throw new Error(`Error getting completion: ${response.statusText}`);
      }

      const data = await response.json();
      return config.extractCompletion(data);
      
    } catch (error) {
      console.error(`Error in ${this.modelType.toUpperCase()} API call:`, error);
      throw error;
    }
  }
}
