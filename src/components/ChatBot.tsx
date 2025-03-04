
import { useState, useEffect } from "react";
import { ChatContainer } from "./chat/ChatContainer";
import { ChatButton } from "./chat/ChatButton";
import { useChat } from "@/hooks/useChat";

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { initializeChat } = useChat();

  const handleToggleChat = () => {
    if (!isOpen) {
      initializeChat();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="absolute bottom-4 right-4">
      {isOpen ? (
        <ChatContainer onClose={handleToggleChat} />
      ) : (
        <ChatButton onClick={handleToggleChat} isBouncing={false} />
      )}
    </div>
  );
};
