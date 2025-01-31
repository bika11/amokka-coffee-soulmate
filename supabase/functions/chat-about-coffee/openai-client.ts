import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
  baseDelay = 2000
): Promise<Response> {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`OpenAI API call attempt ${attempt + 1}/${maxRetries}`);
      
      const response = await fetch(url, options);
      const responseText = await response.text();
      
      try {
        // Try to parse the response as JSON to check for API-level errors
        const responseData = JSON.parse(responseText);
        if (responseData.error) {
          console.error('OpenAI API error:', responseData.error);
          throw new Error(responseData.error.message || 'OpenAI API error');
        }
      } catch (parseError) {
        // If it's not JSON or parsing fails, continue with the original response
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      // If we got here, recreate the response with the body we already read
      return new Response(responseText, response);
      
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (response?.status === 429 || error.message?.includes('rate limit')) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limit hit, waiting ${delay}ms before retry...`);
        await sleep(delay);
        continue;
      }
      
      // For other types of errors, use a shorter delay
      if (attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(1.5, attempt);
        console.log(`Error occurred, waiting ${delay}ms before retry...`);
        await sleep(delay);
        continue;
      }
    }
  }
  
  console.error('All retry attempts failed. Last error:', lastError);
  throw new Error('Failed to get a response from OpenAI after multiple attempts. Please try again later.');
}

export async function getChatResponse(context: string, message: string): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const url = 'https://api.openai.com/v1/chat/completions';
  
  try {
    console.log('Starting chat response generation...');
    console.log('Context length:', context.length);
    console.log('User message:', message);
    
    const requestBody = {
      model: 'gpt-4o-mini',
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