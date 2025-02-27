
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIClient {
  /**
   * Gets a completion from an AI model based on the provided messages
   * @param messages Array of message objects with role and content
   * @returns Promise resolving to the AI's response text
   */
  getCompletion(messages: Message[]): Promise<string>;
}
