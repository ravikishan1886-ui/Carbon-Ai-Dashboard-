import React from "react";

export interface SettingsSectionProps {
  isDarkMode: boolean;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ isDarkMode }) => {
  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald-100"
        }`}
      >
        <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-100 mb-2">
          Systems Parameters Admin Panel
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Manage API keys, environment settings, calculations parameters, and local data
          persistence.
        </p>

        <div className="space-y-5">
          {/* Simulated API Secret Key */}
          <div>
            <label className="block text-xs uppercase font-extrabold text-slate-400 mb-2">
              Google Gemini API key status
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value="********************************************************"
                disabled
                className="flex-1 p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs sm:text-sm rounded-xl text-slate-400 bg-slate-50 dark:bg-slate-900/40"
              />
              <div className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-4 rounded-xl flex items-center justify-center">
                Configured
              </div>
            </div>
            <p className="text-[10.5px] text-slate-450 dark:text-slate-500 mt-1 leading-normal">
              API Keys are administered through the AI Studio Secrets menu. There is no custom UI
              allowed to override this directly inside the viewport.
            </p>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Local storage actions reset */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
              Clear Application state
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Urgently clear tracking history, badges, and chat conversation records cached inside
              your browser storage.
            </p>

            <button
              onClick={() => {
                if (
                  confirm(
                    "Urgently wipe all local history calculations and clear cached dashboard items?"
                  )
                ) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/45 text-rose-600 hover:text-rose-700 dark:text-red-400 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Clear All Cached Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
