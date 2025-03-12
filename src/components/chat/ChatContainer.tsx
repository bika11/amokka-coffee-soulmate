
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatSettings } from "./ChatSettings";
import { LoadingDots } from "./LoadingDots";
import { useChat } from "@/contexts/ChatContext";

interface ChatContainerProps {
  onClose: () => void;
}

export const ChatContainer = ({ onClose }: ChatContainerProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const { messages, input, setInput, isLoading, sendMessage } = useChat();

  return (
    <Card className="w-80 h-96 flex flex-col shadow-lg animate-fade-in">
      <ChatHeader onClose={onClose}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowSettings(!showSettings)}
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </ChatHeader>
      
      {showSettings ? (
        <ChatSettings onClose={() => setShowSettings(false)} />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} content={message.content} isUser={message.role === "user"} />
            ))}
            {isLoading && <LoadingDots />}
          </div>
          <ChatInput
            input={input}
            setInput={setInput}
            handleSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </>
      )}
    </Card>
  );
};
