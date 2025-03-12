
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_TABLES } from "@/integrations/supabase/constants";
import { measureQueryPerformance, clearCache } from "@/utils/performance";

export const useCoffeeTracking = () => {
  const { toast } = useToast();

  const trackCoffeeClick = useCallback(async (coffeeName: string) => {
    const endMeasure = measureQueryPerformance(`trackCoffeeClick:${coffeeName}`);
    
    try {
      const { error } = await supabase
        .from(SUPABASE_TABLES.COFFEE_CLICKS)
        .insert([{ coffee_name: coffeeName }]);

      if (error) throw error;
      
      console.log(`Click tracked for coffee: ${coffeeName}`);
      
      // Clear any related cache that might depend on click data
      clearCache(`recommendations:${coffeeName}`);
      
      endMeasure();
    } catch (error) {
      console.error('Error tracking coffee click:', error);
      endMeasure();
      
      toast({
        title: "Error",
        description: "Failed to track coffee interaction",
        variant: "destructive",
      });
    }
  }, [toast]);

  return { trackCoffeeClick };
};
