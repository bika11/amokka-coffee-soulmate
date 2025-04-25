
import React, { createContext, useContext } from "react";
import { Message } from "@/shared/ai/types";
import { useChat as useBasicChat } from "@/hooks/useChat";

interface ChatContextType {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  sendMessage: () => Promise<void>;
  resetChat: () => void;
  apiSettings: {
    apiKey: string;
    apiType: 'openai' | 'gemini';
    useCustomKey: boolean;
  };
  updateApiSettings: (settings: {
    apiKey?: string;
    apiType?: 'openai' | 'gemini';
    useCustomKey?: boolean;
  }) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the dedicated hook for chat functionality
  const chat = useBasicChat();
  
  return (
    <ChatContext.Provider value={chat}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
