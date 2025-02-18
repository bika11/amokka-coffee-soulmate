
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
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
      console.log('Getting local recommendations with preferences:', {
        drinkStyle,
        roastLevel,
        selectedFlavors,
        brewMethod,
      });

      const topMatches = findBestCoffeeMatches(
        COFFEES,
        drinkStyle,
        roastLevel,
        selectedFlavors
      ).slice(0, 2);
      
      console.log('Found matches:', topMatches);
      setRecommendations(topMatches);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
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
