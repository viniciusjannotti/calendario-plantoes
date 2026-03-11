(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/scheduleGenerator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateSchedule",
    ()=>generateSchedule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$holidayUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/holidayUtils.ts [app-client] (ecmascript)");
;
function fmt(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
// Returns all weekend dates (Sat & Sun) in a cycle (Mar to Feb) grouped by weekend number per month
function getWeekendsInCycle(cycleYear) {
    const weekends = [];
    const holidaySet = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$holidayUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getHolidaysForCycle"])(cycleYear).map((h)=>h.date));
    const cycleMonths = [
        {
            y: cycleYear,
            m: 2
        },
        {
            y: cycleYear,
            m: 3
        },
        {
            y: cycleYear,
            m: 4
        },
        {
            y: cycleYear,
            m: 5
        },
        {
            y: cycleYear,
            m: 6
        },
        {
            y: cycleYear,
            m: 7
        },
        {
            y: cycleYear,
            m: 8
        },
        {
            y: cycleYear,
            m: 9
        },
        {
            y: cycleYear,
            m: 10
        },
        {
            y: cycleYear,
            m: 11
        },
        {
            y: cycleYear + 1,
            m: 0
        },
        {
            y: cycleYear + 1,
            m: 1
        } // Dec, Jan, Feb
    ];
    for (const { y, m } of cycleMonths){
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        let weekCount = 0;
        let currentWeekDates = [];
        let lastSundayMonth = -1;
        for(let day = 1; day <= daysInMonth; day++){
            const d = new Date(y, m, day);
            const dow = d.getDay();
            const dateStr = fmt(d);
            if (dow === 6) {
                // Saturday starts a new weekend
                currentWeekDates = [];
                if (!holidaySet.has(dateStr)) {
                    currentWeekDates.push(dateStr);
                }
            } else if (dow === 0) {
                // Sunday ends the weekend
                if (!holidaySet.has(dateStr)) {
                    currentWeekDates.push(dateStr);
                }
                if (currentWeekDates.length > 0 && lastSundayMonth !== m) {
                    weekCount++;
                    weekends.push({
                        year: y,
                        month: m + 1,
                        week: weekCount,
                        dates: currentWeekDates
                    });
                    lastSundayMonth = m;
                }
                currentWeekDates = [];
            }
        }
    }
    return weekends;
}
function shuffle(arr) {
    const a = [
        ...arr
    ];
    for(let i = a.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [
            a[j],
            a[i]
        ];
    }
    return a;
}
function generateSchedule(cycleYear, existingShifts = {}) {
    const results = [];
    const assigned = new Set(Object.keys(existingShifts));
    // ─── 1. HOLIDAYS ───────────────────────────────────────────────────────────
    const blocks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$holidayUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getHolidayBlocksForCycle"])(cycleYear);
    // Alternate blocks between Luís Gustavo and Ana Carolina
    const shuffledBlocks = shuffle(blocks);
    for(let i = 0; i < shuffledBlocks.length; i++){
        const block = shuffledBlocks[i];
        const resident = i % 2 === 0 ? "Luís Gustavo" : "Ana Carolina";
        const shiftType = block.bridged ? "holiday_block" : "holiday";
        for (const dateStr of block.dates){
            if (assigned.has(dateStr)) continue;
            assigned.add(dateStr);
            results.push({
                date: dateStr,
                resident,
                shiftType,
                blockId: block.blockId
            });
        }
    }
    // ─── 2. WEEKENDS ───────────────────────────────────────────────────────────
    const weekends = getWeekendsInCycle(cycleYear);
    const remainingWeekendDates = [];
    // Group by month
    const weekendsByMonth = {};
    for (const w of weekends){
        if (!weekendsByMonth[w.month]) weekendsByMonth[w.month] = [];
        weekendsByMonth[w.month].push(w);
    }
    // Define cycle months sequence
    const monthsInCycle = [
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        1,
        2
    ];
    for(let cycleIdx = 0; cycleIdx < monthsInCycle.length; cycleIdx++){
        const month = monthsInCycle[cycleIdx];
        const monthWeekends = weekendsByMonth[month] ?? [];
        monthWeekends.sort((a, b)=>a.week - b.week);
        if (month === 3) {
            // March rule: weekends are intercalated between groups
            // Group 1: Ana Carolina + Ana Amélia
            // Group 2: Luís Gustavo + Maria Cecília
            for(let wIdx = 0; wIdx < monthWeekends.length; wIdx++){
                const w = monthWeekends[wIdx];
                const isGroup1 = wIdx % 2 === 0;
                const mainResident = isGroup1 ? "Ana Carolina" : "Luís Gustavo";
                const secondaryResident = isGroup1 ? "Ana Amélia" : "Maria Cecília";
                if (w.dates.length > 0) {
                    if (!assigned.has(w.dates[0])) {
                        assigned.add(w.dates[0]);
                        results.push({
                            date: w.dates[0],
                            resident: mainResident,
                            shiftType: "weekend"
                        });
                    }
                }
                if (w.dates.length > 1) {
                    if (!assigned.has(w.dates[1])) {
                        assigned.add(w.dates[1]);
                        results.push({
                            date: w.dates[1],
                            resident: secondaryResident,
                            shiftType: "weekend"
                        });
                    }
                }
            }
        } else {
            // April to February rule
            // One weekend per month for Ana Amélia OR Maria Cecília (alternating)
            const secondWeekend = monthWeekends[1] ?? monthWeekends[0];
            if (secondWeekend) {
                // Find which resident has fewer shifts or is next in line
                const aaShifts = results.filter((r)=>r.resident === "Ana Amélia").length;
                const mcShifts = results.filter((r)=>r.resident === "Maria Cecília").length;
                const resident = aaShifts <= mcShifts ? "Ana Amélia" : "Maria Cecília";
                for (const dateStr of secondWeekend.dates){
                    if (assigned.has(dateStr)) continue;
                    assigned.add(dateStr);
                    results.push({
                        date: dateStr,
                        resident,
                        shiftType: "weekend"
                    });
                }
            }
            // Rest of weekends go to the pool
            for (const w of monthWeekends){
                if (w === secondWeekend) continue;
                for (const dateStr of w.dates){
                    if (!assigned.has(dateStr)) {
                        remainingWeekendDates.push(dateStr);
                    }
                }
            }
        }
    }
    // Distribute remaining weekends evenly between Luís Gustavo & Ana Carolina
    const shuffledRemaining = shuffle(remainingWeekendDates);
    const halfPoint = Math.ceil(shuffledRemaining.length / 2);
    const lgDates = shuffledRemaining.slice(0, halfPoint);
    const acDates = shuffledRemaining.slice(halfPoint);
    for (const dateStr of lgDates){
        if (assigned.has(dateStr)) continue;
        assigned.add(dateStr);
        results.push({
            date: dateStr,
            resident: "Luís Gustavo",
            shiftType: "weekend"
        });
    }
    for (const dateStr of acDates){
        if (assigned.has(dateStr)) continue;
        assigned.add(dateStr);
        results.push({
            date: dateStr,
            resident: "Ana Carolina",
            shiftType: "weekend"
        });
    }
    return results;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=lib_scheduleGenerator_ts_586a5211._.js.map