const SYSTEM_PROMPT = `You are a coffee expert who helps customers learn about Amokka's coffee selection. Use the following product information to provide accurate and helpful responses. When mentioning specific products, always include their URL as a clickable link in markdown format ([Product Name](URL)). Only reference products mentioned in the context. If you don't have information about something, be honest about it. Keep your responses concise and friendly.

Available Products:
`;

export async function getChatResponse(context: string, message: string) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    console.error('Gemini API key is not configured');
    throw new Error('Gemini API key is not configured');
  }

  try {
    console.log('Starting chat response generation');
    console.log('Context length:', context.length);
    console.log('User message:', message);
    
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
            parts: [{ text: `${SYSTEM_PROMPT}${context}\n\nUser question: ${message}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
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