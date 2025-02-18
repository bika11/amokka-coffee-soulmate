
import { Coffee } from "@/lib/coffee-data";
import { Card } from "@/components/ui/card";
import { ChatBot } from "./ChatBot";
import { RecommendationScore } from "./coffee/RecommendationScore";
import { CoffeeImage } from "./coffee/CoffeeImage";
import { CoffeeDetails } from "./coffee/CoffeeDetails";
import { ActionButtons } from "./coffee/ActionButtons";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_TABLES } from "@/integrations/supabase/constants";
import { useToast } from "./ui/use-toast";

interface CoffeeRecommendationProps {
  coffee: Coffee;
  onReset: () => void;
  onTryAnother: () => Coffee;
}

export const CoffeeRecommendation = ({
  coffee,
  onReset,
  onTryAnother,
}: CoffeeRecommendationProps) => {
  const matchScore = Math.max(1, 10 - coffee.priority);
  const { toast } = useToast();

  const trackCoffeeClick = async (coffeeName: string) => {
    try {
      const { error } = await supabase
        .from(SUPABASE_TABLES.COFFEE_CLICKS)
        .insert([{ coffee_name: coffeeName }]);

      if (error) throw error;
      
      console.log(`Click tracked for coffee: ${coffeeName}`);
    } catch (error) {
      console.error('Error tracking coffee click:', error);
      toast({
        title: "Error",
        description: "Failed to track coffee interaction",
        variant: "destructive",
      });
    }
  };

  const handleCoffeeClick = () => {
    trackCoffeeClick(coffee.name);
    window.open(coffee.url, '_blank');
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <RecommendationScore matchScore={matchScore} />
      
      <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-2">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <CoffeeImage imageUrl={coffee.imageUrl} name={coffee.name} />
        </div>
        
        <div className="p-8 space-y-8">
          <CoffeeDetails
            name={coffee.name}
            description={coffee.description}
            flavorNotes={coffee.flavorNotes}
          />
          
          <div className="space-y-4">
            <ActionButtons
              url={coffee.url}
              onTryAnother={onTryAnother}
              onReset={onReset}
              onBuyClick={handleCoffeeClick}
            />
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-full hover:bg-primary/10 text-primary"
              >
                <a
                  href="https://www.instagram.com/amokkacoffee/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <ChatBot />
    </motion.div>
  );
};
