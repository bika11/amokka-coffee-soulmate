import { Button } from "@/components/ui/button";
import { Coffee } from "@/lib/coffee-data";
import { ExternalLink } from "lucide-react";

interface CoffeeRecommendationProps {
  coffee: Coffee;
  onReset: () => void;
}

export const CoffeeRecommendation = ({
  coffee,
  onReset,
}: CoffeeRecommendationProps) => {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold">Your Perfect Match</h2>
      <div className="bg-secondary p-6 rounded-lg space-y-4">
        <h3 className="text-xl font-semibold">{coffee.name}</h3>
        <p className="text-muted-foreground">{coffee.description}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {coffee.flavorNotes.map((note) => (
            <span
              key={note}
              className="px-3 py-1 bg-background rounded-full text-sm"
            >
              {note}
            </span>
          ))}
        </div>
        <div className="pt-4 space-x-4">
          <Button onClick={onReset} variant="outline">
            Start Over
          </Button>
          <Button asChild>
            <a
              href={coffee.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2"
            >
              <span>View Coffee</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};