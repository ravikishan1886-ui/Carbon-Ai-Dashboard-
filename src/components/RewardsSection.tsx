import React from "react";
import { BadgeItem } from "../types";

export interface RewardsSectionProps {
  isDarkMode: boolean;
  ecoPointsCount: number;
  badges: BadgeItem[];
  achievedBadgesCount: number;
}

export const RewardsSection: React.FC<RewardsSectionProps> = ({
  isDarkMode,
  ecoPointsCount,
}) => {
  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 rounded-2xl flex items-center justify-center text-2xl">
            🏆
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-100">
              Eco Club Rewards Program
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete activities, preserve daily targets, and finalize active carbon checks to earn
              points.
            </p>
          </div>
        </div>

        {/* Points banner detail */}
        <div className="mt-6 p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-250 block font-bold">
              Total Environmental Balance
            </span>
            <strong className="text-3xl sm:text-4xl font-black tracking-tight mt-1 block">
              {ecoPointsCount.toLocaleString()} PTS
            </strong>
          </div>

          <div className="text-right">
            <span className="text-[10px] bg-white/20 px-2 py-1 rounded uppercase tracking-wider font-extrabold text-white">
              Elite Green tier
            </span>
            <p className="text-[11px] mt-1 text-emerald-200">Next tier unlock at 5,000 PTS</p>
          </div>
        </div>

        <section className="mt-8">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-3">
            Rewards Rules & Achievements Guide
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <span className="text-lg">🎯</span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-emerald-100">
                    Complete Carbon Calculations
                  </h4>
                  <p className="text-slate-450 dark:text-slate-500 leading-tight">
                    Review daily travels or food portions with structured AI diagnostics.
                  </p>
                </div>
              </div>
              <strong className="text-slate-900 dark:text-emerald-400">120 PTS</strong>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <span className="text-lg">⚡</span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-emerald-100">
                    Preserve under 5.0 kg Target
                  </h4>
                  <p className="text-slate-450 dark:text-slate-500 leading-tight">
                    Maintain direct ecological day results with zero fossil fuel emissions.
                  </p>
                </div>
              </div>
              <strong className="text-slate-900 dark:text-emerald-400">250 PTS</strong>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <span className="text-lg">🚲</span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-emerald-100">
                    Activate Commuter Shield badge
                  </h4>
                  <p className="text-slate-450 dark:text-slate-500 leading-tight">
                    Switch standard vehicle commute with active cycling or electric subway travel.
                  </p>
                </div>
              </div>
              <strong className="text-slate-900 dark:text-emerald-400">400 PTS</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
