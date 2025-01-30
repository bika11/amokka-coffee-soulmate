const SYSTEM_PROMPT = `You are a coffee expert who helps customers learn about Amokka's coffee selection. Use the following product information to provide accurate and helpful responses. When mentioning specific products, always include their URL as a clickable link in markdown format ([Product Name](URL)). Only reference products mentioned in the context. If you don't have information about something, be honest about it. Keep your responses concise and friendly.

Available Products:
`;

export async function getChatResponse(context: string, message: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT + context
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get response from OpenAI');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}