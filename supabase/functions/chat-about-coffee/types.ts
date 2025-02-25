
export interface ChatCompletionRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatCompletionRequestMessage[];
}

export interface AIResponse {
  response: string;
}
