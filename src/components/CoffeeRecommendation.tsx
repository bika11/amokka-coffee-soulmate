import { Coffee } from "@/lib/coffee-data";
import { Card } from "@/components/ui/card";
import { ChatBot } from "./ChatBot";
import { RecommendationScore } from "./coffee/RecommendationScore";
import { CoffeeImage } from "./coffee/CoffeeImage";
import { CoffeeDetails } from "./coffee/CoffeeDetails";
import { ActionButtons } from "./coffee/ActionButtons";
import { motion } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      <RecommendationScore matchScore={matchScore} />
      
      <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-2">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <CoffeeImage imageUrl={coffee.imageUrl} name={coffee.name} />
        </div>
        
        <div className="p-8 space-y-8">
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
        </div>
      </Card>
      <ChatBot />
    </motion.div>
  );
};