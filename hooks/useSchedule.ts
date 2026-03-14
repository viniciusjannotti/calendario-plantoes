"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ResidentName, ShiftType } from "@/lib/constants";
import type { ShiftEntry } from "@/lib/scheduleGenerator";

export interface Shift extends ShiftEntry {
  id: string;
}

export function useSchedule(cycleYear: number) {
  const [shifts, setShifts] = useState<Record<string, Shift>>({});
  const [dayOverrides, setDayOverrides] = useState<Record<string, "normal" | "weekend" | "holiday">>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const colRef = collection(db, `shifts_${cycleYear}`);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const data: Record<string, Shift> = {};
        snapshot.forEach((docSnap) => {
          data[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as Shift;
        });
        setShifts(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [cycleYear]);

  useEffect(() => {
    const colRef = collection(db, `day_overrides_${cycleYear}`);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const data: Record<string, "normal" | "weekend" | "holiday"> = {};
        snapshot.forEach((docSnap) => {
          data[docSnap.id] = docSnap.data().type;
        });
        setDayOverrides(data);
      },
      (err) => {
        console.error("Firestore overrides error:", err);
      }
    );
    return () => unsub();
  }, [cycleYear]);

  const assignShift = useCallback(
    async (date: string, resident: ResidentName, shiftType: ShiftType, blockId?: string) => {
      const docRef = doc(db, `shifts_${cycleYear}`, date);
      await setDoc(docRef, {
        date,
        resident,
        shiftType,
        blockId: blockId ?? null,
        updatedAt: serverTimestamp(),
      });
    },
    [cycleYear]
  );

  const removeShift = useCallback(
    async (date: string) => {
      const docRef = doc(db, `shifts_${cycleYear}`, date);
      await deleteDoc(docRef);
    },
    [cycleYear]
  );

  const bulkSetShifts = useCallback(
    async (entries: ShiftEntry[]) => {
      const BATCH_SIZE = 400;
      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = entries.slice(i, i + BATCH_SIZE);
        for (const entry of chunk) {
          const docRef = doc(db, `shifts_${cycleYear}`, entry.date);
          batch.set(docRef, {
            ...entry,
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    },
    [cycleYear]
  );

  const clearSchedule = useCallback(
    async () => {
      // Collect all current shift IDs to delete
      const entries = Object.values(shifts);
      if (entries.length === 0) return;

      const BATCH_SIZE = 400;
      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = entries.slice(i, i + BATCH_SIZE);
        for (const entry of chunk) {
          const docRef = doc(db, `shifts_${cycleYear}`, entry.date);
          batch.delete(docRef);
        }
        await batch.commit();
      }
    },
    [cycleYear, shifts]
  );

  const setDayOverride = useCallback(
    async (date: string, type: "normal" | "weekend" | "holiday") => {
      const docRef = doc(db, `day_overrides_${cycleYear}`, date);
      await setDoc(docRef, { type, updatedAt: serverTimestamp() });
    },
    [cycleYear]
  );

  const removeDayOverride = useCallback(
    async (date: string) => {
      const docRef = doc(db, `day_overrides_${cycleYear}`, date);
      await deleteDoc(docRef);
    },
    [cycleYear]
  );

  return { 
    shifts, 
    dayOverrides,
    loading, 
    error, 
    assignShift, 
    removeShift, 
    bulkSetShifts,
    clearSchedule,
    setDayOverride,
    removeDayOverride
  };
}
