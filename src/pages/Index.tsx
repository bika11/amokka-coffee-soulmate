import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  COFFEES,
  type Coffee,
  type DrinkStyle,
  type BrewMethod,
  type FlavorNote,
} from "@/lib/coffee-data";
import { findBestCoffeeMatch } from "@/utils/coffee-scoring";
import { CoffeeRecommendationForm } from "@/components/CoffeeRecommendationForm";
import { CoffeeRecommendation } from "@/components/CoffeeRecommendation";

const Index = () => {
  const [recommendation, setRecommendation] = useState<Coffee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendation = async ({
    drinkStyle,
    roastLevel,
    selectedFlavors,
    brewMethod,
  }: {
    drinkStyle: DrinkStyle;
    roastLevel: number;
    selectedFlavors: FlavorNote[];
    brewMethod: BrewMethod;
  }) => {
    setIsLoading(true);
    try {
      const preferences = `I like coffee that is ${
        drinkStyle === "Straight up" ? "black" : "with milk"
      }, roast level ${roastLevel}/6, and I enjoy ${selectedFlavors.join(
        ", "
      )} flavors. I brew using ${brewMethod?.toLowerCase()}.`;

      const { data, error } = await supabase.functions.invoke(
        "get-coffee-recommendation",
        {
          body: { preferences },
        }
      );

      if (error) throw error;

      const recommendedCoffee = COFFEES.find(
        (coffee) => coffee.name === data.recommendation
      );

      if (!recommendedCoffee) {
        throw new Error("Coffee not found in database");
      }

      setRecommendation(recommendedCoffee);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to get recommendation. Please try again.",
        variant: "destructive",
      });
      // Fallback to existing recommendation logic
      const recommendedCoffee = findBestCoffeeMatch(
        COFFEES,
        drinkStyle,
        roastLevel,
        selectedFlavors
      );
      setRecommendation(recommendedCoffee);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRecommendation(null);
  };

  const handleTryAnother = (currentCoffee: Coffee): Coffee => {
    // Get all coffees except the current one
    const remainingCoffees = COFFEES.filter(coffee => coffee.name !== currentCoffee.name);
    
    // Find the best match among remaining coffees using the same criteria
    return findBestCoffeeMatch(
      remainingCoffees,
      currentCoffee.milk_compatible ? "With milk" : "Straight up",
      currentCoffee.roastLevel,
      currentCoffee.flavorNotes,
      currentCoffee // Pass current coffee to exclude it
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {recommendation ? (
        <CoffeeRecommendation
          coffee={recommendation}
          onReset={handleReset}
          onTryAnother={handleTryAnother}
        />
      ) : (
        <CoffeeRecommendationForm
          onGetRecommendation={handleGetRecommendation}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Index;