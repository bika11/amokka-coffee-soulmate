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
import { findBestCoffeeMatches } from "@/utils/coffee-scoring";
import { CoffeeRecommendationForm } from "@/components/CoffeeRecommendationForm";
import { CoffeeRecommendation } from "@/components/CoffeeRecommendation";

const Index = () => {
  const [recommendations, setRecommendations] = useState<Coffee[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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

      // Find the recommended coffee in our local data
      const recommendedCoffee = COFFEES.find(
        (coffee) => coffee.name === data.recommendation
      );

      if (!recommendedCoffee) {
        throw new Error("Coffee not found in database");
      }

      // Get top 2 matches as backup
      const topMatches = findBestCoffeeMatches(
        COFFEES,
        drinkStyle,
        roastLevel,
        selectedFlavors
      );

      // If we got a recommendation from the API, make it the first one
      const finalRecommendations = recommendedCoffee
        ? [recommendedCoffee, ...topMatches.filter(c => c.name !== recommendedCoffee.name)].slice(0, 2)
        : topMatches;

      setRecommendations(finalRecommendations);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to get recommendation. Using backup recommendations.",
        variant: "destructive",
      });
      // Fallback to existing recommendation logic
      const topMatches = findBestCoffeeMatches(
        COFFEES,
        drinkStyle,
        roastLevel,
        selectedFlavors
      );
      setRecommendations(topMatches);
      setCurrentIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRecommendations([]);
    setCurrentIndex(0);
  };

  const handleTryAnother = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendations.length);
    return recommendations[(currentIndex + 1) % recommendations.length];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {recommendations.length > 0 ? (
        <CoffeeRecommendation
          coffee={recommendations[currentIndex]}
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