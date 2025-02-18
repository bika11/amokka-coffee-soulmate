
interface CoffeeDetailsProps {
  name: string;
  description: string;
  flavorNotes: string[];
  colorScheme?: {
    from: string;
    to: string;
  };
}

export const CoffeeDetails = ({ name, description, flavorNotes, colorScheme = { from: "primary", to: "accent" } }: CoffeeDetailsProps) => {
  return (
    <div className="space-y-8 text-center">
      <div>
        <h3 className={`text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-${colorScheme.from} to-${colorScheme.to}`}>
          {name}
        </h3>
        <p className="text-muted-foreground leading-relaxed mx-auto max-w-prose text-lg">
          {description}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {flavorNotes.map((note) => (
          <span
            key={note}
            className={`px-4 py-2 bg-${colorScheme.from}/10 text-${colorScheme.from} rounded-full text-sm font-medium 
                      hover:bg-${colorScheme.from}/20 transition-colors duration-200 cursor-default`}
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );
};
