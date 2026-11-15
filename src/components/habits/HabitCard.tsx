"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  GitBranch,
  AlertTriangle,
  Sparkles,
  Clock,
  SlidersHorizontal,
} from "lucide-react";
import { Habit, HabitLog, FrictionScore } from "@/types/habit";
import { analyzeHabitSignal } from "@/utils/habitEngine";
import { getLocalDateString } from "@/hooks/useHabitStore";

interface HabitCardProps {
  habit: Habit;
  allLogs: HabitLog[];
  todayStr: string;
  onToggleComplete: (habitId: string, dateStr?: string) => void;
  onSetFrictionScore: (logId: string, score: FrictionScore) => void;
  onUpdatePurpose: (habitId: string, purpose: string) => void;
  onStartShadowing: (habitId: string) => void;
  onResolveLatency: (habitId: string, isTrulyAutomated: boolean) => void;
  onCompleteShadowing: (habitId: string, succeeded: boolean) => void;
  onOpenDiagnostic: (habit: Habit) => void;
}

export default function HabitCard({
  habit,
  allLogs,
  todayStr,
  onToggleComplete,
  onSetFrictionScore,
  onUpdatePurpose,
  onStartShadowing,
  onResolveLatency,
  onCompleteShadowing,
  onOpenDiagnostic,
}: HabitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [purposeDraft, setPurposeDraft] = useState("");

  // Hitung tanggal kemarin untuk opsi pencatatan susulan di dalam accordion
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  // Filter riwayat log milik kebiasaan ini dan urutkan dari yang terbaru
  const habitLogs = allLogs
    .filter((log) => log.habitId === habit.id && log.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  const todayLog = habitLogs.find((log) => log.date === todayStr);
  const yesterdayLog = habitLogs.find((log) => log.date === yesterdayStr);
  const latestLog = habitLogs[0];

  // Panggil sensor mesin aturan untuk menentukan status kartu saat ini
  const signal = analyzeHabitSignal(habit, allLogs, todayStr);
  const isShadowing = habit.phase === "SILENT_SHADOWING";

  // Munculkan pertanyaan skor friksi tiap kelipatan 5 sesi (jika sinyal utama sedang normal)
  const shouldPromptFriction =
    !isShadowing &&
    signal === "NORMAL" &&
    habitLogs.length > 0 &&
    habitLogs.length % 5 === 0 &&
    latestLog &&
    !latestLog.frictionScore;

  const handlePurposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purposeDraft.trim()) return;
    onUpdatePurpose(habit.id, purposeDraft);
    setPurposeDraft("");
  };

  return (
    <div
      className={`rounded-2xl border transition ${
        isShadowing
          ? "border-slate-200 bg-slate-50/80"
          : "border-slate-200 bg-white shadow-2xs"
      }`}
    >
      {/* Baris Utama Kartu */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Tombol Centang Harian (Disembunyikan saat fase Uji Lepas) */}
          {!isShadowing && (
            <button
              type="button"
              onClick={() => onToggleComplete(habit.id, todayStr)}
              aria-label="Tandai selesai hari ini"
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border transition cursor-pointer ${
                todayLog
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-slate-50 text-transparent hover:border-blue-400"
              }`}
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
            </button>
          )}

          {/* Informasi Inti */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`font-semibold truncate ${
                  todayLog && !isShadowing
                    ? "text-slate-400 line-through"
                    : "text-slate-800"
                }`}
              >
                {habit.name}
              </p>
              {habit.isRerouting && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  <GitBranch className="h-3 w-3" />
                  <span>Re-routing</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Pemicu:{" "}
              <span className="font-medium text-slate-600">{habit.anchor}</span>
            </p>
          </div>
        </div>

        {/* Tombol Buka/Tutup Inline Accordion */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          title="Lihat detail & opsi"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ==================================================================== */}
      {/* AREA SINYAL & TELEMETRI MIKRO (Muncul Kontekstual di Bawah Kartu)   */}
      {/* ==================================================================== */}

      {/* 1. Micro-prompt Skor Friksi (Tiap kelipatan 5x selesai) */}
      {shouldPromptFriction && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 rounded-b-2xl">
          <span className="text-xs text-slate-600">
            Sesi ke-{habitLogs.length}: Memulainya tadi terasa...
          </span>
          <div className="flex gap-1.5">
            {(
              [
                { score: 1, label: "Ringan" },
                { score: 2, label: "Sedang" },
                { score: 3, label: "Berat" },
              ] as const
            ).map((item) => (
              <button
                key={item.score}
                type="button"
                onClick={() => onSetFrictionScore(latestLog.id, item.score)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Progressive Profiling: Isi Tujuan setelah 3x selesai */}
      {signal === "PROMPT_PURPOSE" && (
        <form
          onSubmit={handlePurposeSubmit}
          className="border-t border-blue-100 bg-blue-50/50 px-4 py-3 flex flex-col sm:flex-row gap-2 rounded-b-2xl"
        >
          <input
            type="text"
            placeholder="Ritme mulai terbentuk. Tulis 1 kalimat tujuan nyatamu..."
            value={purposeDraft}
            onChange={(e) => setPurposeDraft(e.target.value)}
            className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
          >
            Simpan Tujuan
          </button>
        </form>
      )}

      {/* 3. Gatekeeper Latensi Pencatatan (Pola 1) */}
      {signal === "GATEKEEPER_LATENCY" && (
        <div className="border-t border-indigo-100 bg-indigo-50/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-b-2xl">
          <div className="flex items-start gap-2 text-xs text-indigo-900">
            <Clock className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
            <span>
              Sering dicentang susulan. Ini karena sudah jalan otomatis, atau
              memang jauh dari gawai?
            </span>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onResolveLatency(habit.id, true)}
              className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 cursor-pointer"
            >
              Sudah otomatis
            </button>
            <button
              type="button"
              onClick={() => onResolveLatency(habit.id, false)}
              className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 cursor-pointer"
            >
              Jauh dari gawai
            </button>
          </div>
        </div>
      )}

      {/* 4. Siap Masuk Uji Lepas 7 Hari */}
      {signal === "READY_FOR_SHADOWING" && (
        <div className="border-t border-emerald-100 bg-emerald-50/70 px-4 py-3 flex items-center justify-between gap-2 rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-emerald-900">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Friksi sudah sangat rendah. Siap mulai Uji Lepas 7 hari?
            </span>
          </div>
          <button
            type="button"
            onClick={() => onStartShadowing(habit.id)}
            className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 cursor-pointer"
          >
            Mulai Uji Lepas
          </button>
        </div>
      )}

      {/* 5. Evaluasi Hari ke-7 Fase Silent Shadowing */}
      {signal === "SHADOWING_EVALUATION" && (
        <div className="border-t border-blue-200 bg-blue-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-b-2xl">
          <span className="text-xs font-medium text-blue-900">
            7 hari tanpa pengingat selesai. Kebiasaan ini tetap jalan lancar?
          </span>
          <div className="flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onCompleteShadowing(habit.id, true)}
              className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
              Ya, Lulus
            </button>
            <button
              type="button"
              onClick={() => onOpenDiagnostic(habit)}
              className="rounded-lg border border-blue-300 bg-white px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 cursor-pointer"
            >
              Belum / Macet
            </button>
          </div>
        </div>
      )}

      {/* 6. Peringatan Kemacetan -> Buka Dialog Diagnostik */}
      {signal === "NEEDS_DIAGNOSTIC" && (
        <div className="border-t border-amber-200 bg-amber-50/80 px-4 py-3 flex items-center justify-between gap-2 rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Ritme terdeteksi melambat atau terlewat beberapa hari.</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenDiagnostic(habit)}
            className="shrink-0 rounded-lg bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 cursor-pointer"
          >
            Evaluasi Hambatan
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* INLINE ACCORDION (Detail Metadata & Aksi Sekunder)                   */}
      {/* ==================================================================== */}
      {isExpanded && (
        <div className="border-t border-slate-100 px-4 py-3.5 text-xs text-slate-600 space-y-2.5 bg-slate-50/40 rounded-b-2xl">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>
              Total selesai:{" "}
              <strong className="text-slate-800">
                {habitLogs.length} sesi
              </strong>
            </span>
            {habit.downscaleCount > 0 && (
              <span>
                Kalibrasi skala:{" "}
                <strong className="text-slate-800">
                  {habit.downscaleCount}/2x
                </strong>
              </span>
            )}
          </div>

          {habit.purpose && (
            <p>
              Tujuan: <span className="text-slate-800">{habit.purpose}</span>
            </p>
          )}

          {habit.isRerouting && (
            <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1">
              <p>
                Rutinitas digeser:{" "}
                <span className="font-medium text-slate-800">
                  {habit.replacedRoutine || "-"}
                </span>
              </p>
              <p>
                Friction Patch:{" "}
                <span className="font-medium text-slate-800">
                  {habit.frictionPatch || "-"}
                </span>
              </p>
            </div>
          )}

          {/* Baris Aksi Sekunder: Catat Kemarin & Kalibrasi Manual */}
          <div className="flex items-center justify-between pt-1">
            {!isShadowing ? (
              <button
                type="button"
                onClick={() => onToggleComplete(habit.id, yesterdayStr)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                  yesterdayLog
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {yesterdayLog ? "✓ Kemarin tercatat" : "+ Catat untuk kemarin"}
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={() => onOpenDiagnostic(habit)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Kalibrasi / Jeda</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
