
import { Button } from "@/components/ui/button";
import { ExternalLink, Redo } from "lucide-react";

interface ActionButtonsProps {
  url: string;
  onTryAnother: () => void;
  onReset: () => void;
  onBuyClick?: () => void;
}

export const ActionButtons = ({
  url,
  onTryAnother,
  onReset,
  onBuyClick,
}: ActionButtonsProps) => {
  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBuyClick) {
      onBuyClick();
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button 
        className="flex-1" 
        size="lg"
        onClick={handleBuyClick}
      >
        Buy Now
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={onTryAnother}
        className="flex-1"
      >
        Try Another
        <Redo className="ml-2 h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="lg"
        onClick={onReset}
        className="flex-1"
      >
        Start Over
      </Button>
    </div>
  );
};
