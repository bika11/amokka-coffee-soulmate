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
    <div className="w-full flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto">
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
    </div>
  );
};

export default Index;