import {
  DailyEvaluation,
  DailyJournal,
  EvaluationDistraction,
  EvaluationFlowState,
  EvaluationMissedTask,
  EvaluationRestingActivity,
  JournalDatabase,
  JournalFolder,
  JournalReflection,
  JournalSession,
  JournalTask,
  LegacyMonthFolder,
} from "@/types/jurnal";

export const JOURNAL_DB_STORAGE_KEY = "jurnal_database_v1";

// Kunci penyimpanan lama (dipertahankan untuk proses migrasi otomatis)
const LEGACY_ARCHIVE_KEY = "jurnal_arsipUtama";
const LEGACY_TAGS_KEY = "jurnal_tagStorage";
const LEGACY_SLEEP_TAGS_KEY = "jurnal_tagSleepStorage";

export const CURRENT_SCHEMA_VERSION = 1;

// Membuat kerangka database kosong yang valid
export function createEmptyJournalDatabase(): JournalDatabase {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    folders: [],
    journals: [],
    sessions: [],
    tasks: [],
    reflections: [],
    evaluations: [],
    flowStates: [],
    missedTasks: [],
    distractions: [],
    restingActivities: [],
    tags: [],
    sleepTags: [],
  };
}

// Fungsi murni: meratakan struktur nested 4 lapis menjadi tabel-tabel sejajar
export function migrateLegacyData(
  legacyFolders: LegacyMonthFolder[],
  legacyTags: string[] = [],
  legacySleepTags: string[] = [],
): JournalDatabase {
  const db = createEmptyJournalDatabase();
  db.tags = Array.isArray(legacyTags) ? [...legacyTags] : [];
  db.sleepTags = Array.isArray(legacySleepTags) ? [...legacySleepTags] : [];

  if (!Array.isArray(legacyFolders)) return db;

  for (const folder of legacyFolders) {
    // 1. Ekstrak Folder
    const flatFolder: JournalFolder = {
      id: folder.id,
      name: folder.name || "New Folder",
    };
    db.folders.push(flatFolder);

    const pages = Array.isArray(folder.pages) ? folder.pages : [];
    for (const page of pages) {
      // 2. Ekstrak Jurnal Harian (hubungkan ke folderId)
      const flatJournal: DailyJournal = {
        id: page.id,
        folderId: folder.id,
        date: page.date,
        title: page.title || "",
        isFavorite: Boolean(page.favorite),
      };
      db.journals.push(flatJournal);

      // 3. Ekstrak Sesi beserta Tugas & Refleksi di dalamnya
      const sessions = Array.isArray(page.sessions) ? page.sessions : [];
      for (const session of sessions) {
        const flatSession: JournalSession = {
          id: session.id,
          journalId: page.id,
          startingTime: session.startingTime || "00:00",
          finishingTime: session.finishingTime || "00:00",
        };
        db.sessions.push(flatSession);

        const tasks = Array.isArray(session.tugas) ? session.tugas : [];
        for (const task of tasks) {
          const flatTask: JournalTask = {
            id: task.id,
            sessionId: session.id,
            journalId: page.id,
            name: task.nama,
            duration: task.durasi || "0 j 0 m",
            tag: task.tag || "Tanpa Tag",
          };
          db.tasks.push(flatTask);
        }

        const reflections = Array.isArray(session.refleksi)
          ? session.refleksi
          : [];
        for (const ref of reflections) {
          const flatReflection: JournalReflection = {
            id: ref.id,
            sessionId: session.id,
            journalId: page.id,
            text: ref.text,
          };
          db.reflections.push(flatReflection);
        }
      }

      // 4. Ekstrak Evaluasi Harian beserta 4 sub-entitasnya (jika ada)
      if (page.evaluation) {
        const evalData = page.evaluation;
        const flatEvaluation: DailyEvaluation = {
          id: evalData.id,
          journalId: page.id,
          crashTime: evalData.crashTime || "",
          sleepDuration: evalData.sleepDuration || "",
          morningFeeling: evalData.morningFeeling || "",
        };
        db.evaluations.push(flatEvaluation);

        for (const flow of evalData.flowStates ?? []) {
          const item: EvaluationFlowState = {
            id: flow.id,
            evaluationId: evalData.id,
            start: flow.start,
            end: flow.end,
          };
          db.flowStates.push(item);
        }

        for (const missed of evalData.missedTasks ?? []) {
          const item: EvaluationMissedTask = {
            id: missed.id,
            evaluationId: evalData.id,
            task: missed.task,
            tag: missed.tag,
          };
          db.missedTasks.push(item);
        }

        for (const dist of evalData.distractions ?? []) {
          const item: EvaluationDistraction = {
            id: dist.id,
            evaluationId: evalData.id,
            distraction: dist.distraction,
            start: dist.start,
            end: dist.end,
          };
          db.distractions.push(item);
        }

        for (const rest of evalData.restingActivities ?? []) {
          const item: EvaluationRestingActivity = {
            id: rest.id,
            evaluationId: evalData.id,
            name: rest.name,
          };
          db.restingActivities.push(item);
        }
      }
    }
  }

  return db;
}

// Memuat database dari localStorage, otomatis menjalankan migrasi jika baru pertama kali upgrade
export function loadAndMigrateJournalDatabase(): JournalDatabase {
  if (typeof window === "undefined") {
    return createEmptyJournalDatabase();
  }

  try {
    // A. Cek apakah database versi baru sudah tersedia
    const rawCurrentDb = localStorage.getItem(JOURNAL_DB_STORAGE_KEY);
    if (rawCurrentDb) {
      const parsed = JSON.parse(rawCurrentDb) as JournalDatabase;
      if (parsed && typeof parsed.schemaVersion === "number") {
        return parsed;
      }
    }

    // B. Jika belum ada, periksa apakah ada data lama yang perlu dimigrasi
    const rawLegacyArchive = localStorage.getItem(LEGACY_ARCHIVE_KEY);
    const rawLegacyTags = localStorage.getItem(LEGACY_TAGS_KEY);
    const rawLegacySleepTags = localStorage.getItem(LEGACY_SLEEP_TAGS_KEY);

    if (rawLegacyArchive || rawLegacyTags || rawLegacySleepTags) {
      const legacyFolders: LegacyMonthFolder[] = rawLegacyArchive
        ? JSON.parse(rawLegacyArchive)
        : [];
      const legacyTags: string[] = rawLegacyTags
        ? JSON.parse(rawLegacyTags)
        : [];
      const legacySleepTags: string[] = rawLegacySleepTags
        ? JSON.parse(rawLegacySleepTags)
        : [];

      const migratedDb = migrateLegacyData(
        legacyFolders,
        legacyTags,
        legacySleepTags,
      );

      // Simpan hasil migrasi ke kunci baru (kunci lama dibiarkan utuh sebagai backup)
      localStorage.setItem(JOURNAL_DB_STORAGE_KEY, JSON.stringify(migratedDb));
      return migratedDb;
    }
  } catch (error) {
    console.error("Gagal memuat atau memigrasi database jurnal:", error);
  }

  return createEmptyJournalDatabase();
}
