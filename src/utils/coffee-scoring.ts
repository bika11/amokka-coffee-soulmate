import { Coffee, DrinkStyle, FlavorNote } from "@/lib/coffee-data";

interface CoffeeScore {
  coffee: Coffee;
  totalScore: number;
  details: {
    roastScore: number;
    flavorScore: number;
    drinkStyleScore: number;
    priorityBonus: number;
  };
}

const calculateRoastScore = (coffeeRoastLevel: number, userRoastLevel: number): number => {
  const roastDifference = Math.abs(coffeeRoastLevel - userRoastLevel);
  return Math.max(0, 30 - roastDifference * 6);
};

const calculateFlavorScore = (
  coffeeFlavorNotes: FlavorNote[],
  userPreferredFlavors: FlavorNote[]
): number => {
  return userPreferredFlavors.reduce(
    (score, flavor) => score + (coffeeFlavorNotes.includes(flavor) ? 5 : 0),
    0
  );
};

const calculateDrinkStyleScore = (
  coffee: Coffee,
  userDrinkStyle: DrinkStyle
): number => {
  const isMilkBased = userDrinkStyle === "With milk";
  const isStrongRoast = coffee.roastLevel >= 4;
  
  return (isMilkBased && isStrongRoast) || (!isMilkBased && !isStrongRoast) ? 5 : 0;
};

const calculatePriorityBonus = (coffeePriority: number): number => {
  return 10 - coffeePriority;
};

export const findBestCoffeeMatch = (
  availableCoffees: Coffee[],
  userDrinkStyle: DrinkStyle,
  userRoastLevel: number,
  userPreferredFlavors: FlavorNote[],
  excludeCoffee?: Coffee
): Coffee => {
  // Filter out excluded coffee if provided
  const eligibleCoffees = excludeCoffee
    ? availableCoffees.filter((coffee) => coffee.name !== excludeCoffee.name)
    : availableCoffees;

  // Calculate scores for each coffee
  const coffeeScores: CoffeeScore[] = eligibleCoffees.map((coffee) => {
    const roastScore = calculateRoastScore(coffee.roastLevel, userRoastLevel);
    const flavorScore = calculateFlavorScore(coffee.flavorNotes, userPreferredFlavors);
    const drinkStyleScore = calculateDrinkStyleScore(coffee, userDrinkStyle);
    const priorityBonus = calculatePriorityBonus(coffee.priority);

    const totalScore = roastScore + flavorScore + drinkStyleScore + priorityBonus;

    return {
      coffee,
      totalScore,
      details: {
        roastScore,
        flavorScore,
        drinkStyleScore,
        priorityBonus,
      },
    };
  });

  // Sort coffees by score in descending order
  const sortedCoffees = coffeeScores.sort((a, b) => b.totalScore - a.totalScore);

  // Log scoring details for debugging
  console.log(
    "Coffee Scores:",
    sortedCoffees.map(({ coffee, totalScore, details }) => ({
      name: coffee.name,
      totalScore,
      ...details,
    }))
  );

  // When trying another coffee, return the second-best match
  return sortedCoffees[1]?.coffee || sortedCoffees[0].coffee;
};
