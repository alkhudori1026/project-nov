"use client";

import { useState } from "react";
import { Plus, Hammer, Unlink, Archive } from "lucide-react";
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";
import { Habit } from "@/types/habit";
import { useHabitStore, getLocalDateString } from "@/hooks/useHabitStore";
import HabitCard from "@/components/habits/HabitCard";
import AddHabitDialog from "@/components/habits/AddHabitDialog";
import DiagnosticDialog from "@/components/habits/DiagnosticDialog";
import DeconstructTab from "@/components/habits/DeconstructTab";
import ArchiveTab from "@/components/habits/ArchiveTab";

type ActiveTab = "build" | "deconstruct" | "archive";

export default function HabitsPage() {
  const {
    data,
    isMounted,
    addHabit,
    addBadHabit,
    toggleHabitCompletion,
    setLogFrictionScore,
    updateHabitPurpose,
    startSilentShadowing,
    resolveLatencyGatekeeper,
    completeSilentShadowing,
    updateReroutingPatch,
    rebindHabitAnchor,
    downscaleHabit,
    pauseHabitWithTTL,
    resumePausedHabit,
    deleteHabit,
    addBadHabitTrigger,
    addEnvironmentPatch,
    toggleEnvironmentPatch,
    recordSlipLog,
  } = useHabitStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("build");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [diagnosticHabit, setDiagnosticHabit] = useState<Habit | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 24);
  };

  // --- MULAI SIMULATOR WAKTU SEMENTARA (Hapus jika pengujian selesai) ---
  const [dayOffset, setDayOffset] = useState(0);
  const simulatedDate = new Date();
  simulatedDate.setDate(simulatedDate.getDate() + dayOffset);
  const todayStr = getLocalDateString(simulatedDate);
  // --- AKHIR SIMULATOR WAKTU ---
  const activeHabits = data.habits.filter((h) => h.phase === "INSTRUMENTATION");
  const shadowingHabits = data.habits.filter(
    (h) => h.phase === "SILENT_SHADOWING",
  );
  const archivedHabits = data.habits.filter(
    (h) => h.phase === "AUTOMATED" || h.phase === "PAUSED",
  );

  // Jembatan dari Tab Mengurai -> membuat jalur Re-routing di Tab Membangun
  const handlePromoteTriggerToReroute = (
    anchorTrigger: string,
    badHabitName: string,
  ) => {
    addHabit({
      name: `Pengganti: ${badHabitName}`,
      anchor: anchorTrigger,
      isRerouting: true,
      replacedRoutine: badHabitName,
      frictionPatch: "Pasang hambatan fisik pada pemicu ini",
    });
    setActiveTab("build");
  };

  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr] md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr] h-screen">
      <Navigation />
      <TopBar />

      <div
        className="bg-slate-100 flex-1 overflow-y-auto no-scrollbar py-6 px-8 md:px-12"
        onScroll={handleScroll}
      >
        <div className="max-w-300 mx-auto bg-white rounded-3xl border border-slate-200 relative">
          {/* Bilah Navigasi 3 Tab & Tombol Tambah */}
          <div
            className={`flex flex-col gap-3 sticky -top-6 z-10 bg-white/80 border-b backdrop-blur-sm px-6 md:px-12 p-3 mx-auto max-w-300 transition-all duration-300 ${
              isScrolled
                ? "rounded-none border-slate-200 border-y shadow-sm"
                : "rounded-t-3xl shadow-none border-transparent"
            }`}
          >
            <div className=" flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-blue-700 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Kebiasaan Baru</span>
              </button>
            </div>
            {/* Bilah Simulasi Waktu (Dev Only) */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 px-4 py-2.5 text-xs">
              <span className="font-medium text-blue-900">
                Simulasi Tanggal: <strong>{todayStr}</strong> (
                {dayOffset >= 0 ? `+${dayOffset}` : dayOffset} hari)
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDayOffset(0)}
                  className="rounded-lg border border-blue-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setDayOffset((d) => d + 1)}
                  className="rounded-lg bg-blue-600 px-2.5 py-1 font-medium text-white hover:bg-blue-700 cursor-pointer"
                >
                  +1 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setDayOffset((d) => d + 3)}
                  className="rounded-lg bg-amber-600 px-2.5 py-1 font-medium text-white hover:bg-amber-700 cursor-pointer"
                >
                  +3 Hari (Tes Macet)
                </button>
                <button
                  type="button"
                  onClick={() => setDayOffset((d) => d + 7)}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 font-medium text-white hover:bg-emerald-700 cursor-pointer"
                >
                  +7 Hari (Tes Lulus)
                </button>
              </div>
            </div>
          </div>

          {/* Area Konten Utama */}
          <main className="mx-auto max-w-300 px-6 md:px-12 py-6">
            {!isMounted ? (
              <p className="text-sm text-slate-400">Memuat data kebiasaan...</p>
            ) : (
              <>
                {activeTab === "build" && (
                  <div className="space-y-8">
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
                          {activeHabits.map((habit) => (
                            <HabitCard
                              key={habit.id}
                              habit={habit}
                              allLogs={data.habitLogs}
                              todayStr={todayStr}
                              onToggleComplete={toggleHabitCompletion}
                              onSetFrictionScore={setLogFrictionScore}
                              onUpdatePurpose={updateHabitPurpose}
                              onStartShadowing={startSilentShadowing}
                              onResolveLatency={resolveLatencyGatekeeper}
                              onCompleteShadowing={completeSilentShadowing}
                              onOpenDiagnostic={(target) =>
                                setDiagnosticHabit(target)
                              }
                            />
                          ))}
                        </div>
                      )}
                    </section>

                    {shadowingHabits.length > 0 && (
                      <section className="space-y-3 opacity-75">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Uji Lepas 7 Hari (Tanpa Pengingat)
                        </h2>
                        <div className="space-y-3">
                          {shadowingHabits.map((habit) => (
                            <HabitCard
                              key={habit.id}
                              habit={habit}
                              allLogs={data.habitLogs}
                              todayStr={todayStr}
                              onToggleComplete={toggleHabitCompletion}
                              onSetFrictionScore={setLogFrictionScore}
                              onUpdatePurpose={updateHabitPurpose}
                              onStartShadowing={startSilentShadowing}
                              onResolveLatency={resolveLatencyGatekeeper}
                              onCompleteShadowing={completeSilentShadowing}
                              onOpenDiagnostic={(target) =>
                                setDiagnosticHabit(target)
                              }
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {activeTab === "deconstruct" && (
                  <DeconstructTab
                    badHabits={data.badHabits}
                    patches={data.environmentPatches}
                    slipLogs={data.slipLogs}
                    onAddTrigger={addBadHabitTrigger}
                    onAddPatch={addEnvironmentPatch}
                    onTogglePatch={toggleEnvironmentPatch}
                    onRecordSlip={recordSlipLog}
                    onPromoteToReroute={handlePromoteTriggerToReroute}
                  />
                )}

                {activeTab === "archive" && (
                  <ArchiveTab
                    habits={archivedHabits}
                    todayStr={todayStr}
                    onResumeHabit={resumePausedHabit}
                    onOpenDiagnostic={(target) => setDiagnosticHabit(target)}
                    onDeleteHabit={deleteHabit}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modal Tambah & Dialog Diagnostik */}
      <AddHabitDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultMode={activeTab === "deconstruct" ? "deconstruct" : "build"}
        onAddHabit={addHabit}
        onAddBadHabit={addBadHabit}
      />

      <DiagnosticDialog
        habit={diagnosticHabit}
        onClose={() => setDiagnosticHabit(null)}
        onUpdatePatch={updateReroutingPatch}
        onRebindAnchor={rebindHabitAnchor}
        onDownscale={downscaleHabit}
        onPauseWithTTL={pauseHabitWithTTL}
        onDelete={deleteHabit}
      />
    </div>
  );
}
