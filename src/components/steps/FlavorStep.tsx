import { FlavorSelector } from "@/components/FlavorSelector";
import { type FlavorNote, FLAVOR_NOTES } from "@/lib/coffee-data";

interface FlavorStepProps {
  selectedFlavors: FlavorNote[];
  onFlavorToggle: (flavor: FlavorNote) => void;
}

export const FlavorStep = ({
  selectedFlavors,
  onFlavorToggle,
}: FlavorStepProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Choose 2-3 flavor notes</h2>
      <p className="text-center text-muted-foreground">
        Selected: {selectedFlavors.length}/3
      </p>
      <FlavorSelector
        selectedFlavors={selectedFlavors}
        onFlavorToggle={onFlavorToggle}
        availableFlavors={FLAVOR_NOTES}
      />
    </div>
  );
};