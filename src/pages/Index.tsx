import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { FlavorSelector } from "@/components/FlavorSelector";
import { RoastLevelSlider } from "@/components/RoastLevelSlider";
import { CoffeeRecommendation } from "@/components/CoffeeRecommendation";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  FLAVOR_NOTES,
  type DrinkStyle,
  type BrewMethod,
  type FlavorNote,
} from "@/lib/coffee-data";

const Index = () => {
  const [step, setStep] = useState(1);
  const [drinkStyle, setDrinkStyle] = useState<DrinkStyle | null>(null);
  const [roastLevel, setRoastLevel] = useState(3);
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorNote[]>([]);
  const [brewMethod, setBrewMethod] = useState<BrewMethod | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Auto-proceed when valid selections are made
  useEffect(() => {
    if (drinkStyle) {
      setStep(2);
    }
  }, [drinkStyle]);

  useEffect(() => {
    if (selectedFlavors.length === 3) {
      setStep(4);
    }
  }, [selectedFlavors]);

  useEffect(() => {
    if (brewMethod) {
      handleGetRecommendation();
    }
  }, [brewMethod]);

  const handleFlavorToggle = (flavor: FlavorNote) => {
    setSelectedFlavors((prev) =>
      prev.includes(flavor)
        ? prev.filter((f) => f !== flavor)
        : prev.length < 3
        ? [...prev, flavor]
        : prev
    );
  };

  const mapRoastLevelToSupabase = (level: number) => {
    if (level <= 2) return 'light';
    if (level === 3) return 'medium-light';
    if (level === 4) return 'medium';
    if (level === 5) return 'medium-dark';
    return 'dark';
  };

  const findRecommendedCoffee = async (excludeCoffeeId?: string) => {
    const supabaseRoastLevel = mapRoastLevelToSupabase(roastLevel);
    
    let query = supabase
      .from('coffees')
      .select('*')
      .eq('roast_level', supabaseRoastLevel);

    if (excludeCoffeeId) {
      query = query.neq('id', excludeCoffeeId);
    }

    const { data: coffees, error } = await query;

    if (error) {
      console.error('Error fetching coffees:', error);
      throw error;
    }

    if (!coffees || coffees.length === 0) {
      return null;
    }

    // Score each coffee based on flavor matches and priority
    const scoredCoffees = coffees.map(coffee => {
      let score = 0;
      selectedFlavors.forEach(flavor => {
        if (coffee.flavor_notes.includes(flavor)) {
          score += 5;
        }
      });
      
      // Add priority bonus (higher priority = lower number = better)
      score += (10 - coffee.priority);

      return { ...coffee, score };
    });

    // Sort by score (highest first) and then by priority (lowest first)
    scoredCoffees.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.priority - b.priority;
    });

    return scoredCoffees[0];
  };

  const handleGetRecommendation = async () => {
    setIsLoading(true);
    try {
      const preferences = `I like coffee that is ${
        drinkStyle === "Straight up" ? "black" : "with milk"
      }, roast level ${roastLevel}/6, and I enjoy ${selectedFlavors.join(
        ", "
      )} flavors. I brew using ${brewMethod?.toLowerCase()}.`;

      // Store the interaction
      const { error: interactionError } = await supabase
        .from('user_interactions')
        .insert({
          selected_flavors: selectedFlavors,
          selected_roast_level: mapRoastLevelToSupabase(roastLevel),
          selected_brew_method: brewMethod?.toLowerCase() || 'unknown'
        });

      if (interactionError) {
        console.error('Error storing interaction:', interactionError);
      }

      const recommendedCoffee = await findRecommendedCoffee();

      if (!recommendedCoffee) {
        throw new Error("No matching coffee found");
      }

      setRecommendation(recommendedCoffee);
      setStep(5);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to get recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setDrinkStyle(null);
    setRoastLevel(3);
    setSelectedFlavors([]);
    setBrewMethod(null);
    setRecommendation(null);
  };

  const handleTryAnother = async (currentCoffee: any) => {
    const nextCoffee = await findRecommendedCoffee(currentCoffee.id);
    return nextCoffee || currentCoffee; // Fallback to current coffee if no alternative found
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              How do you drink your coffee?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={drinkStyle === "Straight up" ? "default" : "outline"}
                onClick={() => setDrinkStyle("Straight up")}
              >
                Straight up
              </Button>
              <Button
                variant={drinkStyle === "With milk" ? "default" : "outline"}
                onClick={() => setDrinkStyle("With milk")}
              >
                With milk
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Select your preferred roast level
            </h2>
            <RoastLevelSlider value={roastLevel} onChange={setRoastLevel} />
            <div className="flex justify-end">
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Choose 2-3 flavor notes
            </h2>
            <p className="text-center text-muted-foreground">
              Selected: {selectedFlavors.length}/3
            </p>
            <FlavorSelector
              selectedFlavors={selectedFlavors}
              onFlavorToggle={handleFlavorToggle}
              availableFlavors={FLAVOR_NOTES}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              How do you brew your coffee?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={brewMethod === "Espresso" ? "default" : "outline"}
                onClick={() => setBrewMethod("Espresso")}
              >
                Espresso
              </Button>
              <Button
                variant={brewMethod === "Filter" ? "default" : "outline"}
                onClick={() => setBrewMethod("Filter")}
              >
                Filter
              </Button>
            </div>
          </div>
        );
      case 5:
        return recommendation ? (
          <CoffeeRecommendation
            coffee={recommendation}
            onReset={handleReset}
            onTryAnother={handleTryAnother}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 space-y-6">
        <ProgressBar currentStep={step} totalSteps={4} />
        <div className="min-h-[300px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Getting your perfect match...</p>
            </div>
          ) : (
            renderStep()
          )}
        </div>
      </Card>
    </div>
  );
};

export default Index;