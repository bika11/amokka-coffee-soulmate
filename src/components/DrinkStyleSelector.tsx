import { Button } from "@/components/ui/button";
import { DrinkStyle } from "@/lib/coffee-data";

interface DrinkStyleSelectorProps {
  selectedStyle: DrinkStyle | null;
  onStyleSelect: (style: DrinkStyle) => void;
}

export const DrinkStyleSelector = ({
  selectedStyle,
  onStyleSelect,
}: DrinkStyleSelectorProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">
        How do you drink your coffee?
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={selectedStyle === "Straight up" ? "default" : "outline"}
          onClick={() => onStyleSelect("Straight up")}
        >
          Straight up
        </Button>
        <Button
          variant={selectedStyle === "With milk" ? "default" : "outline"}
          onClick={() => onStyleSelect("With milk")}
        >
          With milk
        </Button>
      </div>
    </div>
  );
};