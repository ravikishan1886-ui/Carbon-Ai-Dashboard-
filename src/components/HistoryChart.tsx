import React, { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { HistoryEntry } from "../types";

export interface HistoryChartProps {
  history: HistoryEntry[];
  isDarkMode: boolean;
  hoveredPointIdx: number | null;
  setHoveredPointIdx: (idx: number | null) => void;
  clearMetricsHistory: () => void;
}

const HistoryChartComponent: React.FC<HistoryChartProps> = ({
  history,
  isDarkMode,
  hoveredPointIdx,
  setHoveredPointIdx,
  clearMetricsHistory,
}) => {
  const svgW = 520;
  const svgH = 160;
  const padL = 45;
  const padR = 25;
  const padT = 25;
  const padB = 30;

  // Compute maximum carbon in history dynamically
  const maxHistoryCarbon = useMemo(() => {
    const values = history.map((h) => (typeof h.carbonKg === "number" ? h.carbonKg : 0));
    return Math.max(...values, 18);
  }, [history]);

  const minHistoryCarbon = 0;

  // Map history points to coordinates
  const chartPoints = useMemo(() => {
    return history.map((entry, idx) => {
      const x = padL + (idx / (history.length - 1 || 1)) * (svgW - padL - padR);
      const carbonVal = typeof entry.carbonKg === "number" ? entry.carbonKg : 0;
      const y =
        svgH -
        padB -
        ((carbonVal - minHistoryCarbon) / (maxHistoryCarbon - minHistoryCarbon)) *
          (svgH - padT - padB);
      return { x, y, ...entry, carbonKg: carbonVal };
    });
  }, [history, maxHistoryCarbon]);

  const gridlines = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const yPos = padT + ratio * (svgH - padT - padB);
      const carbonLabel = (maxHistoryCarbon - ratio * (maxHistoryCarbon - minHistoryCarbon)).toFixed(
        1
      );
      return { yPos, carbonLabel };
    });
  }, [maxHistoryCarbon]);

  return (
    <section
      id="carbon-emission-trend"
      aria-label="Carbon Emission Trend Section"
      className={`p-5 sm:p-6 rounded-3xl border ${
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald-100"
      } shadow-xs`}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="text-emerald-500 font-bold">📈</div>
          <div>
            <h3 className="font-extrabold text-emerald-950 dark:text-emerald-100 text-sm">
              Carbon Emission Trend Graph
            </h3>
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

      <div className="relative w-full overflow-hidden flex flex-col items-center">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          role="img"
          aria-label="Carbon footprint emission trends chart over time"
          className="w-full h-auto bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl p-1.5 overflow-visible"
        >
          {/* Gridlines */}
          {gridlines.map((line, index) => (
            <g key={index} className="opacity-40">
              <line
                x1={padL}
                y1={line.yPos}
                x2={svgW - padR}
                y2={line.yPos}
                stroke={isDarkMode ? "#334155" : "#e2e8f0"}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padL - 8}
                y={line.yPos + 4}
                className="text-[9px] font-mono font-bold fill-slate-400 text-right"
                textAnchor="end"
              >
                {line.carbonLabel}
              </text>
            </g>
          ))}

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
              onMouseEnter={() => setHoveredPointIdx(idx)}
              onMouseLeave={() => setHoveredPointIdx(null)}
            />
          ))}

          {/* Date Horizontal labels */}
          {chartPoints.map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={svgH - 8}
              className="text-[8px] sm:text-[9px] font-mono fill-slate-400 font-bold"
              textAnchor="middle"
            >
              {pt.date}
            </text>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPointIdx !== null && chartPoints[hoveredPointIdx] && (
          <div
            id="trend-chart-tooltip"
            className="mt-3 p-3 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-lg w-full max-w-sm flex flex-col text-xs space-y-1"
          >
            <div className="flex justify-between items-center font-extrabold pb-1 border-b border-slate-800">
              <span className="text-emerald-400">{chartPoints[hoveredPointIdx].date} run</span>
              <span className="font-mono">Score: {chartPoints[hoveredPointIdx].score}/100</span>
            </div>
            <p className="text-slate-300 leading-relaxed italic mt-1">
              &ldquo;{chartPoints[hoveredPointIdx].activity}&rdquo;
            </p>
            <div className="font-extrabold text-[11px] text-emerald-300 pt-1 flex justify-between">
              <span>Emissions:</span>
              <span>{chartPoints[hoveredPointIdx].carbonKg.toFixed(1)} kg CO₂</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export const HistoryChart = React.memo(HistoryChartComponent);
