// src/components/beranda/NextActionsCard.tsx
"use client";

import Link from "next/link";
import { TaskItem } from "@/types/productivity";
import {
  Check,
  ListTodo,
  FolderKanban,
  Zap,
  Clock,
  MapPin,
  BatteryCharging,
  Flag,
  ArrowUpRight,
} from "lucide-react";

// Entitas TaskItem yang sudah diperkaya dengan hasil lookup nama proyek
export interface EnrichedTaskItem extends TaskItem {
  projectName: string | null;
}

interface NextActionsCardProps {
  tasks: EnrichedTaskItem[];
  totalActiveCount: number;
  onToggleTask: (taskId: string) => void;
}

export default function NextActionsCard({
  tasks,
  totalActiveCount,
  onToggleTask,
}: NextActionsCardProps) {
  const remainingCount = Math.max(0, totalActiveCount - tasks.length);

  return (
    <section
      aria-label="Daftar Next Actions Aktif"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
    >
      {/* Header Kartu: Judul, Penghitung Tugas Aktif, & Tautan ke Halaman Project */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Arena Eksekusi (Next Actions)
            </h2>
            <p className="text-xs text-slate-500">
              {totalActiveCount > 0
                ? `Menampilkan ${tasks.length} dari ${totalActiveCount} tindakan aktif`
                : "Seluruh antrean tindakan bersih"}
            </p>
          </div>
        </div>

        <Link
          href="/project"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <span>Semua Tugas</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Daftar Tugas Aktif Teratas */}
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            Tidak ada Next Action aktif saat ini.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sortir item baru dari antrean Inbox atau tambahkan langkah
            berikutnya di halaman Project untuk mulai mengeksekusi.
          </p>
          <div className="pt-2">
            <Link
              href="/project"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <span>Buka Halaman Project</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-start gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-300 hover:bg-slate-50/60 transition-all"
            >
              {/* Tombol Centang Penyelesaian Tugas */}
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                aria-label={`Tandai selesai: ${task.title}`}
                title="Tandai tugas selesai"
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-transparent hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>

              {/* Konten Utama Tugas & Metadata Kontekstual */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {task.title}
                  </p>

                  {/* Lencana Jenis / Asal Proyek */}
                  {task.projectName ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-blue-200/80 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 shrink-0">
                      <FolderKanban className="w-3 h-3" />
                      <span className="max-w-[160px] truncate">
                        {task.projectName}
                      </span>
                    </span>
                  ) : task.type === "quick_task" ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 shrink-0">
                      <Zap className="w-3 h-3" />
                      <span>Quick Task</span>
                    </span>
                  ) : null}
                </div>

                {/* Deskripsi Singkat (Maksimal 1 Baris agar Kartu Tetap Ramping) */}
                {task.description && (
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {task.description}
                  </p>
                )}

                {/* Baris Metadata Eksekusi GTD (Prioritas, Konteks, Durasi, Energi) */}
                {(task.priority ||
                  task.context ||
                  task.duration ||
                  task.energy) && (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-500">
                    {task.priority && (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                        <Flag className="w-3 h-3 text-slate-400" />
                        {task.priority}
                      </span>
                    )}

                    {task.context && (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {task.context}
                      </span>
                    )}

                    {task.duration && (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {task.duration}
                      </span>
                    )}

                    {task.energy && (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                        <BatteryCharging className="w-3 h-3 text-slate-400" />
                        {task.energy}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Footer Pengarah jika Masih Ada Sisa Tugas Aktif di Luar Batas Beranda */}
      {remainingCount > 0 && (
        <div className="pt-1">
          <Link
            href="/project"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-colors"
          >
            <span>
              Lihat {remainingCount} tindakan aktif lainnya di Project
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
