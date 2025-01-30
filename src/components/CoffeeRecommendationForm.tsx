import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FormProgress } from "./FormProgress";
import { DrinkStyleStep } from "./steps/DrinkStyleStep";
import { RoastLevelStep } from "./steps/RoastLevelStep";
import { FlavorStep } from "./steps/FlavorStep";
import { BrewMethodStep } from "./steps/BrewMethodStep";
import {
  type DrinkStyle,
  type BrewMethod,
  type FlavorNote,
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
          <DrinkStyleStep
            selectedStyle={drinkStyle}
            onStyleSelect={setDrinkStyle}
          />
        );
      case 2:
        return (
          <RoastLevelStep
            value={roastLevel}
            onChange={setRoastLevel}
            onNext={() => setStep(3)}
          />
        );
      case 3:
        return (
          <FlavorStep
            selectedFlavors={selectedFlavors}
            onFlavorToggle={handleFlavorToggle}
          />
        );
      case 4:
        return (
          <BrewMethodStep
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