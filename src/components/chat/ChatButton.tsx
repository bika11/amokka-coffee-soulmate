import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatButtonProps {
  onClick: () => void;
  isBouncing: boolean;
}

export const ChatButton = ({ onClick, isBouncing }: ChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 ${
        isBouncing ? "animate-bounce" : ""
      }`}
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
};