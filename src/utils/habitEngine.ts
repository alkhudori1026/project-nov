import { Habit, HabitLog, BadHabit, SlipLog } from "@/types/habit";

// Daftar status sinyal yang dibaca oleh antarmuka (UI) untuk menentukan tindakan
export type HabitSignal =
  | "NORMAL" // Berjalan lancar, tidak butuh intervensi
  | "PROMPT_PURPOSE" // Sudah 3x selesai & tujuan belum diisi (Progressive Profiling)
  | "GATEKEEPER_LATENCY" // 5x telat centang berturut-turut -> tampilkan verifikasi pola 1
  | "READY_FOR_SHADOWING" // Skor friksi ringan >= 80% (10 sesi) -> tawarkan uji lepas
  | "SHADOWING_EVALUATION" // Sudah 7 hari uji lepas -> tanyakan hasil evaluasi
  | "NEEDS_DIAGNOSTIC" // Terdeteksi macet -> wajib buka Dialog Diagnostik
  | "PAUSE_EXPIRED"; // Masa jeda (TTL) habis -> bangunkan kartu

// Fungsi bantu untuk menghitung selisih hari antara dua tanggal (YYYY-MM-DD atau ISO)
export function getDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate.slice(0, 10)).getTime();
  const end = new Date(endDate.slice(0, 10)).getTime();
  const diffInMs = end - start;
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

// 1. ANALYZER UTAMA: Menentukan satu status prioritas untuk setiap kartu kebiasaan
export function analyzeHabitSignal(
  habit: Habit,
  allLogs: HabitLog[],
  todayDateStr: string, // Format 'YYYY-MM-DD'
): HabitSignal {
  // Cek kondisi untuk kebiasaan yang sedang dijeda (TTL)
  if (habit.phase === "PAUSED") {
    if (habit.pausedUntil && todayDateStr >= habit.pausedUntil.slice(0, 10)) {
      return "PAUSE_EXPIRED";
    }
    return "NORMAL";
  }

  // Kebiasaan yang sudah otomatis ditangani oleh Audit Bulanan, bukan evaluasi harian
  if (habit.phase === "AUTOMATED") {
    return "NORMAL";
  }

  // Cek kondisi untuk fase Uji Lepas (Silent Shadowing 7 hari)
  if (habit.phase === "SILENT_SHADOWING") {
    if (
      habit.shadowingStartedAt &&
      getDaysDifference(habit.shadowingStartedAt, todayDateStr) >= 7
    ) {
      return "SHADOWING_EVALUATION";
    }
    return "NORMAL";
  }

  // --- LOGIKA UNTUK FASE 1: INSTRUMENTATION ---
  // Ambil log yang sudah selesai milik habit ini, urutkan dari yang terbaru
  const completedLogs = allLogs
    .filter((log) => log.habitId === habit.id && log.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Prioritas 1: Deteksi Kemacetan (Stall Detection)
  // Syarat A: 3 sesi terakhir semuanya terasa berat (frictionScore === 3)
  const lastThreeLogs = completedLogs.slice(0, 3);
  const isConsistentlyHard =
    lastThreeLogs.length === 3 &&
    lastThreeLogs.every((log) => log.frictionScore === 3);

  // Syarat B: Sudah bolong >= 3 hari sejak eksekusi terakhir (atau sejak kartu dibuat)
  // Ambil tanggal paling baru antara log terakhir, waktu kalibrasi ulang, atau tanggal dibuat
  const candidates = [
    habit.createdAt.slice(0, 10),
    habit.calibratedAt?.slice(0, 10),
    completedLogs[0]?.date,
  ].filter(Boolean) as string[];

  const lastActiveDate = candidates.sort().reverse()[0];
  const daysSinceLastActive = getDaysDifference(lastActiveDate, todayDateStr);

  if (isConsistentlyHard || daysSinceLastActive >= 3) {
    return "NEEDS_DIAGNOSTIC";
  }

  // Prioritas 2: Syarat Lulus ke Uji Lepas via Skor Friksi
  // Minimal 10 sesi selesai, dan minimal 8 di antaranya (80%) berskor 1 (Ringan)
  const lastTenLogs = completedLogs.slice(0, 10);
  if (lastTenLogs.length === 10) {
    const easyCount = lastTenLogs.filter(
      (log) => log.frictionScore === 1,
    ).length;
    if (easyCount >= 8) {
      return "READY_FOR_SHADOWING";
    }
  }

  // Prioritas 3: Gatekeeper Latensi Pencatatan (Pola 1)
  // Cek 5 log terakhir setelah titik reset latensi (jika pernah di-reset)
  const validLatencyLogs = habit.retroactiveResetAt
    ? completedLogs.filter((log) => log.loggedAt > habit.retroactiveResetAt!)
    : completedLogs;

  const lastFiveLatencyLogs = validLatencyLogs.slice(0, 5);
  if (
    lastFiveLatencyLogs.length === 5 &&
    lastFiveLatencyLogs.every((log) => log.isRetroactive)
  ) {
    return "GATEKEEPER_LATENCY";
  }

  // Prioritas 4: Progressive Profiling (Minta isi tujuan setelah 3x berhasil)
  if (!habit.purpose && completedLogs.length >= 3) {
    return "PROMPT_PURPOSE";
  }

  return "NORMAL";
}

// 2. CIRCUIT BREAKER: Mengecek apakah kebiasaan masih boleh diperkecil dosisnya (maksimal 2x)
export function canDownscaleHabit(habit: Habit): boolean {
  return habit.downscaleCount < 2;
}

// 3. DETEKTOR TAB MENGURAI: Mencari pemicu dominan (>= 70% dari minimal 5 insiden)
export function detectDominantTrigger(
  badHabit: BadHabit,
  allSlipLogs: SlipLog[],
): { trigger: string; percentage: number } | null {
  const logs = allSlipLogs.filter((log) => log.badHabitId === badHabit.id);

  // Butuh minimal 5 data insiden agar polanya valid secara statistik
  if (logs.length < 5) return null;

  const triggerCounts: Record<string, number> = {};
  for (const log of logs) {
    triggerCounts[log.triggerUsed] = (triggerCounts[log.triggerUsed] || 0) + 1;
  }

  let dominantTrigger = "";
  let maxCount = 0;

  for (const [trigger, count] of Object.entries(triggerCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantTrigger = trigger;
    }
  }

  const ratio = maxCount / logs.length;
  if (ratio >= 0.7) {
    return {
      trigger: dominantTrigger,
      percentage: Math.round(ratio * 100),
    };
  }

  return null;
}
