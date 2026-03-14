"use client";

import { useState } from "react";
import type { ShiftEntry } from "@/lib/scheduleGenerator";
import type { Shift } from "@/hooks/useSchedule";

interface ScheduleGeneratorProps {
  cycleYear: number;
  shifts: Record<string, Shift>;
  onGenerate: (entries: ShiftEntry[]) => Promise<void>;
  onClear: () => Promise<void>;
  dayOverrides: Record<string, "normal" | "weekend" | "holiday">;
}

export default function ScheduleGenerator({ cycleYear, shifts, dayOverrides, onGenerate, onClear }: ScheduleGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setDone(false);
    try {
      // Dynamic import to avoid SSR issues
      const { generateSchedule } = await import("@/lib/scheduleGenerator");
      const entries = generateSchedule(cycleYear, shifts, dayOverrides);
      await onGenerate(entries);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    if (window.confirm(`Tem certeza que deseja apagar TODOS os plantões de ${cycleYear}? Esta ação não pode ser desfeita.`)) {
      setLoading(true);
      try {
        await onClear();
      } catch (err) {
        console.error("Clear error:", err);
      } finally {
        setLoading(false);
      }
    }
  }

  const hasShifts = Object.keys(shifts).length > 0;

  return (
    <div className="glass-card p-4 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">Gerar Escala Inicial</p>
        <p className="text-xs text-slate-400">
          {hasShifts
            ? "A escala existente não será sobrescrita."
            : `Gera automaticamente a escala (Março ${cycleYear} - Fevereiro ${cycleYear + 1}).`}
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg flex-shrink-0 ${
          done
            ? "bg-green-600 text-white"
            : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <span className="animate-spin text-base">⏳</span> Gerando…
          </>
        ) : done ? (
          <>✅ Escala gerada!</>
        ) : (
          <>✨ Gerar Escala</>
        )}
      </button>

      {/* Clear Button */}
      {hasShifts && (
        <button
          onClick={handleClear}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg flex-shrink-0 bg-red-900/40 text-red-300 border border-red-700/50 hover:bg-red-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Apagar todos os plantões do ano selecionado"
        >
          🗑️
        </button>
      )}
    </div>
  );
}
