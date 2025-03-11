
import { memo } from "react";

interface CoffeeDetailsProps {
  name: string;
  description: string;
  flavorNotes: string[];
}

export const CoffeeHeading = memo(({ name }: { name: string }) => {
  return (
    <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
      {name}
    </h3>
  );
});

export const CoffeeDescription = memo(({ description }: { description: string }) => {
  return (
    <p className="text-muted-foreground leading-relaxed mx-auto max-w-prose text-lg">
      {description}
    </p>
  );
});

export const CoffeeDetails = memo(({ 
  name, 
  description, 
  flavorNotes 
}: CoffeeDetailsProps) => {
  return (
    <div className="space-y-8 text-center">
      <div>
        <CoffeeHeading name={name} />
        <CoffeeDescription description={description} />
      </div>
    </div>
  );
});

CoffeeHeading.displayName = "CoffeeHeading";
CoffeeDescription.displayName = "CoffeeDescription";
CoffeeDetails.displayName = "CoffeeDetails";
