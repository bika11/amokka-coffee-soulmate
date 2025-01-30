import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatButtonProps {
  onClick: () => void;
  isBouncing: boolean;  // keeping this prop for compatibility but won't use bouncing
}

export const ChatButton = ({ onClick }: ChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="rounded-full h-14 w-14 shadow-lg bg-primary/90 hover:bg-primary transition-all duration-300 hover:shadow-xl hover:scale-105 group"
    >
      <MessageSquare className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
    </Button>
  );
};