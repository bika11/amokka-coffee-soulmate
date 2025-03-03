
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface ChatHeaderProps {
  onClose: () => void;
  children?: React.ReactNode;
}

export const ChatHeader = ({ onClose, children }: ChatHeaderProps) => {
  return (
    <div className="border-b p-3 flex items-center justify-between">
      <div className="font-semibold">Amokka Coffee Assistant</div>
      <div className="flex items-center space-x-2">
        {children}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
