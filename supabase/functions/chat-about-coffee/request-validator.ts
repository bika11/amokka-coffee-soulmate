
import { ChatError } from "./error-handler.ts";
import { ERROR_MESSAGES, HTTP_STATUS } from "./constants.ts";

export interface ChatRequest {
  message: string;
  history?: any[];
}

export function validateChatRequest(data: unknown): ChatRequest {
  if (!data || typeof data !== 'object') {
    throw new ChatError('Invalid request data', HTTP_STATUS.BAD_REQUEST);
  }

  const request = data as ChatRequest;

  if (!request.message || typeof request.message !== 'string') {
    throw new ChatError(ERROR_MESSAGES.INVALID_MESSAGE, HTTP_STATUS.BAD_REQUEST);
  }

  if (request.history && !Array.isArray(request.history)) {
    throw new ChatError(ERROR_MESSAGES.INVALID_HISTORY, HTTP_STATUS.BAD_REQUEST);
  }

  return request;
}
