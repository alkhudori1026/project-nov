// src/app/page.tsx
"use client";

import { useMemo } from "react";
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";
import TopGateHeader from "@/components/beranda/TopGateHeader";
import HabitAnchorCard from "@/components/beranda/HabitAnchorCard";
import JournalPulseCard from "@/components/beranda/JournalPulseCard";
import NextActionsCard from "@/components/beranda/NextActionsCard";
import { useHabitStore, getLocalDateString } from "@/hooks/useHabitStore";
import { useProjectStore } from "@/hooks/useProjectStore";
import { useJurnalStore } from "@/hooks/useJurnalStore";

// Batas maksimal tugas aktif di Beranda agar layar tetap ringan dan bebas scroll berlebih
const MAX_VISIBLE_TASKS = 6;

export default function HomePage() {
  // 1. Inisialisasi ketiga store domain utama
  const {
    data: habitData,
    isMounted: isHabitMounted,
    toggleHabitCompletion,
  } = useHabitStore();

  const {
    appData: projectData,
    isHydrated: isProjectHydrated,
    activeTasks,
    activeTaskCount,
    sortedCalendarItems,
    captureToInbox,
    toggleTaskCompletion,
  } = useProjectStore();

  const { isMounted: isJurnalMounted, todaySummary } = useJurnalStore();

  // Penanda tunggal bahwa seluruh brankas localStorage sudah siap dibaca
  const isReady = isHabitMounted && isProjectHydrated && isJurnalMounted;
  const todayStr = getLocalDateString();

  // 2. Data turunan Habits: hanya fase INSTRUMENTATION beserta status centang hari ini
  const activeInstrumentationHabits = useMemo(() => {
    const completedTodayIds = new Set(
      habitData.habitLogs
        .filter((log) => log.date === todayStr && log.completed)
        .map((log) => log.habitId),
    );

    return habitData.habits
      .filter((habit) => habit.phase === "INSTRUMENTATION")
      .map((habit) => ({
        ...habit,
        isCompletedToday: completedTodayIds.has(habit.id),
      }));
  }, [habitData.habits, habitData.habitLogs, todayStr]);

  // 3. Data turunan Calendar GTD: komitmen waktu khusus hari ini (Hard Landscape)
  const todayCalendarItems = useMemo(
    () => sortedCalendarItems.filter((item) => item.date === todayStr),
    [sortedCalendarItems, todayStr],
  );

  // 4. Data turunan Project: gabungkan nama proyek ke daftar Next Actions teratas
  const topActiveTasks = useMemo(() => {
    const projectNameMap = new Map(
      projectData.projects.map((project) => [project.id, project.name]),
    );

    return activeTasks.slice(0, MAX_VISIBLE_TASKS).map((task) => ({
      ...task,
      projectName: task.projectId
        ? (projectNameMap.get(task.projectId) ?? null)
        : null,
    }));
  }, [activeTasks, projectData.projects]);

  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr] md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr] h-screen">
      <Navigation />
      <TopBar />

      {/* Kanvas utama Beranda dengan scroll internal agar TopBar & Navigation tetap terkunci */}
      <main className="bg-slate-100 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-5">
          {!isReady ? (
            // Kerangka muat ringan saat membaca localStorage
            <div className="space-y-5 animate-pulse">
              <div className="h-24 rounded-2xl bg-slate-200/80" />
              <div className="grid grid-cols-1 lg:grid-cols-[38fr_62fr] gap-5">
                <div className="space-y-5">
                  <div className="h-56 rounded-2xl bg-slate-200/80" />
                  <div className="h-44 rounded-2xl bg-slate-200/80" />
                </div>
                <div className="h-96 rounded-2xl bg-slate-200/80" />
              </div>
            </div>
          ) : (
            <>
              {/* LAPISAN 1: TOP GATE (Quick Capture Inbox + Komitmen Kalender Hari Ini) */}
              <TopGateHeader
                todayStr={todayStr}
                inboxCount={projectData.inboxQueue.length}
                calendarItems={todayCalendarItems}
                onCaptureToInbox={captureToInbox}
              />

              {/* LAPISAN 2: ASYMMETRIC F-PATTERN COCKPIT (38% Jangkar / 62% Eksekusi) */}
              <div className="grid grid-cols-1 lg:grid-cols-[38fr_62fr] gap-5 items-start">
                {/* KOLOM KIRI (38%): Jangkar Kebiasaan & Denyut Jurnal */}
                <div className="space-y-5">
                  <HabitAnchorCard
                    habits={activeInstrumentationHabits}
                    onToggleHabit={toggleHabitCompletion}
                  />

                  <JournalPulseCard summary={todaySummary} />
                </div>

                {/* KOLOM KANAN (62%): Arena Eksekusi Next Actions */}
                <NextActionsCard
                  tasks={topActiveTasks}
                  totalActiveCount={activeTaskCount}
                  onToggleTask={toggleTaskCompletion}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
