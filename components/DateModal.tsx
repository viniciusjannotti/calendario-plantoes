"use client";

import { useState, useRef, useEffect } from "react";
import { getResidentColor, RESIDENTS, type ResidentName } from "@/lib/constants";
import type { Shift } from "@/hooks/useSchedule";
import type { ShiftType } from "@/lib/constants";

interface DateModalProps {
  date: string;
  existingShift: Shift | undefined;
  shiftType: ShiftType;
  holidayName?: string;
  onAssign: (resident: ResidentName, shiftType: ShiftType, blockId?: string) => Promise<void>;
  onRemove: () => Promise<void>;
  onClose: () => void;
}

export default function DateModal({
  date,
  existingShift,
  shiftType,
  holidayName,
  onAssign,
  onRemove,
  onClose,
}: DateModalProps) {
  const [selected, setSelected] = useState<ResidentName | "">(
    existingShift?.resident ?? ""
  );
  const [loading, setLoading] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const d = new Date(date + "T00:00:00");
  const formatted = d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isHolidayBlock = shiftType === "holiday_block" || !!existingShift?.blockId;

  const eligibleResidents = isHolidayBlock
    ? RESIDENTS.filter((r) => r.name === "Luís Gustavo" || r.name === "Ana Carolina")
    : shiftType === "holiday"
    ? RESIDENTS.filter((r) => (r.types as readonly string[]).includes("holiday"))
    : RESIDENTS;

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    try {
      await onAssign(selected as ResidentName, shiftType, existingShift?.blockId);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    try {
      await onRemove();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="glass-card p-6 w-full max-w-sm fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white capitalize">{formatted}</h3>
            {isHolidayBlock && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                🔗 Bloco de Feriado {holidayName ? `(${holidayName})` : ""}
              </span>
            )}
            {!isHolidayBlock && holidayName && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                🎉 {holidayName}
              </span>
            )}
            {!isHolidayBlock && !holidayName && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {shiftType === "weekend" ? "📅 Fim de semana" : "📋 Dia normal"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors ml-4 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Resident Selector */}
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Atribuir residente
          </p>
          {eligibleResidents.map((r) => {
            const isActive = selected === r.name;
            return (
              <button
                key={r.name}
                onClick={() => setSelected(r.name as ResidentName)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 border-2 ${
                  isActive
                    ? "border-transparent scale-[1.02] shadow-lg"
                    : "border-transparent bg-slate-800 hover:bg-slate-700"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${r.color}22`,
                        borderColor: r.color,
                        boxShadow: `0 0 12px ${r.color}40`,
                      }
                    : {}
                }
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: r.color }}
                />
                <span className="text-sm font-medium text-white">{r.name}</span>
                {isActive && <span className="ml-auto text-white">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {existingShift && (
            <button
              onClick={handleRemove}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-900/40 text-red-400 border border-red-700/40 hover:bg-red-800/50 transition-colors disabled:opacity-50"
            >
              Remover
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selected || loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Salvando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
