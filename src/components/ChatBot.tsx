
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage } from "./chat/ChatMessage";
import { ChatInput } from "./chat/ChatInput";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatButton } from "./chat/ChatButton";
import { LoadingDots } from "./chat/LoadingDots";
import { Message } from "@/interfaces/ai-client.interface";
import { createAIClient } from "@/services/ai-client.factory";

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const aiClient = createAIClient();

  const handleToggleChat = () => {
    if (!isOpen) {
      setMessages([
        {
          content: "Hello! I'm your Amokka Coffee expert. Ask me anything about our delicious coffees!",
          role: "assistant",
        },
      ]);
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
  supabase.auth.getSession()
    .then(({ data: { session } }) => {
      const headers = session?.access_token ? { Authorization: `Bearer ${session?.access_token}` } : 'No session token';
      console.log("Invoking edge function with headers:", headers);
    });
  if (!input.trim()) return;

  const userMessage = input.trim();
  setInput("");
  setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);
  setIsLoading(true);

  try {
    // Use the AI client factory
    const updatedMessages = [
      ...messages,
      { content: userMessage, role: "user" as const }
    ];

    const response = await aiClient.getCompletion(updatedMessages);

    setMessages((prev) => [
      ...prev,
      { content: response, role: "assistant" },
    ]);
  } catch (error) {
    console.error("Error getting response:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "I apologize, but I'm having trouble responding right now. Please try again later.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="absolute bottom-4 right-4">
      {isOpen ? (
        <Card className="w-80 h-96 flex flex-col shadow-lg animate-fade-in">
          <ChatHeader onClose={handleToggleChat} />
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} content={message.content} isUser={message.role === "user"} />
            ))}
            {isLoading && <LoadingDots />}
          </div>
          <ChatInput
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </Card>
      ) : (
        <ChatButton onClick={handleToggleChat} isBouncing={false} />
      )}
    </div>
  );
};
