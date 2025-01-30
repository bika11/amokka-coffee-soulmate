import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlavorSelector } from "@/components/FlavorSelector";
import { RoastLevelSlider } from "@/components/RoastLevelSlider";
import { DrinkStyleSelector } from "@/components/DrinkStyleSelector";
import { BrewMethodSelector } from "@/components/BrewMethodSelector";
import { FormProgress } from "./FormProgress";
import {
  type DrinkStyle,
  type BrewMethod,
  type FlavorNote,
  FLAVOR_NOTES,
} from "@/lib/coffee-data";

interface CoffeeRecommendationFormProps {
  onGetRecommendation: (preferences: {
    drinkStyle: DrinkStyle;
    roastLevel: number;
    selectedFlavors: FlavorNote[];
    brewMethod: BrewMethod;
  }) => void;
  isLoading: boolean;
}

export const CoffeeRecommendationForm = ({
  onGetRecommendation,
  isLoading,
}: CoffeeRecommendationFormProps) => {
  const [step, setStep] = useState(1);
  const [drinkStyle, setDrinkStyle] = useState<DrinkStyle | null>(null);
  const [roastLevel, setRoastLevel] = useState(3);
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorNote[]>([]);
  const [brewMethod, setBrewMethod] = useState<BrewMethod | null>(null);

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
      handleSubmit();
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

  const handleSubmit = () => {
    if (!drinkStyle || !brewMethod) return;
    
    onGetRecommendation({
      drinkStyle,
      roastLevel,
      selectedFlavors,
      brewMethod,
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <DrinkStyleSelector
            selectedStyle={drinkStyle}
            onStyleSelect={setDrinkStyle}
          />
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
          <BrewMethodSelector
            selectedMethod={brewMethod}
            onMethodSelect={setBrewMethod}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-lg p-6 space-y-6">
      <FormProgress currentStep={step} totalSteps={4} isLoading={isLoading} />
      <div className="min-h-[300px] flex items-center justify-center">
        {!isLoading && renderStep()}
      </div>
    </Card>
  );
};