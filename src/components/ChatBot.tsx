
import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatButton } from "./chat/ChatButton";
import { ChatProvider } from "@/contexts/ChatContext";
import { measureRenderTime } from "@/utils/performance";

// Lazy load the ChatContainer
const ChatContainer = lazy(() => import("./chat/ChatContainer").then(module => ({ 
  default: module.ChatContainer 
})));

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleToggleChat = () => {
    if (!isOpen) {
      setIsLoading(true);
    }
    setIsOpen((prev) => !prev);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  // Measure component render time
  const endMeasure = measureRenderTime('ChatBot');
  
  useEffect(() => {
    if (isLoading && isOpen) {
      setIsLoading(false);
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    endMeasure();
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading]);

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
              <Suspense fallback={
                <div className="bg-background border rounded-lg shadow-lg p-4 w-[350px] h-[500px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }>
                <ChatContainer onClose={handleCloseChat} />
              </Suspense>
            </motion.div>
          ) : (
            <ChatButton onClick={handleToggleChat} isBouncing={false} />
          )}
        </AnimatePresence>
      </div>
    </ChatProvider>
  );
};
