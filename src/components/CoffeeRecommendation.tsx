import { Button } from "@/components/ui/button";
import { Coffee } from "@/lib/coffee-data";
import { ExternalLink, RefreshCw } from "lucide-react";
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
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-primary mb-2">{matchScore}/10</div>
        <div className="text-xl font-medium text-muted-foreground">{matchText}</div>
      </div>
      
      <Card className="p-8 shadow-xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm min-h-[600px] border-2">
        <div className="relative">
          <div className="w-full h-[300px] mb-8 overflow-hidden rounded-xl bg-white shadow-inner">
            <img
              src={coffee.imageUrl}
              alt={coffee.name}
              className="w-full h-full object-contain bg-white transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
        
        <div className="space-y-8 text-center">
          <div>
            <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              {coffee.name}
            </h3>
            <p className="text-muted-foreground leading-relaxed mx-auto max-w-prose text-lg">
              {coffee.description}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {coffee.flavorNotes.map((note) => (
              <span
                key={note}
                className="px-4 py-2 bg-primary/10 text-primary-foreground rounded-full text-sm font-medium 
                          hover:bg-primary/20 transition-colors duration-200 cursor-default"
              >
                {note}
              </span>
            ))}
          </div>
          
          <div className="flex flex-col gap-4 pt-6">
            <Button 
              asChild 
              className="w-full text-lg py-6 font-semibold hover:scale-[1.02] transition-transform duration-200"
            >
              <a
                href={coffee.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <span>View Coffee</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            </Button>
            
            <Button
              onClick={() => onTryAnother()}
              variant="secondary"
              className="w-full py-6 text-lg font-medium hover:bg-secondary/80"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Another Match
            </Button>
            
            <Button 
              onClick={onReset} 
              variant="outline" 
              className="w-full py-6 text-lg font-medium hover:bg-accent/10"
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