const SYSTEM_PROMPT = `You are a coffee expert who helps customers learn about Amokka's coffee selection. Use the following product information to provide accurate and helpful responses. When mentioning specific products, always include their URL as a clickable link in markdown format ([Product Name](URL)). Only reference products mentioned in the context. If you don't have information about something, be honest about it. Keep your responses concise and friendly.

Available Products:
`;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let lastError;
  let waitTime = 1000; // Start with 1 second

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        console.log(`Rate limited on attempt ${attempt + 1}, waiting ${waitTime}ms before retry`);
        await sleep(waitTime);
        waitTime *= 2; // Exponential backoff
        continue;
      }

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        await sleep(waitTime);
        waitTime *= 2;
      }
    }
  }

  throw lastError;
}

export async function getChatResponse(context: string, message: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    console.log('Sending request to OpenAI with context length:', context.length);
    
    const response = await fetchWithRetry(
      'https://api.openai.com/v1/chat/completions',
      {
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
      }
    );

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in getChatResponse:', error);
    throw new Error(
      error.message.includes('429') 
        ? 'The service is currently busy. Please try again in a few moments.'
        : error.message
    );
  }
}