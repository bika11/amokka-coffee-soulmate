import { ChatError } from "./error-handler.ts";
import { ERROR_MESSAGES, HTTP_STATUS } from "./constants.ts";

import { ChatCompletionRequestMessage } from "./types.ts";

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}


export function validateChatRequest(data: unknown): ChatRequest {
  if (!data || typeof data !== 'object') {
    throw new ChatError('Invalid request data', HTTP_STATUS.BAD_REQUEST);
  }

  const request = data as ChatRequest;

  if (!request.message || typeof request.message !== 'string') {
    throw new ChatError(ERROR_MESSAGES.INVALID_REQUEST, HTTP_STATUS.BAD_REQUEST);
  }

  if (request.history && !Array.isArray(request.history)) {
    throw new ChatError(ERROR_MESSAGES.INVALID_REQUEST, HTTP_STATUS.BAD_REQUEST);
  }

  return request;
}
