
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_TABLES } from "@/integrations/supabase/constants";

export const useCoffeeTracking = () => {
  const { toast } = useToast();

  const trackCoffeeClick = useCallback(async (coffeeName: string) => {
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
  }, [toast]);

  return { trackCoffeeClick };
};
