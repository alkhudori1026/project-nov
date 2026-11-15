"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Habit,
  HabitLog,
  HabitAppData,
  FrictionScore,
  BadHabit,
  EnvironmentPatch,
  SlipLog,
} from "@/types/habit";
import { canDownscaleHabit } from "@/utils/habitEngine";

const STORAGE_KEY = "anais_habit_tracker_v1";

const initialHabitData: HabitAppData = {
  habits: [],
  habitLogs: [],
  badHabits: [],
  environmentPatches: [],
  slipLogs: [],
};

// Helper untuk mendapatkan tanggal lokal format 'YYYY-MM-DD' (aman dari pergeseran timezone UTC)
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper membuat ID unik ringan
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useHabitStore() {
  const [data, setData] = useState<HabitAppData>(initialHabitData);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Muat data dari localStorage saat komponen pertama kali dipasang di browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load habit data from localStorage:", error);
    } finally {
      setIsMounted(true);
    }
  }, []);

  // 2. Simpan otomatis ke localStorage setiap kali state berubah
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save habit data to localStorage:", error);
    }
  }, [data, isMounted]);

  // ============================================================================
  // A. AKSI DASAR TAB MEMBANGUN (CRUD & LOGGING)
  // ============================================================================

  const addHabit = useCallback(
    (payload: {
      name: string;
      anchor: string;
      isRerouting: boolean;
      replacedRoutine?: string;
      frictionPatch?: string;
    }) => {
      const newHabit: Habit = {
        id: generateId("hab"),
        name: payload.name.trim(),
        anchor: payload.anchor.trim(),
        isRerouting: payload.isRerouting,
        replacedRoutine: payload.isRerouting
          ? payload.replacedRoutine?.trim()
          : undefined,
        frictionPatch: payload.isRerouting
          ? payload.frictionPatch?.trim()
          : undefined,
        phase: "INSTRUMENTATION",
        downscaleCount: 0,
        createdAt: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        habits: [newHabit, ...prev.habits],
      }));
    },
    [],
  );

  // Mencatat atau membatalkan centang harian (otomatis mendeteksi pencatatan telat)
  const toggleHabitCompletion = useCallback(
    (habitId: string, targetDate: string = getLocalDateString()) => {
      const todayStr = getLocalDateString();

      setData((prev) => {
        const existingIndex = prev.habitLogs.findIndex(
          (log) => log.habitId === habitId && log.date === targetDate,
        );

        // Jika sudah ada log di tanggal tersebut, hapus (toggle off)
        if (existingIndex !== -1) {
          const updatedLogs = [...prev.habitLogs];
          updatedLogs.splice(existingIndex, 1);
          return { ...prev, habitLogs: updatedLogs };
        }

        // Jika belum ada, buat log baru
        const newLog: HabitLog = {
          id: generateId("log"),
          habitId,
          date: targetDate,
          completed: true,
          // Otomatis true jika user mencentang untuk tanggal kemarin/sebelumnya
          isRetroactive: targetDate < todayStr,
          loggedAt: new Date().toISOString(),
        };

        return {
          ...prev,
          habitLogs: [newLog, ...prev.habitLogs],
        };
      });
    },
    [],
  );

  // Menyimpan skor friksi (1-3) pada log tertentu (dipanggil tiap kelipatan 5 sesi)
  const setLogFrictionScore = useCallback(
    (logId: string, score: FrictionScore) => {
      setData((prev) => ({
        ...prev,
        habitLogs: prev.habitLogs.map((log) =>
          log.id === logId ? { ...log, frictionScore: score } : log,
        ),
      }));
    },
    [],
  );

  // Menyimpan kalimat tujuan (Progressive Profiling setelah 3x selesai)
  const updateHabitPurpose = useCallback((habitId: string, purpose: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === habitId ? { ...h, purpose: purpose.trim() } : h,
      ),
    }));
  }, []);

  // ============================================================================
  // B. TRANSISI SIKLUS HIDUP & GATEKEEPER LATENSI
  // ============================================================================

  const startSilentShadowing = useCallback((habitId: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              phase: "SILENT_SHADOWING",
              shadowingStartedAt: new Date().toISOString(),
            }
          : h,
      ),
    }));
  }, []);

  // Menangani jawaban Gatekeeper Pola 1 (Otomatis vs Jauh dari gawai)
  const resolveLatencyGatekeeper = useCallback(
    (habitId: string, isTrulyAutomated: boolean) => {
      if (isTrulyAutomated) {
        startSilentShadowing(habitId);
        return;
      }

      // Jika telat karena jauh dari gawai, reset titik hitung latensi ke waktu sekarang
      setData((prev) => ({
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === habitId
            ? { ...h, retroactiveResetAt: new Date().toISOString() }
            : h,
        ),
      }));
    },
    [startSilentShadowing],
  );

  // Evaluasi setelah 7 hari masa Silent Shadowing
  const completeSilentShadowing = useCallback(
    (habitId: string, succeeded: boolean) => {
      if (!succeeded) return; // Jika gagal, UI akan membuka Dialog Diagnostik

      setData((prev) => ({
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                phase: "AUTOMATED",
                shadowingStartedAt: undefined,
              }
            : h,
        ),
      }));
    },
    [],
  );

  // ============================================================================
  // C. AKSI DIALOG DIAGNOSTIK (RE-ROUTING, RE-ANCHOR, DOWNSCALE, TTL, ARCHIVE)
  // ============================================================================

  // Cabang 1: Perkuat hambatan jalur lama pada Mode Re-routing
  const updateReroutingPatch = useCallback(
    (habitId: string, newPatch: string) => {
      const now = new Date().toISOString();
      setData((prev) => ({
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                frictionPatch: newPatch.trim(),
                phase: "INSTRUMENTATION",
                shadowingStartedAt: undefined,
                calibratedAt: now,
              }
            : h,
        ),
      }));
    },
    [],
  );

  // Cabang 2: Ganti pemicu (Re-anchoring)
  const rebindHabitAnchor = useCallback(
    (habitId: string, newAnchor: string, newReplacedRoutine?: string) => {
      const now = new Date().toISOString();
      setData((prev) => ({
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                anchor: newAnchor.trim(),
                replacedRoutine:
                  h.isRerouting && newReplacedRoutine !== undefined
                    ? newReplacedRoutine.trim()
                    : h.replacedRoutine,
                phase: "INSTRUMENTATION",
                shadowingStartedAt: undefined,
                calibratedAt: now,
              }
            : h,
        ),
      }));
    },
    [],
  );

  // Cabang 3A: Perkecil skala/dosis (dilindungi Circuit Breaker maksimal 2x)
  const downscaleHabit = useCallback((habitId: string, smallerName: string) => {
    const now = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== habitId || !canDownscaleHabit(h)) return h;
        return {
          ...h,
          name: smallerName.trim(),
          downscaleCount: h.downscaleCount + 1,
          phase: "INSTRUMENTATION",
          shadowingStartedAt: undefined,
          calibratedAt: now,
        };
      }),
    }));
  }, []);

  // Cabang 3B: Jeda sementara dengan batas waktu wajib (TTL)
  const pauseHabitWithTTL = useCallback((habitId: string, days: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              phase: "PAUSED",
              pausedUntil: targetDate.toISOString(),
              shadowingStartedAt: undefined,
            }
          : h,
      ),
    }));
  }, []);

  // Membangunkan kebiasaan setelah masa TTL selesai
  const resumePausedHabit = useCallback((habitId: string) => {
    const now = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              phase: "INSTRUMENTATION",
              pausedUntil: undefined,
              downscaleCount: 0, // Reset jatah downscale setelah jeda penuh
              calibratedAt: now,
            }
          : h,
      ),
    }));
  }, []);

  // Garbage collection: Hapus kebiasaan yang sudah tidak relevan
  const deleteHabit = useCallback((habitId: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
      habitLogs: prev.habitLogs.filter((log) => log.habitId !== habitId),
    }));
  }, []);

  // ============================================================================
  // D. AKSI TAB MENGURAI (BAD HABITS, PATCHES, SLIP LOGS)
  // ============================================================================

  const addBadHabit = useCallback(
    (name: string, initialTriggers: string[] = []) => {
      const newBadHabit: BadHabit = {
        id: generateId("bad"),
        name: name.trim(),
        triggers: initialTriggers.map((t) => t.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        badHabits: [newBadHabit, ...prev.badHabits],
      }));
    },
    [],
  );

  const addBadHabitTrigger = useCallback(
    (badHabitId: string, trigger: string) => {
      const cleanTrigger = trigger.trim();
      if (!cleanTrigger) return;

      setData((prev) => ({
        ...prev,
        badHabits: prev.badHabits.map((bh) =>
          bh.id === badHabitId && !bh.triggers.includes(cleanTrigger)
            ? { ...bh, triggers: [...bh.triggers, cleanTrigger] }
            : bh,
        ),
      }));
    },
    [],
  );

  const addEnvironmentPatch = useCallback(
    (badHabitId: string, description: string) => {
      const newPatch: EnvironmentPatch = {
        id: generateId("pat"),
        badHabitId,
        description: description.trim(),
        isApplied: false,
      };

      setData((prev) => ({
        ...prev,
        environmentPatches: [...prev.environmentPatches, newPatch],
      }));
    },
    [],
  );

  const toggleEnvironmentPatch = useCallback((patchId: string) => {
    setData((prev) => ({
      ...prev,
      environmentPatches: prev.environmentPatches.map((p) =>
        p.id === patchId ? { ...p, isApplied: !p.isApplied } : p,
      ),
    }));
  }, []);

  const recordSlipLog = useCallback(
    (badHabitId: string, triggerUsed: string, costNote: string) => {
      const newSlip: SlipLog = {
        id: generateId("slip"),
        badHabitId,
        triggerUsed,
        costNote: costNote.trim(),
        occurredAt: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        slipLogs: [newSlip, ...prev.slipLogs],
      }));
    },
    [],
  );

  return {
    data,
    isMounted,
    // Tab Membangun
    addHabit,
    toggleHabitCompletion,
    setLogFrictionScore,
    updateHabitPurpose,
    // Siklus Hidup
    startSilentShadowing,
    resolveLatencyGatekeeper,
    completeSilentShadowing,
    // Dialog Diagnostik & Arsip
    updateReroutingPatch,
    rebindHabitAnchor,
    downscaleHabit,
    pauseHabitWithTTL,
    resumePausedHabit,
    deleteHabit,
    // Tab Mengurai
    addBadHabit,
    addBadHabitTrigger,
    addEnvironmentPatch,
    toggleEnvironmentPatch,
    recordSlipLog,
  };
}
