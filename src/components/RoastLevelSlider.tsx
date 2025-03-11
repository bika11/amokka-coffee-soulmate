
import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { memo, useCallback } from "react";

interface RoastLevelSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const RoastLevelSlider = memo(({ value, onChange }: RoastLevelSliderProps) => {
  const handleValueChange = useCallback((values: number[]) => {
    onChange(values[0]);
  }, [onChange]);

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Very Light";
      case 2:
        return "Light";
      case 3:
        return "Medium Light";
      case 4:
        return "Medium";
      case 5:
        return "Medium Dark";
      case 6:
        return "Dark";
      default:
        return "";
    }
  };

  return (
    <div className="w-full space-y-4">
      <Slider
        value={[value]}
        onValueChange={handleValueChange}
        max={6}
        min={1}
        step={1}
        className="w-full"
      />
      <div className="text-center text-lg font-medium">
        {getLevelLabel(value)}
      </div>
    </div>
  );
});

RoastLevelSlider.displayName = "RoastLevelSlider";
