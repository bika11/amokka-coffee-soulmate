import { BrewMethodSelector } from "@/components/BrewMethodSelector";
import { type BrewMethod } from "@/lib/coffee-data";

interface BrewMethodStepProps {
  selectedMethod: BrewMethod | null;
  onMethodSelect: (method: BrewMethod) => void;
}

export const BrewMethodStep = ({
  selectedMethod,
  onMethodSelect,
}: BrewMethodStepProps) => {
  return (
    <BrewMethodSelector
      selectedMethod={selectedMethod}
      onMethodSelect={onMethodSelect}
    />
  );
};