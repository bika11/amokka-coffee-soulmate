import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from "@/lib/utils";

interface RecommendationScoreProps {
  matchScore: number;
}

export const RecommendationScore = ({ matchScore }: RecommendationScoreProps) => {
  const matchText = matchScore >= 8 
    ? "Perfect Match!" 
    : matchScore >= 6 
    ? "Great Match" 
    : "Good Match";

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-500";
    if (score >= 6) return "text-amber-500";
    return "text-blue-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 8) return "#10b981"; // emerald-500
    if (score >= 6) return "#f59e0b"; // amber-500
    return "#3b82f6"; // blue-500
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 mb-8">
      <div className="w-24 h-24">
        <CircularProgressbar
          value={matchScore * 10}
          text={`${matchScore}`}
          styles={buildStyles({
            textSize: '32px',
            pathColor: getProgressColor(matchScore),
            textColor: getProgressColor(matchScore),
            trailColor: '#e5e7eb',
            pathTransitionDuration: 0.5,
          })}
        />
      </div>
      <div className={cn(
        "text-xl font-medium transition-colors duration-300",
        getScoreColor(matchScore)
      )}>
        {matchText}
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Based on your preferences for roast level, flavor notes, and brewing method
      </p>
    </div>
  );
};