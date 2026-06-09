export interface ScoreDetail {
  title: string;
  color: string;
  banner: string;
  text: string;
}

/**
 * Categorizes and formats carbon score ratings
 */
export const getScoreDetails = (score: number): ScoreDetail => {
  if (score >= 90) {
    return {
      title: 'Eco Hero 🌱',
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/45 border-emerald-400',
      banner: 'bg-emerald-600',
      text: 'Stellar work! Your day exhibits near-zero emissions. You are a model for carbon neutrality.'
    };
  }
  if (score >= 70) {
    return {
      title: 'Green Champion ♻️',
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/45 border-teal-400',
      banner: 'bg-teal-600',
      text: 'Excellent! Highly sustainable choices, but can be improved with small commuting adaptations.'
    };
  }
  if (score >= 50) {
    return {
      title: 'Improving 🌍',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/45 border-amber-400',
      banner: 'bg-amber-500',
      text: 'Reasonable, yet your daily routine relies on several high-carbon assets like beef burgers or SUV driving.'
    };
  }
  return {
    title: 'Needs Attention ⚠️',
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/45 border-rose-400',
    banner: 'bg-rose-500',
    text: 'High emissions detected. Urgently adopt active travel modes, plant nutrition, or smart household heating.'
  };
};

/**
 * Calculates environmental points based on participant metrics
 */
export const calculatePoints = (
  completedTipsCount: number,
  completedGoalsCount: number,
  achievedBadgesCount: number
): number => {
  return 2100 + (completedTipsCount * 120) + (completedGoalsCount * 250) + (achievedBadgesCount * 400);
};
