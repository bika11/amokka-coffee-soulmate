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

/**
 * Calculates how well a coffee's roast level matches the user's preference
 * @param coffeeRoastLevel - The roast level of the coffee being evaluated
 * @param userRoastLevel - The user's preferred roast level
 * @returns A score from 0-30, with 30 being a perfect match
 */
const calculateRoastScore = (coffeeRoastLevel: number, userRoastLevel: number): number => {
  const roastDifference = Math.abs(coffeeRoastLevel - userRoastLevel);
  return Math.max(0, 30 - roastDifference * 6); // Each level difference reduces score by 6
};

/**
 * Calculates how many of the user's preferred flavors are present in the coffee
 * @param coffeeFlavorNotes - The flavor notes present in the coffee
 * @param userPreferredFlavors - The flavors the user is looking for
 * @returns A score from 0-15, with 5 points per matching flavor
 */
const calculateFlavorScore = (
  coffeeFlavorNotes: FlavorNote[],
  userPreferredFlavors: FlavorNote[]
): number => {
  return userPreferredFlavors.reduce(
    (score, flavor) => score + (coffeeFlavorNotes.includes(flavor) ? 5 : 0),
    0
  );
};

/**
 * Determines if the coffee's characteristics match the user's drinking style
 * @param coffee - The coffee being evaluated
 * @param userDrinkStyle - How the user prefers to drink their coffee
 * @returns A score of 0 or 5, with 5 indicating a good match
 */
const calculateDrinkStyleScore = (
  coffee: Coffee,
  userDrinkStyle: DrinkStyle
): number => {
  const isMilkBased = userDrinkStyle === "With milk";
  const isStrongRoast = coffee.roastLevel >= 4;
  
  // Milk-based drinks work better with darker roasts
  // Black coffee works better with lighter roasts
  return (isMilkBased && isStrongRoast) || (!isMilkBased && !isStrongRoast) ? 5 : 0;
};

/**
 * Calculates a priority bonus to help break ties between similarly scored coffees
 * @param coffeePriority - The priority value of the coffee (lower is better)
 * @returns A score from 1-9 based on inverse priority
 */
const calculatePriorityBonus = (coffeePriority: number): number => {
  return 10 - coffeePriority;
};

/**
 * Evaluates how well each coffee matches the user's preferences
 * @param availableCoffees - List of all coffees to evaluate
 * @param userDrinkStyle - User's preferred way of drinking coffee
 * @param userRoastLevel - User's preferred roast level
 * @param userPreferredFlavors - User's preferred flavor notes
 * @param excludedCoffee - Optional coffee to exclude from recommendations
 * @returns The coffee that best matches the user's preferences
 */
export const findBestCoffeeMatch = (
  availableCoffees: Coffee[],
  userDrinkStyle: DrinkStyle,
  userRoastLevel: number,
  userPreferredFlavors: FlavorNote[],
  excludedCoffee?: Coffee
): Coffee => {
  // Filter out excluded coffee if provided
  const eligibleCoffees = excludedCoffee
    ? availableCoffees.filter((coffee) => coffee.name !== excludedCoffee.name)
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

  // Log scoring details for debugging
  console.log(
    "Coffee Scores:",
    coffeeScores.map(({ coffee, totalScore, details }) => ({
      name: coffee.name,
      totalScore,
      ...details,
    }))
  );

  // Return the coffee with the highest score
  return coffeeScores.sort((a, b) => b.totalScore - a.totalScore)[0].coffee;
};