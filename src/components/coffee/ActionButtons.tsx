
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface ActionButtonsProps {
  url: string;
  onTryAnother: () => void;
  onReset: () => void;
}

export const ActionButtons = ({ url, onTryAnother, onReset }: ActionButtonsProps) => {
  return (
    <div className="flex flex-col gap-4 pt-6">
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <Button 
          asChild 
          className="w-full text-lg py-6 font-semibold bg-primary hover:bg-primary/90 transition-all duration-200"
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2"
          >
            <span>View Coffee</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </Button>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <Button
          onClick={() => onTryAnother()}
          variant="secondary"
          className="w-full py-6 text-lg font-medium hover:bg-secondary/80 transition-all duration-200"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Try Another Match
        </Button>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <Button 
          onClick={onReset} 
          variant="outline" 
          className="w-full py-6 text-lg font-medium hover:bg-accent/10 transition-all duration-200"
        >
          Start Over
        </Button>
      </motion.div>
    </div>
  );
};
