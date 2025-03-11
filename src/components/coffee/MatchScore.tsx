
import { motion } from "framer-motion";
import { RecommendationScore } from "./RecommendationScore";
import { memo } from "react";

interface MatchScoreProps {
  matchScore: number;
}

export const MatchScore = memo(({ matchScore }: MatchScoreProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RecommendationScore matchScore={matchScore} />
    </motion.div>
  );
});

MatchScore.displayName = "MatchScore";
