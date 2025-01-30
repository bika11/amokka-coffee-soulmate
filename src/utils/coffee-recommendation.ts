import { Coffee, DrinkStyle, FlavorNote } from "@/lib/coffee-data";

interface CoffeeScore {
  coffee: Coffee;
  score: number;
  debug: {
    roastScore: number;
    flavorScore: number;
    drinkStyleScore: number;
    priorityBonus: number;
  };
}

export const findRecommendedCoffee = (
  coffees: Coffee[],
  drinkStyle: DrinkStyle,
  roastLevel: number,
  selectedFlavors: FlavorNote[],
  excludeCoffee?: Coffee
): Coffee => {
  const coffeeScores: CoffeeScore[] = coffees
    .filter((coffee) => !excludeCoffee || coffee.name !== excludeCoffee.name)
    .map((coffee) => {
      let score = 0;

      // Roast level matching (0-30 points) - Highest weight
      const roastDiff = Math.abs(coffee.roastLevel - roastLevel);
      const roastScore = Math.max(0, 30 - roastDiff * 6); // Each level difference reduces score by 6
      score += roastScore;

      // Flavor matching (0-15 points) - Medium weight
      const flavorScore = selectedFlavors.reduce(
        (acc, flavor) => acc + (coffee.flavorNotes.includes(flavor) ? 5 : 0),
        0
      );
      score += flavorScore;

      // Drink style compatibility (0-5 points) - Lowest weight
      const drinkStyleScore =
        (drinkStyle === "With milk" && coffee.roastLevel >= 4) ||
        (drinkStyle === "Straight up" && coffee.roastLevel <= 3)
          ? 5
          : 0;
      score += drinkStyleScore;

      // Priority bonus (1-9 points) - Tiebreaker
      const priorityBonus = 10 - coffee.priority;
      score += priorityBonus;

      return {
        coffee,
        score,
        debug: {
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
    coffeeScores.map(({ coffee, score, debug }) => ({
      name: coffee.name,
      totalScore: score,
      ...debug,
    }))
  );

  return coffeeScores.sort((a, b) => b.score - a.score)[0].coffee;
};