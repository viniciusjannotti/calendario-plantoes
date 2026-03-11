"use client";

import { MONTH_NAMES } from "@/lib/constants";

type ViewType = "month" | "year" | "resident";

interface TopNavProps {
  month: number;
  cycleYear: number;
  view: ViewType;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onViewChange: (v: ViewType) => void;
}

export default function TopNav({
  month,
  cycleYear,
  view,
  onPrevMonth,
  onNextMonth,
  onViewChange,
}: TopNavProps) {
  return (
    <header className="glass-card px-6 py-4 flex items-center justify-between flex-wrap gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="animated-border p-[2px] rounded-xl">
          <div className="bg-[#0f172a] rounded-[10px] px-3 py-2">
            <span className="text-2xl">🏥</span>
          </div>
        </div>
        <div>
          <h1 className="gradient-text text-xl font-bold leading-tight">Controle de Plantões</h1>
          <p className="text-xs text-slate-400 font-medium">Residência Médica • Pouso Alegre</p>
        </div>
      </div>

      {/* Month/Year Navigator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevMonth}
          className="w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-center text-white font-bold"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <div className="text-center min-w-[160px]">
          <p className="text-lg font-bold text-white">
            {MONTH_NAMES[month - 1]} <span className="text-cyan-400">{month < 3 ? cycleYear + 1 : cycleYear}</span>
          </p>
        </div>
        <button
          onClick={onNextMonth}
          className="w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-center text-white font-bold"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl p-1">
        {(["month", "year", "resident"] as ViewType[]).map((v) => {
          const labels: Record<ViewType, string> = {
            month: "Mês",
            year: "Ano",
            resident: "Residente",
          };
          return (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                view === v
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {labels[v]}
            </button>
          );
        })}
      </div>
    </header>
  );
}
