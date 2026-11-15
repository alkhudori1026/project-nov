"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DailyEvaluation,
  DailyJournal,
  DailyJournalSummary,
  EvaluationDistraction,
  EvaluationFlowState,
  EvaluationMissedTask,
  EvaluationRestingActivity,
  HydratedSession,
  JournalDatabase,
  JournalFolder,
  JournalReflection,
  JournalSession,
  JournalTask,
} from "@/types/jurnal";
import {
  JOURNAL_DB_STORAGE_KEY,
  createEmptyJournalDatabase,
  loadAndMigrateJournalDatabase,
} from "@/utils/jurnalMigration";
import {
  getJournalSummaryByDate,
  getJournalSummaryById,
} from "@/utils/jurnalSelectors";

// Event internal agar beberapa komponen (misal Jurnal & Beranda) tetap sinkron
const JOURNAL_SYNC_EVENT = "jurnal-db-updated";

// Kontrak input saat mencatat sesi baru dari form draf
export interface BookSessionInput {
  startingTime: string;
  finishingTime: string;
  tasks: Array<{
    name: string;
    duration: string;
    tag: string;
  }>;
  reflections: Array<{
    text: string;
  }>;
}

// Kontrak input saat menyimpan atau memperbarui evaluasi harian
export interface SaveEvaluationInput {
  id?: string | null; // Diisi jika sedang dalam mode edit evaluasi lama
  crashTime: string;
  sleepDuration: string;
  morningFeeling: string;
  flowStates: Array<{ start: string; end: string }>;
  missedTasks: Array<{ task: string; tag: string }>;
  distractions: Array<{ distraction: string; start: string; end: string }>;
  restingActivities: Array<{ name: string }>;
}

// Helper tanggal lokal ("YYYY-MM-DD") agar tidak tergeser oleh zona waktu UTC
function getTodayLocalISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useJurnalStore() {
  const [db, setDb] = useState<JournalDatabase>(createEmptyJournalDatabase);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeJournalId, setActiveJournalId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Fungsi transaksional: memperbarui state React sekaligus menulis ke localStorage
  const commitDatabase = useCallback(
    (updater: (prevDb: JournalDatabase) => JournalDatabase) => {
      setDb((prevDb) => {
        const nextDb = updater(prevDb);
        if (typeof window !== "undefined") {
          localStorage.setItem(JOURNAL_DB_STORAGE_KEY, JSON.stringify(nextDb));
          window.dispatchEvent(new Event(JOURNAL_SYNC_EVENT));
        }
        return nextDb;
      });
    },
    [],
  );

  // 1. INISIALISASI & MIGRASI OTOMATIS SAAT MENDARAT DI BROWSER
  useEffect(() => {
    const todayDate = getTodayLocalISO(); // Contoh: "2026-11-15"
    const currentMonthId = todayDate.substring(0, 7); // Contoh: "2026-11"

    // Muat database (otomatis migrasi dari format nested lama jika baru pertama kali)
    const loadedDb = loadAndMigrateJournalDatabase();
    let needsSave = false;

    const nextFolders = [...loadedDb.folders];
    const nextJournals = [...loadedDb.journals];

    // Cek apakah jurnal untuk hari ini sudah ada (di folder mana pun)
    let todayJournal = nextJournals.find((j) => j.date === todayDate);
    let targetFolderId = todayJournal?.folderId ?? currentMonthId;

    if (!todayJournal) {
      // Pastikan folder bulan ini tersedia sebelum membuat halaman baru
      const monthFolderExists = nextFolders.some(
        (f) => f.id === currentMonthId,
      );
      if (!monthFolderExists) {
        nextFolders.push({
          id: currentMonthId,
          name: "New Folder",
        });
      }

      todayJournal = {
        id: crypto.randomUUID(),
        folderId: currentMonthId,
        date: todayDate,
        title: "",
        isFavorite: false,
      };
      nextJournals.push(todayJournal);
      targetFolderId = currentMonthId;
      needsSave = true;
    }

    const initializedDb: JournalDatabase = needsSave
      ? {
          ...loadedDb,
          folders: nextFolders,
          journals: nextJournals,
        }
      : loadedDb;

    if (needsSave) {
      localStorage.setItem(
        JOURNAL_DB_STORAGE_KEY,
        JSON.stringify(initializedDb),
      );
    }

    setDb(initializedDb);
    setActiveFolderId(targetFolderId);
    setActiveJournalId(todayJournal.id);
    setIsMounted(true);
  }, []);

  // 2. SINKRONISASI ANTAR-KOMPONEN / TAB BROWSER
  useEffect(() => {
    const syncFromStorage = () => {
      const latestDb = loadAndMigrateJournalDatabase();
      setDb(latestDb);
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(JOURNAL_SYNC_EVENT, syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(JOURNAL_SYNC_EVENT, syncFromStorage);
    };
  }, []);

  // 3. DATA TURUNAN (SELECTORS) UNTUK UI JURNAL & BERANDA
  const todayDate = useMemo(() => getTodayLocalISO(), []);

  // Ringkasan jurnal yang sedang dibuka di layar Jurnal
  const activeSummary: DailyJournalSummary = useMemo(
    () => getJournalSummaryById(db, activeJournalId),
    [db, activeJournalId],
  );

  // Ringkasan khusus hari ini (siap pakai untuk widget di halaman Beranda)
  const todaySummary: DailyJournalSummary = useMemo(
    () => getJournalSummaryByDate(db, todayDate),
    [db, todayDate],
  );

  const activeFolder: JournalFolder | undefined = useMemo(
    () => db.folders.find((f) => f.id === activeFolderId),
    [db.folders, activeFolderId],
  );

  // Helper query fleksibel untuk mengambil ringkasan tanggal tertentu dari halaman mana pun
  const getSummaryByDate = useCallback(
    (isoDate: string) => getJournalSummaryByDate(db, isoDate),
    [db],
  );

  // ==========================================================================
  // 4. AKSI DIREKTORI FOLDER & NAVIGASI HALAMAN
  // ==========================================================================

  const selectFolder = useCallback((folderId: string) => {
    setActiveFolderId(folderId);
  }, []);

  const selectJournal = useCallback(
    (journalId: string) => {
      const target = db.journals.find((j) => j.id === journalId);
      if (!target) return;
      setActiveFolderId(target.folderId);
      setActiveJournalId(target.id);
    },
    [db.journals],
  );

  const createFolder = useCallback(
    (name = "New Folder") => {
      const trimmedName = name.trim() || "New Folder";
      const newFolderId = crypto.randomUUID();

      commitDatabase((prev) => ({
        ...prev,
        folders: [...prev.folders, { id: newFolderId, name: trimmedName }],
      }));

      setActiveFolderId(newFolderId);
      return newFolderId;
    },
    [commitDatabase],
  );

  const renameFolder = useCallback(
    (folderId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;

      commitDatabase((prev) => ({
        ...prev,
        folders: prev.folders.map((folder) =>
          folder.id === folderId ? { ...folder, name: trimmed } : folder,
        ),
      }));
    },
    [commitDatabase],
  );

  // Pindah folder di skema datar cukup memperbarui foreign key `folderId`
  const moveJournalToFolder = useCallback(
    (journalId: string, targetFolderId: string | null) => {
      if (!targetFolderId) return;

      commitDatabase((prev) => {
        const journal = prev.journals.find((j) => j.id === journalId);
        if (!journal || journal.folderId === targetFolderId) return prev;

        return {
          ...prev,
          journals: prev.journals.map((j) =>
            j.id === journalId ? { ...j, folderId: targetFolderId } : j,
          ),
        };
      });
    },
    [commitDatabase],
  );

  // ==========================================================================
  // 5. AKSI METADATA HALAMAN JURNAL
  // ==========================================================================

  const updateJournalTitle = useCallback(
    (journalId: string, newTitle: string) => {
      commitDatabase((prev) => ({
        ...prev,
        journals: prev.journals.map((j) =>
          j.id === journalId ? { ...j, title: newTitle } : j,
        ),
      }));
    },
    [commitDatabase],
  );

  const toggleJournalFavorite = useCallback(
    (journalId: string) => {
      commitDatabase((prev) => ({
        ...prev,
        journals: prev.journals.map((j) =>
          j.id === journalId ? { ...j, isFavorite: !j.isFavorite } : j,
        ),
      }));
    },
    [commitDatabase],
  );

  // ==========================================================================
  // 6. AKSI CRUD SESI, TUGAS, & REFLEKSI
  // ==========================================================================

  const bookSession = useCallback(
    (input: BookSessionInput) => {
      if (!activeJournalId) return;
      if (input.tasks.length === 0 && input.reflections.length === 0) return;

      const sessionId = crypto.randomUUID();

      const newSession: JournalSession = {
        id: sessionId,
        journalId: activeJournalId,
        startingTime: input.startingTime || "00:00",
        finishingTime: input.finishingTime || "00:00",
      };

      const newTasks: JournalTask[] = input.tasks.map((t) => ({
        id: crypto.randomUUID(),
        sessionId,
        journalId: activeJournalId,
        name: t.name,
        duration: t.duration || "0 j 0 m",
        tag: t.tag || "Tanpa Tag",
      }));

      const newReflections: JournalReflection[] = input.reflections.map(
        (r) => ({
          id: crypto.randomUUID(),
          sessionId,
          journalId: activeJournalId,
          text: r.text,
        }),
      );

      commitDatabase((prev) => ({
        ...prev,
        sessions: [...prev.sessions, newSession],
        tasks: [...prev.tasks, ...newTasks],
        reflections: [...prev.reflections, ...newReflections],
      }));
    },
    [activeJournalId, commitDatabase],
  );

  const updateSession = useCallback(
    (updatedSession: HydratedSession) => {
      commitDatabase((prev) => {
        // 1. Perbarui waktu mulai & selesai pada tabel sessions
        const nextSessions = prev.sessions.map((s) =>
          s.id === updatedSession.id
            ? {
                ...s,
                startingTime: updatedSession.startingTime,
                finishingTime: updatedSession.finishingTime,
              }
            : s,
        );

        // 2. Ganti seluruh tugas milik sesi ini dengan versi terbarunya
        const otherTasks = prev.tasks.filter(
          (t) => t.sessionId !== updatedSession.id,
        );
        const normalizedTasks: JournalTask[] = updatedSession.tasks.map(
          (t) => ({
            ...t,
            sessionId: updatedSession.id,
            journalId: updatedSession.journalId,
          }),
        );

        // 3. Ganti seluruh refleksi milik sesi ini dengan versi terbarunya
        const otherReflections = prev.reflections.filter(
          (r) => r.sessionId !== updatedSession.id,
        );
        const normalizedReflections: JournalReflection[] =
          updatedSession.reflections.map((r) => ({
            ...r,
            sessionId: updatedSession.id,
            journalId: updatedSession.journalId,
          }));

        return {
          ...prev,
          sessions: nextSessions,
          tasks: [...otherTasks, ...normalizedTasks],
          reflections: [...otherReflections, ...normalizedReflections],
        };
      });
    },
    [commitDatabase],
  );

  // Menghapus sesi sekaligus membersihkan seluruh tugas & refleksi anaknya (cascade delete)
  const deleteSession = useCallback(
    (sessionId: string) => {
      commitDatabase((prev) => ({
        ...prev,
        sessions: prev.sessions.filter((s) => s.id !== sessionId),
        tasks: prev.tasks.filter((t) => t.sessionId !== sessionId),
        reflections: prev.reflections.filter((r) => r.sessionId !== sessionId),
      }));
    },
    [commitDatabase],
  );

  // ==========================================================================
  // 7. AKSI EVALUASI HARIAN (CREATE / UPDATE ATOMIK)
  // ==========================================================================

  const saveEvaluation = useCallback(
    (input: SaveEvaluationInput) => {
      if (!activeJournalId) return;

      commitDatabase((prev) => {
        // Cek apakah evaluasi untuk jurnal ini sudah ada (mode edit atau timpa)
        const existingEval = prev.evaluations.find(
          (e) => e.journalId === activeJournalId,
        );
        const evaluationId =
          input.id || existingEval?.id || crypto.randomUUID();

        const nextEvaluation: DailyEvaluation = {
          id: evaluationId,
          journalId: activeJournalId,
          crashTime: input.crashTime,
          sleepDuration: input.sleepDuration,
          morningFeeling: input.morningFeeling,
        };

        const nextEvaluations = existingEval
          ? prev.evaluations.map((e) =>
              e.id === evaluationId ? nextEvaluation : e,
            )
          : [...prev.evaluations, nextEvaluation];

        // Bersihkan sub-entitas lama milik evaluationId ini sebelum menyisipkan yang baru
        const nextFlowStates: EvaluationFlowState[] = [
          ...prev.flowStates.filter((f) => f.evaluationId !== evaluationId),
          ...input.flowStates.map((f) => ({
            id: crypto.randomUUID(),
            evaluationId,
            start: f.start,
            end: f.end,
          })),
        ];

        const nextMissedTasks: EvaluationMissedTask[] = [
          ...prev.missedTasks.filter((m) => m.evaluationId !== evaluationId),
          ...input.missedTasks.map((m) => ({
            id: crypto.randomUUID(),
            evaluationId,
            task: m.task,
            tag: m.tag,
          })),
        ];

        const nextDistractions: EvaluationDistraction[] = [
          ...prev.distractions.filter((d) => d.evaluationId !== evaluationId),
          ...input.distractions.map((d) => ({
            id: crypto.randomUUID(),
            evaluationId,
            distraction: d.distraction,
            start: d.start,
            end: d.end,
          })),
        ];

        const nextRestingActivities: EvaluationRestingActivity[] = [
          ...prev.restingActivities.filter(
            (r) => r.evaluationId !== evaluationId,
          ),
          ...input.restingActivities.map((r) => ({
            id: crypto.randomUUID(),
            evaluationId,
            name: r.name,
          })),
        ];

        return {
          ...prev,
          evaluations: nextEvaluations,
          flowStates: nextFlowStates,
          missedTasks: nextMissedTasks,
          distractions: nextDistractions,
          restingActivities: nextRestingActivities,
        };
      });
    },
    [activeJournalId, commitDatabase],
  );

  // ==========================================================================
  // 8. AKSI PENYIMPANAN TAG GLOBAL
  // ==========================================================================

  const addTag = useCallback(
    (newTag: string) => {
      const trimmed = newTag.trim();
      if (!trimmed) return;

      commitDatabase((prev) => {
        if (prev.tags.includes(trimmed)) return prev;
        return {
          ...prev,
          tags: [...prev.tags, trimmed],
        };
      });
    },
    [commitDatabase],
  );

  const addSleepTag = useCallback(
    (newTag: string) => {
      const trimmed = newTag.trim();
      if (!trimmed) return;

      commitDatabase((prev) => {
        if (prev.sleepTags.includes(trimmed)) return prev;
        return {
          ...prev,
          sleepTags: [...prev.sleepTags, trimmed],
        };
      });
    },
    [commitDatabase],
  );

  return {
    // Status & Konteks Aktif
    isMounted,
    todayDate,
    folders: db.folders,
    journals: db.journals,
    tags: db.tags,
    sleepTags: db.sleepTags,
    activeFolderId,
    activeJournalId,
    activeFolder,
    activeSummary,

    // Akses Lintas Halaman (untuk Beranda)
    todaySummary,
    getSummaryByDate,

    // Aksi Direktori & Halaman
    selectFolder,
    selectJournal,
    createFolder,
    renameFolder,
    moveJournalToFolder,
    updateJournalTitle,
    toggleJournalFavorite,

    // Aksi Sesi & Evaluasi
    bookSession,
    updateSession,
    deleteSession,
    saveEvaluation,

    // Aksi Tag
    addTag,
    addSleepTag,
  };
}
