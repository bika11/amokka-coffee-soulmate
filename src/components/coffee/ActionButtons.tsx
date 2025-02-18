
import { Button } from "@/components/ui/button";
import { ExternalLink, Redo } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <Button 
          className="flex-1 w-full transition-all duration-200" 
          size="lg"
          onClick={handleBuyClick}
        >
          Buy Now
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <Button
          variant="outline"
          size="lg"
          onClick={onTryAnother}
          className="flex-1 w-full transition-all duration-200"
        >
          Try Another
          <Redo className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <Button
          variant="ghost"
          size="lg"
          onClick={onReset}
          className="flex-1 w-full transition-all duration-200"
        >
          Start Over
        </Button>
      </motion.div>
    </div>
  );
};
