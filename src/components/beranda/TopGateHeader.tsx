// src/components/beranda/TopGateHeader.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { CalendarItem, CalendarItemType } from "@/types/productivity";
import {
  Inbox,
  Calendar,
  Plus,
  Check,
  ArrowUpRight,
  Clock,
} from "lucide-react";

interface TopGateHeaderProps {
  todayStr: string; // Format 'YYYY-MM-DD'
  inboxCount: number;
  calendarItems: CalendarItem[];
  onCaptureToInbox: (title: string, description?: string) => void;
}

// Mengubah string 'YYYY-MM-DD' menjadi format tanggal Indonesia yang mudah dipindai
function formatIndonesianDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(localDate);
}

// Label dan warna pembeda untuk klasifikasi jadwal GTD
function getCalendarTypeMeta(type: CalendarItemType): {
  label: string;
  badgeClass: string;
} {
  switch (type) {
    case "appointment":
      return {
        label: "Janji",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "day_action":
      return {
        label: "Aksi Hari Ini",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "day_info":
      return {
        label: "Info",
        badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      };
  }
}

export default function TopGateHeader({
  todayStr,
  inboxCount,
  calendarItems,
  onCaptureToInbox,
}: TopGateHeaderProps) {
  const [captureTitle, setCaptureTitle] = useState("");
  const [justCaptured, setJustCaptured] = useState(false);

  const handleQuickCapture = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = captureTitle.trim();
    if (!trimmed) return;

    onCaptureToInbox(trimmed);
    setCaptureTitle("");
    setJustCaptured(true);

    // Reset umpan balik visual setelah 1.5 detik
    setTimeout(() => {
      setJustCaptured(false);
    }, 1500);
  };

  return (
    <section
      aria-label="Gerbang Harian"
      className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm space-y-4"
    >
      {/* BARIS ATAS: Konteks Hari Ini & Input Quick Capture Inbox */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
        {/* Identitas Waktu & Indikator Antrean Inbox */}
        <div className="flex flex-wrap items-center justify-between lg:justify-start gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {formatIndonesianDate(todayStr)}
            </p>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
              Fokus Hari Ini, Anais
            </h1>
          </div>

          <Link
            href="/project"
            title="Buka antrean Inbox di halaman Project"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <Inbox className="w-3.5 h-3.5 text-blue-600" />
            <span>Inbox: {inboxCount}</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {/* Form Penangkap Pikiran Cepat (1-Line GTD Capture) */}
        <form
          onSubmit={handleQuickCapture}
          className="flex items-center gap-2 w-full lg:w-auto lg:min-w-[380px]"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={captureTitle}
              onChange={(e) => setCaptureTitle(e.target.value)}
              placeholder="Tangkap ide atau tugas ke Inbox..."
              aria-label="Tangkap ide atau tugas ke Inbox"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!captureTitle.trim() && !justCaptured}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors shrink-0 ${
              justCaptured
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            }`}
          >
            {justCaptured ? (
              <>
                <Check className="w-4 h-4" />
                <span>Masuk</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Tangkap</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* BARIS BAWAH: Pita Komitmen Kalender Hari Ini (Hard Landscape) */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Jadwal Hari Ini:</span>
        </div>

        {calendarItems.length === 0 ? (
          <span className="text-xs text-slate-400">
            Tidak ada komitmen terikat waktu hari ini.
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {calendarItems.map((item) => {
              const meta = getCalendarTypeMeta(item.calendarType);
              return (
                <div
                  key={item.id}
                  title={item.description || item.title}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs"
                >
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${meta.badgeClass}`}
                  >
                    {meta.label}
                  </span>

                  {item.time && (
                    <span className="inline-flex items-center gap-1 font-mono font-medium text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.time}
                    </span>
                  )}

                  <span className="font-medium text-slate-800">
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
