
import { ChatCompletionRequestMessage, AIResponse } from "./types.ts";
import { ChatError } from "./error-handler.ts";

/**
 * Service to interact with AI models (OpenAI and Gemini)
 */
export class AIService {
  private openaiApiKey: string | null;
  private geminiApiKey: string | null;

  constructor() {
    this.openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    this.geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!this.geminiApiKey && !this.openaiApiKey) {
      console.error("No AI API keys found in environment variables");
    }
  }

  /**
   * Get AI completion based on selected model
   */
  async getCompletion(
    messages: ChatCompletionRequestMessage[], 
    model = 'gemini',
    temperature = 0.7,
    maxTokens?: number
  ): Promise<AIResponse> {
    if (model === 'gemini' && this.geminiApiKey) {
      console.log("Using Gemini API for completion");
      return this.getGeminiCompletion(messages, temperature, maxTokens);
    } else if (model === 'openai' && this.openaiApiKey) {
      console.log("Using OpenAI API for completion");
      return this.getOpenAICompletion(messages, temperature, maxTokens);
    }
    
    throw new ChatError(`No API key available for ${model} model`, 401);
  }

  /**
   * Check if a specific model is available
   */
  isModelAvailable(model: string): boolean {
    if (model === 'gemini') {
      return !!this.geminiApiKey;
    } else if (model === 'openai') {
      return !!this.openaiApiKey;
    }
    return false;
  }

  /**
   * Get available fallback model if primary model is not available
   */
  getFallbackModel(primaryModel: string): string | null {
    if (primaryModel === 'openai' && this.geminiApiKey) {
      return 'gemini';
    } else if (primaryModel === 'gemini' && this.openaiApiKey) {
      return 'openai';
    }
    return null;
  }

  /**
   * OpenAI API client implementation with performance optimizations
   */
  async getOpenAICompletion(
    messages: ChatCompletionRequestMessage[],
    temperature = 0.7,
    maxTokens?: number
  ): Promise<AIResponse> {
    try {
      console.log("Sending request to OpenAI API (gpt-3.5-turbo)");
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (${response.status}):`, errorText);
        throw new ChatError(`OpenAI API error: ${response.statusText}`, response.status, errorText);
      }

      const data = await response.json();
      console.log("OpenAI response received successfully");
      
      // Extract token usage
      const tokens = data.usage ? {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens
      } : undefined;
      
      return {
        completion: data.choices[0].message.content,
        model: data.model,
        tokens
      };
    } catch (error) {
      console.error("Error in OpenAI API call:", error);
      if (error instanceof ChatError) {
        throw error;
      }
      throw new ChatError(error.message || "Error in OpenAI API call", 500);
    }
  }

  /**
   * Gemini API client implementation
   */
  async getGeminiCompletion(
    messages: ChatCompletionRequestMessage[], 
    temperature = 0.7,
    maxTokens?: number
  ): Promise<AIResponse> {
    try {
      // Build the prompt differently for Gemini
      let prompt = '';
      
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

      console.log("Sending request to Gemini API (gemini-1.5-pro)");
      
      // Use the correct Gemini API endpoint and model name for the latest API version
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.geminiApiKey}`, {
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
            temperature,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: maxTokens || 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error (${response.status}):`, errorText);
        throw new ChatError(`Gemini API error: ${response.statusText}`, response.status, errorText);
      }

      const data = await response.json();
      console.log("Gemini response received successfully");
      
      // Check if the response has the expected structure for the current API version
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error("Unexpected response structure from Gemini API:", JSON.stringify(data));
        throw new ChatError("Unexpected response structure from Gemini API", 500, JSON.stringify(data));
      }
      
      // Extract token usage if available
      const tokens = data.usageMetadata ? {
        prompt: data.usageMetadata.promptTokenCount || 0,
        completion: data.usageMetadata.candidatesTokenCount || 0,
        total: data.usageMetadata.totalTokens || 0
      } : undefined;
      
      return {
        completion: data.candidates[0].content.parts[0].text,
        model: 'gemini-1.5-pro',
        tokens
      };
    } catch (error) {
      console.error("Error in Gemini API call:", error);
      if (error instanceof ChatError) {
        throw error;
      }
      throw new ChatError(error.message || "Error in Gemini API call", 500);
    }
  }
}
