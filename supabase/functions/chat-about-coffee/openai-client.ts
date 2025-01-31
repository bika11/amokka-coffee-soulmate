const SYSTEM_PROMPT = `You are a coffee expert who helps customers learn about Amokka's coffee selection. Your responses should be friendly, concise, and focused on helping customers find their perfect coffee match. When mentioning specific products, include their URL as a markdown link ([Product Name](URL)).

Key guidelines:
- Keep responses under 3-4 sentences when possible
- Only reference products from the provided context
- Be honest if you don't have information about something
- Focus on being helpful and direct

Available Products:`;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to call OpenAI API`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      await sleep(1000 * Math.pow(2, attempt));
    }
  }
  
  throw new Error('Max retries reached');
}

export async function getChatResponse(context: string, message: string): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const url = 'https://api.openai.com/v1/chat/completions';
  
  try {
    console.log('Generating chat response...');
    
    const requestBody = {
      model: 'gpt-4o-mini',  // Changed from gpt-4 to gpt-4o-mini
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT + '\n\n' + context
        },
        { 
          role: 'user', 
          content: message 
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    };

    console.log('OpenAI Request:', JSON.stringify(requestBody, null, 2));

    const response = await fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    console.log('Successfully generated response:', generatedResponse);
    return generatedResponse;

  } catch (error) {
    console.error('Error in getChatResponse:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate response'
    );
  }
}