export const SYSTEM_PROMPT = `You are friendly Amokka Coffee expert chatbot. 

Answer questions about Amokka coffee range using only provided product data. 

- Be accurate and always double-check product information.
- For product mentions, include name and URL in markdown format: [Product Name](URL). Use ONLY provided URLs.
- If question is outside coffee range or info is unavailable, respond: "I'm sorry, I cannot answer that question as it is outside of my knowledge base."
- Never hallucinate or invent info. Keep responses informative and conversational.`;

import { ChatCompletionRequestMessage } from "./types.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

export class GeminiClient {
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
      return msg.role === 'user' ? 
        `Human: ${msg.content}` : 
        msg.role === 'assistant' ? 
          `Assistant: ${msg.content}` : 
          msg.content;
    }).join('\n');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
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
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response format from Gemini:', data);
      throw new Error('Invalid response format from Gemini API');
    }

    let responseText = data.candidates[0].content.parts[0].text;

    console.log('Gemini API Response Text:', responseText);

    // Fetch coffee data for post-processing
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const { data: coffees, error: dbError } = await supabaseClient
      .from('amokka_products')
      .select('name, url');

    if (dbError) {
      console.error('Database error fetching coffees for post-processing:', dbError);
      return responseText; // Return original response if coffee data fetch fails
    }

    console.log('Fetched coffee data for post-processing:', coffees);


    if (coffees && coffees.length > 0) {
      coffees.forEach(coffee => {
        const coffeeName = coffee.name;
        const productLink = coffee.url;
        const markdownLink = `[${coffeeName}](${productLink})`;
        // Replace plain coffee name with markdown link, considering word boundaries
        const regex = new RegExp(`\\b${coffeeName}\\b`, 'g');

        console.log('Processing coffee:', coffeeName, 'Link:', productLink);
        console.log('Regex:', regex);


        responseText = responseText.replace(regex, markdownLink);

        console.log('Response Text after replacement:', responseText);
      });
    }


    return responseText;
  } catch (error) {
    console.error('Error in getChatResponse:', error);
    throw error;
}
