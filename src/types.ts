export interface CarbonResult {
  estimatedCarbonKg: number;
  carbonScore: number;
  analysis: string;
  actionableTips: string[];
  topEmissionSources: string[];
  estimatedMonthlyReductionKg: number;
  weeklyGoals: string[];
}

export interface HistoryEntry {
  date: string;
  carbonKg: number;
  score: number;
  activity: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  desc: string;
  achieved: boolean;
  icon: string;
}
