interface RecommendationScoreProps {
  matchScore: number;
}

export const RecommendationScore = ({ matchScore }: RecommendationScoreProps) => {
  const matchText = matchScore >= 8 
    ? "Perfect Match!" 
    : matchScore >= 6 
    ? "Great Match" 
    : "Good Match";

  return (
    <div className="text-center mb-8">
      <div className="text-4xl font-bold text-primary mb-2">{matchScore}/10</div>
      <div className="text-xl font-medium text-muted-foreground">{matchText}</div>
    </div>
  );
};