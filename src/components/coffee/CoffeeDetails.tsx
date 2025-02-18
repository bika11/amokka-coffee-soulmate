
interface CoffeeDetailsProps {
  name: string;
  description: string;
  flavorNotes: string[];
}

export const CoffeeDetails = ({ name, description, flavorNotes }: CoffeeDetailsProps) => {
  return (
    <div className="space-y-8 text-center">
      <div>
        <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {name}
        </h3>
        <p className="text-muted-foreground leading-relaxed mx-auto max-w-prose text-lg">
          {description}
        </p>
      </div>
    </div>
  );
};
