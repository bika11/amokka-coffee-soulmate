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

      const roastDiff = Math.abs(parseInt(coffee.roast_level) - roastLevel);
      const roastScore = Math.max(0, 30 - roastDiff * 6);
      score += roastScore;

      const flavorScore = selectedFlavors.reduce(
        (acc, flavor) => acc + (coffee.flavor_notes.includes(flavor) ? 5 : 0),
        0
      );
      score += flavorScore;

      const drinkStyleScore =
        (drinkStyle === "With milk" && parseInt(coffee.roast_level) >= 4) ||
        (drinkStyle === "Straight up" && parseInt(coffee.roast_level) <= 3)
          ? 5
          : 0;
      score += drinkStyleScore;

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