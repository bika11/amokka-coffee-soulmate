import { Coffee } from "@/lib/coffee-data";
import { Card } from "@/components/ui/card";
import { ChatBot } from "./ChatBot";
import { RecommendationScore } from "./coffee/RecommendationScore";
import { CoffeeImage } from "./coffee/CoffeeImage";
import { CoffeeDetails } from "./coffee/CoffeeDetails";
import { ActionButtons } from "./coffee/ActionButtons";

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
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <RecommendationScore matchScore={matchScore} />
      
      <Card className="p-8 shadow-xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm min-h-[600px] border-2">
        <CoffeeImage imageUrl={coffee.imageUrl} name={coffee.name} />
        
        <CoffeeDetails
          name={coffee.name}
          description={coffee.description}
          flavorNotes={coffee.flavorNotes}
        />
        
        <ActionButtons
          url={coffee.url}
          onTryAnother={onTryAnother}
          onReset={onReset}
        />
      </Card>
      <ChatBot />
    </div>
  );
};