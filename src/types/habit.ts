// 1. STATUS SIKLUS HIDUP (Tab Membangun & Tab Arsip)
export type HabitPhase =
  | "INSTRUMENTATION" // Fase 1: Aktif dilatih & butuh visibilitas penuh
  | "SILENT_SHADOWING" // Fase 2: Uji lepas 7 hari (tampilan redup, tanpa pengingat)
  | "AUTOMATED" // Fase 3: Lulus, pindah ke Tab Arsip (Audit Bulanan)
  | "PAUSED"; // Mode jeda sementara dengan batas waktu (TTL)

export type FrictionScore = 1 | 2 | 3; // 1: Ringan, 2: Sedang, 3: Berat

export interface Habit {
  id: string;
  name: string;
  anchor: string; // Pemicu konteks/waktu/lokasi
  purpose?: string; // Diisi belakangan (Progressive Profiling setelah 3-5x selesai)

  // Konfigurasi Mode Re-routing (Opsional)
  isRerouting: boolean;
  replacedRoutine?: string; // Rutinitas lama yang digeser
  frictionPatch?: string; // Hambatan fisik/digital pemutus jalur lama

  // Variabel State Machine & Pengaman
  phase: HabitPhase;
  downscaleCount: number; // Penghitung Circuit Breaker (maksimal 2x)
  shadowingStartedAt?: string; // Tanggal mulai uji lepas 7 hari (ISO string)
  pausedUntil?: string; // Tanggal berakhirnya mode jeda / TTL (ISO string)

  createdAt: string;
  retroactiveResetAt?: string; // Penanda waktu jika user memilih "Jauh dari gawai" pada Gatekeeper
  calibratedAt?: string; // Penanda waktu terakhir habit dikalibrasi ulang lewat Dialog Diagnostik
}

// Dipisah dari Habit (Flattened) agar mudah menghitung tren 10 sesi terakhir
export interface HabitLog {
  id: string;
  habitId: string; // Relasi ke Habit.id
  date: string; // Format 'YYYY-MM-DD'
  completed: boolean;
  frictionScore?: FrictionScore;
  isRetroactive: boolean; // True jika dicentang H+1 (untuk Gatekeeper latensi)
  loggedAt: string; // Timestamp aktual saat tombol diklik
}

// 2. ENTITAS TAB MENGURAI (Kebiasaan Buruk / Multi-Pemicu)
export interface BadHabit {
  id: string;
  name: string;
  triggers: string[]; // Daftar tag pemicu (misal: ["Stres", "Jam 10 malam"])
  createdAt: string;
}

// Tindakan hambatan sekali pasang (One-time setup)
export interface EnvironmentPatch {
  id: string;
  badHabitId: string; // Relasi ke BadHabit.id
  description: string; // Misal: "Taruh charger HP di ruang tamu"
  isApplied: boolean;
}

// Catatan insiden pasif & telemetri biaya
export interface SlipLog {
  id: string;
  badHabitId: string; // Relasi ke BadHabit.id
  triggerUsed: string; // Pemicu mana yang jebol saat kejadian
  costNote: string; // Dampak riil (waktu terbuang / energi drop)
  occurredAt: string;
}

// 3. WADAH UTAMA LOCAL STORAGE (Setara AppData di halaman Project)
export interface HabitAppData {
  habits: Habit[];
  habitLogs: HabitLog[];
  badHabits: BadHabit[];
  environmentPatches: EnvironmentPatch[];
  slipLogs: SlipLog[];
}
