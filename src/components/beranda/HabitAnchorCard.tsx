// src/components/beranda/HabitAnchorCard.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Habit } from "@/types/habit";
import { Anchor, Check, ArrowUpRight } from "lucide-react";

// Tipe gabungan antara entitas Habit aktif dengan status penyelesaian hari ini
export interface InstrumentationHabitItem extends Habit {
  isCompletedToday: boolean;
}

interface HabitAnchorCardProps {
  habits: InstrumentationHabitItem[];
  onToggleHabit: (habitId: string) => void;
}

export default function HabitAnchorCard({
  habits,
  onToggleHabit,
}: HabitAnchorCardProps) {
  // Urutkan kebiasaan yang belum selesai di atas agar prioritas eksekusi langsung terlihat
  const orderedHabits = useMemo(() => {
    return [...habits].sort(
      (a, b) => Number(a.isCompletedToday) - Number(b.isCompletedToday),
    );
  }, [habits]);

  const completedCount = useMemo(
    () => habits.filter((habit) => habit.isCompletedToday).length,
    [habits],
  );

  return (
    <section
      aria-label="Jangkar Kebiasaan Aktif"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
    >
      {/* Header Kartu: Judul, Rasio Penyelesaian, & Tautan ke Halaman Habits */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Jangkar Kebiasaan
            </h2>
            <p className="text-xs text-slate-500">
              {habits.length > 0
                ? `${completedCount} dari ${habits.length} selesai hari ini`
                : "Fase latihan aktif"}
            </p>
          </div>
        </div>

        <Link
          href="/habits"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <span>Kelola</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Daftar Kebiasaan Fase INSTRUMENTATION */}
      {orderedHabits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center space-y-1.5">
          <p className="text-xs font-medium text-slate-600">
            Tidak ada kebiasaan di fase latihan aktif.
          </p>
          <p className="text-[11px] text-slate-400">
            Kebiasaan uji lepas & otomatis disembunyikan agar layar tetap
            tenang.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {orderedHabits.map((habit) => (
            <li key={habit.id}>
              <button
                type="button"
                onClick={() => onToggleHabit(habit.id)}
                aria-pressed={habit.isCompletedToday}
                className={`w-full text-left flex items-start gap-3 rounded-xl border p-3 transition-all ${
                  habit.isCompletedToday
                    ? "border-emerald-200/80 bg-emerald-50/40"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80"
                }`}
              >
                {/* Kotak Centang Eksekusi */}
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    habit.isCompletedToday
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {habit.isCompletedToday && <Check className="w-3.5 h-3.5" />}
                </span>

                {/* Nama Kebiasaan & Pemicu Konteks (Anchor) */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium leading-snug ${
                        habit.isCompletedToday
                          ? "line-through text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {habit.name}
                    </span>

                    {habit.isRerouting && (
                      <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200/70">
                        Re-routing
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs truncate ${
                      habit.isCompletedToday
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Pemicu: {habit.anchor}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
