import { useState } from "react";
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

  const handleFlavorToggle = (flavor: FlavorNote) => {
    setSelectedFlavors((prev) =>
      prev.includes(flavor)
        ? prev.filter((f) => f !== flavor)
        : prev.length < 3
        ? [...prev, flavor]
        : prev
    );
  };

  const handleNext = () => {
    if (step === 4) {
      // Calculate recommendation
      const recommendedCoffee = findRecommendedCoffee();
      setRecommendation(recommendedCoffee);
    }
    setStep((prev) => prev + 1);
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
    // Simple scoring system
    const coffeeScores = COFFEES.map((coffee) => {
      let score = 0;

      // Roast level match (0-3 points)
      const roastDiff = Math.abs(coffee.roastLevel - roastLevel);
      score += 3 - roastDiff;

      // Flavor notes match (0-5 points per match)
      selectedFlavors.forEach((flavor) => {
        if (coffee.flavorNotes.includes(flavor)) {
          score += 5;
        }
      });

      return { coffee, score };
    });

    // Return the coffee with the highest score
    return coffeeScores.sort((a, b) => b.score - a.score)[0].coffee;
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return drinkStyle !== null;
      case 2:
        return true; // Roast level always has a value
      case 3:
        return selectedFlavors.length >= 2;
      case 4:
        return brewMethod !== null;
      default:
        return false;
    }
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
        {step < 5 && (
          <div className="flex justify-end">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((prev) => prev - 1)}
                className="mr-4"
              >
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={!canProceed()}>
              {step === 4 ? "Get Recommendation" : "Next"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Index;