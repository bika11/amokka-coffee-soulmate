import { DrinkStyleSelector } from "@/components/DrinkStyleSelector";
import { type DrinkStyle } from "@/lib/coffee-data";

interface DrinkStyleStepProps {
  selectedStyle: DrinkStyle | null;
  onStyleSelect: (style: DrinkStyle) => void;
}

export const DrinkStyleStep = ({
  selectedStyle,
  onStyleSelect,
}: DrinkStyleStepProps) => {
  return (
    <DrinkStyleSelector
      selectedStyle={selectedStyle}
      onStyleSelect={onStyleSelect}
    />
  );
};