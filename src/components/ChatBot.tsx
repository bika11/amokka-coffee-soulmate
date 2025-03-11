
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatButton } from "./chat/ChatButton";
import { ChatContainer } from "./chat/ChatContainer";
import { ChatProvider } from "@/contexts/ChatContext";

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <ChatProvider>
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <ChatContainer onClose={handleCloseChat} />
            </motion.div>
          ) : (
            <ChatButton onClick={handleToggleChat} />
          )}
        </AnimatePresence>
      </div>
    </ChatProvider>
  );
};
