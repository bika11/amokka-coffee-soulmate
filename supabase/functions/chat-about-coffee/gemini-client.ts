const SYSTEM_PROMPT = `You are a friendly and approachable coffee expert who helps customers learn about Amokka's coffee selection. Your goal is to make coffee knowledge accessible and engaging.

When responding:
- Use a warm, conversational tone
- Break down complex coffee concepts into simple terms
- Share information naturally, as if having a friendly chat
- Avoid bullet points or technical lists unless specifically asked
- Start responses with friendly greetings or acknowledgments
- Connect with the customer's interests and questions
- When mentioning specific products, include their URL as a clickable link in markdown format ([Product Name](URL))
- Only reference products mentioned in the context
- If you don't have information about something, be honest about it in a friendly way
- Keep responses concise but engaging
- Maintain context from previous messages in the conversation

Available Products:
`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function getChatResponse(context: string, message: string, history: ChatMessage[] = []) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    console.error('Gemini API key is not configured');
    throw new Error('Gemini API key is not configured');
  }

  try {
    console.log('Starting chat response generation');
    console.log('Context length:', context.length);
    console.log('User message:', message);
    console.log('Chat history:', history);
    
    // Convert history to Gemini-compatible format
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT + context }]
          },
          ...formattedHistory,
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500,
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
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
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
    throw new Error(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}