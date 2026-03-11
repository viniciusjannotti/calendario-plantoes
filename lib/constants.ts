// Resident definitions
export const RESIDENTS = [
  {
    name: "Luís Gustavo",
    color: "#FFBE8A",
    bgClass: "bg-[#FFBE8A]",
    textClass: "text-[#7a4a00]",
    borderClass: "border-[#FFBE8A]",
    types: ["weekend", "holiday"],
  },
  {
    name: "Ana Carolina",
    color: "#C9B8FF",
    bgClass: "bg-[#C9B8FF]",
    textClass: "text-[#3d1fa8]",
    borderClass: "border-[#C9B8FF]",
    types: ["weekend", "holiday"],
  },
  {
    name: "Ana Amélia",
    color: "#A8E6B0",
    bgClass: "bg-[#A8E6B0]",
    textClass: "text-[#1a5c26]",
    borderClass: "border-[#A8E6B0]",
    types: ["weekend"],
  },
  {
    name: "Maria Cecília",
    color: "#FFB3C6",
    bgClass: "bg-[#FFB3C6]",
    textClass: "text-[#7a1a35]",
    borderClass: "border-[#FFB3C6]",
    types: ["weekend"],
  },
] as const;

export type ResidentName =
  | "Luís Gustavo"
  | "Ana Carolina"
  | "Ana Amélia"
  | "Maria Cecília";

export type ShiftType = "weekend" | "holiday" | "normal" | "holiday_block";

export function getResident(name: ResidentName) {
  return RESIDENTS.find((r) => r.name === name)!;
}

export function getResidentColor(name: ResidentName): string {
  return getResident(name)?.color ?? "#e5e7eb";
}

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
