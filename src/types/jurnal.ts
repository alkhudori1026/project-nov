// ============================================================================
// 1. ENTITAS UTAMA (SKEMA DATAR / RELATIONAL-READY)
// Setiap entitas merepresentasikan satu tabel sejajar di database (Supabase/MySQL)
// ============================================================================

export interface JournalFolder {
  id: string;
  name: string;
}

export interface DailyJournal {
  id: string;
  folderId: string; // Foreign Key -> JournalFolder.id
  date: string; // Format ISO "YYYY-MM-DD"
  title: string;
  isFavorite: boolean;
}

export interface JournalSession {
  id: string;
  journalId: string; // Foreign Key -> DailyJournal.id
  startingTime: string; // Format "HH:mm"
  finishingTime: string; // Format "HH:mm"
}

export interface JournalTask {
  id: string;
  sessionId: string; // Foreign Key -> JournalSession.id
  journalId: string; // Foreign Key -> DailyJournal.id (mempercepat query harian di Beranda)
  name: string;
  duration: string;
  tag: string;
}

export interface JournalReflection {
  id: string;
  sessionId: string; // Foreign Key -> JournalSession.id
  journalId: string; // Foreign Key -> DailyJournal.id
  text: string;
}

export interface DailyEvaluation {
  id: string;
  journalId: string; // Foreign Key 1-to-1 -> DailyJournal.id
  crashTime: string;
  sleepDuration: string;
  morningFeeling: string;
}

export interface EvaluationFlowState {
  id: string;
  evaluationId: string; // Foreign Key -> DailyEvaluation.id
  start: string;
  end: string;
}

export interface EvaluationMissedTask {
  id: string;
  evaluationId: string; // Foreign Key -> DailyEvaluation.id
  task: string;
  tag: string;
}

export interface EvaluationDistraction {
  id: string;
  evaluationId: string; // Foreign Key -> DailyEvaluation.id
  distraction: string;
  start: string;
  end: string;
}

export interface EvaluationRestingActivity {
  id: string;
  evaluationId: string; // Foreign Key -> DailyEvaluation.id
  name: string;
}

// ============================================================================
// 2. KONTAINER PENYIMPANAN UTAMA (LOCAL STORAGE DATABASE)
// ============================================================================

export interface JournalDatabase {
  schemaVersion: number; // Penanda versi skema untuk kebutuhan migrasi masa depan
  folders: JournalFolder[];
  journals: DailyJournal[];
  sessions: JournalSession[];
  tasks: JournalTask[];
  reflections: JournalReflection[];
  evaluations: DailyEvaluation[];
  flowStates: EvaluationFlowState[];
  missedTasks: EvaluationMissedTask[];
  distractions: EvaluationDistraction[];
  restingActivities: EvaluationRestingActivity[];
  tags: string[]; // Pengganti jurnal_tagStorage
  sleepTags: string[]; // Pengganti jurnal_tagSleepStorage
}

// ============================================================================
// 3. VIEW MODELS / DATA TERHIDRASI (UNTUK KOMPONEN UI & HALAMAN BERANDA)
// Hasil penggabungan relasi agar komponen UI tidak perlu melakukan join manual
// ============================================================================

export interface HydratedSession extends JournalSession {
  uniqueTags: string[]; // Dihitung dinamis dari daftar tasks pada sesi ini
  tasks: JournalTask[];
  reflections: JournalReflection[];
}

export interface HydratedEvaluation extends DailyEvaluation {
  flowStates: EvaluationFlowState[];
  missedTasks: EvaluationMissedTask[];
  distractions: EvaluationDistraction[];
  restingActivities: EvaluationRestingActivity[];
}

// Ringkasan ringan yang siap dikonsumsi lintas halaman (misal: widget Beranda)
export interface DailyJournalSummary {
  journal: DailyJournal | null;
  folderName: string;
  totalSessions: number;
  totalCompletedTasks: number;
  sessions: HydratedSession[];
  evaluation: HydratedEvaluation | null;
}

// ============================================================================
// 4. TIPE DATA LAMA (LEGACY NESTED SCHEMA)
// Digunakan khusus oleh utilitas migrasi agar pembacaan data lama tetap type-safe
// ============================================================================

export interface LegacyTask {
  id: string;
  nama: string;
  durasi: string;
  tag: string;
}

export interface LegacyReflection {
  id: string;
  text: string;
}

export interface LegacySession {
  id: string;
  startingTime: string;
  finishingTime: string;
  tagUnik: string[];
  tugas: LegacyTask[];
  refleksi: LegacyReflection[];
}

export interface LegacyFlowState {
  id: string;
  start: string;
  end: string;
}

export interface LegacyMissedTask {
  id: string;
  task: string;
  tag: string;
}

export interface LegacyDistraction {
  id: string;
  distraction: string;
  start: string;
  end: string;
}

export interface LegacyRestingActivity {
  id: string;
  name: string;
}

export interface LegacyEvaluation {
  id: string;
  flowStates: LegacyFlowState[];
  crashTime: string;
  missedTasks: LegacyMissedTask[];
  distractions: LegacyDistraction[];
  sleepDuration: string;
  morningFeeling: string;
  restingActivities: LegacyRestingActivity[];
}

export interface LegacyDailyJournal {
  id: string;
  date: string;
  title: string;
  favorite: boolean;
  sessions: LegacySession[];
  evaluation: LegacyEvaluation | null;
}

export interface LegacyMonthFolder {
  id: string;
  name: string;
  pages: LegacyDailyJournal[];
}
