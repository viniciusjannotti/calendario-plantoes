"use client";

import { RESIDENTS, MONTH_NAMES, getResidentColor, type ResidentName } from "@/lib/constants";
import { getHolidayMap, getHolidayMapForCycle } from "@/lib/holidayUtils";
import type { Shift } from "@/hooks/useSchedule";

interface ResidentViewProps {
  cycleYear: number;
  shifts: Record<string, Shift>;
  selectedResident: ResidentName | null;
  onSelectResident: (r: ResidentName) => void;
}

export default function ResidentView({
  cycleYear,
  shifts,
  selectedResident,
  onSelectResident,
}: ResidentViewProps) {
  const mergedHolidayMap = getHolidayMapForCycle(cycleYear);
  const allShifts = Object.values(shifts).sort((a, b) => a.date.localeCompare(b.date));

  const residents = selectedResident
    ? RESIDENTS.filter((r) => r.name === selectedResident)
    : RESIDENTS;

  return (
    <div className="overflow-y-auto space-y-6 p-1">
      {/* Resident selector pills */}
      <div className="flex gap-2 flex-wrap">
        {RESIDENTS.map((r) => {
          const active = selectedResident === r.name;
          return (
            <button
              key={r.name}
              onClick={() => onSelectResident(r.name as ResidentName)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2"
              style={{
                backgroundColor: active ? r.color : `${r.color}20`,
                color: active ? "#0f172a" : r.color,
                borderColor: r.color,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: active ? "#0f172a" : r.color }}
              />
              {r.name}
            </button>
          );
        })}
      </div>

      {residents.map((resident) => {
        const residentShifts = allShifts.filter((s) => s.resident === resident.name);
        const color = resident.color;

        // Group by month
        const byMonth: Record<number, typeof residentShifts> = {};
        for (const s of residentShifts) {
          const m = parseInt(s.date.split("-")[1]);
          if (!byMonth[m]) byMonth[m] = [];
          byMonth[m].push(s);
        }

        const weekendCount = residentShifts.filter((s) => s.shiftType === "weekend").length;
        const holidayCount = residentShifts.filter((s) => s.shiftType === "holiday").length;

        return (
          <div key={resident.name} className="glass-card p-4">
            {/* Resident header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full shadow-lg"
                style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}60` }}
              />
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">{resident.name}</h3>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-xs" style={{ color }}>
                    📅 {weekendCount} fins de semana
                  </span>
                  {(resident.types as readonly string[]).includes("holiday") && (
                    <span className="text-xs" style={{ color }}>
                      🎉 {holidayCount} feriados
                    </span>
                  )}
                </div>
              </div>
              <div className="text-2xl font-black" style={{ color }}>
                {residentShifts.length}
              </div>
            </div>

            {residentShifts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhum plantão atribuído
              </p>
            ) : (
              <div className="space-y-3">
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2]
                  .filter((m) => byMonth[m]?.length)
                  .map((m) => (
                    <div key={m}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {MONTH_NAMES[m - 1]}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {byMonth[m].map((s) => {
                          const d = new Date(s.date + "T00:00:00");
                          const dayNum = d.getDate();
                          const weekday = d.toLocaleDateString("pt-BR", { weekday: "short" });
                          const holidayName = mergedHolidayMap.get(s.date);
                          return (
                            <div
                              key={s.date}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                              style={{
                                backgroundColor: `${color}25`,
                                color: "#0f172a",
                                border: `1px solid ${color}60`,
                              }}
                              title={holidayName ?? s.shiftType}
                            >
                              <span
                                className="font-black"
                                style={{ color: color === "#A8E6B0" ? "#1a5c26" : color === "#FFB3C6" ? "#7a1a35" : color === "#FFBE8A" ? "#7a4a00" : "#3d1fa8" }}
                              >
                                {String(dayNum).padStart(2, "0")}
                              </span>
                              <span className="text-slate-600 capitalize">{weekday}</span>
                              {holidayName && <span className="text-yellow-600">🎉</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
