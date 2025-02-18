
import { useState } from "react";
import { useCoffeeRecommendations } from "@/hooks/useCoffeeRecommendations";
import { CoffeeRecommendationForm } from "@/components/CoffeeRecommendationForm";
import { CoffeeRecommendation } from "@/components/CoffeeRecommendation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const {
    currentCoffee,
    isLoading,
    getRecommendation,
    reset,
    tryAnother,
  } = useCoffeeRecommendations();

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="w-full flex items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentCoffee ? (
          <CoffeeRecommendation
            coffee={currentCoffee}
            onReset={reset}
            onTryAnother={tryAnother}
          />
        ) : showForm ? (
          <CoffeeRecommendationForm
            onGetRecommendation={getRecommendation}
            isLoading={isLoading}
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl font-medium leading-tight tracking-tighter mb-4">
              Take the quiz and let us introduce you to your perfect coffee match.
            </h1>
            <Button 
              size="lg"
              onClick={() => setShowForm(true)}
              className="text-lg"
            >
              Take the quiz
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
