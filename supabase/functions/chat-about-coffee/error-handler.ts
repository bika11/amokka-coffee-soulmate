
export class ChatError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export function handleError(error: unknown) {
  console.error('Error in chat-about-coffee function:', error);
  
  if (error instanceof ChatError) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details
      }),
      { 
        status: error.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      }
    );
  }

  return new Response(
    JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      details: 'An unexpected error occurred while processing your request.'
    }),
    { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    }
  );
}
