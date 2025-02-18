
import { Button } from "@/components/ui/button";
import { DrinkStyle } from "@/lib/coffee-data";
import { motion } from "framer-motion";

interface DrinkStyleSelectorProps {
  selectedStyle: DrinkStyle | null;
  onStyleSelect: (style: DrinkStyle) => void;
}

export const DrinkStyleSelector = ({
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
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Button
            variant={selectedStyle === "Straight up" ? "default" : "outline"}
            onClick={() => onStyleSelect("Straight up")}
            className="w-full h-16 text-lg transition-all duration-200"
            role="radio"
            aria-checked={selectedStyle === "Straight up"}
          >
            Straight up
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Button
            variant={selectedStyle === "With milk" ? "default" : "outline"}
            onClick={() => onStyleSelect("With milk")}
            className="w-full h-16 text-lg transition-all duration-200"
            role="radio"
            aria-checked={selectedStyle === "With milk"}
          >
            With milk
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
