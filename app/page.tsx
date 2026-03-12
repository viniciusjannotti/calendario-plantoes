"use client";

import { useState } from "react";
import type { ResidentName, ShiftType } from "@/lib/constants";
import { useSchedule } from "@/hooks/useSchedule";
import type { ShiftEntry } from "@/lib/scheduleGenerator";

import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import MonthView from "@/components/Calendar/MonthView";
import YearView from "@/components/Calendar/YearView";
import ResidentView from "@/components/Calendar/ResidentView";
import ScheduleGenerator from "@/components/ScheduleGenerator";

type ViewType = "month" | "year" | "resident";

export default function HomePage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const initialCycleYear = currentMonth < 3 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();

  const [cycleYear, setCycleYear] = useState(initialCycleYear);
  const [month, setMonth] = useState(currentMonth < 3 ? currentMonth : currentMonth); // Keep 1-12
  const [view, setView] = useState<ViewType>("month");
  const [selectedResident, setSelectedResident] = useState<ResidentName | null>(null);

  const { 
    shifts, 
    dayOverrides,
    loading, 
    error, 
    assignShift, 
    removeShift, 
    bulkSetShifts,
    setDayOverride
  } = useSchedule(cycleYear);

  function handlePrevMonth() {
    if (month === 3) {
      setCycleYear((y) => y - 1);
      setMonth(2);
    } else if (month === 1) {
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
    setView("month");
  }

  function handleNextMonth() {
    if (month === 2) {
      setCycleYear((y) => y + 1);
      setMonth(3);
    } else if (month === 12) {
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
    setView("month");
  }

  function handleViewChange(v: ViewType) {
    setView(v);
  }

  function handleMonthClick(m: number) {
    setMonth(m);
    setView("month");
  }

  function handleSelectResident(r: ResidentName | null) {
    setSelectedResident(r);
    if (r) setView("resident");
  }

  async function handleGenerate(entries: ShiftEntry[]) {
    await bulkSetShifts(entries);
  }

  return (
    <div className="min-h-screen flex flex-col p-3 md:p-4 gap-3 md:gap-4 max-w-[1600px] mx-auto">
      {/* Top Nav */}
      <TopNav
        month={month}
        cycleYear={cycleYear}
        view={view}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onViewChange={handleViewChange}
      />

      {/* Generator bar */}
      <ScheduleGenerator
        cycleYear={cycleYear}
        shifts={shifts}
        dayOverrides={dayOverrides}
        onGenerate={handleGenerate}
      />

      {/* Main layout */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-full md:w-72 lg:w-80 xl:w-80 flex-shrink-0">
          <Sidebar
            shifts={shifts}
            selectedResident={selectedResident}
            onSelectResident={handleSelectResident}
            cycleYear={cycleYear}
          />
        </div>

        {/* Calendar area */}
        <div className="flex-1 glass-card p-4 min-h-[500px] overflow-hidden flex flex-col">
          {/* State messages */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">
              ⚠️ Erro ao conectar ao Firebase. Configure seu <code>.env.local</code>.<br />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}
          {loading && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-blue-900/30 border border-blue-700/30 text-blue-300 text-sm pulse-glow">
              ⏳ Carregando dados…
            </div>
          )}

          {/* Views */}
          <div className="flex-1 overflow-hidden fade-in" key={view}>
            {view === "month" && (
              <MonthView
                month={month}
                year={month < 3 ? cycleYear + 1 : cycleYear}
                shifts={shifts}
                selectedResident={selectedResident}
                onAssign={assignShift}
                onRemove={removeShift}
                dayOverrides={dayOverrides}
                onSetOverride={setDayOverride}
              />
            )}
            {view === "year" && (
              <YearView
                cycleYear={cycleYear}
                shifts={shifts}
                selectedResident={selectedResident}
                onMonthClick={handleMonthClick}
              />
            )}
            {view === "resident" && (
              <ResidentView
                cycleYear={cycleYear}
                shifts={shifts}
                selectedResident={selectedResident}
                onSelectResident={(r) => setSelectedResident(r)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
