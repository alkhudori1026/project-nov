"use client";

import { useState } from "react";
import {
  CheckCircle2,
  PauseCircle,
  Play,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Habit } from "@/types/habit";
import { getDaysDifference } from "@/utils/habitEngine";

interface ArchiveTabProps {
  habits: Habit[];
  todayStr: string;
  onResumeHabit: (habitId: string) => void;
  onOpenDiagnostic: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export default function ArchiveTab({
  habits,
  todayStr,
  onResumeHabit,
  onOpenDiagnostic,
  onDeleteHabit,
}: ArchiveTabProps) {
  // Menyimpan ID habit otomatis yang sudah dikonfirmasi aman pada sesi audit ini
  const [auditedIds, setAuditedIds] = useState<string[]>([]);

  const automatedHabits = habits.filter((h) => h.phase === "AUTOMATED");
  const pausedHabits = habits.filter((h) => h.phase === "PAUSED");

  if (automatedHabits.length === 0 && pausedHabits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
        Arsip masih kosong. Kebiasaan yang lulus Uji Lepas atau sedang dijeda
        sementara akan tampil di sini.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Zona 1: Kebiasaan Dijeda (TTL Countdown) */}
      {pausedHabits.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Mode Jeda Terukur (TTL)
          </h2>
          <div className="space-y-3">
            {pausedHabits.map((habit) => {
              const remainingDays = habit.pausedUntil
                ? getDaysDifference(todayStr, habit.pausedUntil)
                : 0;
              const isExpired = remainingDays <= 0;

              return (
                <div
                  key={habit.id}
                  className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isExpired
                      ? "border-amber-300 bg-amber-50/70"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <PauseCircle
                        className={`h-4 w-4 ${
                          isExpired ? "text-amber-600" : "text-slate-400"
                        }`}
                      />
                      <p className="font-semibold text-slate-800">
                        {habit.name}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {isExpired
                        ? "Masa jeda selesai. Waktunya menentukan kelanjutan rutinitas ini."
                        : `Tertidur — tersisa ${remainingDays} hari sebelum evaluasi ulang.`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onResumeHabit(habit.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Aktifkan Lagi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHabit(habit.id)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      title="Hapus permanen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Zona 2: Kebiasaan Otomatis (Audit Bulanan) */}
      {automatedHabits.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sudah Otomatis (Audit Berkala)
            </h2>
            <span className="text-xs text-slate-400">
              Perancah dilepas • Cek kondisi sebulan sekali
            </span>
          </div>

          <div className="space-y-3">
            {automatedHabits.map((habit) => {
              const isAudited = auditedIds.includes(habit.id);

              return (
                <div
                  key={habit.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <p className="font-semibold text-slate-800">
                        {habit.name}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pemicu: {habit.anchor}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAudited ? (
                      <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                        ✓ Terkonfirmasi aman
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setAuditedIds((prev) => [...prev, habit.id])
                          }
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 cursor-pointer"
                        >
                          Masih Aman
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenDiagnostic(habit)}
                          className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 cursor-pointer"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Mulai Macet</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
