/// <reference types="deno-runtime" />
/// <reference types="deno-runtime" />
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
      console.log(`Attempt ${attempt + 1} to call OpenAI API`);
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        console.log(`Rate limited on attempt ${attempt + 1}, waiting ${waitTime}ms before retry`);
        await sleep(waitTime);
        waitTime *= 2; // Exponential backoff
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (${response.status}):`, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenAI API response structure:', JSON.stringify(data, null, 2));

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid response format from OpenAI:', data);
        throw new Error('Invalid response format from OpenAI API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        await sleep(waitTime);
        waitTime *= 2;
      }
    }
  }

  throw lastError || new Error('Failed to get response from OpenAI API');
}

export async function getChatResponse(context: string, message: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.error('OpenAI API key is not configured');
    throw new Error('OpenAI API key is not configured');
  }

  try {
    console.log('Sending request to OpenAI');
    console.log('Context length:', context.length);
    console.log('User message:', message);
    
    const requestBody = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT + context
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('OpenAI Request Body:', requestBody);

    const response = await fetchWithRetry(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
      }
    );

    console.log('OpenAI Response Status:', response.status);
    console.log('OpenAI Response Headers:', response.headers);
    const responseText = await response.text();
    console.log('OpenAI Response Text:', responseText);

    const responseData = await response.json();
    console.log('OpenAI Response Data:', JSON.stringify(responseData, null, 2));
    return responseData.choices[0].message.content;


  } catch (error) {
    console.error('Error in getChatResponse:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}
