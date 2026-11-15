// src/hooks/useProjectStore.ts

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AppData, InboxItem, InboxSortPayload } from "@/types/productivity";
import {
  STORAGE_KEY,
  INITIAL_APP_DATA,
  getSortedTasks,
  getSortedCalendarItems,
  getProjectProgressSummaries,
  applyInboxSort,
  InboxSortResult,
} from "@/utils/projectHelpers";

// Nama event internal untuk menyinkronkan state antar-komponen di halaman yang sama
const VAULT_SYNC_EVENT = "anais-vault-sync";

export function useProjectStore() {
  const [appData, setAppData] = useState<AppData>(INITIAL_APP_DATA);
  const [isHydrated, setIsHydrated] = useState(false);

  // Membaca snapshot terbaru dari localStorage
  const readVaultFromStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed: AppData = JSON.parse(savedData);
        setAppData(parsed);
      }
    } catch (error) {
      console.error("Gagal membaca brankas localStorage:", error);
    }
  }, []);

  // Hidrasi awal saat komponen terpasang di browser + listener sinkronisasi lintas tab/komponen
  useEffect(() => {
    readVaultFromStorage();
    setIsHydrated(true);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        readVaultFromStorage();
      }
    };

    const handleLocalSync = () => {
      readVaultFromStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(VAULT_SYNC_EVENT, handleLocalSync);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(VAULT_SYNC_EVENT, handleLocalSync);
    };
  }, [readVaultFromStorage]);

  // Helper atomik untuk memperbarui state sekaligus menyimpannya ke localStorage
  const commitAppData = useCallback(
    (updater: AppData | ((prev: AppData) => AppData)) => {
      setAppData((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          // Gunakan microtask agar dispatch event berjalan aman di luar fase render React
          queueMicrotask(() => {
            window.dispatchEvent(new Event(VAULT_SYNC_EVENT));
          });
        } catch (error) {
          console.error("Gagal menyimpan ke localStorage:", error);
        }
        return next;
      });
    },
    [],
  );

  // --- AKSI UTAMA LINTAS HALAMAN ---

  // Menangkap ide baru ke antrean paling atas Inbox
  const captureToInbox = useCallback(
    (title: string, description: string = "") => {
      const cleanTitle = title.trim();
      if (!cleanTitle) return;

      const newInboxItem: InboxItem = {
        id: `inb-${Date.now()}`,
        title: cleanTitle,
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };

      commitAppData((prev) => ({
        ...prev,
        inboxQueue: [newInboxItem, ...prev.inboxQueue],
      }));
    },
    [commitAppData],
  );

  // Mengubah status selesai/belum selesai pada tugas (dipakai di Project & Beranda)
  const toggleTaskCompletion = useCallback(
    (taskId: string) => {
      commitAppData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? { ...task, isCompleted: !task.isCompleted }
            : task,
        ),
      }));
    },
    [commitAppData],
  );

  // Memproses penyortiran satu item Inbox ke destinasi GTD/PARA
  const sortInboxItem = useCallback(
    (targetItemId: string, payload: InboxSortPayload): InboxSortResult => {
      const result = applyInboxSort(appData, targetItemId, payload);
      commitAppData(result.nextData);
      return result;
    },
    [appData, commitAppData],
  );

  // Menghapus item dari antrean Inbox
  const trashInboxItem = useCallback(
    (targetItemId: string) => {
      commitAppData((prev) => ({
        ...prev,
        inboxQueue: prev.inboxQueue.filter((item) => item.id !== targetItemId),
      }));
    },
    [commitAppData],
  );

  // Memulihkan state dari snapshot (untuk fitur Undo di Mode Sortir)
  const restoreSnapshot = useCallback(
    (previousData: AppData) => {
      commitAppData(previousData);
    },
    [commitAppData],
  );

  // --- DATA TURUNAN (SIAP PAKAI UNTUK DASHBOARD & BERANDA) ---

  const sortedTasks = useMemo(
    () => getSortedTasks(appData.tasks),
    [appData.tasks],
  );

  const activeTasks = useMemo(
    () => sortedTasks.filter((task) => !task.isCompleted),
    [sortedTasks],
  );

  const activeTaskCount = activeTasks.length;

  const sortedCalendarItems = useMemo(
    () => getSortedCalendarItems(appData.calendarItems),
    [appData.calendarItems],
  );

  const projectSummaries = useMemo(
    () =>
      getProjectProgressSummaries(
        appData.projects,
        appData.tasks,
        appData.notes,
      ),
    [appData.projects, appData.tasks, appData.notes],
  );

  return {
    // State mentah & status hidrasi
    appData,
    isHydrated,

    // Data turunan terkomputasi
    sortedTasks,
    activeTasks,
    activeTaskCount,
    sortedCalendarItems,
    projectSummaries,

    // Handler aksi
    captureToInbox,
    toggleTaskCompletion,
    sortInboxItem,
    trashInboxItem,
    restoreSnapshot,
  };
}
