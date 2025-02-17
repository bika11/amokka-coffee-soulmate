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
  if (!coffeeFlavorNotes || !userPreferredFlavors) return 0;
  
  // Calculate matches between user preferences and coffee flavor notes
  const matches = userPreferredFlavors.reduce(
    (score, flavor) => score + (coffeeFlavorNotes.includes(flavor) ? 1 : 0),
    0
  );

  // Calculate maximum possible matches based on coffee's flavor notes count
  const coffeeNotesCount = coffeeFlavorNotes.length;
  const maxPossibleMatches = Math.min(3, Math.max(2, coffeeNotesCount));
  
  // Calculate score (5 points per match, normalized to account for coffees with 2 notes)
  const normalizedScore = (matches / maxPossibleMatches) * 15;
  
  // If coffee has 2 notes and matches both, give full score
  if (coffeeNotesCount === 2 && matches === 2) {
    return 15;
  }
  
  return normalizedScore;
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

export const findBestCoffeeMatches = (
  availableCoffees: Coffee[],
  userDrinkStyle: DrinkStyle,
  userRoastLevel: number,
  userPreferredFlavors: FlavorNote[],
): Coffee[] => {
  // Calculate scores for each coffee
  const coffeeScores: CoffeeScore[] = availableCoffees.map((coffee) => {
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

  // Sort coffees by score in descending order AND by priority in ascending order for equal scores
  const sortedCoffees = coffeeScores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // If scores are equal, sort by priority (lower priority first)
    return a.coffee.priority - b.coffee.priority;
  });

  // Log scoring details for debugging
  console.log(
    "Coffee Scores:",
    sortedCoffees.map(({ coffee, totalScore, details }) => ({
      name: coffee.name,
      totalScore,
      priority: coffee.priority,
      flavorNotes: coffee.flavorNotes,
      ...details,
    }))
  );

  // Return top 2 matches
  return sortedCoffees.slice(0, 2).map(score => score.coffee);
};