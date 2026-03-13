"use client";

import { getResidentColor, MONTH_NAMES, type ResidentName } from "@/lib/constants";
import { getHolidayMap, getHolidayMapForCycle, isWeekend } from "@/lib/holidayUtils";
import type { Shift } from "@/hooks/useSchedule";

function fmt(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

interface YearViewProps {
  cycleYear: number;
  shifts: Record<string, Shift>;
  onMonthClick: (month: number) => void;
  selectedResident: ResidentName | null;
  dayOverrides: Record<string, "normal" | "weekend" | "holiday">;
}

function MiniMonth({
  month,
  year,
  shifts,
  holidayMap,
  dayOverrides,
  selectedResident,
  onClick,
}: {
  month: number;
  year: number;
  shifts: Record<string, Shift>;
  holidayMap: Map<string, string>;
  dayOverrides: Record<string, "normal" | "weekend" | "holiday">;
  selectedResident: ResidentName | null;
  onClick: () => void;
}) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <button
      onClick={onClick}
      className="glass-card p-3 hover:bg-slate-700/60 transition-all duration-200 hover:scale-[1.02] text-left w-full"
    >
      <p className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">
        {MONTH_NAMES[month - 1]}
      </p>
      <div className="grid grid-cols-7 gap-[2px]">
        {["D","S","T","Q","Q","S","S"].map((d, i) => (
          <div key={i} className="text-center text-[8px] text-slate-500 font-bold">
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} className="aspect-square" />;
          const dateStr = fmt(year, month, day);
          const shift = shifts[dateStr];
          const isHoliday = holidayMap.has(dateStr);
          const isWknd = isWeekend(dateStr, dayOverrides);
          const dimmed = selectedResident && shift && shift.resident !== selectedResident;

          const color = shift
            ? getResidentColor(shift.resident)
            : isHoliday
            ? "#FBBF24"
            : undefined;

          return (
            <div
              key={dateStr}
              className={`aspect-square rounded-sm transition-opacity ${
                dimmed ? "opacity-20" : ""
              } ${isWknd && !shift && !isHoliday ? "bg-slate-700/50" : ""}`}
              style={color ? { backgroundColor: color } : undefined}
            />
          );
        })}
      </div>
    </button>
  );
}

export default function YearView({
  cycleYear,
  shifts,
  onMonthClick,
  selectedResident,
  dayOverrides,
}: YearViewProps) {
  const mergedHolidayMap = getHolidayMapForCycle(cycleYear, dayOverrides);

  // March to Feb
  const monthsInCycle = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-1 overflow-y-auto">
      {monthsInCycle.map((month) => {
        const calendarYear = month < 3 ? cycleYear + 1 : cycleYear;
        return (
          <MiniMonth
            key={month}
            month={month}
            year={calendarYear}
            shifts={shifts}
            holidayMap={mergedHolidayMap}
            dayOverrides={dayOverrides}
            selectedResident={selectedResident}
            onClick={() => onMonthClick(month)}
          />
        );
      })}
    </div>
  );
}
