import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { FormSteps } from "./recommendation-form/FormSteps";
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
    if (drinkStyle) setStep(2);
  }, [drinkStyle]);

  useEffect(() => {
    if (selectedFlavors.length === 3) setStep(4);
  }, [selectedFlavors]);

  useEffect(() => {
    if (brewMethod) handleSubmit();
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

  return (
    <Card className="w-full max-w-lg p-6 space-y-6">
      <ProgressBar currentStep={step} totalSteps={4} />
      <div className="min-h-[300px] flex items-center justify-center">
        <FormSteps
          step={step}
          isLoading={isLoading}
          drinkStyle={drinkStyle}
          roastLevel={roastLevel}
          selectedFlavors={selectedFlavors}
          brewMethod={brewMethod}
          onDrinkStyleSelect={setDrinkStyle}
          onRoastLevelChange={setRoastLevel}
          onFlavorToggle={handleFlavorToggle}
          onBrewMethodSelect={setBrewMethod}
          onNextStep={() => setStep(3)}
        />
      </div>
    </Card>
  );
};