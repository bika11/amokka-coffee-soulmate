
import { useState, memo, useCallback } from "react";
import { useCoffeeRecommendations } from "@/contexts/CoffeeRecommendationContext";
import { CoffeeRecommendationForm } from "@/components/CoffeeRecommendationForm";
import { CoffeeRecommendation } from "@/components/CoffeeRecommendation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { StepTransition } from "@/components/recommendation-form/StepTransition";

const WelcomeScreen = memo(({ onStartQuiz }: { onStartQuiz: () => void }) => {
  return (
    <StepTransition className="text-center space-y-8 max-w-2xl mx-auto bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border/50">
      <div className="flex justify-center mb-6">
        <motion.img
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          src="/amokka-og.png"
          alt="Amokka Logo"
          className="h-24 w-auto"
        />
      </div>
      <h1 className="text-4xl font-medium leading-tight tracking-tighter">
        Take the quiz and let us introduce you to your perfect coffee match.
      </h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Button 
            size="lg"
            onClick={onStartQuiz}
            className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 transition-all duration-200"
          >
            Take the quiz
          </Button>
        </motion.div>
      </motion.div>
    </StepTransition>
  );
});

const Index = () => {
  const {
    currentCoffee,
    isLoading,
    getRecommendation,
    reset,
    tryAnother,
  } = useCoffeeRecommendations();

  const [showForm, setShowForm] = useState(false);
  
  const handleStartQuiz = useCallback(() => {
    setShowForm(true);
  }, []);

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
          <WelcomeScreen onStartQuiz={handleStartQuiz} />
        )}
      </div>
    </div>
  );
};

WelcomeScreen.displayName = "WelcomeScreen";
export default Index;
