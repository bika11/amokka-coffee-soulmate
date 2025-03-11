
import { useState, useEffect, memo } from "react";
import { Card } from "@/components/ui/card";
import { FormContent } from "./recommendation-form/FormContent";
import { StepTransition } from "./recommendation-form/StepTransition";
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

export const CoffeeRecommendationForm = memo(({
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
    <StepTransition className="w-full max-w-lg mx-auto px-4 sm:px-0">
      <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-2">
        <FormContent
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
      </Card>
    </StepTransition>
  );
});

CoffeeRecommendationForm.displayName = "CoffeeRecommendationForm";
