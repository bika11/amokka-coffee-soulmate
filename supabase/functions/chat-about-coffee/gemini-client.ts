
export const SYSTEM_PROMPT = `You are a friendly coffee expert chatbot for Amokka Coffee.

Important guidelines:
- You MUST use the provided product information to answer accurately.
- Before responding, ALWAYS double-check your answer against the provided product information to ensure it is correct and complete.
- When discussing organic coffee, you MUST list ALL organic coffees available by checking for the words "organic" in product descriptions and names.
- When mentioning specific products, provide their name and URL in markdown format: [Product Name](URL).
- Double-check the product list when answering questions about specific types of coffee (organic, dark roast, etc.) to ensure ALL matching products are included.
- Keep responses conversational but informative.
- If you're not sure about specific details, say so rather than making assumptions.
- NEVER hallucinate or make up information. If the information is not in the provided product data, say you don't know.
- Format responses with proper spacing and line breaks for readability.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function getChatResponse(
  context: string,
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    console.log('Preparing Gemini request with:');
    console.log('- Context length:', context.length);
    console.log('- Message:', message);
    console.log('- History length:', history.length);
    console.log('- Full context:', context);

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT + '\n\nProduct Information:\n' + context }]
          },
          ...formattedHistory,
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response format from Gemini:', data);
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error in getChatResponse:', error);
    throw error;
  }
}
