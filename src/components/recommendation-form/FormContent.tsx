
import { FormSteps } from "./FormSteps";
import { ProgressBar } from "@/components/ProgressBar";
import {
  type DrinkStyle,
  type BrewMethod,
  type FlavorNote,
} from "@/lib/coffee-data";

interface FormContentProps {
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

export const FormContent = ({
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
}: FormContentProps) => {
  return (
    <div className="p-4 sm:p-6 space-y-8">
      <header>
        <h1 className="sr-only">Coffee Recommendation Quiz</h1>
        <ProgressBar currentStep={step} totalSteps={4} />
      </header>
      <div className="min-h-[300px] flex items-center justify-center">
        <FormSteps
          step={step}
          isLoading={isLoading}
          drinkStyle={drinkStyle}
          roastLevel={roastLevel}
          selectedFlavors={selectedFlavors}
          brewMethod={brewMethod}
          onDrinkStyleSelect={onDrinkStyleSelect}
          onRoastLevelChange={onRoastLevelChange}
          onFlavorToggle={onFlavorToggle}
          onBrewMethodSelect={onBrewMethodSelect}
          onNextStep={onNextStep}
        />
      </div>
    </div>
  );
};
