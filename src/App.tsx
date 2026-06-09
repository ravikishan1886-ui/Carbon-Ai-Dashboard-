import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getScoreDetails, calculatePoints } from './utils';
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
  ArrowRight,
  Sun,
  Moon,
  Trash2,
  Download,
  Award,
  TrendingDown,
  Activity,
  Send,
  Zap,
  Globe,
  Plus
} from 'lucide-react';

interface CarbonResult {
  estimatedCarbonKg: number;
  carbonScore: number;
  analysis: string;
  actionableTips: string[];
  topEmissionSources: string[];
  estimatedMonthlyReductionKg: number;
  weeklyGoals: string[];
}

interface HistoryEntry {
  date: string;
  carbonKg: number;
  score: number;
  activity: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  id: string;
}

const PRE_SEEDED_HISTORY: HistoryEntry[] = [
  { date: "June 5", carbonKg: 12.8, score: 62, activity: "Drove 20km to office in an SUVs, had a standard beef burger for lunch." },
  { date: "June 6", carbonKg: 19.5, score: 41, activity: "Flew short regional flight for a family visit, rode a conventional taxi." },
  { date: "June 7", carbonKg: 5.6, score: 82, activity: "Took electric train, had vegetarian pasta with spinach salad." },
  { date: "June 8", carbonKg: 2.3, score: 96, activity: "Worked from home, turned off major climate systems, cooked plants." },
];

export default function App() {
  const [activity, setActivity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CarbonResult | null>(null);
  
  // Interactive checklist for custom tips
  const [completedTips, setCompletedTips] = useState<boolean[]>([]);
  
  // Sidebar tab state: 'dashboard' | 'chat' | 'rewards' | 'settings'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Unified theme toggling
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Carbon history tracker for line-graph logging
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // Hovered node index on the graphics component for dynamic tooltip
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  // Chat coaching message history and controller states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Export report visualization modal state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Weekly goals completion checks
  const [completedWeeklyGoals, setCompletedWeeklyGoals] = useState<boolean[]>([false, false, false]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample presets to help users understand how to phrase their activities
  const presets = [
    {
      label: "🚗 Average SUV Commute",
      text: "I drove 25 km in a gasoline-powered SUV, ate a steak for dinner, and did laundry in hot water."
    },
    {
      label: "🚇 Low-Carbon Transit Day",
      text: "Took the electric subway to work, ate purely plant-based meals today, composted waste, and turned off heating."
    },
    {
      label: "✈️ Weekend Travel Fly",
      text: "Flew economy class from New York to Philadelphia, took a gasoline Uber, and bought takeaway in plastic boxes."
    }
  ];

  // Load persistence configurations
  useEffect(() => {
    // Theme preference load
    const savedTheme = localStorage.getItem('theme_dark');
    if (savedTheme === 'true') {
      setIsDarkMode(true);
    }

    // Historical calculations
    const savedHistory = localStorage.getItem('carbon_history_store');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          const sanitizedHistory = parsedHistory.map((item: any) => ({
            date: item.date || "Unknown",
            carbonKg: typeof item.carbonKg === 'number' ? item.carbonKg : (typeof item.carbon === 'number' ? item.carbon : (typeof item.estimatedCarbon === 'number' ? item.estimatedCarbon : 0)),
            score: typeof item.score === 'number' ? item.score : (typeof item.carbonScore === 'number' ? item.carbonScore : 50),
            activity: item.activity || ""
          }));
          setHistory(sanitizedHistory);
        } else {
          setHistory(PRE_SEEDED_HISTORY);
        }
      } catch (err) {
        setHistory(PRE_SEEDED_HISTORY);
      }
    } else {
      setHistory(PRE_SEEDED_HISTORY);
      localStorage.setItem('carbon_history_store', JSON.stringify(PRE_SEEDED_HISTORY));
    }

    // Restore previous calculation on load
    const savedLastResult = localStorage.getItem('last_carbon_result');
    const savedActivity = localStorage.getItem('last_carbon_activity');
    if (savedLastResult) {
      try {
        const parsed = JSON.parse(savedLastResult);
        if (parsed) {
          const sanitizedResult: CarbonResult = {
            estimatedCarbonKg: typeof parsed.estimatedCarbonKg === 'number' ? parsed.estimatedCarbonKg : (typeof parsed.estimatedCarbon === 'number' ? parsed.estimatedCarbon : 0),
            carbonScore: typeof parsed.carbonScore === 'number' ? parsed.carbonScore : (typeof parsed.score === 'number' ? parsed.score : 50),
            analysis: parsed.analysis || parsed.evaluation || "",
            actionableTips: Array.isArray(parsed.actionableTips) ? parsed.actionableTips : [],
            topEmissionSources: Array.isArray(parsed.topEmissionSources) ? parsed.topEmissionSources : [],
            estimatedMonthlyReductionKg: typeof parsed.estimatedMonthlyReductionKg === 'number' ? parsed.estimatedMonthlyReductionKg : 0,
            weeklyGoals: Array.isArray(parsed.weeklyGoals) ? parsed.weeklyGoals : []
          };
          setResult(sanitizedResult);
          setCompletedTips(new Array(sanitizedResult.actionableTips?.length || 0).fill(false));
        }
      } catch (e) {
        localStorage.removeItem('last_carbon_result');
      }
    }
    if (savedActivity) {
      setActivity(savedActivity);
    }

    // Initialize chat coach
    const initialGreeting: ChatMessage[] = [
      {
        id: 'greet-1',
        role: 'model',
        content: `👋 Hello! I am **Sustaina**, your AI Carbon Coach. 
        
I can calculate your emissions footprint, analyze your food/commute choices, and suggest tailored weekly goals. 

How can I help you improve your **Carbon Score** today? Ask me anything about environmental preservation!`
      }
    ];
    setChatHistory(initialGreeting);
  }, []);

  // Sync scroll on chat addition
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, chatLoading]);

  const toggleTheme = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem('theme_dark', String(newVal));
  };

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
        throw new Error(errData.error || "Failed to analyze activity. Please check your internet or API key.");
      }

      const data: CarbonResult = await response.json();
      
      // Save details
      localStorage.setItem('last_carbon_result', JSON.stringify(data));
      localStorage.setItem('last_carbon_activity', activity);

      setResult(data);
      setCompletedTips(new Array(data.actionableTips?.length || 0).fill(false));

      // Append calculation results to our history for graphics rendering
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      const dateName = today.toLocaleDateString('en-US', options);

      // Avoid double entry on the same activity run by replacing or pushing
      const updatedHistory = [...history, {
        date: dateName,
        carbonKg: data.estimatedCarbonKg,
        score: data.carbonScore,
        activity: activity.substring(0, 60) + (activity.length > 60 ? "..." : "")
      }];
      
      // Keep within trailing 8 logs
      if (updatedHistory.length > 8) {
        updatedHistory.shift();
      }

      setHistory(updatedHistory);
      localStorage.setItem('carbon_history_store', JSON.stringify(updatedHistory));
      setCompletedWeeklyGoals([false, false, false]); // reset checkboxes for new goals

    } catch (err: any) {
      console.error("Gracefully handled error layout update:", err);
      setError("Unable to fetch real-time footprint data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTip = (index: number) => {
    const next = [...completedTips];
    next[index] = !next[index];
    setCompletedTips(next);
  };

  const toggleWeeklyGoal = (index: number) => {
    const next = [...completedWeeklyGoals];
    next[index] = !next[index];
    setCompletedWeeklyGoals(next);
  };

  const handleReset = () => {
    setActivity('');
    setResult(null);
    setCompletedTips([]);
    setError(null);
    localStorage.removeItem('last_carbon_result');
    localStorage.removeItem('last_carbon_activity');
  };

  const clearMetricsHistory = () => {
    if (window.confirm("Do you want to reset your historical calculations back to defaults?")) {
      setHistory(PRE_SEEDED_HISTORY);
      localStorage.setItem('carbon_history_store', JSON.stringify(PRE_SEEDED_HISTORY));
      handleReset();
    }
  };

  // Submit messages into Coach Chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsgText = chatInput;
    setChatInput('');
    setChatError(null);

    // Update with client message
    const userMessageObj: ChatMessage = {
      id: `chat-${Date.now()}`,
      role: 'user',
      content: userMsgText
    };

    const nextHistory = [...chatHistory, userMessageObj];
    setChatHistory(nextHistory);
    setChatLoading(true);

    try {
      const response = await fetch('/api/eco-coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nextHistory.map(h => ({ role: h.role, content: h.content })),
          currentContext: result ? {
            estimatedCarbonKg: result.estimatedCarbonKg,
            score: result.carbonScore,
            topSources: result.topEmissionSources,
            tips: result.actionableTips
          } : null
        })
      });

      if (!response.ok) {
        throw new Error("Coach failed to respond. Verify server is active.");
      }

      const data = await response.json();
      const coachReply = data.reply || "I encountered an error trying to process that suggestion.";

      setChatHistory(prev => [...prev, {
        id: `chat-${Date.now() + 1}`,
        role: 'model',
        content: coachReply
      }]);
    } catch (err: any) {
      console.error("Gracefully handled error layout update:", err);
      setChatError("Unable to fetch real-time footprint data. Please try again.");
      setChatHistory(prev => [...prev, {
        id: `chat-${Date.now() + 2}`,
        role: 'model',
        content: "⚠️ I had trouble connecting to the server. Please verify your GEMINI_API_KEY is configured in Settings."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Badges completion evaluation
  const badges = [
    {
      id: 'badge1',
      title: 'First Check-in',
      desc: 'Calculate carbon footprint once.',
      achieved: history.length > PRE_SEEDED_HISTORY.length,
      icon: '🎯'
    },
    {
      id: 'badge2',
      title: 'Energy Saver',
      desc: 'Active when Carbon Score > 80.',
      achieved: history.some(h => h.score >= 80),
      icon: '⚡'
    },
    {
      id: 'badge3',
      title: 'Green Commuter',
      desc: 'Complete an eco check with low travel impact.',
      achieved: history.some(h => h.carbonKg < 6),
      icon: '🚲'
    },
    {
      id: 'badge4',
      title: 'Eco Hero Legend',
      desc: 'Achieve a Carbon Score above 90+.',
      achieved: history.some(h => h.score >= 90),
      icon: '🌱'
    }
  ];

  // Eco points computed dynamically
  const completedTipsCount = completedTips.filter(Boolean).length;
  const completedGoalsCount = completedWeeklyGoals.filter(Boolean).length;
  const achievedBadgesCount = badges.filter(b => b.achieved).length;
  const ecoPointsCount = calculatePoints(completedTipsCount, completedGoalsCount, achievedBadgesCount);

  // SVG Chart points computation
  const svgW = 520;
  const svgH = 160;
  const padL = 45;
  const padR = 25;
  const padT = 25;
  const padB = 30;

  const maxHistoryCarbon = Math.max(...history.map(h => typeof h.carbonKg === 'number' ? h.carbonKg : 0), 18);
  const minHistoryCarbon = 0;

  const chartPoints = history.map((entry, idx) => {
    const x = padL + (idx / (history.length - 1 || 1)) * (svgW - padL - padR);
    const carbonVal = typeof entry.carbonKg === 'number' ? entry.carbonKg : 0;
    const y = svgH - padB - ((carbonVal - minHistoryCarbon) / (maxHistoryCarbon - minHistoryCarbon)) * (svgH - padT - padB);
    return { x, y, ...entry, carbonKg: carbonVal };
  });

  // Native Trigger window print styling for carbon report
  const triggerPrintReport = () => {
    window.print();
  };

  // A helper component to translate basic Markdown (paragraphs, bullet points, headers, bold markup)
  const renderMarkdownText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-slate-700 dark:text-slate-300 text-sm">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-2"></div>;
          
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            return (
              <li key={lIdx} className="list-disc ml-5 pl-1 text-slate-700 dark:text-slate-300">
                {parseBoldMarkdown(content)}
              </li>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={lIdx} className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mt-3 flex items-center gap-1">
                {trimmed.substring(4)}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={lIdx} className="text-base font-extrabold text-emerald-900 dark:text-emerald-200 mt-4">
                {trimmed.substring(3)}
              </h3>
            );
          }
          return <p key={lIdx}>{parseBoldMarkdown(trimmed)}</p>;
        })}
      </div>
    );
  };

  const parseBoldMarkdown = (text: string) => {
    const regex = /\*\*(.*?)\*\*/g;
    const parts = text.split(regex);
    return parts.map((part, index) => 
      index % 2 === 1 ? <strong key={index} className="font-extrabold text-slate-900 dark:text-white">{part}</strong> : part
    );
  };

  return (
    <div id="carbon-ai-root" className={`min-h-screen flex font-sans transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-slate-950 text-slate-100 dark' 
        : 'bg-[#F0FDF4] text-slate-900'
    }`}>
      
      {/* Sidebar Navigation - Vibrant styled to match design rail instructions */}
      <nav id="sidebar" className={`w-20 hidden sm:flex flex-col items-center py-8 gap-9 shrink-0 shadow-lg ${
        isDarkMode 
          ? 'bg-slate-900 border-r border-slate-800' 
          : 'bg-emerald-950'
      }`}>
        {/* Launcher icon */}
        <div className="w-11 h-11 bg-emerald-400 rounded-2xl flex items-center justify-center text-emerald-950 text-xl font-bold shadow-lg shadow-emerald-400/20 antialiased hover:scale-105 transition-transform">
          🌱
        </div>

        {/* Sidebar Tabs */}
        <div className="flex flex-col gap-6 text-white/50 w-full px-2">
          <button 
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`w-12 h-12 mx-auto rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-emerald-500 text-white shadow-md font-bold scale-[1.08]' 
                : 'hover:text-white hover:bg-white/10'
            }`}
            title="Dashboard Monitor"
            aria-label="Access Carbon Footprint Dashboard"
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[9px] mt-0.5 tracking-tighter">Panel</span>
          </button>

          <button 
            id="tab-chat"
            onClick={() => setActiveTab('chat')}
            className={`w-12 h-12 mx-auto rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'chat' 
                ? 'bg-emerald-500 text-white shadow-md font-bold scale-[1.08]' 
                : 'hover:text-white hover:bg-white/10'
            }`}
            title="Sustaina AI Sustainability Coach"
            aria-label="Sustaina AI Sustainability Coach Chat"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            </div>
            <span className="text-[9px] mt-0.5 tracking-tighter">Coach</span>
          </button>

          <button 
            id="tab-rewards"
            onClick={() => setActiveTab('rewards')}
            className={`w-12 h-12 mx-auto rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'rewards' 
                ? 'bg-emerald-500 text-white shadow-md font-bold scale-[1.08]' 
                : 'hover:text-white hover:bg-white/10'
            }`}
            title="Eco Achievements"
            aria-label="Eco Club Rewards and Achievements"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[9px] mt-0.5 tracking-tighter">Club</span>
          </button>

          <button 
            id="tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`w-12 h-12 mx-auto rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-emerald-500 text-white shadow-md font-bold scale-[1.08]' 
                : 'hover:text-white hover:bg-white/10'
            }`}
            title="Carbon parameters"
            aria-label="Carbon settings and variables"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] mt-0.5 tracking-tighter">Admin</span>
          </button>
        </div>

        {/* Global theme controls at bottom of rail */}
        <div className="mt-auto flex flex-col gap-4 items-center">
          <button 
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-yellow-400' 
                : 'bg-emerald-900 border-emerald-800 text-emerald-100 hover:bg-emerald-800'
            }`}
            title="Toggle color theme"
            aria-label="Toggle light and dark color theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="w-9 h-9 rounded-full bg-emerald-800 border-2 border-emerald-400/40 flex items-center justify-center text-[10px] font-black text-emerald-200">
            RK
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col p-4 pb-20 sm:p-9 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* Responsive Header block matching Vibrant design styles */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6 pb-5 border-b border-emerald-150/50 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="sm:hidden text-2xl">🌱</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-250">
                Carbon <span className="text-emerald-500 font-black">AI</span> Dashboard
              </h1>
            </div>
            <p className="text-emerald-700/80 dark:text-slate-400 font-medium text-xs sm:text-sm mt-1 flex items-center gap-1.5">
              <span>Powered by Gemini 3.5 Flash</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-350"></span>
              <span>Awareness Footprint Platform</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Theme Switcher for mobile users */}
            <button 
              onClick={toggleTheme}
              className="sm:hidden px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-100 dark:bg-slate-800 text-emerald-850 dark:text-amber-400 flex items-center gap-1 cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>Theme</span>
            </button>

            {/* Simulated Live Connection stats */}
            <div className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 rounded-full text-emerald-700 dark:text-emerald-400 text-[11px] font-extrabold border border-emerald-200/50 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ACTIVE SECURE
            </div>

            <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-full text-emerald-950 dark:text-slate-300 text-[11px] font-bold shadow-sm">
              SYNCED • ECO ACCURACY 99%
            </div>
          </div>
        </header>

        {/* Warning notification / calculation prompt errors */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              id="error-block"
              className="p-4 bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900/60 rounded-2xl mb-6 flex items-start gap-3 text-red-950 dark:text-red-100 text-sm"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Calculations Interrupted</p>
                <p className="opacity-90 leading-relaxed text-xs sm:text-sm mt-0.5">{error}</p>
                <p className="text-[11px] text-red-700 dark:text-red-300 font-mono mt-1">Check settings / credentials.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick responsive banner summary cards for rewards points context */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-emerald-100'} shadow-xs`}>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-widest">Eco Club Points</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5" id="eco-points-display">
              {ecoPointsCount.toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400">PTS</span>
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-emerald-100'} shadow-xs`}>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-widest">Daily Limit Cap</p>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-0.5">5.0 <span className="text-xs text-slate-500 dark:text-slate-400">kg CO₂</span></p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-emerald-100'} shadow-xs`}>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-widest">Calculations Logged</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {history.length} <span className="text-xs text-slate-500 dark:text-slate-400">runs</span>
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-emerald-100'} shadow-xs`}>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-widest">Unlocked Badges</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
              {achievedBadgesCount} / {badges.length}
            </p>
          </div>
        </div>

        {/* ==================== TAB 1: DASHBOARD MONITOR ==================== */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT AREA: Calculations input + Action plan checklist (7 columns) */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Dynamic activity text calculator */}
              <div className={`border-2 p-5 sm:p-7 rounded-3xl transition-transform ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 shadow-xl' 
                  : 'bg-white border-emerald-100 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center text-sm">✍️</div>
                    <h2 className="text-lg font-black text-emerald-950 dark:text-emerald-100">Carbon Footprint Calculator</h2>
                  </div>

                  {activity && (
                    <button
                      id="btn-reset"
                      onClick={handleReset}
                      className="text-xs text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-all font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 italic">
                  Describe your daily transportation choices, meals, water temperature, or purchasing behaviors naturally. Sourcing models will extract precise metrics.
                </p>

                <textarea
                  id="txt-activity-input"
                  className={`w-full h-36 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-600' 
                      : 'bg-emerald-50/40 border border-emerald-100 text-slate-700 placeholder-slate-400'
                  }`}
                  placeholder="e.g., I drove 12 miles in an old diesel wagon to the organic store, cooked a giant steak steak for lunch with potatoes, and took a hot 15 min shower..."
                  value={activity}
                  onChange={(e) => {
                    setActivity(e.target.value);
                    if (error) setError(null);
                  }}
                />

                {/* Instant Presets section */}
                <div id="presets-panel" className="mt-4">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-2 tracking-wider">Try quick smart presets</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {presets.map((preset, idx) => (
                      <button
                        key={idx}
                        id={`btn-preset-${idx}`}
                        onClick={() => handlePresetClick(preset.text)}
                        className={`px-3 py-2 text-[11px] border rounded-xl cursor-pointer text-left transition-all truncate ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 hover:border-emerald-700 hover:bg-slate-800/80 text-slate-300' 
                            : 'bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-600'
                        }`}
                        title={preset.text}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Calculation trigger */}
                <button
                  id="btn-calculate"
                  onClick={calculateFootprint}
                  disabled={loading || !activity.trim()}
                  className="w-full mt-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-md hover:shadow-emerald-300/40 cursor-pointer disabled:bg-emerald-350 disabled:shadow-none disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Analyzing Your Carbon footprint...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-white/10" />
                      <span>Analyze Day Footprint</span>
                    </>
                  )}
                </button>
              </div>

              {/* Progress Tracking Graph (Dynamic interactive SVG Line graph) */}
              <section 
                id="carbon-emission-trend"
                aria-label="Carbon Emission Trend Section"
                className={`p-5 sm:p-6 rounded-3xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-emerald-100'
                } shadow-xs`}
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <div className="text-emerald-500 font-bold">📈</div>
                    <div>
                      <h3 className="font-extrabold text-emerald-950 dark:text-emerald-100 text-sm">Carbon Emission Trend Graph</h3>
                      <p className="text-[10px] text-slate-400">Hover nodes to view exact metrics</p>
                    </div>
                  </div>

                  <button 
                    onClick={clearMetricsHistory}
                    className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer bg-rose-50 dark:bg-rose-950/35 px-2 py-1 rounded"
                    title="Reset back to default lines"
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    Reset Logs
                  </button>
                </div>

                {/* SVG Graph visualizer */}
                <div className="relative w-full overflow-hidden flex flex-col items-center">
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label="Carbon footprint emission trends chart over time" className="w-full h-auto bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl p-1.5 overflow-visible">
                    
                    {/* Gridlines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                      const yPos = padT + ratio * (svgH - padT - padB);
                      const carbonLabel = (maxHistoryCarbon - ratio * (maxHistoryCarbon - minHistoryCarbon)).toFixed(1);
                      return (
                        <g key={index} className="opacity-40">
                          <line 
                            x1={padL} 
                            y1={yPos} 
                            x2={svgW - padR} 
                            y2={yPos} 
                            stroke={isDarkMode ? "#334155" : "#e2e8f0"} 
                            strokeWidth="1" 
                            strokeDasharray="4 4"
                          />
                          <text 
                            x={padL - 8} 
                            y={yPos + 4} 
                            className="text-[9px] font-mono font-bold fill-slate-400 text-right" 
                            textAnchor="end"
                          >
                            {carbonLabel}
                          </text>
                        </g>
                      );
                    })}

                    {/* Baseline daily Neutral target marker */}
                    <g className="opacity-90">
                      <line 
                        x1={padL} 
                        y1={svgH - padB - (5.0 / maxHistoryCarbon) * (svgH - padT - padB)} 
                        x2={svgW - padR} 
                        y2={svgH - padB - (5.0 / maxHistoryCarbon) * (svgH - padT - padB)} 
                        stroke="#10b981" 
                        strokeWidth="1.5" 
                        strokeDasharray="2 2"
                      />
                      <text 
                        x={svgW - padR - 5} 
                        y={svgH - padB - (5.0 / maxHistoryCarbon) * (svgH - padT - padB) - 4} 
                        className="text-[7px] font-black fill-emerald-600 uppercase tracking-widest text-right"
                        textAnchor="end"
                      >
                        Target 5.0 kg
                      </text>
                    </g>

                    {/* Line Chart path */}
                    {chartPoints.length > 1 && (
                      <path
                        d={chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                        fill="none"
                        stroke="#059669"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />
                    )}

                    {/* Interactive Node Circles */}
                    {chartPoints.map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPointIdx === idx ? 8 : 5}
                        fill={pt.carbonKg <= 5.0 ? "#10b981" : pt.carbonKg <= 15.0 ? "#f59e0b" : "#ef4444"}
                        stroke={isDarkMode ? "#0f172a" : "#ffffff"}
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => setCompletedTips && setHoveredPointIdx(idx)}
                        onMouseLeave={() => setHoveredPointIdx(null)}
                      />
                    ))}

                    {/* Date Horizontal labels */}
                    {chartPoints.map((pt, idx) => (
                      <text
                        key={idx}
                        x={pt.x}
                        y={svgH - 10}
                        className="text-[9px] font-extrabold fill-slate-400 text-center"
                        textAnchor="middle"
                      >
                        {pt.date}
                      </text>
                    ))}
                  </svg>

                  {/* HTML Overlay Tooltip inside the chart */}
                  <AnimatePresence>
                    {hoveredPointIdx !== null && history[hoveredPointIdx] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 shadow-xl max-w-xs text-xs z-25 text-left"
                      >
                        <p className="font-extrabold text-emerald-300">{history[hoveredPointIdx]?.date || 'Unknown'}</p>
                        <p className="font-mono mt-0.5"><span className="text-red-400 font-bold">{(history[hoveredPointIdx]?.carbonKg ?? 0).toFixed(1)} kg CO₂</span> • Carbon Score: <span className="text-yellow-300 font-bold">{history[hoveredPointIdx]?.score ?? 0}</span></p>
                        <p className="text-[10px] text-slate-300 leading-tight mt-1 line-clamp-2 italic">"{history[hoveredPointIdx]?.activity || ''}"</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Achievements & badges Center overview */}
              <section 
                id="achievements-milestones"
                aria-label="Achievements and Milestones Section"
                className={`p-5 sm:p-6 rounded-3xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-emerald-100'
                } shadow-xs`}
              >
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mb-3 flex items-center gap-1">
                  <span>🏆</span> Achievements & Milestones
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {badges.map((b) => (
                    <div 
                      key={b.id} 
                      className={`p-3 rounded-2xl border flex items-start gap-2.5 transition-all ${
                        b.achieved 
                          ? 'bg-emerald-50/65 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200' 
                          : 'bg-slate-50 dark:bg-slate-950/30 border-slate-100 dark:border-slate-900 text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        b.achieved ? 'bg-emerald-200 dark:bg-emerald-900' : 'bg-slate-200 dark:bg-slate-800 filter grayscale opacity-40'
                      }`}>
                        {b.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs sm:text-sm">{b.title}</h4>
                          {b.achieved && (
                            <span className="px-1 text-[8px] tracking-wider uppercase font-extrabold text-white bg-emerald-600 rounded">Awarded</span>
                          )}
                        </div>
                        <p className="text-[10.5px] mt-0.5 leading-tight opacity-75">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* RIGHT AREA: Report and Score widget gauge (5 columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              
              <section 
                id="carbon-logged-results"
                aria-label="Logged Carbon Results and Analysis Section"
                className={`p-6 sm:p-7 rounded-3xl border-2 flex flex-col min-h-[460px] ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-emerald-100'
                } shadow-md`}
              >
                
                {/* Visualizer header */}
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg flex items-center justify-center text-sm">🔥</div>
                    <h2 className="text-base font-black text-emerald-950 dark:text-emerald-100">AI Impact Report</h2>
                  </div>

                  {result && (
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100/60 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:hover:bg-emerald-900 rounded-lg cursor-pointer flex items-center gap-1 transition-all"
                      title="Open printable environmental report card"
                    >
                      <Download className="w-3 h-3" />
                      Report
                    </button>
                  )}
                </div>

                {/* State rendering */}
                {result ? (
                  <div className="flex-1 flex flex-col justify-between mt-5">
                    <div>
                      {/* Unified Scoring Circle Dial plus Rating system */}
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-900 mb-5 relative">
                        
                        {/* Rating header */}
                        <div className="flex items-baseline gap-1" id="estimated-footprint">
                          <span className="text-5xl font-black text-rose-500 font-mono tracking-tighter">
                            {(result?.estimatedCarbonKg ?? 0).toFixed(2)}
                          </span>
                          <span className="text-slate-400 text-xs font-extrabold uppercase">kg CO₂e / day</span>
                        </div>

                        {/* Comparative Gauge Bar (User vs Global Average 14.5 kg) */}
                        <div className="w-full mt-3">
                          <div className="flex justify-between text-[9px] font-extrabold text-slate-400 mb-1">
                            <span>YOU: {(result?.estimatedCarbonKg ?? 0).toFixed(1)} kg</span>
                            <span>GLOBAL AVG: 14.5 kg</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex relative">
                            {/* User marker bar */}
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                (result?.estimatedCarbonKg ?? 0) <= 5.0 ? 'bg-emerald-500' : (result?.estimatedCarbonKg ?? 0) <= 15.0 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(((result?.estimatedCarbonKg ?? 0) / 25.0) * 100, 100)}%` }}
                            ></div>
                            {/* Marker line for Global Average */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-800 dark:bg-slate-200" style={{ left: '58%' }} title="Global average mark"></div>
                          </div>
                        </div>

                        {/* Carbon rating score indicator */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-extrabold text-slate-400 block leading-none">Carbon Score</span>
                            <span className="text-2xl font-black text-slate-800 dark:text-white font-mono mt-0.5 block">{result?.carbonScore ?? 0} <span className="text-xs text-slate-400">/ 100</span></span>
                          </div>

                          <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black ${getScoreDetails(result?.carbonScore ?? 50).color}`}>
                            {getScoreDetails(result?.carbonScore ?? 50).title}
                          </div>
                        </div>

                        <p className="text-[10.5px] tracking-tight leading-relaxed text-slate-400 dark:text-slate-500 font-medium text-center mt-3 filter hover:brightness-110">
                          {getScoreDetails(result?.carbonScore ?? 50).text}
                        </p>
                      </div>

                      {/* Top 3 emission drivers / Personalized Action plan */}
                      <div className="bg-gradient-to-br from-slate-50 to-emerald-50/5 dark:from-slate-900/40 dark:to-emerald-950/5 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4 text-xs">
                        <div className="flex items-center gap-1 mb-2.5 text-emerald-800 dark:text-emerald-300">
                          <Flame className="w-3.5 h-3.5 text-red-500" />
                          <span className="font-extrabold uppercase tracking-wider text-[10px]">Top Carbon Drivers Identified</span>
                        </div>

                        <div className="space-y-1.5 font-bold text-slate-600 dark:text-slate-300">
                          {result?.topEmissionSources?.map((src, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-1.5 bg-white dark:bg-slate-950/70 p-2 rounded-lg border border-slate-100 dark:border-slate-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                              <span className="truncate leading-none text-[11px] sm:text-xs">{src}</span>
                            </div>
                          ))}
                        </div>

                        {/* Project monthly footprint reductions potential */}
                        <div className="mt-3.5 pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-450 dark:text-slate-500 font-extrabold">Estimated Monthly Impact Savings:</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{(result?.estimatedMonthlyReductionKg ?? 0).toFixed(1)} kg CO₂</strong>
                        </div>
                      </div>

                      {/* AI assessment analysis paragraph */}
                      <div className="mb-4 text-xs bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 leading-relaxed">
                        <span className="font-black text-slate-400 dark:text-slate-500 uppercase block text-[10px] tracking-wider mb-1.5">Sustainability Coach Evaluation</span>
                        <p className="text-slate-650 dark:text-slate-300 text-xs text-justify" id="result-analysis">
                          {result.analysis}
                        </p>
                      </div>

                      {/* Action plan weekly goals with completion percentages */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest leading-none">
                            Next Weekly Action Goals
                          </h3>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {completedGoalsCount} of 3 goal achieved
                          </span>
                        </div>

                        <ul className="space-y-2">
                          {result.weeklyGoals?.map((goal, idx) => (
                            <li 
                              key={idx}
                              onClick={() => toggleWeeklyGoal(idx)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleWeeklyGoal(idx);
                                }
                              }}
                              tabIndex={0}
                              role="button"
                              aria-label={`Toggle weekly goal: ${goal}`}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                                completedWeeklyGoals[idx]
                                  ? 'bg-emerald-50/25 dark:bg-emerald-950/15 border-emerald-150 text-slate-400 line-through'
                                  : 'bg-white dark:bg-slate-950/50 border-slate-100 dark:border-slate-900 hover:border-emerald-250 hover:bg-emerald-50/10'
                              }`}
                            >
                              <span className="shrink-0 mt-0.5" aria-hidden="true">
                                <CheckCircle className={`w-3.5 h-3.5 transition-all ${
                                  completedWeeklyGoals[idx] ? 'text-emerald-600 fill-emerald-100 dark:text-emerald-500' : 'text-slate-350'
                                }`} />
                              </span>
                              <span className="text-[11.5px] leading-tight text-slate-600 dark:text-slate-300">{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-50 dark:border-slate-900 flex items-center justify-between">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-wide">ECO ENGINE v3.5 FLASH</div>
                      <div className="flex -space-x-1.5">
                        <div className="w-5.5 h-5.5 rounded-full bg-emerald-200 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] font-black text-emerald-800">A</div>
                        <div className="w-5.5 h-5.5 rounded-full bg-emerald-300 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] font-black text-emerald-850">B</div>
                        <div className="w-5.5 h-5.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] font-black text-emerald-900">C</div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Premium Welcome Instruction empty-state dashboard */
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">
                      ✨
                    </div>
                    
                    <h3 className="font-extrabold text-emerald-950 dark:text-emerald-100 text-sm mb-1.5">No Calculations Generated</h3>
                    <p className="text-xs text-slate-450 dark:text-slate-400 max-w-xs leading-relaxed mb-6">
                      Input your daily actions into the text editor, or select one of the smart presets to calculate your score instantly inside our AI schema structure.
                    </p>

                    <div className="w-full space-y-2 text-left bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-900 rounded-2xl text-xs text-slate-500">
                      <span className="block font-black text-emerald-850 dark:text-emerald-300 text-[9px] uppercase tracking-wider mb-2">Footprint score limits</span>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                        <span>🌱 Eco Hero Level</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">90 - 100</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                        <span>♻️ Green Champion Level</span>
                        <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">70 - 89</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                        <span>🌍 Improving Routine</span>
                        <span className="font-mono text-amber-600 dark:text-amber-450 font-bold">50 - 69</span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-rose-600">
                        <span>⚠️ Needs Urgent Attention</span>
                        <span className="font-mono font-bold">&lt; 50</span>
                      </div>
                    </div>
                  </div>
                )}

              </section>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: COOPERATIVE AI CHAT COACH ==================== */}
        {activeTab === 'chat' && (
          <div className="bg-white border-2 border-emerald-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between h-[620px] max-w-4xl mx-auto w-full dark:bg-slate-900 dark:border-slate-800">
            
            {/* Chat header */}
            <header className="p-4 bg-emerald-900 text-white flex items-center justify-between shadow-xs dark:bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-emerald-400 text-emerald-950 rounded-2xl flex items-center justify-center text-xl font-bold">
                  S
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">Sustaina Carbon Coach</h3>
                  <p className="text-[10px] text-emerald-300 flex items-center gap-1 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Ask anything about preservation, food energy, or transport
                  </p>
                </div>
              </div>

              <div className="text-[10.5px] font-mono bg-emerald-800 dark:bg-slate-800 px-2.5 py-1 rounded">
                Score sync context: {result ? `${result.carbonScore} PTS` : 'No run logged'}
              </div>
            </header>

            {/* Chat Messages flow thread list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              {chatHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                  }`}>
                    {msg.role === 'model' ? (
                      renderMarkdownText(msg.content)
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Loader response state */}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-none p-4 max-w-[85%] shadow-xs flex items-center gap-2 text-xs text-slate-400">
                    <svg className="animate-spin h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sustaina is compiling sustainable insights...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Prompt questions shortcuts */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto text-[10.5px] whitespace-nowrap bg-white dark:bg-slate-900">
              <button 
                onClick={() => setChatInput("What daily activities contribute most to my footprint?")}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer text-slate-500 hover:text-emerald-600 transition-all dark:text-slate-400"
              >
                🌍 Main drivers?
              </button>
              <button 
                onClick={() => setChatInput("Give me simple hacks to save electricity at home")}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer text-slate-500 hover:text-emerald-600 transition-all dark:text-slate-400"
              >
                💡 Save electricity hacks?
              </button>
              <button 
                onClick={() => setChatInput("Are electric vehicles really zero carbon emissions?")}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer text-slate-500 hover:text-emerald-600 transition-all dark:text-slate-400"
              >
                🚗 Electric vehicle truth?
              </button>
            </div>

            {/* Chat user text submit */}
            <form onSubmit={handleSendChat} className="p-3 bg-slate-50 border-t border-slate-150 dark:bg-slate-950 dark:border-slate-850 flex gap-2">
              <input
                type="text"
                className="flex-1 p-3 text-xs sm:text-sm border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="Ask Sustaina how to make cleaner environment choices..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 px-4 rounded-xl cursor-pointer shadow disabled:opacity-50 flex items-center justify-center text-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

        {/* ==================== TAB 3: ECO CLUB ACHIEVEMENTS TABLE ==================== */}
        {activeTab === 'rewards' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            
            <div className={`p-6 sm:p-8 rounded-3xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-emerald-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 rounded-2xl flex items-center justify-center text-2xl">🏆</div>
                <div>
                  <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-100">Eco Club Rewards Program</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Complete activities, preserve daily targets, and finalize active carbon checks to earn points.</p>
                </div>
              </div>

              {/* Points banner detail */}
              <div className="mt-6 p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-emerald-250 block font-bold">Total Environmental Balance</span>
                  <strong className="text-3xl sm:text-4xl font-black tracking-tight mt-1 block">{ecoPointsCount.toLocaleString()} PTS</strong>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-white/20 px-2 py-1 rounded uppercase tracking-wider font-extrabold text-white">Elite Green tier</span>
                  <p className="text-[11px] mt-1 text-emerald-200">Next tier unlock at 5,000 PTS</p>
                </div>
              </div>

              <section className="mt-8">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-3">Rewards Rules & Achievements Guide</h3>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎯</span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-emerald-100">Complete Carbon Calculations</h4>
                        <p className="text-slate-450 dark:text-slate-500 leading-tight">Review daily travels or food portions with structured AI diagnostics.</p>
                      </div>
                    </div>
                    <strong>120 PTS</strong>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⚡</span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-emerald-100">Preserve under 5.0 kg Target</h4>
                        <p className="text-slate-450 dark:text-slate-500 leading-tight">Maintain direct ecological day results with zero fossil fuel emissions.</p>
                      </div>
                    </div>
                    <strong>250 PTS</strong>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🚲</span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-emerald-100">Activate Commuter Shield badge</h4>
                        <p className="text-slate-450 dark:text-slate-500 leading-tight">Switch standard vehicle commute with active cycling or electric subway travel.</p>
                      </div>
                    </div>
                    <strong>400 PTS</strong>
                  </div>
                </div>
              </section>

            </div>

          </div>
        )}

        {/* ==================== TAB 4: SYSTEM CONFIGURATION SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            
            <div className={`p-6 sm:p-8 rounded-3xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-emerald-100'
            }`}>
              <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-100 mb-2">Systems Parameters Admin Panel</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Manage API keys, environment settings, calculations parameters, and local data persistence.</p>

              <div className="space-y-5">
                
                {/* Simulated API Secret Key */}
                <div>
                  <label className="block text-xs uppercase font-extrabold text-slate-400 mb-2">Google Gemini API key status</label>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      value="********************************************************" 
                      disabled 
                      className="flex-1 p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs sm:text-sm rounded-xl text-slate-400"
                    />
                    <div className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-4 rounded-xl flex items-center justify-center">
                      Configured
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-450 dark:text-slate-500 mt-1 leading-normal">API Keys are administered through the AI Studio Secrets menu. There is no custom UI allowed to override this directly inside the viewport.</p>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Local storage actions reset */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Clear Application state</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Urgently clear tracking history, badges, and chat conversation records cached inside your browser storage.</p>
                  
                  <button 
                    onClick={() => {
                      if (confirm("Urgently wipe all local history calculations and clear cached dashboard items?")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/45 text-rose-600 hover:text-rose-700 dark:text-red-400 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Clear All Cached Storage
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* ==================== HIGH FIDELITY EXPORT PDF CERTIFICATE MODAL ==================== */}
      <AnimatePresence>
        {showReportModal && result && (
          <div 
            id="print-card-overlay"
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 p-6 sm:p-9 rounded-3xl shadow-2xl max-w-2xl w-full text-left print:p-0 print:shadow-none"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Report printable document layout content */}
              <div id="carbon-printable-card" className="border-4 border-double border-emerald-800 p-6 sm:p-8 rounded-2xl bg-[#FCFDFB]">
                
                {/* Header branding */}
                <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-800">Environmental Report Card</span>
                    <h2 className="text-2xl font-black text-slate-950 mt-1">CARBON AI AUDIT RECORD</h2>
                    <p className="text-xs text-slate-450 mt-0.5 font-mono">Date Compiled: June 9, 2026</p>
                  </div>
                  <span className="text-3xl">🌱</span>
                </div>

                {/* Score panel inside report */}
                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-150 text-center">
                    <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Estimated Carbon Footprint</span>
                    <strong className="text-3xl font-mono block text-rose-500 fill-rose-500 font-extrabold mt-1">{(result?.estimatedCarbonKg ?? 0).toFixed(2)} kg</strong>
                    <span className="text-[9px] text-slate-400">Equivalent direct CO₂e emissions / day</span>
                  </div>

                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-150 text-center">
                    <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Eco Coach Score Rating</span>
                    <strong className="text-3xl font-mono block text-emerald-600 font-extrabold mt-1">{result?.carbonScore ?? 0} / 100</strong>
                    <span className="text-[9.5px] font-extrabold uppercase text-emerald-800">{getScoreDetails(result?.carbonScore ?? 50).title}</span>
                  </div>
                </div>

                {/* Key diagnostics drivers list */}
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-extrabold uppercase text-emerald-900 text-[10px] tracking-wider mb-1.5 border-b border-emerald-150 pb-1">Top Emission Contributors</h4>
                    <ul className="list-disc pl-5 mt-1 text-slate-705 space-y-1">
                      {result.topEmissionSources?.map((source, idx) => (
                        <li key={idx} className="font-bold">{source}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-extrabold uppercase text-emerald-900 text-[10px] tracking-wider mb-1.5 border-b border-emerald-150 pb-1">AI Carbon Diagnostics Evaluation</h4>
                    <p className="text-slate-600 leading-normal text-justify text-[11px] italic">
                      "{result.analysis}"
                    </p>
                  </div>

                  <div>
                    <h4 className="font-extrabold uppercase text-emerald-900 text-[10px] tracking-wider mb-1.5 border-b border-emerald-150 pb-1">Custom Reduction Recommendations Plan</h4>
                    <ol className="list-decimal pl-5 mt-1 text-slate-650 space-y-1">
                      {result.actionableTips?.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Signature seal stamp */}
                <div className="mt-8 pt-4 border-t border-emerald-800 flex justify-between items-end">
                  <div className="text-[10px] text-slate-450 font-mono leading-none">
                    <p>VERIFICATION BLOCK: SECURE CLOUD RUN</p>
                    <p className="mt-1">GEMINI COOPERATIVE GROUP • RAVI KISHAN</p>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-xl font-black text-emerald-800 font-mono tracking-tighter leading-none">Sustaina AI</span>
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-1 leading-none font-bold">Official Certified Seal</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3 print:hidden justify-end">
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer font-bold"
                >
                  Close Document
                </button>
                <button 
                  onClick={triggerPrintReport}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 text-slate-50 hover:bg-emerald-700 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print / Download PDF Report
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar - Accessible touch nodes (height 44px+) */}
      <nav 
        id="mobile-navigation" 
        aria-label="Mobile Navigation Bar" 
        className={`fixed bottom-0 left-0 right-0 h-16 sm:hidden flex justify-around items-center z-45 print:hidden shadow-2xl border-t ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-400' 
            : 'bg-[#064e3b] border-emerald-900 text-emerald-100/70'
        }`}
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          aria-label="Active Carbon Monitor Dashboard"
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-extrabold scale-110'
              : 'hover:text-white'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 tracking-tight">Panel</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          aria-label="Sustaina AI Coach Chat"
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all relative ${
            activeTab === 'chat'
              ? 'text-emerald-400 font-extrabold scale-110'
              : 'hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1 right-3 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
          <span className="text-[9px] mt-0.5 tracking-tight">Coach</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          aria-label="Rewards achievement club"
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
            activeTab === 'rewards'
              ? 'text-emerald-400 font-extrabold scale-110'
              : 'hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 tracking-tight">Club</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          aria-label="Settings parameters console"
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'text-emerald-400 font-extrabold scale-110'
              : 'hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 tracking-tight">Admin</span>
        </button>
      </nav>

      {/* Embedded Printable Report styles to support clean PDF rendering on window.print() */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: #ffffff !important;
            color: #000000 !important;
          }
          #print-card-overlay, #print-card-overlay * {
            visibility: visible;
          }
          #print-card-overlay {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: #ffffff !important;
            box-shadow: none !important;
          }
          .print\\:hidden, button {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
