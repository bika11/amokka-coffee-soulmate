import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { FlavorSelector } from "@/components/FlavorSelector";
import { RoastLevelSlider } from "@/components/RoastLevelSlider";
import { CoffeeRecommendation } from "@/components/CoffeeRecommendation";
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

  // Auto-proceed when valid selections are made
  useEffect(() => {
    if (drinkStyle) {
      setStep(2);
    }
  }, [drinkStyle]);

  useEffect(() => {
    if (selectedFlavors.length >= 2) {
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

  const handleGetRecommendation = () => {
    const recommendedCoffee = findRecommendedCoffee();
    setRecommendation(recommendedCoffee);
    setStep(5);
  };

  const handleReset = () => {
    setStep(1);
    setDrinkStyle(null);
    setRoastLevel(3);
    setSelectedFlavors([]);
    setBrewMethod(null);
    setRecommendation(null);
  };

  const findRecommendedCoffee = (): Coffee => {
    const coffeeScores = COFFEES.map((coffee) => {
      let score = 0;
      const roastDiff = Math.abs(coffee.roastLevel - roastLevel);
      score += 3 - roastDiff;
      selectedFlavors.forEach((flavor) => {
        if (coffee.flavorNotes.includes(flavor)) {
          score += 5;
        }
      });
      return { coffee, score };
    });

    return coffeeScores.sort((a, b) => b.score - a.score)[0].coffee;
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
          {renderStep()}
        </div>
      </Card>
    </div>
  );
};

export default Index;