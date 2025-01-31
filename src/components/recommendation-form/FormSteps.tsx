import { Button } from "@/components/ui/button";
import { FlavorSelector } from "@/components/FlavorSelector";
import { RoastLevelSlider } from "@/components/RoastLevelSlider";
import { DrinkStyleSelector } from "@/components/DrinkStyleSelector";
import { BrewMethodSelector } from "@/components/BrewMethodSelector";
import { FormStepWrapper } from "./FormStepWrapper";
import { LoadingState } from "./LoadingState";
import {
  type DrinkStyle,
  type BrewMethod,
  type FlavorNote,
  FLAVOR_NOTES,
} from "@/lib/coffee-data";

interface FormStepsProps {
  step: number;
  isLoading: boolean;
  drinkStyle: DrinkStyle | null;
  roastLevel: number;
  selectedFlavors: FlavorNote[];
  brewMethod: BrewMethod | null;
  onDrinkStyleSelect: (style: DrinkStyle) => void;
  onRoastLevelChange: (level: number) => void;
  onFlavorToggle: (flavor: FlavorNote) => void;
  onBrewMethodSelect: (method: BrewMethod) => void;
  onNextStep: () => void;
}

export const FormSteps = ({
  step,
  isLoading,
  drinkStyle,
  roastLevel,
  selectedFlavors,
  brewMethod,
  onDrinkStyleSelect,
  onRoastLevelChange,
  onFlavorToggle,
  onBrewMethodSelect,
  onNextStep,
}: FormStepsProps) => {
  if (isLoading) return <LoadingState />;

  switch (step) {
    case 1:
      return (
        <DrinkStyleSelector
          selectedStyle={drinkStyle}
          onStyleSelect={onDrinkStyleSelect}
        />
      );
    case 2:
      return (
        <FormStepWrapper title="Select your preferred roast level">
          <RoastLevelSlider value={roastLevel} onChange={onRoastLevelChange} />
          <div className="flex justify-end">
            <Button onClick={onNextStep}>Next</Button>
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
            onFlavorToggle={onFlavorToggle}
            availableFlavors={FLAVOR_NOTES}
          />
        </FormStepWrapper>
      );
    case 4:
      return (
        <BrewMethodSelector
          selectedMethod={brewMethod}
          onMethodSelect={onBrewMethodSelect}
        />
      );
    default:
      return null;
  }
};