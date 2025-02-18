
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
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, rgb(var(--${colorScheme.from})), rgb(var(--${colorScheme.to})))`,
  };

  return (
    <div className="space-y-8 text-center">
      <div>
        <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent" style={gradientStyle}>
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
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-default"
            style={{
              backgroundColor: `rgb(var(--${colorScheme.from}) / 0.1)`,
              color: `rgb(var(--${colorScheme.from}))`,
            }}
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );
};
