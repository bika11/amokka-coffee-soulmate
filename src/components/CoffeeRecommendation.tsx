import { Button } from "@/components/ui/button";
import { Coffee } from "@/lib/coffee-data";
import { ExternalLink, RefreshCw, Coffee as CoffeeIcon, Star } from "lucide-react";
import { useState } from "react";
import { ChatBot } from "./ChatBot";
import { Card } from "@/components/ui/card";

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
    <div className="space-y-6 text-center max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-center gap-2 mb-8">
        <CoffeeIcon className="w-6 h-6 text-primary" />
        <h2 className="text-3xl font-bold">Your Perfect Match</h2>
      </div>
      
      <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          <div className="w-64 h-64 mx-auto mb-6 overflow-hidden rounded-xl">
            <img
              src={currentCoffee.imageLink}
              alt={currentCoffee.name}
              className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
            />
          </div>
          <div className="absolute top-2 right-2">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
        
        <h3 className="text-2xl font-semibold mb-4">{currentCoffee.name}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {currentCoffee.description}
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {currentCoffee.flavorNotes.map((note) => (
            <span
              key={note}
              className="px-4 py-2 bg-primary/10 text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              {note}
            </span>
          ))}
        </div>
        
        <div className="space-y-3">
          <Button 
            asChild 
            className="w-full max-w-xs group hover:scale-105 transition-transform duration-200"
          >
            <a
              href={currentCoffee.productLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2"
            >
              <span>View Coffee</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          
          <Button
            onClick={handleTryAnother}
            variant="secondary"
            className="w-full max-w-xs group hover:bg-secondary/80"
          >
            <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Try Another Match
          </Button>
          
          <Button 
            onClick={onReset} 
            variant="outline" 
            className="w-full max-w-xs hover:bg-background/80"
          >
            Start Over
          </Button>
        </div>
      </Card>
      <ChatBot />
    </div>
  );
};