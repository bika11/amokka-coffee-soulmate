import { Button } from "@/components/ui/button";
import { FlavorNote } from "@/lib/coffee-data";
import { cn } from "@/lib/utils";

interface FlavorSelectorProps {
  selectedFlavors: FlavorNote[];
  onFlavorToggle: (flavor: FlavorNote) => void;
  availableFlavors: FlavorNote[];
}

export const FlavorSelector = ({
  selectedFlavors,
  onFlavorToggle,
  availableFlavors,
}: FlavorSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {availableFlavors.map((flavor) => (
        <Button
          key={flavor}
          onClick={() => onFlavorToggle(flavor)}
          variant="outline"
          className={cn(
            "capitalize transition-all",
            selectedFlavors.includes(flavor) &&
              "bg-accent text-accent-foreground border-accent"
          )}
          disabled={
            selectedFlavors.length >= 3 && !selectedFlavors.includes(flavor)
          }
        >
          {flavor.replace("-", " ")}
        </Button>
      ))}
    </div>
  );
};