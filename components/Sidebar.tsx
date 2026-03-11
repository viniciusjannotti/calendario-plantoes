"use client";

import { RESIDENTS, type ResidentName } from "@/lib/constants";
import type { Shift } from "@/hooks/useSchedule";

interface SidebarProps {
  shifts: Record<string, Shift>;
  selectedResident: ResidentName | null;
  onSelectResident: (r: ResidentName | null) => void;
  cycleYear: number;
}

export default function Sidebar({
  shifts,
  selectedResident,
  onSelectResident,
  cycleYear,
}: SidebarProps) {
  const allShifts = Object.values(shifts);

  function countShifts(name: ResidentName, type: "weekend" | "holiday") {
    return allShifts.filter((s) => s.resident === name && s.shiftType === type).length;
  }

  return (
    <aside className="glass-card p-5 flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
          Residentes
        </h2>
        <p className="text-xs text-slate-500">Ciclo {cycleYear}/{String(cycleYear + 1).slice(2)}</p>
      </div>

      {/* Resident Cards */}
      <div className="flex flex-col gap-3">
        {RESIDENTS.map((resident) => {
          const isSelected = selectedResident === resident.name;
          const weekendCount = countShifts(resident.name as ResidentName, "weekend");
          const holidayCount = countShifts(resident.name as ResidentName, "holiday");

          return (
            <button
              key={resident.name}
              onClick={() =>
                onSelectResident(isSelected ? null : (resident.name as ResidentName))
              }
              className={`text-left rounded-2xl p-4 transition-all duration-200 border-2 ${
                isSelected
                  ? "border-cyan-400 bg-slate-700/50 shadow-lg shadow-cyan-400/10"
                  : "border-transparent bg-slate-800/60 hover:bg-slate-700/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 shadow-lg"
                  style={{
                    backgroundColor: resident.color,
                    boxShadow: isSelected ? `0 0 12px ${resident.color}80` : undefined,
                  }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white leading-tight truncate">
                    {resident.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {resident.types.join(" • ")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <StatBadge
                  icon="📅"
                  label="Fins de semana"
                  count={weekendCount}
                  color={resident.color}
                />
                {(resident.types as readonly string[]).includes("holiday") && (
                  <StatBadge
                    icon="🎉"
                    label="Feriados"
                    count={holidayCount}
                    color={resident.color}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Color Legend */}
      <div className="mt-auto pt-4 border-t border-slate-700">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Legenda
        </p>
        <div className="flex flex-col gap-1.5">
          {RESIDENTS.map((r) => (
            <div key={r.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-xs text-slate-400 truncate">{r.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full flex-shrink-0 bg-yellow-400" />
            <span className="text-xs text-slate-400">Feriado</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatBadge({
  icon,
  label,
  count,
  color,
}: {
  icon: string;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold"
      style={{
        backgroundColor: `${color}25`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span>{icon}</span>
      <span>{count}</span>
    </div>
  );
}
