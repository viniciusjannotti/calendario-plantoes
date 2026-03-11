"use client";

import { useState } from "react";
import { DAY_NAMES, getResidentColor, type ResidentName } from "@/lib/constants";
import { getHolidayMap, isWeekend } from "@/lib/holidayUtils";
import type { Shift } from "@/hooks/useSchedule";
import type { ShiftType } from "@/lib/constants";
import DateModal from "@/components/DateModal";

function fmt(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

interface MonthViewProps {
  month: number; // 1-12
  year: number;
  shifts: Record<string, Shift>;
  selectedResident: ResidentName | null;
  onAssign: (date: string, resident: ResidentName, shiftType: ShiftType, blockId?: string) => Promise<void>;
  onRemove: (date: string) => Promise<void>;
}

export default function MonthView({
  month,
  year,
  shifts,
  selectedResident,
  onAssign,
  onRemove,
}: MonthViewProps) {
  const [modalDate, setModalDate] = useState<string | null>(null);
  const holidayMap = getHolidayMap(year);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const modalDateStr = modalDate;
  const modalShift = modalDateStr ? shifts[modalDateStr] : undefined;
  const modalHolidayName = modalDateStr ? holidayMap.get(modalDateStr) : undefined;
  const modalShiftType = modalDateStr
    ? holidayMap.has(modalDateStr)
      ? "holiday"
      : isWeekend(modalDateStr)
      ? "weekend"
      : "normal"
    : "normal";

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {cells.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} />;
            }

            const dateStr = fmt(year, month, day);
            const shift = shifts[dateStr];
            const isHoliday = holidayMap.has(dateStr);
            const isWknd = isWeekend(dateStr);
            const holidayName = holidayMap.get(dateStr);

            const isBlock = !!shift?.blockId;
            const isHighlighted = selectedResident
              ? shift?.resident === selectedResident
              : false;
            const isDimmed = selectedResident && !isHighlighted;

            const bgColor = shift ? getResidentColor(shift.resident) : undefined;

            return (
              <div key={dateStr} className="relative group">
                {/* Block connection band (simplified) */}
                {isBlock && (
                  <div 
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 opacity-20 z-0"
                    style={{ backgroundColor: bgColor }}
                  />
                )}
                <button
                  onClick={() => setModalDate(dateStr)}
                  className={`cal-cell w-full aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all duration-200 border z-10 relative ${
                    isDimmed ? "opacity-25" : ""
                  } ${
                    isHighlighted
                      ? "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-105"
                      : ""
                  } ${
                    shift
                      ? "border-transparent text-slate-900 shadow-md"
                      : isHoliday
                      ? "border-yellow-500/40 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20"
                      : isWknd
                      ? "border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600/70"
                      : "border-slate-700/50 bg-slate-800/40 text-slate-400 hover:bg-slate-700/50"
                  } ${isBlock ? "ring-1 ring-white/30" : ""}`}
                  style={shift ? { backgroundColor: bgColor } : undefined}
                  title={shift ? `${shift.resident}` : holidayName ?? ""}
                >
                  <span className="text-xs leading-none">{day}</span>
                  {shift && (
                    <span
                      className="text-[9px] leading-tight mt-0.5 text-center px-0.5 font-bold opacity-80 truncate w-full"
                    >
                      {shift.resident.split(" ")[0]}
                    </span>
                  )}
                  {isHoliday && !shift && (
                    <span className="text-[8px] leading-none mt-0.5">🎉</span>
                  )}
                  {isBlock && (
                    <span className="absolute top-1 right-1 text-[8px] opacity-60">🔗</span>
                  )}
                </button>

                {/* Tooltip */}
                <div className="tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                  <div className="glass-card px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                    <p className="font-bold text-white">{dateStr}</p>
                    {shift && (
                      <div className="mt-1">
                        {isBlock && <p className="text-cyan-400 font-bold">Bloco de Feriado</p>}
                        <p style={{ color: getResidentColor(shift.resident) }}>
                          {shift.resident}
                        </p>
                      </div>
                    )}
                    {holidayName && <p className="text-yellow-300">🎉 {holidayName}</p>}
                    {isWknd && !isHoliday && !shift && (
                      <p className="text-slate-400">Fim de semana</p>
                    )}
                    {!shift && !holidayName && !isWknd && (
                      <p className="text-slate-400">Sem plantão</p>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1 border-r border-b border-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalDate && (
        <DateModal
          date={modalDate}
          existingShift={modalShift}
          shiftType={modalShiftType}
          holidayName={modalHolidayName}
          onAssign={(resident, type, blockId) => onAssign(modalDate, resident, type, blockId)}
          onRemove={() => onRemove(modalDate)}
          onClose={() => setModalDate(null)}
        />
      )}
    </>
  );
}
