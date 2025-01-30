import { Coffee } from "@/lib/coffee-data";
import { FlavorTags } from "./FlavorTags";
import { CoffeeImage } from "./CoffeeImage";
import { CoffeeActions } from "./CoffeeActions";
import { ChatBot } from "./ChatBot";

interface CoffeeRecommendationProps {
  coffee: Coffee;
  onReset: () => void;
  onTryAnother: (currentCoffee: Coffee) => Coffee;
}

export const CoffeeRecommendation = ({
  coffee,
  onReset,
  onTryAnother,
}: CoffeeRecommendationProps) => {
  const handleTryAnother = () => {
    const nextCoffee = onTryAnother(coffee);
  };

  return (
    <div className="space-y-6 text-center animate-fade-in">
      <h2 className="text-2xl font-bold">Your Perfect Match</h2>
      <div className="bg-secondary p-6 rounded-lg space-y-4">
        <CoffeeImage imageUrl={coffee.imageUrl} name={coffee.name} />
        <h3 className="text-xl font-semibold">{coffee.name}</h3>
        <p className="text-muted-foreground">{coffee.description}</p>
        <FlavorTags flavorNotes={coffee.flavorNotes} />
        <CoffeeActions
          coffee={coffee}
          onTryAnother={handleTryAnother}
          onReset={onReset}
        />
      </div>
      <ChatBot />
    </div>
  );
};