import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { FlavorSelector } from "@/components/FlavorSelector";
import { RoastLevelSlider } from "@/components/RoastLevelSlider";
import { CoffeeRecommendation } from "@/components/CoffeeRecommendation";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  COFFEES,
  FLAVOR_NOTES,
  type Coffee,
  type DrinkStyle,
  type BrewMethod,
  type FlavorNote,
} from "@/lib/coffee-data";

const Index = () => {
  const [step, setStep] = useState(1);
  const [drinkStyle, setDrinkStyle] = useState<DrinkStyle | null>(null);
  const [roastLevel, setRoastLevel] = useState(3);
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorNote[]>([]);
  const [brewMethod, setBrewMethod] = useState<BrewMethod | null>(null);
  const [recommendation, setRecommendation] = useState<Coffee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Auto-proceed when valid selections are made
  useEffect(() => {
    if (drinkStyle) {
      setStep(2);
    }
  }, [drinkStyle]);

  useEffect(() => {
    if (selectedFlavors.length === 3) {
      setStep(4);
    }
  }, [selectedFlavors]);

  useEffect(() => {
    if (brewMethod) {
      handleGetRecommendation();
    }
  }, [brewMethod]);

  const handleFlavorToggle = (flavor: FlavorNote) => {
    setSelectedFlavors((prev) =>
      prev.includes(flavor)
        ? prev.filter((f) => f !== flavor)
        : prev.length < 3
        ? [...prev, flavor]
        : prev
    );
  };

  const handleGetRecommendation = async () => {
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
      setStep(5);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to get recommendation. Please try again.",
        variant: "destructive",
      });
      // Fallback to existing recommendation logic
      const recommendedCoffee = findRecommendedCoffee();
      setRecommendation(recommendedCoffee);
      setStep(5);
    } finally {
      setIsLoading(false);
    }
  };

  const findRecommendedCoffee = (excludeCoffee?: Coffee): Coffee => {
    const coffeeScores = COFFEES
      .filter(coffee => !excludeCoffee || coffee.name !== excludeCoffee.name)
      .map((coffee) => {
        let score = 0;
        
        // Roast level matching (0-30 points) - Highest weight
        const roastDiff = Math.abs(coffee.roastLevel - roastLevel);
        const roastScore = Math.max(0, 30 - (roastDiff * 6)); // Each level difference reduces score by 6
        score += roastScore;

        // Flavor matching (0-15 points) - Medium weight
        const flavorScore = selectedFlavors.reduce((acc, flavor) => {
          return acc + (coffee.flavorNotes.includes(flavor) ? 5 : 0);
        }, 0);
        score += flavorScore;

        // Drink style compatibility (0-5 points) - Lowest weight
        if (drinkStyle === "With milk" && coffee.roastLevel >= 4) {
          score += 5;
        } else if (drinkStyle === "Straight up" && coffee.roastLevel <= 3) {
          score += 5;
        }

        // Priority bonus (1-9 points) - Tiebreaker
        score += (10 - coffee.priority);

        return { 
          coffee, 
          score,
          // Add debug information
          debug: {
            roastScore,
            flavorScore,
            drinkStyleScore: score - roastScore - flavorScore - (10 - coffee.priority),
            priorityBonus: 10 - coffee.priority
          }
        };
      });

    // Log scoring details for debugging
    console.log('Coffee Scores:', coffeeScores.map(({ coffee, score, debug }) => ({
      name: coffee.name,
      totalScore: score,
      ...debug
    })));

    return coffeeScores.sort((a, b) => b.score - a.score)[0].coffee;
  };

  const handleReset = () => {
    setStep(1);
    setDrinkStyle(null);
    setRoastLevel(3);
    setSelectedFlavors([]);
    setBrewMethod(null);
    setRecommendation(null);
  };

  const handleTryAnother = (currentCoffee: Coffee): Coffee => {
    return findRecommendedCoffee(currentCoffee);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              How do you drink your coffee?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={drinkStyle === "Straight up" ? "default" : "outline"}
                onClick={() => setDrinkStyle("Straight up")}
              >
                Straight up
              </Button>
              <Button
                variant={drinkStyle === "With milk" ? "default" : "outline"}
                onClick={() => setDrinkStyle("With milk")}
              >
                With milk
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Select your preferred roast level
            </h2>
            <RoastLevelSlider value={roastLevel} onChange={setRoastLevel} />
            <div className="flex justify-end">
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Choose 2-3 flavor notes
            </h2>
            <p className="text-center text-muted-foreground">
              Selected: {selectedFlavors.length}/3
            </p>
            <FlavorSelector
              selectedFlavors={selectedFlavors}
              onFlavorToggle={handleFlavorToggle}
              availableFlavors={FLAVOR_NOTES}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              How do you brew your coffee?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={brewMethod === "Espresso" ? "default" : "outline"}
                onClick={() => setBrewMethod("Espresso")}
              >
                Espresso
              </Button>
              <Button
                variant={brewMethod === "Filter" ? "default" : "outline"}
                onClick={() => setBrewMethod("Filter")}
              >
                Filter
              </Button>
            </div>
          </div>
        );
      case 5:
        return recommendation ? (
          <CoffeeRecommendation
            coffee={recommendation}
            onReset={handleReset}
            onTryAnother={handleTryAnother}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 space-y-6">
        <ProgressBar currentStep={step} totalSteps={4} />
        <div className="min-h-[300px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Getting your perfect match...</p>
            </div>
          ) : (
            renderStep()
          )}
        </div>
      </Card>
    </div>
  );
};

export default Index;