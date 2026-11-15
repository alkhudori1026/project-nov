// src/app/.../page.tsx

"use client";

import { useState } from "react";
import { Inbox, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";
import { useProjectStore } from "@/hooks/useProjectStore";
import TakeActionCard from "@/components/project/TakeActionCard";
import CalendarCard from "@/components/project/CalendarCard";
import ActiveProjectsCard from "@/components/project/ActiveProjectsCard";
import CaptureDrawer from "@/components/project/CaptureDrawer";
import InboxOrganizer from "@/components/project/InboxOrganizer";

export default function ProjectPage() {
  const [mode, setMode] = useState<"dashboard" | "clarify">("dashboard");
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  const {
    appData,
    sortedTasks,
    activeTaskCount,
    sortedCalendarItems,
    projectSummaries,
    captureToInbox,
    toggleTaskCompletion,
    sortInboxItem,
    trashInboxItem,
    restoreSnapshot,
  } = useProjectStore();

  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr] md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr] h-screen overflow-hidden">
      <Navigation />
      <TopBar />

      <div className="bg-slate-100 flex-1 overflow-y-auto relative no-scrollbar">
        {mode === "dashboard" ? (
          /* LAYAR 1: BENTO BOX 60/40 (DASHBOARD) */
          <div className="p-4 md:p-8">
            <div className="max-w-300 mx-auto mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => setMode("clarify")}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
              >
                <Inbox className="size-5" />
                Mulai Sortir Inbox ({appData.inboxQueue.length})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 md:gap-6 max-w-300 mx-auto min-h-[82vh]">
              {/* ZONA 60% KIRI: TAKE ACTION */}
              <TakeActionCard
                tasks={sortedTasks}
                activeTaskCount={activeTaskCount}
                projects={appData.projects}
                waitingForItems={appData.waitingForItems}
                onToggleTask={toggleTaskCompletion}
              />

              {/* ZONA 40% KANAN ATAS: CALENDAR */}
              <CalendarCard calendarItems={sortedCalendarItems} />

              {/* ZONA 40% KANAN BAWAH: ACTIVE PROJECTS */}
              <ActiveProjectsCard projectSummaries={projectSummaries} />
            </div>
          </div>
        ) : (
          /* LAYAR 2: MODE FOKUS CLARIFY / ORGANIZE */
          <InboxOrganizer
            appData={appData}
            onSortItem={sortInboxItem}
            onTrashItem={trashInboxItem}
            onRestoreSnapshot={restoreSnapshot}
            onClose={() => setMode("dashboard")}
          />
        )}
      </div>

      {/* TOMBOL FAB CAPTURE */}
      {mode === "dashboard" && (
        <button
          type="button"
          onClick={() => setIsCaptureOpen(true)}
          title="Tangkap Ide Cepat"
          className="fixed bottom-8 right-8 md:bottom-12 md:right-12 size-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
        >
          <Plus className="size-8 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* LACI SLIDE-OUT CAPTURE */}
      <CaptureDrawer
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        onSave={captureToInbox}
      />
    </div>
  );
}
