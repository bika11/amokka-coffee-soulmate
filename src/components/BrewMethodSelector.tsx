import { Button } from "@/components/ui/button";
import { BrewMethod } from "@/lib/coffee-data";

interface BrewMethodSelectorProps {
  selectedMethod: BrewMethod | null;
  onMethodSelect: (method: BrewMethod) => void;
}

export const BrewMethodSelector = ({
  selectedMethod,
  onMethodSelect,
}: BrewMethodSelectorProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">
        How do you brew your coffee?
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={selectedMethod === "Espresso" ? "default" : "outline"}
          onClick={() => onMethodSelect("Espresso")}
        >
          Espresso
        </Button>
        <Button
          variant={selectedMethod === "Filter" ? "default" : "outline"}
          onClick={() => onMethodSelect("Filter")}
        >
          Filter
        </Button>
      </div>
    </div>
  );
};