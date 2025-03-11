
import { memo, useCallback } from "react";
import { Coffee } from "@/lib/coffee-data";
import { ChatBot } from "./ChatBot";
import { motion } from "framer-motion";
import { useCoffeeTracking } from "@/hooks/useCoffeeTracking";
import { MatchScore } from "./coffee/MatchScore";
import { CoffeeCard } from "./coffee/CoffeeCard";

interface CoffeeRecommendationProps {
  coffee: Coffee;
  onReset: () => void;
  onTryAnother: () => Coffee;
}

export const CoffeeRecommendation = memo(({
  coffee,
  onReset,
  onTryAnother,
}: CoffeeRecommendationProps) => {
  const matchScore = Math.max(1, 10 - coffee.priority);
  const { trackCoffeeClick } = useCoffeeTracking();

  const handleCoffeeClick = useCallback(() => {
    trackCoffeeClick(coffee.name);
    window.open(coffee.url, '_blank');
  }, [coffee.name, coffee.url, trackCoffeeClick]);
  
  const handleTryAnother = useCallback(() => {
    onTryAnother();
  }, [onTryAnother]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <MatchScore matchScore={matchScore} />
      
      <CoffeeCard 
        coffee={coffee}
        onTryAnother={handleTryAnother}
        onReset={onReset}
        onBuyClick={handleCoffeeClick}
      />
      
      <ChatBot />
    </motion.div>
  );
});

CoffeeRecommendation.displayName = "CoffeeRecommendation";
