
import { ChatCompletionRequestMessage } from "./types.ts";

export class ChatService {
  private apiKey: string;

  constructor() {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    this.apiKey = apiKey;
  }

  async getCompletion(messages: ChatCompletionRequestMessage[]): Promise<string> {
    // Convert chat history to Gemini format
    const prompt = messages.map(msg => {
      if (msg.role === 'system') {
        return `Context: ${msg.content}\n\n`;
      }
      return msg.role === 'user' ? 
        `Human: ${msg.content}\n` : 
        `Assistant: ${msg.content}\n`;
    }).join('');

    try {
      console.log("Sending request to Gemini API");
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`,
        {
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
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error (${response.status}):`, errorText);
        throw new Error(`Error getting completion: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Unexpected response structure from Gemini API");
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error in Gemini API call:", error);
      throw error;
    }
  }
}
