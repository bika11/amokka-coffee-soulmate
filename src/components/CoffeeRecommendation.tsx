import { Button } from "@/components/ui/button";
import { Coffee } from "@/lib/coffee-data";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";

interface CoffeeRecommendationProps {
  coffee: Coffee;
  onReset: () => void;
  onTryAnother: (currentCoffee: Coffee) => Coffee;
}

export const CoffeeRecommendation = ({
  coffee,
  onReset,
  onTryAnother,
}: CoffeeRecommendationProps) => {
  const [currentCoffee, setCurrentCoffee] = useState<Coffee>(coffee);

  const handleTryAnother = () => {
    const nextCoffee = onTryAnother(currentCoffee);
    setCurrentCoffee(nextCoffee);
  };

  return (
    <div className="space-y-6 text-center animate-fade-in">
      <h2 className="text-2xl font-bold">Your Perfect Match</h2>
      <div className="bg-secondary p-6 rounded-lg space-y-4">
        <div className="w-48 h-48 mx-auto mb-4 overflow-hidden rounded-lg">
          <img
            src={currentCoffee.imageUrl}
            alt={currentCoffee.name}
            className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
          />
        </div>
        <h3 className="text-xl font-semibold">{currentCoffee.name}</h3>
        <p className="text-muted-foreground">{currentCoffee.description}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {currentCoffee.flavorNotes.map((note) => (
            <span
              key={note}
              className="px-3 py-1 bg-background rounded-full text-sm"
            >
              {note}
            </span>
          ))}
        </div>
        <div className="pt-4 flex flex-col gap-3 items-center">
          <Button asChild className="w-full max-w-xs">
            <a
              href={currentCoffee.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2"
            >
              <span>View Coffee</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
          <Button
            onClick={handleTryAnother}
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
      </div>
    </div>
  );
};