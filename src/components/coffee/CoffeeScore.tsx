
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from "@/lib/utils";
import { Coffee } from "lucide-react";
import { memo } from "react";

interface CoffeeScoreProps {
  matchScore: number;
  showAnimation?: boolean;
  showProgressBar?: boolean;
  showLogo?: boolean;
  showDescription?: boolean;
  variant?: 'match' | 'recommendation';
}

/**
 * Unified component for displaying coffee match and recommendation scores
 * Replaces both MatchScore and RecommendationScore components
 */
export const CoffeeScore = memo(({ 
  matchScore, 
  showAnimation = true,
  showProgressBar = false,
  showLogo = true,
  showDescription = true,
  variant = 'match'
}: CoffeeScoreProps) => {
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
  const Component = showAnimation ? motion.div : 'div';

  return (
    <Component 
      className="flex flex-col items-center justify-center space-y-6 mb-8"
      {...(showAnimation ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
      } : {})}
    >
      {showLogo && (
        <img 
          src="/amokka_LOGO_primary_POS.svg" 
          alt="Amokka Logo" 
          className="w-32 h-auto mb-2"
        />
      )}
      
      {showProgressBar && (
        <div className="w-24 h-24 mb-4">
          <CircularProgressbar 
            value={matchScore * 10} 
            text={`${matchScore}/10`}
            styles={buildStyles({
              textSize: '22px',
              pathColor: matchScore >= 8 ? '#10b981' : matchScore >= 6 ? '#f59e0b' : '#3b82f6',
              textColor: '#64748b',
              trailColor: '#e2e8f0',
            })}
          />
        </div>
      )}
      
      <div className="text-center space-y-2">
        <div className={cn(
          "text-xl font-medium transition-colors duration-300",
          matchQuality.color
        )}>
          {matchQuality.label}
        </div>
        {showDescription && (
          <p className="text-sm text-muted-foreground max-w-sm">
            {matchQuality.description}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Coffee className="w-4 h-4" />
        <span>Based on your roast level, flavor notes, and brewing preferences</span>
      </div>
    </Component>
  );
});

CoffeeScore.displayName = "CoffeeScore";
