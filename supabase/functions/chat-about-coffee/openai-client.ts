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
  maxRetries = 3,
  initialDelay = 2000
): Promise<Response> {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to call OpenAI API`);
      
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        console.log(`Rate limit hit on attempt ${attempt + 1}, waiting before retry...`);
        await sleep(initialDelay * Math.pow(2, attempt));
        continue;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        await sleep(initialDelay * Math.pow(2, attempt));
        continue;
      }
      
      throw new Error('OpenAI service is currently unavailable. Please try again in a few minutes.');
    }
  }
  
  throw lastError;
}

export async function getChatResponse(context: string, message: string): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const url = 'https://api.openai.com/v1/chat/completions';
  
  try {
    console.log('Generating chat response...');
    console.log('Context length:', context.length);
    console.log('User message:', message);
    
    const requestBody = {
      model: 'gpt-3.5-turbo',
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

    console.log('Making OpenAI request...');

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
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI response format:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const generatedResponse = data.choices[0].message.content;
    console.log('Successfully generated response');
    return generatedResponse;

  } catch (error) {
    console.error('Error in getChatResponse:', error);
    throw error;
  }
}