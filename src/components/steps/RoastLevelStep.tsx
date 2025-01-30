import { Button } from "@/components/ui/button";
import { RoastLevelSlider } from "@/components/RoastLevelSlider";

interface RoastLevelStepProps {
  value: number;
  onChange: (value: number) => void;
  onNext: () => void;
}

export const RoastLevelStep = ({
  value,
  onChange,
  onNext,
}: RoastLevelStepProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">
        Select your preferred roast level
      </h2>
      <RoastLevelSlider value={value} onChange={onChange} />
      <div className="flex justify-end">
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
};