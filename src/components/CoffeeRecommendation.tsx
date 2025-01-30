import { Button } from "@/components/ui/button";
import { Coffee } from "@/lib/coffee-data";
import { ExternalLink, RefreshCw, Coffee as CoffeeIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChatBot } from "./ChatBot";

interface CoffeeRecommendationProps {
  coffee: Coffee;
  onReset: () => void;
  onTryAnother: () => Coffee;
}

export const CoffeeRecommendation = ({
  coffee,
  onReset,
  onTryAnother,
}: CoffeeRecommendationProps) => {
  const matchScore = Math.max(1, 10 - coffee.priority);
  const matchText = matchScore >= 8 
    ? "Perfect Match!" 
    : matchScore >= 6 
    ? "Great Match" 
    : "Good Match";
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-6">
        <CoffeeIcon className="w-8 h-8 text-primary" />
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{matchScore}/10</div>
          <div className="text-lg text-muted-foreground">{matchText}</div>
        </div>
      </div>
      
      <Card className="p-6 md:p-8 shadow-lg">
        <div className="relative">
          <div className="aspect-square w-full max-w-sm mx-auto mb-6 overflow-hidden rounded-xl">
            <img
              src={coffee.imageUrl}
              alt={coffee.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold mb-3">{coffee.name}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {coffee.description}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {coffee.flavorNotes.map((note) => (
              <span
                key={note}
                className="px-3 py-1.5 bg-primary/10 text-primary-foreground rounded-full text-sm font-medium"
              >
                {note}
              </span>
            ))}
          </div>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              asChild 
              className="w-full"
            >
              <a
                href={coffee.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <span>View Coffee</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            
            <Button
              onClick={() => onTryAnother()}
              variant="secondary"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Another Match
            </Button>
            
            <Button 
              onClick={onReset} 
              variant="outline" 
              className="w-full"
            >
              Start Over
            </Button>
          </div>
        </div>
      </Card>
      <ChatBot />
    </div>
  );
};