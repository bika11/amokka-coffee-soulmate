
import { memo } from "react";
import { Coffee } from "@/lib/coffee-data";
import { Card } from "@/components/ui/card";
import { CoffeeImage } from "./CoffeeImage";
import { CoffeeDetails } from "./CoffeeDetails";
import { ActionButtons } from "./ActionButtons";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sanitizeString } from "@/lib/utils";
import { motion } from "framer-motion";

interface CoffeeCardProps {
  coffee: Coffee;
  onTryAnother: () => void;
  onReset: () => void;
  onBuyClick: () => void;
}

export const CoffeeCard = memo(({ 
  coffee, 
  onTryAnother, 
  onReset, 
  onBuyClick 
}: CoffeeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-2">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <CoffeeImage imageUrl={coffee.imageUrl} name={coffee.name} />
        </div>
        
        <div className="p-8 space-y-8">
          <CoffeeDetails
            name={sanitizeString(coffee.name)}
            description={sanitizeString(coffee.description)}
            flavorNotes={coffee.flavorNotes.map(sanitizeString)}
          />
          
          <div className="space-y-4">
            <ActionButtons
              url={coffee.url}
              onTryAnother={onTryAnother}
              onReset={onReset}
              onBuyClick={onBuyClick}
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
    </motion.div>
  );
});

CoffeeCard.displayName = "CoffeeCard";
