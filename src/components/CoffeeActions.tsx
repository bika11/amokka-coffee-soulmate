import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Coffee } from "@/lib/coffee-data";

interface CoffeeActionsProps {
  coffee: Coffee;
  onTryAnother: () => void;
  onReset: () => void;
}

export const CoffeeActions = ({ coffee, onTryAnother, onReset }: CoffeeActionsProps) => {
  return (
    <div className="pt-4 flex flex-col gap-3 items-center">
      <Button asChild className="w-full max-w-xs">
        <a
          href={coffee.product_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2"
        >
          <span>View Coffee</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </Button>
      <Button
        onClick={onTryAnother}
        variant="secondary"
        className="w-full max-w-xs"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        I've tried this coffee
      </Button>
      <Button 
        onClick={onReset} 
        variant="outline" 
        className="w-full max-w-xs"
      >
        Start Over
      </Button>
    </div>
  );
};