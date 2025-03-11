
import { Button } from "@/components/ui/button";
import { BrewMethod } from "@/lib/coffee-data";
import { memo } from "react";
import { motion } from "framer-motion";

interface BrewMethodSelectorProps {
  selectedMethod: BrewMethod | null;
  onMethodSelect: (method: BrewMethod) => void;
}

export const BrewMethodSelector = memo(({
  selectedMethod,
  onMethodSelect,
}: BrewMethodSelectorProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">
        How do you brew your coffee?
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <BrewMethodButton 
          method="Espresso"
          isSelected={selectedMethod === "Espresso"}
          onSelect={onMethodSelect}
        />
        <BrewMethodButton 
          method="Filter"
          isSelected={selectedMethod === "Filter"}
          onSelect={onMethodSelect}
        />
      </div>
    </div>
  );
});

interface BrewMethodButtonProps {
  method: BrewMethod;
  isSelected: boolean;
  onSelect: (method: BrewMethod) => void;
}

const BrewMethodButton = memo(({
  method,
  isSelected,
  onSelect
}: BrewMethodButtonProps) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Button
        variant={isSelected ? "default" : "outline"}
        onClick={() => onSelect(method)}
      >
        {method}
      </Button>
    </motion.div>
  );
});

BrewMethodSelector.displayName = "BrewMethodSelector";
BrewMethodButton.displayName = "BrewMethodButton";
