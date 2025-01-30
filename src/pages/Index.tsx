import { useCoffeeRecommendations } from "@/hooks/useCoffeeRecommendations";
import { CoffeeRecommendationForm } from "@/components/CoffeeRecommendationForm";
import { CoffeeRecommendation } from "@/components/CoffeeRecommendation";

const Index = () => {
  const {
    currentCoffee,
    isLoading,
    getRecommendation,
    reset,
    tryAnother,
  } = useCoffeeRecommendations();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {currentCoffee ? (
        <CoffeeRecommendation
          coffee={currentCoffee}
          onReset={reset}
          onTryAnother={tryAnother}
        />
      ) : (
        <CoffeeRecommendationForm
          onGetRecommendation={getRecommendation}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Index;