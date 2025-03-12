
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionParams {
  messages: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  contextLimit?: number;
}

export interface AICompletionResult {
  completion: string;
  model: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  duration?: number;
}

export interface AIPrompt {
  id: string;
  version: string;
  content: string;
  description?: string;
}

export interface AIClient {
  /**
   * Gets a completion from an AI model based on the provided messages
   * @param params Completion parameters including messages array
   * @returns Promise resolving to the AI's completion result
   */
  getCompletion(params: AICompletionParams): Promise<AICompletionResult>;
  
  /**
   * Gets the AI client name/type
   */
  getClientType(): string;
}
