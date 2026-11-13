"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  FolderGit2,
  BookOpen,
  Trash2,
  ArrowRight,
  Inbox,
  Clock,
  Battery,
  Tag,
  AlignLeft,
  X,
  AlertCircle,
  Plus,
  Layers,
  ChevronRight,
  Folder,
  FolderOpen,
  Undo2,
  Zap,
  Calendar as CalendarIcon,
  Hourglass,
  UserCheck,
} from "lucide-react";

import TagPicker from "./TagPicker";
import DurationPicker from "./DurationPicker";

// =========================================
// KONTRAK DATA FLAT (SIAP UNTUK DATABASE)
// =========================================
type DestinationType =
  | "quick_task"
  | "next_action"
  | "action_project"
  | "calendar"
  | "waiting_for"
  | "para_project"
  | "para_area"
  | "para_reference"
  | null;

interface InboxItem {
  id: string;
  title: string;
  description: string;
}

interface ProjectItem {
  id: string;
  name: string;
}

interface ParaFolderItem {
  id: string;
  name: string;
  category: "area" | "reference";
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: "quick_task" | "next_action";
  projectId: string | null;
  priority?: string;
  energy?: string;
  duration?: string;
  context?: string;
}

interface CalendarItem {
  id: string;
  title: string;
  description: string;
  calendarType: "appointment" | "day_action" | "day_info";
  date: string;
  time?: string;
}

interface WaitingForItem {
  id: string;
  title: string;
  description: string;
  waitingFor: string;
  followUpDate?: string;
}

interface NoteItem {
  id: string;
  title: string;
  description: string;
  paraCategory: "project" | "area" | "reference";
  targetId: string;
}

interface UndoSnapshot {
  inboxQueue: InboxItem[];
  tasks: TaskItem[];
  calendarItems: CalendarItem[];
  waitingForItems: WaitingForItem[];
  notes: NoteItem[];
  projects: ProjectItem[];
  paraFolders: ParaFolderItem[];
  selectedItemId: string | null;
  message: string;
}

export default function InboxOrganizer({ onClose }: { onClose: () => void }) {
  // 1. STATE ANTREAN INBOX (KOLOM 1)
  const [inboxQueue, setInboxQueue] = useState<InboxItem[]>([
    {
      id: "inb-1",
      title: "Meeting review desain bersama klien",
      description: "Bahas revisi navigasi dan palet warna via Google Meet.",
    },
    {
      id: "inb-2",
      title: "Menunggu konfirmasi berkas pendaftaran dari kampus",
      description: "Sudah kirim email follow-up kemarin pagi.",
    },
    {
      id: "inb-3",
      title: "Artikel arsitektur Micro-frontend",
      description: "Referensi pola pemisahan state untuk proyek web.",
    },
    {
      id: "inb-4",
      title: "Perbaiki atap bocor",
      description: "Bocor di atas kasur saat hujan deras.",
    },
  ]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    inboxQueue.length > 0 ? inboxQueue[0].id : null,
  );
  const currentItem =
    inboxQueue.find((item) => item.id === selectedItemId) || null;

  // 2. STATE PENYIMPANAN UTAMA / FLAT TABLES (KOLOM 3)
  const [projects, setProjects] = useState<ProjectItem[]>([
    { id: "p1", name: "Portofolio V2" },
    { id: "p2", name: "Riset Beasiswa 2027" },
  ]);

  const [paraFolders, setParaFolders] = useState<ParaFolderItem[]>([
    { id: "a1", name: "Pengembangan Karir & Coding", category: "area" },
    { id: "a2", name: "Kesehatan & Calisthenics", category: "area" },
    { id: "a3", name: "Keuangan Pribadi", category: "area" },
    { id: "r1", name: "Arsitektur Software & React", category: "reference" },
    { id: "r2", name: "Desain UI/UX & Material 3", category: "reference" },
  ]);

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "t1",
      title: "Tulis draf navigasi sidebar",
      description: "",
      type: "next_action",
      projectId: "p1",
      priority: "High",
      energy: "High (Fokus Penuh)",
      duration: "0 j 30 m",
      context: "@Computer",
    },
  ]);

  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([
    {
      id: "cal-1",
      title: "Kirim laporan mingguan",
      description: "",
      calendarType: "day_action",
      date: "2026-11-20",
      time: "17:00",
    },
  ]);

  const [waitingForItems, setWaitingForItems] = useState<WaitingForItem[]>([
    {
      id: "wait-1",
      title: "Revisi aset ilustrasi dari desainer",
      description: "",
      waitingFor: "Raka (Desainer)",
      followUpDate: "2026-11-18",
    },
  ]);

  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: "n1",
      title: "Palet warna pastel Material 3",
      description: "Gunakan tonal surface slate untuk latar belakang.",
      paraCategory: "project",
      targetId: "p1",
    },
  ]);

  // 3. STATE INPUT KOLOM 2
  const [localTitle, setLocalTitle] = useState("");
  const [localDesc, setLocalDesc] = useState("");
  const [dropdownMenu, setDropdownMenu] = useState<"action" | "idea" | null>(
    null,
  );
  const [selectedDest, setSelectedDest] = useState<DestinationType>(null);

  // Parameter Form GTD
  const [nextActionData, setNextActionData] = useState({
    priority: "",
    energy: "",
    duration: "",
    context: "",
  });

  const [isNewGtdProject, setIsNewGtdProject] = useState(false);
  const [gtdProjectData, setGtdProjectData] = useState({
    existingProjectId: "",
    newProjectName: "",
    firstNextAction: "",
  });

  // Parameter Form Calendar
  const [calendarData, setCalendarData] = useState<{
    calendarType: "appointment" | "day_action" | "day_info";
    date: string;
    time: string;
  }>({
    calendarType: "appointment",
    date: "",
    time: "",
  });

  // Parameter Form Waiting For
  const [waitingData, setWaitingData] = useState({
    waitingFor: "",
    followUpDate: "",
  });

  // Parameter Form PARA
  const [isNewParaFolder, setIsNewParaFolder] = useState(false);
  const [paraFolderData, setParaFolderData] = useState({
    selectedFolderId: "",
    newFolderName: "",
  });

  // 4. STATE KONTROL VISUAL KOLOM 3 & UNDO
  const [storageTab, setStorageTab] = useState<"action" | "idea">("action");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    group_active_projects: true,
    group_general_actions: true,
    group_calendar: true,
    group_waiting_for: true,
    group_para_project: true,
  });
  const [undoSnapshot, setUndoSnapshot] = useState<UndoSnapshot | null>(null);

  const priorityOptions = ["High", "Med", "Low"];
  const energyOptions = ["High (Fokus Penuh)", "Low (Admin Ringan)"];
  const contextOptions = [
    "@Computer",
    "@Home",
    "@Phone",
    "@Office",
    "@Errands",
  ];

  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentItem) {
      setLocalTitle(currentItem.title);
      setLocalDesc(currentItem.description);
      resetDestination();
    }
  }, [currentItem]);

  // --- HELPER TOGGLE FOLDER DI KOLOM 3 ---
  const toggleFolder = (folderKey: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderKey]: !prev[folderKey],
    }));
  };

  // --- HELPER FORMAT TANGGAL RINGKAS (Contoh: "20 Nov") ---
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  // --- KONTROL MENU DROP-UP KOLOM 2 ---
  const handleMouseEnter = (menu: "action" | "idea") => {
    if (selectedDest) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (dropdownMenu === null) {
      hoverTimer.current = setTimeout(() => setDropdownMenu(menu), 300);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setDropdownMenu(null), 300);
  };

  const handleClickMenu = (menu: "action" | "idea") => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setDropdownMenu((prev) => (prev === menu ? null : menu));
  };

  const selectDestination = (dest: DestinationType) => {
    setSelectedDest(dest);
    setDropdownMenu(null);

    if (
      dest === "quick_task" ||
      dest === "next_action" ||
      dest === "action_project" ||
      dest === "calendar" ||
      dest === "waiting_for"
    ) {
      setStorageTab("action");
    } else if (
      dest === "para_project" ||
      dest === "para_area" ||
      dest === "para_reference"
    ) {
      setStorageTab("idea");
    }
  };

  const resetDestination = () => {
    setSelectedDest(null);
    setDropdownMenu(null);
    setNextActionData({ priority: "", energy: "", duration: "", context: "" });
    setIsNewGtdProject(false);
    setGtdProjectData({
      existingProjectId: "",
      newProjectName: "",
      firstNextAction: "",
    });
    setCalendarData({ calendarType: "appointment", date: "", time: "" });
    setWaitingData({ waitingFor: "", followUpDate: "" });
    setIsNewParaFolder(false);
    setParaFolderData({ selectedFolderId: "", newFolderName: "" });
  };

  const handleCreateCustomTag = (category: string, newValue: string) => {
    setNextActionData((prev) => ({ ...prev, [category]: newValue }));
  };

  const getParaConfig = () => {
    if (selectedDest === "para_project") {
      return {
        label: "Project",
        list: projects,
        placeholder: "Nama Project baru...",
      };
    }
    if (selectedDest === "para_area") {
      return {
        label: "Area",
        list: paraFolders.filter((f) => f.category === "area"),
        placeholder: "Misal: Kesehatan, Keuangan...",
      };
    }
    return {
      label: "Folder Referensi",
      list: paraFolders.filter((f) => f.category === "reference"),
      placeholder: "Misal: Resep Masakan, Inspirasi Desain...",
    };
  };

  // --- VALIDASI KELENGKAPAN FORM ---
  const isSaveReady = () => {
    if (!selectedDest || localTitle.trim() === "") return false;
    if (selectedDest === "quick_task") return true;

    if (selectedDest === "next_action") {
      return (
        nextActionData.priority !== "" &&
        nextActionData.energy !== "" &&
        nextActionData.duration !== "" &&
        nextActionData.context !== ""
      );
    }

    if (selectedDest === "action_project") {
      return isNewGtdProject
        ? gtdProjectData.newProjectName.trim() !== "" &&
            gtdProjectData.firstNextAction.trim() !== ""
        : gtdProjectData.existingProjectId !== "";
    }

    if (selectedDest === "calendar") {
      if (calendarData.date === "") return false;
      // Jika Janji Temu, jam spesifik wajib diisi
      if (calendarData.calendarType === "appointment") {
        return calendarData.time !== "";
      }
      return true;
    }

    if (selectedDest === "waiting_for") {
      return waitingData.waitingFor.trim() !== "";
    }

    if (
      selectedDest === "para_project" ||
      selectedDest === "para_area" ||
      selectedDest === "para_reference"
    ) {
      return isNewParaFolder
        ? paraFolderData.newFolderName.trim() !== ""
        : paraFolderData.selectedFolderId !== "";
    }

    return false;
  };

  // =========================================
  // EKSEKUSI PEMINDAHAN DATA (KOLOM 1 -> 3)
  // =========================================
  const advanceToNextInboxItem = (
    currentId: string,
    updatedQueue: InboxItem[],
  ) => {
    if (updatedQueue.length === 0) {
      setSelectedItemId(null);
      return;
    }
    const oldIndex = inboxQueue.findIndex((item) => item.id === currentId);
    const nextItem = updatedQueue[oldIndex] || updatedQueue[0];
    setSelectedItemId(nextItem.id);
  };

  const handleCommitSave = () => {
    if (!currentItem || !selectedDest || !isSaveReady()) return;

    const snapshot: UndoSnapshot = {
      inboxQueue: [...inboxQueue],
      tasks: [...tasks],
      calendarItems: [...calendarItems],
      waitingForItems: [...waitingForItems],
      notes: [...notes],
      projects: [...projects],
      paraFolders: [...paraFolders],
      selectedItemId: currentItem.id,
      message: `"${localTitle}" berhasil disimpan.`,
    };

    const timestampId = Date.now().toString();
    let updatedProjects = [...projects];
    let updatedParaFolders = [...paraFolders];
    let updatedTasks = [...tasks];
    let updatedCalendar = [...calendarItems];
    let updatedWaiting = [...waitingForItems];
    let updatedNotes = [...notes];
    const foldersToAutoOpen: Record<string, boolean> = {};

    if (selectedDest === "quick_task") {
      updatedTasks.push({
        id: `task-${timestampId}`,
        title: localTitle.trim(),
        description: localDesc.trim(),
        type: "quick_task",
        projectId: null,
      });
      foldersToAutoOpen["group_general_actions"] = true;
      foldersToAutoOpen["folder_quick_tasks"] = true;
      setStorageTab("action");
    } else if (selectedDest === "next_action") {
      updatedTasks.push({
        id: `task-${timestampId}`,
        title: localTitle.trim(),
        description: localDesc.trim(),
        type: "next_action",
        projectId: null,
        ...nextActionData,
      });
      foldersToAutoOpen["group_general_actions"] = true;
      foldersToAutoOpen["folder_next_actions"] = true;
      setStorageTab("action");
    } else if (selectedDest === "action_project") {
      let targetProjId = gtdProjectData.existingProjectId;
      let taskTitleToSave = localTitle.trim();

      if (isNewGtdProject) {
        targetProjId = `proj-${timestampId}`;
        updatedProjects.push({
          id: targetProjId,
          name: gtdProjectData.newProjectName.trim(),
        });
        taskTitleToSave = gtdProjectData.firstNextAction.trim();
      }

      updatedTasks.push({
        id: `task-${timestampId}`,
        title: taskTitleToSave,
        description: localDesc.trim(),
        type: "next_action",
        projectId: targetProjId,
      });
      foldersToAutoOpen["group_active_projects"] = true;
      foldersToAutoOpen[`gtd_proj_${targetProjId}`] = true;
      setStorageTab("action");
    } else if (selectedDest === "calendar") {
      updatedCalendar.push({
        id: `cal-${timestampId}`,
        title: localTitle.trim(),
        description: localDesc.trim(),
        calendarType: calendarData.calendarType,
        date: calendarData.date,
        time: calendarData.time || undefined,
      });
      foldersToAutoOpen["group_calendar"] = true;
      setStorageTab("action");
    } else if (selectedDest === "waiting_for") {
      updatedWaiting.push({
        id: `wait-${timestampId}`,
        title: localTitle.trim(),
        description: localDesc.trim(),
        waitingFor: waitingData.waitingFor.trim(),
        followUpDate: waitingData.followUpDate || undefined,
      });
      foldersToAutoOpen["group_waiting_for"] = true;
      setStorageTab("action");
    } else if (selectedDest === "para_project") {
      let targetProjId = paraFolderData.selectedFolderId;
      if (isNewParaFolder) {
        targetProjId = `proj-${timestampId}`;
        updatedProjects.push({
          id: targetProjId,
          name: paraFolderData.newFolderName.trim(),
        });
      }
      updatedNotes.push({
        id: `note-${timestampId}`,
        title: localTitle.trim(),
        description: localDesc.trim(),
        paraCategory: "project",
        targetId: targetProjId,
      });
      foldersToAutoOpen["group_para_project"] = true;
      foldersToAutoOpen[`para_proj_${targetProjId}`] = true;
      setStorageTab("idea");
    } else if (
      selectedDest === "para_area" ||
      selectedDest === "para_reference"
    ) {
      const category = selectedDest === "para_area" ? "area" : "reference";
      let targetFolderId = paraFolderData.selectedFolderId;

      if (isNewParaFolder) {
        targetFolderId = `${category}-${timestampId}`;
        updatedParaFolders.push({
          id: targetFolderId,
          name: paraFolderData.newFolderName.trim(),
          category,
        });
      }
      updatedNotes.push({
        id: `note-${timestampId}`,
        title: localTitle.trim(),
        description: localDesc.trim(),
        paraCategory: category,
        targetId: targetFolderId,
      });
      foldersToAutoOpen[`group_para_${category}`] = true;
      foldersToAutoOpen[`para_folder_${targetFolderId}`] = true;
      setStorageTab("idea");
    }

    const remainingInbox = inboxQueue.filter(
      (item) => item.id !== currentItem.id,
    );

    setProjects(updatedProjects);
    setParaFolders(updatedParaFolders);
    setTasks(updatedTasks);
    setCalendarItems(updatedCalendar);
    setWaitingForItems(updatedWaiting);
    setNotes(updatedNotes);
    setInboxQueue(remainingInbox);
    setOpenFolders((prev) => ({ ...prev, ...foldersToAutoOpen }));
    setUndoSnapshot(snapshot);

    advanceToNextInboxItem(currentItem.id, remainingInbox);
  };

  const handleTrashItem = () => {
    if (!currentItem) return;

    const snapshot: UndoSnapshot = {
      inboxQueue: [...inboxQueue],
      tasks: [...tasks],
      calendarItems: [...calendarItems],
      waitingForItems: [...waitingForItems],
      notes: [...notes],
      projects: [...projects],
      paraFolders: [...paraFolders],
      selectedItemId: currentItem.id,
      message: `"${currentItem.title}" dihapus dari Inbox.`,
    };

    const remainingInbox = inboxQueue.filter(
      (item) => item.id !== currentItem.id,
    );
    setInboxQueue(remainingInbox);
    setUndoSnapshot(snapshot);
    advanceToNextInboxItem(currentItem.id, remainingInbox);
  };

  const handleUndo = () => {
    if (!undoSnapshot) return;
    setInboxQueue(undoSnapshot.inboxQueue);
    setTasks(undoSnapshot.tasks);
    setCalendarItems(undoSnapshot.calendarItems);
    setWaitingForItems(undoSnapshot.waitingForItems);
    setNotes(undoSnapshot.notes);
    setProjects(undoSnapshot.projects);
    setParaFolders(undoSnapshot.paraFolders);
    setSelectedItemId(undoSnapshot.selectedItemId);
    setUndoSnapshot(null);
  };

  // --- DATA TURUNAN UNTUK RENDER KOLOM 3 ---
  const standaloneNextActions = tasks.filter(
    (t) => t.type === "next_action" && t.projectId === null,
  );
  const quickTasks = tasks.filter((t) => t.type === "quick_task");
  const areaFolders = paraFolders.filter((f) => f.category === "area");
  const referenceFolders = paraFolders.filter(
    (f) => f.category === "reference",
  );

  const totalActionCount =
    tasks.length + calendarItems.length + waitingForItems.length;

  const isActionSelected =
    selectedDest === "quick_task" ||
    selectedDest === "next_action" ||
    selectedDest === "action_project" ||
    selectedDest === "calendar" ||
    selectedDest === "waiting_for";

  const isIdeaSelected =
    selectedDest === "para_project" ||
    selectedDest === "para_area" ||
    selectedDest === "para_reference";

  const paraConfig = getParaConfig();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-350 mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 max-w-[1600px] w-full mx-auto p-4 md:p-8 pb-0">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Inbox className="size-6 text-blue-600" /> Mode Sortir
        </h1>
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          Kembali ke Dashboard
        </button>
      </div>

      {/* GRID 3 KOLOM */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1.15fr] gap-6 max-w-[1600px] w-full mx-auto flex-1 p-4 md:p-8 pt-0">
        {/* ========================================= */}
        {/* KOLOM 1: DRAFT CATATAN */}
        {/* ========================================= */}
        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 flex flex-col gap-5 max-h-[85vh] overflow-hidden">
          <h2 className="font-semibold text-slate-500 uppercase tracking-widest text-sm flex justify-between items-center">
            Draft Catatan{" "}
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">
              {inboxQueue.length}
            </span>
          </h2>
          <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-4 h-full">
            {inboxQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                <CheckCircle2 className="size-8 text-emerald-400" />
                <p className="text-sm text-center font-medium text-slate-500">
                  Inbox Bersih!
                </p>
              </div>
            ) : (
              inboxQueue.map((item) => {
                const isActive = currentItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-white border-blue-400 shadow-sm ring-1 ring-blue-100"
                        : "bg-transparent border-slate-200 opacity-60 hover:opacity-100 hover:bg-white"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium line-clamp-1 ${
                        isActive ? "text-blue-800" : "text-slate-700"
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* KOLOM 2: MEJA INSPEKSI & EKSEKUSI */}
        {/* ========================================= */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col relative max-h-[85vh] overflow-y-auto custom-scrollbar">
          {currentItem ? (
            <>
              {/* AREA INPUT (JUDUL & DESKRIPSI) */}
              <div className="flex flex-col gap-4 mb-6">
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  placeholder="Judul catatan..."
                  className="text-2xl md:text-3xl font-medium text-slate-800 leading-tight outline-none w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-400 transition-colors py-1"
                />
                <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                  <label className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-2">
                    <AlignLeft className="size-3" /> Deskripsi
                  </label>
                  <textarea
                    value={localDesc}
                    onChange={(e) => setLocalDesc(e.target.value)}
                    placeholder="Tambahkan detail..."
                    className="outline-none w-full bg-transparent resize-none min-h-[4rem] text-sm text-slate-600 custom-scrollbar"
                  />
                </div>
              </div>

              {/* AREA KEPUTUSAN & MORPHING */}
              <div className="flex flex-col gap-4 bg-slate-50 border border-slate-200 rounded-3xl p-6 mt-auto relative transition-all duration-300">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 text-center">
                  Di mana ide ini ditempatkan?
                </p>

                <div className="flex flex-wrap gap-3 w-full relative">
                  {/* --- SISI KIRI: TINDAKAN (GTD) --- */}
                  {(!selectedDest || isActionSelected) && (
                    <div
                      className={`relative flex flex-col flex-1 ${
                        isActionSelected ? "w-full flex-none" : ""
                      }`}
                      onMouseEnter={() => handleMouseEnter("action")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() =>
                            !selectedDest && handleClickMenu("action")
                          }
                          className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl font-medium transition-all duration-300 ${
                            isActionSelected
                              ? "bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm"
                              : "bg-white border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {selectedDest === "quick_task" ? (
                            <>
                              <Clock className="size-5" /> Tugas Ringan (&lt;
                              2m)
                            </>
                          ) : selectedDest === "next_action" ? (
                            <>
                              <ArrowRight className="size-5" /> Jadikan Next
                              Action
                            </>
                          ) : selectedDest === "action_project" ? (
                            <>
                              <FolderGit2 className="size-5" /> Masukkan ke
                              Project
                            </>
                          ) : selectedDest === "calendar" ? (
                            <>
                              <CalendarIcon className="size-5" /> Jadwalkan di
                              Calendar
                            </>
                          ) : selectedDest === "waiting_for" ? (
                            <>
                              <Hourglass className="size-5" /> Waiting For
                              (Menunggu)
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-5" /> Tindakan
                            </>
                          )}
                        </button>
                        {isActionSelected && (
                          <button
                            onClick={resetDestination}
                            className="p-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-400 rounded-xl transition-colors"
                          >
                            <X className="size-5" />
                          </button>
                        )}
                      </div>

                      {/* DROP-UP TINDAKAN (5 Opsi GTD) */}
                      <div
                        className={`w-full grid transition-all duration-300 ease-out origin-bottom absolute bottom-full left-0 z-30 ${
                          dropdownMenu === "action"
                            ? "grid-rows-[1fr] opacity-100 mb-2"
                            : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
                        }`}
                      >
                        <div className="overflow-hidden flex flex-col gap-1.5 bg-white border border-emerald-100 p-2 rounded-2xl shadow-lg">
                          <button
                            onClick={() => selectDestination("quick_task")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <Clock className="size-4 text-emerald-500" /> Tugas
                            Ringan (&lt; 2m)
                          </button>
                          <button
                            onClick={() => selectDestination("next_action")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <ArrowRight className="size-4 text-blue-500" />{" "}
                            Jadikan Next Action
                          </button>
                          <button
                            onClick={() => selectDestination("action_project")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <FolderGit2 className="size-4 text-indigo-500" />{" "}
                            Masukkan ke Project
                          </button>
                          <div className="border-t border-slate-100 my-0.5" />
                          <button
                            onClick={() => selectDestination("calendar")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-rose-50 rounded-xl text-slate-600 hover:text-rose-700 font-medium transition-colors text-sm"
                          >
                            <CalendarIcon className="size-4 text-rose-500" />{" "}
                            Jadwalkan di Calendar
                          </button>
                          <button
                            onClick={() => selectDestination("waiting_for")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-amber-50 rounded-xl text-slate-600 hover:text-amber-700 font-medium transition-colors text-sm"
                          >
                            <Hourglass className="size-4 text-amber-500" />{" "}
                            Waiting For (Menunggu)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- SISI KANAN: IDE (PARA) --- */}
                  {(!selectedDest || isIdeaSelected) && (
                    <div
                      className={`relative flex flex-col flex-1 ${
                        isIdeaSelected ? "w-full flex-none" : ""
                      }`}
                      onMouseEnter={() => handleMouseEnter("idea")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() =>
                            !selectedDest && handleClickMenu("idea")
                          }
                          className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl font-medium transition-all duration-300 ${
                            isIdeaSelected
                              ? "bg-indigo-100 border-indigo-300 text-indigo-800 shadow-sm"
                              : "bg-white border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {selectedDest === "para_project" ? (
                            <>
                              <FolderGit2 className="size-5" /> Kirim ke Project
                              (PARA)
                            </>
                          ) : selectedDest === "para_area" ? (
                            <>
                              <Layers className="size-5" /> Kirim ke Area (PARA)
                            </>
                          ) : selectedDest === "para_reference" ? (
                            <>
                              <BookOpen className="size-5" /> Jadikan Referensi
                              (PARA)
                            </>
                          ) : (
                            <>
                              <BookOpen className="size-5" /> Ide (PARA)
                            </>
                          )}
                        </button>
                        {isIdeaSelected && (
                          <button
                            onClick={resetDestination}
                            className="p-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-400 rounded-xl transition-colors"
                          >
                            <X className="size-5" />
                          </button>
                        )}
                      </div>

                      {/* DROP-UP IDE (PARA) */}
                      <div
                        className={`w-full grid transition-all duration-300 ease-out origin-bottom absolute bottom-full left-0 z-30 ${
                          dropdownMenu === "idea"
                            ? "grid-rows-[1fr] opacity-100 mb-2"
                            : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
                        }`}
                      >
                        <div className="overflow-hidden flex flex-col gap-1.5 bg-white border border-indigo-100 p-2 rounded-2xl shadow-lg">
                          <button
                            onClick={() => selectDestination("para_project")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-indigo-50 rounded-xl text-slate-600 hover:text-indigo-700 font-medium transition-colors text-sm"
                          >
                            <FolderGit2 className="size-4 text-indigo-500" />{" "}
                            Kirim ke Project
                          </button>
                          <button
                            onClick={() => selectDestination("para_area")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <Layers className="size-4 text-emerald-500" /> Kirim
                            ke Area
                          </button>
                          <button
                            onClick={() => selectDestination("para_reference")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-amber-50 rounded-xl text-slate-600 hover:text-amber-700 font-medium transition-colors text-sm"
                          >
                            <BookOpen className="size-4 text-amber-500" />{" "}
                            Jadikan Referensi
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* FORM 1: NEXT ACTION (GTD) */}
                {selectedDest === "next_action" && (
                  <div className="mt-2 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-300 p-4 border border-emerald-100 bg-white rounded-2xl relative z-10">
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <AlertCircle className="size-3" /> Prioritas
                      </label>
                      <TagPicker
                        daftarTag={priorityOptions}
                        tagTerpilih={nextActionData.priority}
                        onPilihTag={(t) =>
                          setNextActionData({ ...nextActionData, priority: t })
                        }
                        onBuatTagBaru={(t) =>
                          handleCreateCustomTag("priority", t)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Battery className="size-3" /> Energi
                      </label>
                      <TagPicker
                        daftarTag={energyOptions}
                        tagTerpilih={nextActionData.energy}
                        onPilihTag={(t) =>
                          setNextActionData({ ...nextActionData, energy: t })
                        }
                        onBuatTagBaru={(t) =>
                          handleCreateCustomTag("energy", t)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2 relative z-20">
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="size-3" /> Durasi
                      </label>
                      <DurationPicker
                        durasiTerpilih={nextActionData.duration}
                        onPilihDurasi={(d) =>
                          setNextActionData({ ...nextActionData, duration: d })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Tag className="size-3" /> Konteks
                      </label>
                      <TagPicker
                        daftarTag={contextOptions}
                        tagTerpilih={nextActionData.context}
                        onPilihTag={(t) =>
                          setNextActionData({ ...nextActionData, context: t })
                        }
                        onBuatTagBaru={(t) =>
                          handleCreateCustomTag("context", t)
                        }
                      />
                    </div>
                  </div>
                )}

                {/* FORM 2: ACTION PROJECT (GTD) */}
                {selectedDest === "action_project" && (
                  <div className="mt-2 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300 p-4 border border-emerald-100 bg-white rounded-2xl relative z-10">
                    <div className="flex bg-slate-100 p-1 rounded-lg w-full mb-1">
                      <button
                        onClick={() => setIsNewGtdProject(false)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          !isNewGtdProject
                            ? "bg-white text-emerald-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Pilih Project Aktif
                      </button>
                      <button
                        onClick={() => {
                          setIsNewGtdProject(true);
                          setGtdProjectData((prev) => ({
                            ...prev,
                            newProjectName: localTitle,
                          }));
                        }}
                        className={`flex-1 flex justify-center items-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          isNewGtdProject
                            ? "bg-white text-emerald-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Plus className="size-3" /> Buat Project Baru
                      </button>
                    </div>

                    {!isNewGtdProject ? (
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Pilih dari sistem
                        </label>
                        <select
                          value={gtdProjectData.existingProjectId}
                          onChange={(e) =>
                            setGtdProjectData({
                              ...gtdProjectData,
                              existingProjectId: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none focus:border-emerald-400 text-sm font-medium"
                        >
                          <option value="" disabled>
                            -- Pilih Project Aktif --
                          </option>
                          {projects.map((proj) => (
                            <option key={proj.id} value={proj.id}>
                              {proj.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400">
                            Nama Project Baru
                          </label>
                          <input
                            type="text"
                            value={gtdProjectData.newProjectName}
                            onChange={(e) =>
                              setGtdProjectData({
                                ...gtdProjectData,
                                newProjectName: e.target.value,
                              })
                            }
                            placeholder="Misal: Perbaiki Atap Rumah..."
                            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-400"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                            <span>Next Action Pertama</span>
                            <span className="text-emerald-600 font-semibold lowercase tracking-normal bg-emerald-100 px-2 rounded-sm">
                              wajib
                            </span>
                          </label>
                          <input
                            type="text"
                            value={gtdProjectData.firstNextAction}
                            onChange={(e) =>
                              setGtdProjectData({
                                ...gtdProjectData,
                                firstNextAction: e.target.value,
                              })
                            }
                            placeholder="Apa langkah fisik pertamanya?"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FORM 3: CALENDAR (GTD HARD LANDSCAPE) */}
                {selectedDest === "calendar" && (
                  <div className="mt-2 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300 p-4 border border-rose-100 bg-white rounded-2xl relative z-10">
                    {/* Tipe Item Kalender GTD */}
                    <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarData({
                            ...calendarData,
                            calendarType: "appointment",
                          })
                        }
                        className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors ${
                          calendarData.calendarType === "appointment"
                            ? "bg-white text-rose-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Janji Temu
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarData({
                            ...calendarData,
                            calendarType: "day_action",
                          })
                        }
                        className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors ${
                          calendarData.calendarType === "day_action"
                            ? "bg-white text-rose-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Aksi Tenggat
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarData({
                            ...calendarData,
                            calendarType: "day_info",
                          })
                        }
                        className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors ${
                          calendarData.calendarType === "day_info"
                            ? "bg-white text-rose-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Info Hari
                      </button>
                    </div>

                    {/* Input Tanggal & Waktu */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                          <span>Tanggal</span>
                          <span className="text-rose-600 font-semibold lowercase bg-rose-50 px-1.5 rounded">
                            wajib
                          </span>
                        </label>
                        <input
                          type="date"
                          value={calendarData.date}
                          onChange={(e) =>
                            setCalendarData({
                              ...calendarData,
                              date: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-700 outline-none focus:border-rose-400 focus:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                          <span>Jam</span>
                          <span className="text-slate-400 font-normal lowercase">
                            {calendarData.calendarType === "appointment"
                              ? "wajib"
                              : "opsional"}
                          </span>
                        </label>
                        <input
                          type="time"
                          value={calendarData.time}
                          onChange={(e) =>
                            setCalendarData({
                              ...calendarData,
                              time: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-700 outline-none focus:border-rose-400 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* FORM 4: WAITING FOR (GTD DELEGATION) */}
                {selectedDest === "waiting_for" && (
                  <div className="mt-2 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300 p-4 border border-amber-100 bg-white rounded-2xl relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <UserCheck className="size-3" /> Menunggu Siapa /
                            Pihak Apa?
                          </span>
                          <span className="text-amber-600 font-semibold lowercase bg-amber-50 px-1.5 rounded">
                            wajib
                          </span>
                        </label>
                        <input
                          type="text"
                          value={waitingData.waitingFor}
                          onChange={(e) =>
                            setWaitingData({
                              ...waitingData,
                              waitingFor: e.target.value,
                            })
                          }
                          placeholder="Misal: Admin Kampus, Kurir, Budi..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 focus:bg-white"
                          autoFocus
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                          <span>Tgl Follow-up</span>
                          <span className="text-slate-400 font-normal lowercase">
                            opsional
                          </span>
                        </label>
                        <input
                          type="date"
                          value={waitingData.followUpDate}
                          onChange={(e) =>
                            setWaitingData({
                              ...waitingData,
                              followUpDate: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-700 outline-none focus:border-amber-400 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* FORM 5: IDE PARA */}
                {isIdeaSelected && (
                  <div className="mt-2 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300 p-4 border border-indigo-100 bg-white rounded-2xl relative z-10">
                    <div className="flex bg-slate-100 p-1 rounded-lg w-full mb-1">
                      <button
                        onClick={() => setIsNewParaFolder(false)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          !isNewParaFolder
                            ? "bg-white text-indigo-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Pilih {paraConfig.label}
                      </button>
                      <button
                        onClick={() => setIsNewParaFolder(true)}
                        className={`flex-1 flex justify-center items-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          isNewParaFolder
                            ? "bg-white text-indigo-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Plus className="size-3" /> Buat {paraConfig.label} Baru
                      </button>
                    </div>

                    {!isNewParaFolder ? (
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Pilih {paraConfig.label} yang tersedia
                        </label>
                        <select
                          value={paraFolderData.selectedFolderId}
                          onChange={(e) =>
                            setParaFolderData({
                              ...paraFolderData,
                              selectedFolderId: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none focus:border-indigo-400 text-sm font-medium"
                        >
                          <option value="" disabled>
                            -- Pilih {paraConfig.label} --
                          </option>
                          {paraConfig.list.map((folder) => (
                            <option key={folder.id} value={folder.id}>
                              {folder.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Nama {paraConfig.label} Baru
                        </label>
                        <input
                          type="text"
                          value={paraFolderData.newFolderName}
                          onChange={(e) =>
                            setParaFolderData({
                              ...paraFolderData,
                              newFolderName: e.target.value,
                            })
                          }
                          placeholder={paraConfig.placeholder}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-400"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* AREA TOMBOL SIMPAN & HAPUS */}
                <div className="grid grid-cols-[1fr_auto] gap-3 mt-4 pt-4 border-t border-slate-200">
                  <button
                    disabled={!isSaveReady()}
                    onClick={handleCommitSave}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors text-sm shadow-sm"
                  >
                    {!selectedDest
                      ? "Pilih destinasi dulu..."
                      : !isSaveReady()
                        ? "Lengkapi data rincian..."
                        : "Simpan Data"}
                  </button>
                  <button
                    onClick={handleTrashItem}
                    title="Hapus catatan ini"
                    className="flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 h-full gap-2">
              <CheckCircle2 className="size-16 text-emerald-400 mb-2" />
              <p className="text-xl font-medium text-slate-600">
                Semua Draf Selesai Diproses
              </p>
              <p className="text-sm text-center max-w-xs">
                Periksa hasil penyortiranmu di Tempat Penyimpanan sebelah kanan.
              </p>
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* KOLOM 3: TEMPAT PENYIMPANAN (FILE EXPLORER M3) */}
        {/* ========================================= */}
        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5 flex flex-col gap-4 max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-semibold text-slate-500 uppercase tracking-widest text-xs">
              Penyimpanan
            </h2>
          </div>

          {/* SEGMENTED CONTROL (TAB SWITCHER) */}
          <div className="grid grid-cols-2 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setStorageTab("action")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                storageTab === "action"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <CheckCircle2 className="size-3.5" />
              <span>Tindakan</span>
              <span className="ml-0.5 text-[10px] opacity-75">
                ({totalActionCount})
              </span>
            </button>
            <button
              onClick={() => setStorageTab("idea")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                storageTab === "idea"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <BookOpen className="size-3.5" />
              <span>Ide (PARA)</span>
              <span className="ml-0.5 text-[10px] opacity-75">
                ({notes.length})
              </span>
            </button>
          </div>

          {/* KONTEN EXPLORER (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-3">
            {storageTab === "action" ? (
              /* ===================================== */
              /* TAB 1: GUDANG TINDAKAN (GTD) */
              /* ===================================== */
              <>
                {/* GRUP 1: PROJEK AKTIF */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
                  <button
                    onClick={() => toggleFolder("group_active_projects")}
                    className="flex items-center justify-between w-full text-left py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <ChevronRight
                        className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                          openFolders["group_active_projects"]
                            ? "rotate-90"
                            : ""
                        }`}
                      />
                      Projek Aktif
                    </span>
                    <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {projects.length}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      openFolders["group_active_projects"]
                        ? "grid-rows-[1fr] mt-2"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden flex flex-col gap-1.5 pl-2 border-l-2 border-slate-100 ml-2">
                      {projects.map((proj) => {
                        const projectTasks = tasks.filter(
                          (t) => t.projectId === proj.id,
                        );
                        const folderKey = `gtd_proj_${proj.id}`;
                        const isOpen = !!openFolders[folderKey];

                        return (
                          <div key={proj.id} className="flex flex-col">
                            <button
                              onClick={() => toggleFolder(folderKey)}
                              className="flex items-center justify-between w-full py-1.5 px-2 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                {isOpen ? (
                                  <FolderOpen className="size-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <Folder className="size-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                                )}
                                <span
                                  title={proj.name}
                                  className="text-xs font-medium text-slate-700 truncate"
                                >
                                  {proj.name}
                                </span>
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 ml-2 shrink-0">
                                {projectTasks.length}
                              </span>
                            </button>

                            <div
                              className={`grid transition-all duration-200 ease-out ${
                                isOpen
                                  ? "grid-rows-[1fr] mt-1"
                                  : "grid-rows-[0fr]"
                              }`}
                            >
                              <div className="overflow-hidden flex flex-col gap-1 pl-3 border-l border-emerald-200/70 ml-3.5">
                                {projectTasks.length === 0 ? (
                                  <span className="text-[11px] text-slate-400 italic py-1">
                                    Belum ada tindakan
                                  </span>
                                ) : (
                                  projectTasks.map((task) => (
                                    <div
                                      key={task.id}
                                      title={task.title}
                                      className="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-emerald-50/50 text-xs text-slate-600"
                                    >
                                      <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                                      <span className="truncate">
                                        {task.title}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* GRUP 2: TINDAKAN UMUM (Next Action & Tugas Ringan) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
                  <button
                    onClick={() => toggleFolder("group_general_actions")}
                    className="flex items-center justify-between w-full text-left py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <ChevronRight
                        className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                          openFolders["group_general_actions"]
                            ? "rotate-90"
                            : ""
                        }`}
                      />
                      Tindakan
                    </span>
                    <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {standaloneNextActions.length + quickTasks.length}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      openFolders["group_general_actions"]
                        ? "grid-rows-[1fr] mt-2"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden flex flex-col gap-1.5 pl-2 border-l-2 border-slate-100 ml-2">
                      {/* Folder 1: Next Action Biasa */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => toggleFolder("folder_next_actions")}
                          className="flex items-center justify-between w-full py-1.5 px-2 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            {openFolders["folder_next_actions"] ? (
                              <FolderOpen className="size-4 text-blue-600 shrink-0" />
                            ) : (
                              <Folder className="size-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                            )}
                            <span className="text-xs font-medium text-slate-700 truncate">
                              Next Action
                            </span>
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 ml-2">
                            {standaloneNextActions.length}
                          </span>
                        </button>

                        <div
                          className={`grid transition-all duration-200 ease-out ${
                            openFolders["folder_next_actions"]
                              ? "grid-rows-[1fr] mt-1"
                              : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="overflow-hidden flex flex-col gap-1 pl-3 border-l border-blue-200/70 ml-3.5">
                            {standaloneNextActions.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic py-1">
                                Kosong
                              </span>
                            ) : (
                              standaloneNextActions.map((task) => (
                                <div
                                  key={task.id}
                                  title={task.title}
                                  className="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-blue-50/50 text-xs text-slate-600"
                                >
                                  <span className="size-1.5 rounded-full bg-blue-400 shrink-0" />
                                  <span className="truncate">{task.title}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Folder 2: Tugas Ringan (< 2m) */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => toggleFolder("folder_quick_tasks")}
                          className="flex items-center justify-between w-full py-1.5 px-2 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <Zap className="size-4 text-amber-500 shrink-0" />
                            <span className="text-xs font-medium text-slate-700 truncate">
                              Tugas Ringan (&lt; 2m)
                            </span>
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 ml-2">
                            {quickTasks.length}
                          </span>
                        </button>

                        <div
                          className={`grid transition-all duration-200 ease-out ${
                            openFolders["folder_quick_tasks"]
                              ? "grid-rows-[1fr] mt-1"
                              : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="overflow-hidden flex flex-col gap-1 pl-3 border-l border-amber-200/70 ml-3.5">
                            {quickTasks.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic py-1">
                                Kosong
                              </span>
                            ) : (
                              quickTasks.map((task) => (
                                <div
                                  key={task.id}
                                  title={task.title}
                                  className="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-amber-50/50 text-xs text-slate-600"
                                >
                                  <span className="size-1.5 rounded-full bg-amber-400 shrink-0" />
                                  <span className="truncate">{task.title}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GRUP 3: CALENDAR (HARD LANDSCAPE) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
                  <button
                    onClick={() => toggleFolder("group_calendar")}
                    className="flex items-center justify-between w-full text-left py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
                      <ChevronRight
                        className={`size-3.5 text-rose-400 transition-transform duration-200 ${
                          openFolders["group_calendar"] ? "rotate-90" : ""
                        }`}
                      />
                      Calendar
                    </span>
                    <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
                      {calendarItems.length}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      openFolders["group_calendar"]
                        ? "grid-rows-[1fr] mt-2"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden flex flex-col gap-1.5 pl-2 border-l-2 border-rose-100 ml-2">
                      {calendarItems.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic py-1 px-2">
                          Belum ada jadwal
                        </span>
                      ) : (
                        calendarItems.map((cal) => (
                          <div
                            key={cal.id}
                            title={`${cal.title} (${cal.date}${
                              cal.time ? ` • ${cal.time}` : ""
                            })`}
                            className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-xl hover:bg-rose-50/50 text-xs text-slate-700"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <CalendarIcon className="size-3.5 text-rose-500 shrink-0" />
                              <span className="truncate">{cal.title}</span>
                            </span>
                            <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded shrink-0">
                              {formatShortDate(cal.date)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* GRUP 4: WAITING FOR (DELEGASI) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
                  <button
                    onClick={() => toggleFolder("group_waiting_for")}
                    className="flex items-center justify-between w-full text-left py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                      <ChevronRight
                        className={`size-3.5 text-amber-400 transition-transform duration-200 ${
                          openFolders["group_waiting_for"] ? "rotate-90" : ""
                        }`}
                      />
                      Waiting For
                    </span>
                    <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      {waitingForItems.length}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      openFolders["group_waiting_for"]
                        ? "grid-rows-[1fr] mt-2"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden flex flex-col gap-1.5 pl-2 border-l-2 border-amber-100 ml-2">
                      {waitingForItems.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic py-1 px-2">
                          Tidak ada yang ditunggu
                        </span>
                      ) : (
                        waitingForItems.map((wait) => (
                          <div
                            key={wait.id}
                            title={`${wait.title} — Menunggu: ${wait.waitingFor}`}
                            className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-xl hover:bg-amber-50/50 text-xs text-slate-700"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <Hourglass className="size-3.5 text-amber-500 shrink-0" />
                              <span className="truncate">{wait.title}</span>
                            </span>
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded shrink-0 max-w-[85px] truncate">
                              @{wait.waitingFor}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* ===================================== */
              /* TAB 2: GUDANG IDE / SECOND BRAIN (PARA) */
              /* ===================================== */
              <>
                {/* FOLDER 1: PROJECT (PARA) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
                  <button
                    onClick={() => toggleFolder("group_para_project")}
                    className="flex items-center justify-between w-full text-left py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
                      <ChevronRight
                        className={`size-3.5 text-indigo-400 transition-transform duration-200 ${
                          openFolders["group_para_project"] ? "rotate-90" : ""
                        }`}
                      />
                      Project
                    </span>
                    <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      {notes.filter((n) => n.paraCategory === "project").length}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      openFolders["group_para_project"]
                        ? "grid-rows-[1fr] mt-2"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden flex flex-col gap-1.5 pl-2 border-l-2 border-indigo-100 ml-2">
                      {projects.map((proj) => {
                        const projectNotes = notes.filter(
                          (n) =>
                            n.paraCategory === "project" &&
                            n.targetId === proj.id,
                        );
                        const folderKey = `para_proj_${proj.id}`;
                        const isOpen = !!openFolders[folderKey];

                        return (
                          <div key={proj.id} className="flex flex-col">
                            <button
                              onClick={() => toggleFolder(folderKey)}
                              className="flex items-center justify-between w-full py-1.5 px-2 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                {isOpen ? (
                                  <FolderOpen className="size-4 text-indigo-600 shrink-0" />
                                ) : (
                                  <Folder className="size-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                )}
                                <span
                                  title={proj.name}
                                  className="text-xs font-medium text-slate-700 truncate"
                                >
                                  {proj.name}
                                </span>
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 ml-2 shrink-0">
                                {projectNotes.length}
                              </span>
                            </button>

                            <div
                              className={`grid transition-all duration-200 ease-out ${
                                isOpen
                                  ? "grid-rows-[1fr] mt-1"
                                  : "grid-rows-[0fr]"
                              }`}
                            >
                              <div className="overflow-hidden flex flex-col gap-1 pl-3 border-l border-indigo-200/70 ml-3.5">
                                {projectNotes.length === 0 ? (
                                  <span className="text-[11px] text-slate-400 italic py-1">
                                    Belum ada catatan
                                  </span>
                                ) : (
                                  projectNotes.map((note) => (
                                    <div
                                      key={note.id}
                                      title={note.title}
                                      className="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-indigo-50/50 text-xs text-slate-600"
                                    >
                                      <span className="size-1.5 rounded-full bg-indigo-400 shrink-0" />
                                      <span className="truncate">
                                        {note.title}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* FOLDER 2: AREA (PARA) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
                  <button
                    onClick={() => toggleFolder("group_para_area")}
                    className="flex items-center justify-between w-full text-left py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                      <ChevronRight
                        className={`size-3.5 text-emerald-400 transition-transform duration-200 ${
                          openFolders["group_para_area"] ? "rotate-90" : ""
                        }`}
                      />
                      Area
                    </span>
                    <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {notes.filter((n) => n.paraCategory === "area").length}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      openFolders["group_para_area"]
                        ? "grid-rows-[1fr] mt-2"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden flex flex-col gap-1.5 pl-2 border-l-2 border-emerald-100 ml-2">
                      {areaFolders.map((area) => {
                        const areaNotes = notes.filter(
                          (n) =>
                            n.paraCategory === "area" && n.targetId === area.id,
                        );
                        const folderKey = `para_folder_${area.id}`;
                        const isOpen = !!openFolders[folderKey];

                        return (
                          <div key={area.id} className="flex flex-col">
                            <button
                              onClick={() => toggleFolder(folderKey)}
                              className="flex items-center justify-between w-full py-1.5 px-2 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                {isOpen ? (
                                  <FolderOpen className="size-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <Folder className="size-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                                )}
                                <span
                                  title={area.name}
                                  className="text-xs font-medium text-slate-700 truncate"
                                >
                                  {area.name}
                                </span>
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 ml-2 shrink-0">
                                {areaNotes.length}
                              </span>
                            </button>

                            <div
                              className={`grid transition-all duration-200 ease-out ${
                                isOpen
                                  ? "grid-rows-[1fr] mt-1"
                                  : "grid-rows-[0fr]"
                              }`}
                            >
                              <div className="overflow-hidden flex flex-col gap-1 pl-3 border-l border-emerald-200/70 ml-3.5">
                                {areaNotes.length === 0 ? (
                                  <span className="text-[11px] text-slate-400 italic py-1">
                                    Belum ada catatan
                                  </span>
                                ) : (
                                  areaNotes.map((note) => (
                                    <div
                                      key={note.id}
                                      title={note.title}
                                      className="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-emerald-50/50 text-xs text-slate-600"
                                    >
                                      <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                                      <span className="truncate">
                                        {note.title}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* FOLDER 3: REFERENSI (PARA) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
                  <button
                    onClick={() => toggleFolder("group_para_reference")}
                    className="flex items-center justify-between w-full text-left py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                      <ChevronRight
                        className={`size-3.5 text-amber-400 transition-transform duration-200 ${
                          openFolders["group_para_reference"] ? "rotate-90" : ""
                        }`}
                      />
                      Referensi
                    </span>
                    <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      {
                        notes.filter((n) => n.paraCategory === "reference")
                          .length
                      }
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-out ${
                      openFolders["group_para_reference"]
                        ? "grid-rows-[1fr] mt-2"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden flex flex-col gap-1.5 pl-2 border-l-2 border-amber-100 ml-2">
                      {referenceFolders.map((refFolder) => {
                        const refNotes = notes.filter(
                          (n) =>
                            n.paraCategory === "reference" &&
                            n.targetId === refFolder.id,
                        );
                        const folderKey = `para_folder_${refFolder.id}`;
                        const isOpen = !!openFolders[folderKey];

                        return (
                          <div key={refFolder.id} className="flex flex-col">
                            <button
                              onClick={() => toggleFolder(folderKey)}
                              className="flex items-center justify-between w-full py-1.5 px-2 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                {isOpen ? (
                                  <FolderOpen className="size-4 text-amber-600 shrink-0" />
                                ) : (
                                  <Folder className="size-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
                                )}
                                <span
                                  title={refFolder.name}
                                  className="text-xs font-medium text-slate-700 truncate"
                                >
                                  {refFolder.name}
                                </span>
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 ml-2 shrink-0">
                                {refNotes.length}
                              </span>
                            </button>

                            <div
                              className={`grid transition-all duration-200 ease-out ${
                                isOpen
                                  ? "grid-rows-[1fr] mt-1"
                                  : "grid-rows-[0fr]"
                              }`}
                            >
                              <div className="overflow-hidden flex flex-col gap-1 pl-3 border-l border-amber-200/70 ml-3.5">
                                {refNotes.length === 0 ? (
                                  <span className="text-[11px] text-slate-400 italic py-1">
                                    Belum ada catatan
                                  </span>
                                ) : (
                                  refNotes.map((note) => (
                                    <div
                                      key={note.id}
                                      title={note.title}
                                      className="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-amber-50/50 text-xs text-slate-600"
                                    >
                                      <span className="size-1.5 rounded-full bg-amber-400 shrink-0" />
                                      <span className="truncate">
                                        {note.title}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* PENGAMAN LAPIS 2: TOAST UNDO MAKRO */}
      {undoSnapshot && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{undoSnapshot.message}</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 text-blue-300 hover:text-blue-100 text-xs font-bold uppercase tracking-wider bg-slate-700/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Undo2 className="size-3.5" /> Batal (Undo)
          </button>
          <button
            onClick={() => setUndoSnapshot(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
