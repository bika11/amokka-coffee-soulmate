
import { Button } from "@/components/ui/button";
import { FlavorNote } from "@/lib/coffee-data";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface FlavorSelectorProps {
  selectedFlavors: FlavorNote[];
  onFlavorToggle: (flavor: FlavorNote) => void;
  availableFlavors: FlavorNote[];
}

export const FlavorSelector = memo(({
  selectedFlavors,
  onFlavorToggle,
  availableFlavors,
}: FlavorSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {availableFlavors.map((flavor) => (
        <FlavorButton
          key={flavor}
          flavor={flavor}
          isSelected={selectedFlavors.includes(flavor)}
          isDisabled={selectedFlavors.length >= 3 && !selectedFlavors.includes(flavor)}
          onToggle={() => onFlavorToggle(flavor)}
        />
      ))}
    </div>
  );
});

interface FlavorButtonProps {
  flavor: FlavorNote;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

const FlavorButton = memo(({
  flavor,
  isSelected,
  isDisabled,
  onToggle
}: FlavorButtonProps) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      className={cn(
        "capitalize transition-all",
        isSelected && "bg-accent text-accent-foreground border-accent"
      )}
      disabled={isDisabled}
    >
      {flavor.replace("-", " ")}
    </Button>
  );
});

FlavorSelector.displayName = "FlavorSelector";
FlavorButton.displayName = "FlavorButton";
