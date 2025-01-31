import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { FlavorSelector } from "@/components/FlavorSelector";
import { RoastLevelSlider } from "@/components/RoastLevelSlider";
import { DrinkStyleSelector } from "@/components/DrinkStyleSelector";
import { BrewMethodSelector } from "@/components/BrewMethodSelector";
import { FormStepWrapper } from "./recommendation-form/FormStepWrapper";
import { LoadingState } from "./recommendation-form/LoadingState";
import { Button } from "@/components/ui/button";
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

  const renderStep = () => {
    if (isLoading) return <LoadingState />;

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
          <FormStepWrapper title="Select your preferred roast level">
            <RoastLevelSlider value={roastLevel} onChange={setRoastLevel} />
            <div className="flex justify-end">
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </FormStepWrapper>
        );
      case 3:
        return (
          <FormStepWrapper
            title="Choose 2-3 flavor notes"
            subtitle={`Selected: ${selectedFlavors.length}/3`}
          >
            <FlavorSelector
              selectedFlavors={selectedFlavors}
              onFlavorToggle={handleFlavorToggle}
              availableFlavors={FLAVOR_NOTES}
            />
          </FormStepWrapper>
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
      <ProgressBar currentStep={step} totalSteps={4} />
      <div className="min-h-[300px] flex items-center justify-center">
        {renderStep()}
      </div>
    </Card>
  );
};