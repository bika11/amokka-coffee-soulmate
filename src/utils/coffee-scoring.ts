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
  const isStrongRoast = parseInt(coffee.roast_level) >= 4;
  
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
  excludedCoffee?: Coffee
): Coffee => {
  const eligibleCoffees = excludedCoffee
    ? availableCoffees.filter((coffee) => coffee.name !== excludedCoffee.name)
    : availableCoffees;

  const coffeeScores: CoffeeScore[] = eligibleCoffees.map((coffee) => {
    const roastScore = calculateRoastScore(parseInt(coffee.roast_level), userRoastLevel);
    const flavorScore = calculateFlavorScore(coffee.flavor_notes, userPreferredFlavors);
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

  console.log(
    "Coffee Scores:",
    coffeeScores.map(({ coffee, totalScore, details }) => ({
      name: coffee.name,
      totalScore,
      ...details,
    }))
  );

  return coffeeScores.sort((a, b) => b.totalScore - a.totalScore)[0].coffee;
};