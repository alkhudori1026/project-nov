// src/components/beranda/JournalPulseCard.tsx
"use client";

import Link from "next/link";
import { DailyJournalSummary } from "@/types/jurnal";
import { BookOpen, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface JournalPulseCardProps {
  summary: DailyJournalSummary;
}

export default function JournalPulseCard({ summary }: JournalPulseCardProps) {
  const { totalSessions, totalCompletedTasks, sessions, evaluation } = summary;
  const latestSession =
    sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const hasEvaluation = evaluation !== null;

  return (
    <section
      aria-label="Denyut Jurnal Hari Ini"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
    >
      {/* Header Kartu: Judul & Status Evaluasi Malam */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Denyut Jurnal</h2>
            <p className="text-xs text-slate-500">Rekam ritme hari ini</p>
          </div>
        </div>

        {hasEvaluation ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            <span>Evaluasi Selesai</span>
          </span>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
            Belum Evaluasi
          </span>
        )}
      </div>

      {/* Ringkasan Angka Sesi & Blok Aktivitas */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
          <p className="text-[11px] font-medium text-slate-500">Sesi Fokus</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {totalSessions}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
          <p className="text-[11px] font-medium text-slate-500">
            Aktivitas Tercatat
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {totalCompletedTasks}
          </p>
        </div>
      </div>

      {/* Cuplikan Sesi Terakhir Hari Ini */}
      {latestSession ? (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Sesi Terakhir</span>
            <span className="inline-flex items-center gap-1 font-mono text-slate-600">
              <Clock className="w-3 h-3 text-slate-400" />
              {latestSession.startingTime} – {latestSession.finishingTime}
            </span>
          </div>

          {latestSession.uniqueTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {latestSession.uniqueTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          Belum ada sesi fokus yang dicatat hari ini.
        </p>
      )}

      {/* Tautan Pintas ke Halaman Jurnal */}
      <Link
        href="/jurnal"
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-colors"
      >
        <span>Catat Sesi atau Evaluasi</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </section>
  );
}
