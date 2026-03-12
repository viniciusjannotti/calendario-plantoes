// Brazilian national holidays + Pouso Alegre local holidays
// Bridge rule:
//   Holiday on Tuesday  → Monday is also a "holiday block"
//   Holiday on Thursday → Friday is also a "holiday block"

export interface HolidayInfo {
  date: string; // YYYY-MM-DD
  name: string;
  isLocal?: boolean; // Pouso Alegre specific
}

export interface HolidayBlock {
  blockId: string;
  dates: string[];
  primaryDate: string;
  name: string;
  bridged: boolean;
}

// Easter calculation (Gregorian)
function easterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmt(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mkDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

export function getHolidaysForYear(year: number): HolidayInfo[] {
  const easter = easterDate(year);
  const goodFriday = addDays(easter, -2);
  const carnivalTue = addDays(easter, -47);
  const carnivalMon = addDays(easter, -48);
  const corpusChristi = addDays(easter, 60);

  const holidays: HolidayInfo[] = [
    // National fixed holidays
    { date: fmt(mkDate(year, 1, 1)), name: "Ano Novo" },
    { date: fmt(carnivalMon), name: "Carnaval (Segunda)" },
    { date: fmt(carnivalTue), name: "Carnaval (Terça)" },
    { date: fmt(goodFriday), name: "Sexta-feira Santa" },
    { date: fmt(easter), name: "Páscoa" },
    { date: fmt(mkDate(year, 4, 21)), name: "Tiradentes" },
    { date: fmt(mkDate(year, 5, 1)), name: "Dia do Trabalho" },
    { date: fmt(corpusChristi), name: "Corpus Christi" },
    { date: fmt(mkDate(year, 9, 7)), name: "Independência do Brasil" },
    { date: fmt(mkDate(year, 10, 12)), name: "Nossa Sra. Aparecida" },
    { date: fmt(mkDate(year, 11, 2)), name: "Finados" },
    { date: fmt(mkDate(year, 11, 15)), name: "Proclamação da República" },
    { date: fmt(mkDate(year, 11, 20)), name: "Consciência Negra" },
    { date: fmt(mkDate(year, 12, 25)), name: "Natal" },
    // Pouso Alegre local holidays
    { date: fmt(mkDate(year, 1, 20)), name: "São Sebastião (Pouso Alegre)", isLocal: true },
    { date: fmt(mkDate(year, 8, 6)), name: "Bom Jesus (Padroeiro Pouso Alegre)", isLocal: true },
    { date: fmt(mkDate(year, 10, 19)), name: "Aniversário de Pouso Alegre", isLocal: true },
  ];

  return holidays;
}

export function getHolidaysForCycle(cycleYear: number): HolidayInfo[] {
  const holidaysY1 = getHolidaysForYear(cycleYear);
  const holidaysY2 = getHolidaysForYear(cycleYear + 1);

  return [
    ...holidaysY1.filter((h) => {
      const m = new Date(h.date + "T00:00:00").getMonth();
      return m >= 2; // March to December
    }),
    ...holidaysY2.filter((h) => {
      const m = new Date(h.date + "T00:00:00").getMonth();
      return m < 2; // Jan to Feb
    }),
  ];
}

export function getHolidayBlocksForCycle(cycleYear: number): HolidayBlock[] {
  const holidays = getHolidaysForCycle(cycleYear);
  const blocks: HolidayBlock[] = [];
  const processedDates = new Set<string>();

  for (const holiday of holidays) {
    if (processedDates.has(holiday.date)) continue;

    const d = new Date(holiday.date + "T00:00:00");
    const dow = d.getDay(); // 0=Sun, 1=Mon, ... 6=Sat

    let blockDates: string[] = [holiday.date];
    let bridged = false;

    if (dow === 1 || dow === 2) {
      // Monday or Tuesday -> Sat, Sun, Mon, Tue
      const refDate = dow === 1 ? d : addDays(d, -1); // Reference Monday
      const sat = addDays(refDate, -2);
      const sun = addDays(refDate, -1);
      const mon = refDate;
      const tue = addDays(refDate, 1);
      blockDates = [fmt(sat), fmt(sun), fmt(mon), fmt(tue)];
      bridged = true;
    } else if (dow === 4 || dow === 5) {
      // Thursday or Friday -> Thu, Fri, Sat, Sun
      const refDate = dow === 4 ? d : addDays(d, -1); // Reference Thursday
      const thu = refDate;
      const fri = addDays(refDate, 1);
      const sat = addDays(refDate, 2);
      const sun = addDays(refDate, 3);
      blockDates = [fmt(thu), fmt(fri), fmt(sat), fmt(sun)];
      bridged = true;
    }

    for (const bd of blockDates) {
      processedDates.add(bd);
    }

    blocks.push({
      blockId: `block_${holiday.date}`,
      dates: blockDates,
      primaryDate: holiday.date,
      name: holiday.name,
      bridged,
    });
  }

  return blocks;
}

export function getHolidayMapForCycle(
  cycleYear: number, 
  overrides?: Record<string, "normal" | "weekend" | "holiday">
): Map<string, string> {
  const holidays = getHolidaysForCycle(cycleYear);
  const map = new Map<string, string>();
  for (const h of holidays) {
    if (overrides && overrides[h.date] === "normal") continue;
    map.set(h.date, h.name);
  }
  
  if (overrides) {
    for (const [date, type] of Object.entries(overrides)) {
      if (type === "holiday" && !map.has(date)) {
        map.set(date, "Feriado (Manual)");
      }
    }
  }
  
  return map;
}

export function getHolidayMap(
  year: number,
  overrides?: Record<string, "normal" | "weekend" | "holiday">
): Map<string, string> {
  const holidays = getHolidaysForYear(year);
  const map = new Map<string, string>();
  for (const h of holidays) {
    if (overrides && overrides[h.date] === "normal") continue;
    map.set(h.date, h.name);
  }

  if (overrides) {
    for (const [date, type] of Object.entries(overrides)) {
      const d = new Date(date + "T00:00:00");
      if (type === "holiday" && d.getFullYear() === year && !map.has(date)) {
        map.set(date, "Feriado (Manual)");
      }
    }
  }

  return map;
}

export function isWeekend(
  dateStr: string,
  overrides?: Record<string, "normal" | "weekend" | "holiday">
): boolean {
  if (overrides && overrides[dateStr]) {
    if (overrides[dateStr] === "weekend") return true;
    if (overrides[dateStr] === "normal" || overrides[dateStr] === "holiday") return false;
  }
  const d = new Date(dateStr + "T00:00:00");
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

export function isHoliday(dateStr: string, holidayMap: Map<string, string>): boolean {
  return holidayMap.has(dateStr);
}
