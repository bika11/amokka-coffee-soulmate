
import { ChatRequest } from "./types.ts";
import { ChatError } from "./error-handler.ts";

export async function validateRequest(req: Request): Promise<ChatRequest> {
  try {
    const body = await req.json();
    
    if (!body.message || typeof body.message !== 'string') {
      throw new ChatError('Invalid message format', 400, 'Message must be a string');
    }

    const history = Array.isArray(body.history) ? body.history : [];
    
    return {
      message: body.message,
      history: history,
    };
  } catch (error) {
    throw new ChatError('Invalid request format', 400, error.message);
  }
}
