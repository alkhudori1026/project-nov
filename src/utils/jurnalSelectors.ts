import {
  DailyEvaluation,
  DailyJournal,
  DailyJournalSummary,
  HydratedEvaluation,
  HydratedSession,
  JournalDatabase,
  JournalReflection,
  JournalSession,
  JournalTask,
} from "@/types/jurnal";

// Memformat tanggal ISO ("YYYY-MM-DD") ke tampilan bahasa Indonesia
export function formatIndonesianDate(isoDate: string): string {
  if (!isoDate) return "";
  // Tambahkan jam lokal agar tidak tergeser zona waktu UTC
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Menggabungkan satu sesi dengan daftar tugas, refleksi, dan tag unik dinamisnya
export function hydrateSession(
  session: JournalSession,
  allTasks: JournalTask[],
  allReflections: JournalReflection[],
): HydratedSession {
  const tasks = allTasks.filter((t) => t.sessionId === session.id);
  const reflections = allReflections.filter((r) => r.sessionId === session.id);
  const uniqueTags = Array.from(new Set(tasks.map((t) => t.tag)));

  return {
    ...session,
    uniqueTags,
    tasks,
    reflections,
  };
}

// Menggabungkan satu evaluasi harian dengan 4 sub-tabelnya
export function hydrateEvaluation(
  evaluation: DailyEvaluation | undefined,
  db: JournalDatabase,
): HydratedEvaluation | null {
  if (!evaluation) return null;

  return {
    ...evaluation,
    flowStates: db.flowStates.filter((f) => f.evaluationId === evaluation.id),
    missedTasks: db.missedTasks.filter((m) => m.evaluationId === evaluation.id),
    distractions: db.distractions.filter(
      (d) => d.evaluationId === evaluation.id,
    ),
    restingActivities: db.restingActivities.filter(
      (r) => r.evaluationId === evaluation.id,
    ),
  };
}

// Membangun ringkasan utuh satu halaman jurnal (digunakan oleh halaman Jurnal & Beranda)
export function buildJournalSummary(
  db: JournalDatabase,
  journal: DailyJournal | undefined,
): DailyJournalSummary {
  if (!journal) {
    return {
      journal: null,
      folderName: "",
      totalSessions: 0,
      totalCompletedTasks: 0,
      sessions: [],
      evaluation: null,
    };
  }

  const folder = db.folders.find((f) => f.id === journal.folderId);

  // Ambil dan urutkan sesi secara kronologis berdasarkan jam mulai
  const journalSessions = db.sessions
    .filter((s) => s.journalId === journal.id)
    .sort((a, b) => a.startingTime.localeCompare(b.startingTime));

  const hydratedSessions = journalSessions.map((session) =>
    hydrateSession(session, db.tasks, db.reflections),
  );

  const rawEvaluation = db.evaluations.find((e) => e.journalId === journal.id);
  const hydratedEvaluation = hydrateEvaluation(rawEvaluation, db);

  const totalCompletedTasks = db.tasks.filter(
    (t) => t.journalId === journal.id,
  ).length;

  return {
    journal,
    folderName: folder?.name || "Tanpa Folder",
    totalSessions: hydratedSessions.length,
    totalCompletedTasks,
    sessions: hydratedSessions,
    evaluation: hydratedEvaluation,
  };
}

// Helper cepat untuk membaca jurnal berdasarkan ID halaman
export function getJournalSummaryById(
  db: JournalDatabase,
  journalId: string | null,
): DailyJournalSummary {
  const journal = journalId
    ? db.journals.find((j) => j.id === journalId)
    : undefined;
  return buildJournalSummary(db, journal);
}

// Helper cepat untuk halaman Beranda: langsung mengambil ringkasan berdasarkan tanggal ("YYYY-MM-DD")
export function getJournalSummaryByDate(
  db: JournalDatabase,
  targetDate: string,
): DailyJournalSummary {
  const journal = db.journals.find((j) => j.date === targetDate);
  return buildJournalSummary(db, journal);
}
