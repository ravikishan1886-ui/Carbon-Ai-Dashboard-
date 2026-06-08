import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  HelpCircle, 
  Sparkles,
  BarChart2,
  MessageSquare,
  Trophy,
  Settings,
  Flame,
  ArrowRight
} from 'lucide-react';

interface CarbonResult {
  estimatedCarbonKg: number;
  analysis: string;
  actionableTips: string[];
}

export default function App() {
  const [activity, setActivity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CarbonResult | null>(null);
  
  // Interactive checklist for custom tips
  const [completedTips, setCompletedTips] = useState<boolean[]>([]);
  
  // High-fidelity touch: persistent active navigation tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sample presets to help users understand how to phrase their activities
  const presets = [
    {
      label: "🚗 Average Commute",
      text: "I drove 25 km to work and back in an older gasoline-powered SUV, then had a steak for dinner."
    },
    {
      label: "✈️ Travel Weekend",
      text: "Flew economy class from New York to Washington DC (about 350 km) and took a 20-minute Uber ride."
    },
    {
      label: "🌱 Low-Carbon Day",
      text: "Took the electric subway to work, ate purely plant-based meals today, and kept all house heating turned off."
    }
  ];

  // Restore previous calculation on load
  useEffect(() => {
    const saved = localStorage.getItem('last_carbon_result');
    const savedActivity = localStorage.getItem('last_carbon_activity');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResult(parsed);
        setCompletedTips(new Array(parsed.actionableTips?.length || 0).fill(false));
      } catch (e) {
        localStorage.removeItem('last_carbon_result');
      }
    }
    if (savedActivity) {
      setActivity(savedActivity);
    }
  }, []);

  const handlePresetClick = (presetText: string) => {
    setActivity(presetText);
    setError(null);
  };

  const calculateFootprint = async () => {
    if (!activity.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/eco-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userActivity: activity }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to analyze activity. Please check backend connection.");
      }

      const data: CarbonResult = await response.json();
      
      // Save to localStorage
      localStorage.setItem('last_carbon_result', JSON.stringify(data));
      localStorage.setItem('last_carbon_activity', activity);

      setResult(data);
      setCompletedTips(new Array(data.actionableTips?.length || 0).fill(false));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTip = (index: number) => {
    const next = [...completedTips];
    next[index] = !next[index];
    setCompletedTips(next);
  };

  const handleReset = () => {
    setActivity('');
    setResult(null);
    setCompletedTips([]);
    setError(null);
    localStorage.removeItem('last_carbon_result');
    localStorage.removeItem('last_carbon_activity');
  };

  // Compute stats dynamically based on checklist completion
  const completedCount = completedTips.filter(Boolean).length;
  const totalEcoPoints = 2480 + (completedCount * 100);

  return (
    <div id="carbon-ai-root" className="min-h-screen bg-[#F0FDF4] flex font-sans overflow-x-hidden text-slate-900">
      
      {/* Left Navigation Rail (Responsive: hidden on mobile, compact on md+) */}
      <nav className="hidden sm:flex w-24 bg-emerald-900 flex-col items-center py-8 gap-10 shrink-0">
        <div className="w-12 h-12 bg-emerald-400 rounded-2xl flex items-center justify-center text-emerald-900 text-2xl shadow-lg shadow-emerald-400/20">
          🌱
        </div>
        <div className="flex flex-col gap-8 text-white/60">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-emerald-800 text-emerald-300 opacity-100' : 'hover:opacity-100 hover:text-white'}`}
            title="Dashboard"
          >
            <BarChart2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTab === 'chat' ? 'bg-emerald-800 text-emerald-300 opacity-100' : 'hover:opacity-100 hover:text-white'}`}
            title="Assistant chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('rewards')} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTab === 'rewards' ? 'bg-emerald-800 text-emerald-300 opacity-100' : 'hover:opacity-100 hover:text-white'}`}
            title="Rewards"
          >
            <Trophy className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-emerald-800 text-emerald-300 opacity-100' : 'hover:opacity-100 hover:text-white'}`}
            title="Configuration"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-auto mb-4">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-400/30 bg-emerald-800 flex items-center justify-center text-sm font-bold text-emerald-200">
            C
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 sm:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* Header Block with styling from design HTML */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-emerald-900 tracking-tight flex items-center gap-2">
              <span className="sm:hidden text-2xl">🌱</span> Carbon AI Dashboard
            </h1>
            <p className="text-emerald-700/80 font-medium text-sm sm:text-base mt-1">
              Powered by Gemini 3.5 Flash • Real-time Emission Tracking
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <div className="px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-xs font-bold border border-emerald-200 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </div>
            <div className="px-4 py-2 bg-white border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold shadow-sm">
              MOBILE APP SYNCED
            </div>
          </div>
        </header>

        {/* Dynamic Warning Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              id="error-block"
              className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl mb-8 flex items-start gap-3 text-red-950 text-sm max-w-full"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Emissions Analysis Halted</p>
                <p className="opacity-90 leading-relaxed text-xs sm:text-sm mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Split Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Activity input Module (Spans 7 columns on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm">
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-sm">✍️</div>
                  <h2 className="text-lg font-bold text-emerald-900">Activity Input</h2>
                </div>
                
                {activity && (
                  <button
                    id="btn-reset"
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-all"
                    title="Reset calculations and inputs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mb-4 italic">
                Describe your day to calculate emissions naturally, e.g., "I drove 15 miles in a gasoline SUV to pick up groceries and used plastic bags."
              </p>

              <textarea 
                id="txt-activity-input"
                className="w-full h-44 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none transition-all placeholder-slate-400"
                placeholder="Type or try one of our smart presets below..."
                value={activity}
                onChange={(e) => {
                  setActivity(e.target.value);
                  if (error) setError(null);
                }}
              />

              {/* Presets Grid */}
              <div id="presets-panel" className="mt-4">
                <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Smart Presets</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      id={`btn-preset-${idx}`}
                      onClick={() => handlePresetClick(preset.text)}
                      className="px-3 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-600 cursor-pointer text-left transition-all truncate"
                      title={preset.text}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Core trigger button */}
              <button 
                id="btn-calculate"
                onClick={calculateFootprint}
                disabled={loading || !activity.trim()}
                className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-200/50 disabled:bg-emerald-400 disabled:shadow-none disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Calculating emissions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Footprint
                  </>
                )}
              </button>
            </div>

            {/* Target & Point Progression Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-emerald-50 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Daily Carbon Limit</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">5.0 <span className="text-xs text-slate-400">kg CO₂e</span></p>
                </div>
                <div className="text-2xl opacity-80">🎯</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-emerald-50 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Eco Club Points</p>
                  <p className="text-2xl font-black text-emerald-950 mt-1" id="eco-points-display">
                    {totalEcoPoints.toLocaleString()} <span className="text-xs text-emerald-600 font-bold">PTS</span>
                  </p>
                </div>
                <div className="text-2xl animate-bounce">🏆</div>
              </div>
            </div>

          </div>

          {/* Right Panel: Analysis & Impact Report (Spans 5 columns on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col min-h-[480px]">
              
              {/* Header block for Report */}
              <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm">🔥</div>
                  <h2 className="text-lg font-bold text-emerald-900">Impact Report</h2>
                </div>
                {result && (
                  <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded-full ${
                    result.estimatedCarbonKg < 5 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : result.estimatedCarbonKg < 15 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-rose-50 text-red-700 border border-rose-200'
                  }`}>
                    {result.estimatedCarbonKg < 5 ? 'LOW footprint' : result.estimatedCarbonKg < 15 ? 'MODERATE footprint' : 'HIGH footprint'}
                  </span>
                )}
              </div>

              {/* Analysis container with beautiful states */}
              {result ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Massive Numeric Carbon Footprint Display Banner */}
                    <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-slate-100/60 mb-6">
                      <div className="text-5xl sm:text-6xl font-black text-red-650" id="estimated-footprint">
                        {result.estimatedCarbonKg.toFixed(2)}
                      </div>
                      <div className="text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                        Estimated kg CO₂e
                      </div>
                    </div>

                    {/* Detailed evaluation paragraphs */}
                    <div className="bg-gradient-to-br from-slate-50 to-emerald-50/10 p-5 rounded-2xl border border-slate-100 mb-6">
                      <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                        AI Assessment
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed" id="result-analysis">
                        {result.analysis}
                      </p>
                    </div>

                    {/* Actionable recommendations list */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                          Actionable Tips
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400">
                          {completedCount} / {result.actionableTips?.length} Done (+{completedCount * 100} PTS)
                        </span>
                      </div>

                      <ul className="space-y-2.5">
                        {result.actionableTips?.map((tip, idx) => (
                          <li 
                            key={idx}
                            id={`tip-card-${idx}`}
                            onClick={() => toggleTip(idx)}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              completedTips[idx]
                                ? 'bg-emerald-50/30 border-emerald-100 text-slate-400 line-through'
                                : 'bg-slate-50/40 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/15'
                            }`}
                          >
                            <button className="shrink-0 mt-0.5" title="Toggle task progress">
                              <CheckCircle className={`w-4 h-4 transition-all ${
                                completedTips[idx] ? 'text-emerald-650 fill-emerald-100' : 'text-slate-350'
                              }`} />
                            </button>
                            <span className="text-xs text-slate-600 leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Sync status and participants footer */}
                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">STATUS: SYNCED</div>
                    <div className="flex -space-x-1.5 leading-none">
                      <div className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-emerald-850">A</div>
                      <div className="w-6 h-6 rounded-full bg-emerald-300 border-2 border-white flex items-center justify-center text-[8px] font-bold text-emerald-900">B</div>
                      <div className="w-6 h-6 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center text-[8px] font-bold text-emerald-950">C</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Premium Welcome Empty State inside Result panel */
                <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-slate-50/40 rounded-2xl border-2 border-dashed border-emerald-100/60">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">
                    🌱
                  </div>
                  <h3 className="font-bold text-emerald-900 text-base mb-1">Awaiting Carbon Input</h3>
                  <p className="text-xs text-slate-450 max-w-xs leading-relaxed mb-6">
                    Write standard daily actions or select one of the smart presets to calculate your environmental impact instantly using advanced schemas.
                  </p>
                  
                  <div className="w-full space-y-2 text-left bg-white p-3.5 border border-slate-100 rounded-xl shadow-sm text-xs text-slate-500">
                    <span className="block font-bold text-emerald-800 text-[10px] uppercase tracking-wider mb-1.5">Emission targets</span>
                    <div className="flex items-center justify-between py-1 border-b border-slate-50">
                      <span>Low footprints</span>
                      <span className="font-mono text-emerald-600 font-bold">&lt; 5.0 kg</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-50">
                      <span>Moderate footprints</span>
                      <span className="font-mono text-amber-600 font-bold">5.0 - 15.0 kg</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>High emissions warning</span>
                      <span className="font-mono text-rose-600 font-bold">&gt; 15.0 kg</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
