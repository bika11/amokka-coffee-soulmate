
import { Button } from "@/components/ui/button";
import { DrinkStyle } from "@/lib/coffee-data";
import { motion } from "framer-motion";
import { memo } from "react";

interface DrinkStyleSelectorProps {
  selectedStyle: DrinkStyle | null;
  onStyleSelect: (style: DrinkStyle) => void;
}

export const DrinkStyleSelector = memo(({
  selectedStyle,
  onStyleSelect,
}: DrinkStyleSelectorProps) => {
  return (
    <div className="space-y-6 w-full px-4 sm:px-0">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold" id="drink-style-heading">
          How do you drink your coffee?
        </h2>
        <p className="text-muted-foreground">
          Choose your preferred way of enjoying coffee
        </p>
      </div>
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        role="radiogroup"
        aria-labelledby="drink-style-heading"
      >
        <DrinkStyleButton 
          style="Straight up"
          isSelected={selectedStyle === "Straight up"}
          onSelect={onStyleSelect}
        />
        <DrinkStyleButton 
          style="With milk"
          isSelected={selectedStyle === "With milk"}
          onSelect={onStyleSelect}
        />
      </div>
    </div>
  );
});

interface DrinkStyleButtonProps {
  style: DrinkStyle;
  isSelected: boolean;
  onSelect: (style: DrinkStyle) => void;
}

const DrinkStyleButton = memo(({
  style,
  isSelected,
  onSelect
}: DrinkStyleButtonProps) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Button
        variant={isSelected ? "default" : "outline"}
        onClick={() => onSelect(style)}
        className="w-full h-16 text-lg transition-all duration-200"
        role="radio"
        aria-checked={isSelected}
      >
        {style}
      </Button>
    </motion.div>
  );
});

DrinkStyleSelector.displayName = "DrinkStyleSelector";
DrinkStyleButton.displayName = "DrinkStyleButton";
