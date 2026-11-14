"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";
import InboxOrganizer from "@/components/InboxOrganizer";
import { AppData } from "@/types/productivity";
import {
  Inbox,
  Plus,
  X,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  FolderGit2,
  Clock,
  Tag,
  Zap,
  FileText,
  Hourglass,
} from "lucide-react";

const STORAGE_KEY = "anais_gtd_para_vault_v1";

const INITIAL_APP_DATA: AppData = {
  inboxQueue: [
    {
      id: "inb-1",
      title: "Perbaiki atap bocor",
      description: "Bocor di atas kasur saat hujan deras.",
    },
    {
      id: "inb-2",
      title: "Artikel arsitektur Micro-frontend",
      description: "Referensi pola pemisahan state untuk proyek web.",
    },
  ],
  projects: [
    { id: "p1", name: "Portofolio V2" },
    { id: "p2", name: "Riset Beasiswa 2027" },
  ],
  paraFolders: [
    { id: "a1", name: "Pengembangan Karir & Coding", category: "area" },
    { id: "a2", name: "Kesehatan & Calisthenics", category: "area" },
    { id: "r1", name: "Arsitektur Software & React", category: "reference" },
    { id: "r2", name: "Desain UI/UX & Material 3", category: "reference" },
  ],
  tasks: [
    {
      id: "t1",
      title: "Tulis draf navigasi sidebar",
      description: "Gunakan pola responsive drawer untuk mobile.",
      type: "next_action",
      projectId: "p1",
      priority: "High",
      energy: "High (Fokus Penuh)",
      duration: "0 j 30 m",
      context: "@Computer",
      isCompleted: false,
    },
    {
      id: "t2",
      title: "Beli galon air mineral",
      description: "",
      type: "quick_task",
      projectId: null,
      isCompleted: false,
    },
  ],
  calendarItems: [
    {
      id: "cal-1",
      title: "Kirim laporan mingguan",
      description: "",
      calendarType: "day_action",
      date: "2026-11-20",
      time: "17:00",
    },
  ],
  waitingForItems: [
    {
      id: "wait-1",
      title: "Revisi aset ilustrasi dari desainer",
      description: "",
      waitingFor: "Raka (Desainer)",
      followUpDate: "2026-11-18",
    },
  ],
  notes: [
    {
      id: "n1",
      title: "Palet warna pastel Material 3",
      description: "Gunakan tonal surface slate untuk latar belakang.",
      paraCategory: "project",
      targetId: "p1",
    },
  ],
};

export default function HomePage() {
  const [mode, setMode] = useState<"dashboard" | "clarify">("dashboard");

  // 1. STATE BRANKAS UTAMA (Single Source of Truth)
  const [appData, setAppData] = useState<AppData>(INITIAL_APP_DATA);
  const [isHydrated, setIsHydrated] = useState(false);

  // 2. STATE LACI CAPTURE (TAHAP 1)
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [captureTitle, setCaptureTitle] = useState("");
  const [captureDesc, setCaptureDesc] = useState("");

  // FASE BACA: Ambil data dari localStorage saat browser siap
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed: AppData = JSON.parse(savedData);
        setAppData(parsed);
      }
    } catch (error) {
      console.error("Gagal membaca brankas localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // FASE TULIS: Simpan otomatis setiap kali appData berubah
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (error) {
      console.error("Gagal menyimpan ke localStorage:", error);
    }
  }, [appData, isHydrated]);

  // Simpan ide baru dari Laci Capture ke Inbox
  const handleSaveCapture = () => {
    if (captureTitle.trim() === "") return;

    const newInboxItem = {
      id: `inb-${Date.now()}`,
      title: captureTitle.trim(),
      description: captureDesc.trim(),
      createdAt: new Date().toISOString(),
    };

    setAppData((prev) => ({
      ...prev,
      inboxQueue: [newInboxItem, ...prev.inboxQueue],
    }));

    setCaptureTitle("");
    setCaptureDesc("");
    setIsCaptureOpen(false);
  };

  // Centang / Batalkan Centang Tugas di Dashboard
  const toggleTaskCompletion = (taskId: string) => {
    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task,
      ),
    }));
  };

  // Helper format tanggal singkat (Contoh: "20 Nov")
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  // Helper label & warna tipe kalender GTD
  const getCalendarBadge = (
    type: "appointment" | "day_action" | "day_info",
  ) => {
    if (type === "appointment") {
      return { label: "Janji Temu", style: "bg-rose-100 text-rose-700" };
    }
    if (type === "day_action") {
      return { label: "Tenggat", style: "bg-amber-100 text-amber-700" };
    }
    return { label: "Info Hari", style: "bg-sky-100 text-sky-700" };
  };

  // Urutkan tugas: yang belum selesai di atas, yang selesai di bawah
  const sortedTasks = [...appData.tasks].sort(
    (a, b) => Number(Boolean(a.isCompleted)) - Number(Boolean(b.isCompleted)),
  );
  const activeTaskCount = appData.tasks.filter((t) => !t.isCompleted).length;

  // Urutkan kalender berdasarkan tanggal terdekat
  const sortedCalendarItems = [...appData.calendarItems].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr] md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr] h-screen overflow-hidden">
      <Navigation />
      <TopBar />

      <div className="bg-slate-100 flex-1 overflow-y-auto relative">
        {mode === "dashboard" ? (
          /* LAYAR 1: BENTO BOX 60/40 (DASHBOARD) */
          <div className="p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto mb-6 flex justify-end">
              <button
                onClick={() => setMode("clarify")}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
              >
                <Inbox className="size-5" />
                Mulai Sortir Inbox ({appData.inboxQueue.length})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 md:gap-6 max-w-[1600px] mx-auto min-h-[82vh]">
              {/* ========================================= */}
              {/* ZONA 60% KIRI: TAKE ACTION */}
              {/* ========================================= */}
              <div className="bg-white border border-slate-200 md:row-span-2 w-full p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-2xl text-slate-800 tracking-tight">
                    Take Action
                  </h2>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {activeTaskCount} Tersisa
                  </span>
                </div>

                {/* Daftar Tugas */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                  {sortedTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                      <CheckCircle2 className="size-10 text-slate-200 mb-2" />
                      <p className="text-sm font-medium">
                        Belum ada Next Action aktif.
                      </p>
                      <p className="text-xs">
                        Tangkap ide lewat tombol + atau sortir Inbox.
                      </p>
                    </div>
                  ) : (
                    sortedTasks.map((task) => {
                      const linkedProject = appData.projects.find(
                        (p) => p.id === task.projectId,
                      );

                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleTaskCompletion(task.id)}
                          className={`group flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                            task.isCompleted
                              ? "bg-slate-50/70 border-slate-100 opacity-60"
                              : "bg-slate-50 hover:bg-white border-transparent hover:border-slate-200 hover:shadow-sm"
                          }`}
                        >
                          {/* Tombol Centang */}
                          <button
                            type="button"
                            className="mt-0.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0"
                          >
                            {task.isCompleted ? (
                              <CheckCircle2 className="size-5 text-emerald-500" />
                            ) : (
                              <Circle className="size-5" />
                            )}
                          </button>

                          {/* Konten & Lencana Metadata */}
                          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <p
                              className={`text-base font-medium leading-snug ${
                                task.isCompleted
                                  ? "line-through text-slate-400"
                                  : "text-slate-800"
                              }`}
                            >
                              {task.title}
                            </p>

                            {task.description && (
                              <p className="text-xs text-slate-500 line-clamp-1">
                                {task.description}
                              </p>
                            )}

                            {/* Baris Lencana GTD */}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {task.type === "quick_task" && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/70 px-2.5 py-0.5 rounded-full">
                                  <Zap className="size-3" /> &lt; 2m
                                </span>
                              )}

                              {linkedProject && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-2.5 py-0.5 rounded-full">
                                  <FolderGit2 className="size-3" />{" "}
                                  {linkedProject.name}
                                </span>
                              )}

                              {task.context && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                                  <Tag className="size-3 text-slate-400" />{" "}
                                  {task.context}
                                </span>
                              )}

                              {task.duration && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                                  <Clock className="size-3 text-slate-400" />{" "}
                                  {task.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Strip Ringkas Waiting For (Jika ada delegasi aktif) */}
                {appData.waitingForItems.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <Hourglass className="size-3.5" /> Waiting For (
                      {appData.waitingForItems.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {appData.waitingForItems.map((wait) => (
                        <div
                          key={wait.id}
                          className="text-xs bg-amber-50/70 border border-amber-200/70 text-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2"
                        >
                          <span className="font-medium truncate max-w-[200px]">
                            {wait.title}
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                            @{wait.waitingFor}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================= */}
              {/* ZONA 40% KANAN ATAS: CALENDAR */}
              {/* ========================================= */}
              <div className="bg-white border border-slate-200 w-full p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-xl text-slate-800 tracking-tight">
                    Calendar
                  </h2>
                  <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">
                    {sortedCalendarItems.length} Jadwal
                  </span>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                  {sortedCalendarItems.length === 0 ? (
                    <p className="text-sm text-slate-400 italic py-6 text-center">
                      Tidak ada komitmen waktu terjadwal.
                    </p>
                  ) : (
                    sortedCalendarItems.map((cal) => {
                      const badge = getCalendarBadge(cal.calendarType);
                      return (
                        <div
                          key={cal.id}
                          className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shrink-0 min-w-[54px]">
                              <span className="text-xs font-bold text-slate-800">
                                {formatShortDate(cal.date)}
                              </span>
                              {cal.time && (
                                <span className="text-[10px] font-semibold text-rose-600">
                                  {cal.time}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {cal.title}
                              </p>
                              <span
                                className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badge.style}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                          </div>

                          <CalendarIcon className="size-4 text-slate-300 shrink-0" />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ========================================= */}
              {/* ZONA 40% KANAN BAWAH: ACTIVE PROJECTS */}
              {/* ========================================= */}
              <div className="bg-white border border-slate-200 w-full p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-xl text-slate-800 tracking-tight">
                    Active Projects
                  </h2>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                    {appData.projects.length} Aktif
                  </span>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                  {appData.projects.length === 0 ? (
                    <p className="text-sm text-slate-400 italic py-6 text-center">
                      Belum ada proyek aktif.
                    </p>
                  ) : (
                    appData.projects.map((proj) => {
                      const projectTasks = appData.tasks.filter(
                        (t) => t.projectId === proj.id,
                      );
                      const completedCount = projectTasks.filter(
                        (t) => t.isCompleted,
                      ).length;
                      const totalCount = projectTasks.length;
                      const progressPercent =
                        totalCount > 0
                          ? Math.round((completedCount / totalCount) * 100)
                          : 0;

                      const noteCount = appData.notes.filter(
                        (n) =>
                          n.paraCategory === "project" &&
                          n.targetId === proj.id,
                      ).length;

                      return (
                        <div
                          key={proj.id}
                          className="flex flex-col gap-2.5 bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-transparent hover:border-slate-200 transition-colors"
                        >
                          <div className="flex justify-between items-center gap-2">
                            <h3 className="font-semibold text-slate-800 text-sm truncate">
                              {proj.name}
                            </h3>
                            <span className="text-xs font-bold text-blue-600 shrink-0">
                              {progressPercent}%
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="size-3.5 text-emerald-500" />
                              {completedCount}/{totalCount} Aksi
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="size-3.5 text-indigo-500" />
                              {noteCount} Catatan PARA
                            </span>
                          </div>

                          {/* Progress Bar Dinamis */}
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              style={{ width: `${progressPercent}%` }}
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* LAYAR 2: MODE FOKUS CLARIFY / ORGANIZE */
          <InboxOrganizer
            appData={appData}
            onUpdateAppData={setAppData}
            onClose={() => setMode("dashboard")}
          />
        )}
      </div>

      {/* TOMBOL FAB CAPTURE */}
      {mode === "dashboard" && (
        <button
          onClick={() => setIsCaptureOpen(true)}
          title="Tangkap Ide Cepat"
          className="fixed bottom-8 right-8 md:bottom-12 md:right-12 size-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
        >
          <Plus className="size-8 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* OVERLAY LACI CAPTURE */}
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isCaptureOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsCaptureOpen(false)}
      />

      {/* LACI SLIDE-OUT CAPTURE */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[420px] bg-slate-50 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isCaptureOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-slate-200">
          <h2 className="font-semibold text-xl text-slate-800">
            Tumpahkan Ide
          </h2>
          <button
            onClick={() => setIsCaptureOpen(false)}
            className="size-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Judul / Inti Pikiran
            </label>
            <input
              type="text"
              value={captureTitle}
              onChange={(e) => setCaptureTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && captureTitle.trim() !== "") {
                  handleSaveCapture();
                }
              }}
              placeholder="Misal: Beli buku Atomic Habits..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              value={captureDesc}
              onChange={(e) => setCaptureDesc(e.target.value)}
              placeholder="Detail, konteks, atau tautan..."
              className="w-full flex-1 bg-white border border-slate-200 rounded-2xl p-4 text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed custom-scrollbar"
            />
          </div>
        </div>

        <div className="px-6 py-5 bg-white border-t border-slate-200 flex justify-end gap-3">
          <button
            disabled={captureTitle.trim() === ""}
            onClick={handleSaveCapture}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors"
          >
            Simpan ke Inbox
          </button>
        </div>
      </div>
    </div>
  );
}
