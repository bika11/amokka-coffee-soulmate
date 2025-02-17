import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from "@/lib/utils";
import { Coffee } from "lucide-react";

interface RecommendationScoreProps {
  matchScore: number;
}

export const RecommendationScore = ({ matchScore }: RecommendationScoreProps) => {
  const getMatchQuality = (score: number) => {
    if (score >= 8) return {
      label: "Perfect Match",
      description: "This coffee aligns perfectly with your preferences",
      icon: "✨",
      color: "text-emerald-500"
    };
    if (score >= 6) return {
      label: "Great Match",
      description: "This coffee matches most of your preferences",
      icon: "🎯",
      color: "text-amber-500"
    };
    return {
      label: "Good Match",
      description: "This coffee matches some of your preferences",
      icon: "👍",
      color: "text-blue-500"
    };
  };

  const matchQuality = getMatchQuality(matchScore);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 mb-8">
      <img 
        src="/amokka-og.png" 
        alt="Amokka Logo" 
        className="w-32 h-auto mb-2"
      />
      
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse">
        <span className="text-3xl" role="img" aria-label="match quality">
          {matchQuality.icon}
        </span>
      </div>
      
      <div className="text-center space-y-2">
        <div className={cn(
          "text-xl font-medium transition-colors duration-300",
          matchQuality.color
        )}>
          {matchQuality.label}
        </div>
        <p className="text-sm text-muted-foreground max-w-sm">
          {matchQuality.description}
        </p>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Coffee className="w-4 h-4" />
        <span>Based on your roast level, flavor notes, and brewing preferences</span>
      </div>
    </div>
  );
};