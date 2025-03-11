
import React, { createContext, useContext, useState, useEffect } from "react";
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

interface RecommendationContextType {
  recommendations: Coffee[];
  currentCoffee: Coffee | undefined;
  isLoading: boolean;
  getRecommendation: (preferences: CoffeePreferences) => void;
  reset: () => void;
  tryAnother: () => Coffee | undefined;
  lastPreferences: CoffeePreferences | null;
}

const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

const STORAGE_KEY = 'coffeePreferences';

export const CoffeeRecommendationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recommendations, setRecommendations] = useState<Coffee[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPreferences, setLastPreferences] = useState<CoffeePreferences | null>(null);
  const { toast } = useToast();

  // Load saved preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences) as CoffeePreferences;
        setLastPreferences(preferences);
        // Optionally auto-load recommendations here if desired
      } catch (error) {
        console.error("Error loading saved preferences:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const getRecommendation = async (preferences: CoffeePreferences) => {
    setIsLoading(true);
    try {
      console.log('Getting local recommendations with preferences:', preferences);
      
      // Save preferences to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setLastPreferences(preferences);

      const topMatches = findBestCoffeeMatches(
        COFFEES,
        preferences.drinkStyle,
        preferences.roastLevel,
        preferences.selectedFlavors
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

  return (
    <RecommendationContext.Provider
      value={{
        recommendations,
        currentCoffee: recommendations[currentIndex],
        isLoading,
        getRecommendation,
        reset,
        tryAnother,
        lastPreferences
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};

export const useCoffeeRecommendations = () => {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error("useCoffeeRecommendations must be used within a CoffeeRecommendationProvider");
  }
  return context;
};
