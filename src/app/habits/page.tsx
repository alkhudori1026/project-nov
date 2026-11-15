"use client";

import { useState } from "react";
import { Plus, Hammer, Unlink, Archive } from "lucide-react";
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";
import { useHabitStore, getLocalDateString } from "@/hooks/useHabitStore";
import { analyzeHabitSignal } from "@/utils/habitEngine";

type ActiveTab = "build" | "deconstruct" | "archive";

export default function HabitsPage() {
  const { data, isMounted } = useHabitStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("build");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Memicu bayangan tipis pada header tab saat konten digulir melewati 10px
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  // Memilah data flattened ke dalam zona siklus hidup masing-masing
  const todayStr = getLocalDateString();
  const activeHabits = data.habits.filter((h) => h.phase === "INSTRUMENTATION");
  const shadowingHabits = data.habits.filter(
    (h) => h.phase === "SILENT_SHADOWING",
  );
  const archivedHabits = data.habits.filter(
    (h) => h.phase === "AUTOMATED" || h.phase === "PAUSED",
  );

  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr] md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr] h-screen">
      <Navigation />
      <TopBar />

      <div
        className="bg-slate-100 flex-1 overflow-y-auto no-scrollbar"
        onScroll={handleScroll}
      >
        {/* Bilah Navigasi 3 Tab & Tombol Tambah (Sticky saat digulir) */}
        <div
          className={`sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs px-6 md:px-12 py-3 transition-shadow ${
            isScrolled ? "border-b border-slate-200 shadow-xs" : ""
          }`}
        >
          <div className="mx-auto max-w-4xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Switcher 3 Tab */}
            <nav className="flex gap-1.5 rounded-xl bg-slate-200/70 p-1">
              <button
                onClick={() => setActiveTab("build")}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition cursor-pointer ${
                  activeTab === "build"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Hammer className="h-4 w-4" />
                <span>
                  Membangun ({activeHabits.length + shadowingHabits.length})
                </span>
              </button>

              <button
                onClick={() => setActiveTab("deconstruct")}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition cursor-pointer ${
                  activeTab === "deconstruct"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Unlink className="h-4 w-4" />
                <span>Mengurai ({data.badHabits.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("archive")}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition cursor-pointer ${
                  activeTab === "archive"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Archive className="h-4 w-4" />
                <span>Arsip ({archivedHabits.length})</span>
              </button>
            </nav>

            {/* Tombol Utama */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Kebiasaan Baru</span>
            </button>
          </div>
        </div>

        {/* Area Konten Utama */}
        <main className="mx-auto max-w-4xl px-6 md:px-12 py-6">
          {!isMounted ? (
            <p className="text-sm text-slate-400">Memuat data kebiasaan...</p>
          ) : (
            <>
              {activeTab === "build" && (
                <div className="space-y-8">
                  {/* Zona Atas: Fase 1 (Instrumentation) */}
                  <section className="space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Fokus Perancah Aktif
                    </h2>
                    {activeHabits.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
                        Belum ada kebiasaan aktif. Mulai dengan satu pemicu
                        kecil.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeHabits.map((habit) => {
                          const signal = analyzeHabitSignal(
                            habit,
                            data.habitLogs,
                            todayStr,
                          );
                          return (
                            <div
                              key={habit.id}
                              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                            >
                              <p className="font-semibold text-slate-800">
                                {habit.name}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Pemicu: {habit.anchor} • Sinyal: {signal}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {/* Zona Bawah: Fase 2 (Silent Shadowing - Visual Redup) */}
                  {shadowingHabits.length > 0 && (
                    <section className="space-y-3 opacity-75">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Uji Lepas 7 Hari (Tanpa Pengingat)
                      </h2>
                      <div className="space-y-3">
                        {shadowingHabits.map((habit) => (
                          <div
                            key={habit.id}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <p className="font-medium text-slate-700">
                              {habit.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Pemicu: {habit.anchor}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === "deconstruct" && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
                  Slot Tab Mengurai (Akan dirakit di Bagian 4.4)
                </div>
              )}

              {activeTab === "archive" && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
                  Slot Tab Arsip & Audit Bulanan (Akan dirakit di Bagian 4.4)
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
