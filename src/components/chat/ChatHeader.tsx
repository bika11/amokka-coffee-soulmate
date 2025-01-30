import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <div className="p-3 border-b bg-primary flex justify-between items-center">
      <span className="text-primary-foreground font-semibold">Coffee Expert</span>
      <Button variant="ghost" size="sm" onClick={onClose}>
        ✕
      </Button>
    </div>
  );
};