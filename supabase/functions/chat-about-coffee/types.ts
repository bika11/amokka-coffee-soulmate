
export interface ChatCompletionRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatCompletionRequestMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  promptId?: string;
}

export interface AIResponse {
  completion: string;
  model: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  }
}

export interface PromptTemplate {
  id: string;
  version: string;
  content: string;
  description?: string;
}
