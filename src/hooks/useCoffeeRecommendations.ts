
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
import { findBestCoffeeMatches } from "@/utils/coffee-recommendation";

interface CoffeePreferences {
  drinkStyle: DrinkStyle;
  roastLevel: number;
  selectedFlavors: FlavorNote[];
  brewMethod: BrewMethod;
}

export const useCoffeeRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Coffee[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getRecommendation = async ({
    drinkStyle,
    roastLevel,
    selectedFlavors,
    brewMethod,
  }: CoffeePreferences) => {
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

      const topMatches = findBestCoffeeMatches(
        COFFEES,
        drinkStyle,
        roastLevel,
        selectedFlavors
      );

      // Sort recommendations by priority (lower is better)
      const finalRecommendations = recommendedCoffee
        ? [recommendedCoffee, ...topMatches.filter(c => c.name !== recommendedCoffee.name)]
            .slice(0, 2)
            .sort((a, b) => a.priority - b.priority)
        : topMatches.slice(0, 2);

      setRecommendations(finalRecommendations);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to get recommendation. Using backup recommendations.",
        variant: "destructive",
      });
      const topMatches = findBestCoffeeMatches(
        COFFEES,
        drinkStyle,
        roastLevel,
        selectedFlavors
      ).slice(0, 2);
      setRecommendations(topMatches);
      setCurrentIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setRecommendations([]);
    setCurrentIndex(0);
  };

  const tryAnother = () => {
    const nextIndex = (currentIndex + 1) % recommendations.length;
    setCurrentIndex(nextIndex);
    return recommendations[nextIndex];
  };

  return {
    recommendations,
    currentCoffee: recommendations[currentIndex],
    isLoading,
    getRecommendation,
    reset,
    tryAnother,
  };
};
