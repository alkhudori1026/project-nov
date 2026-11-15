// src/components/project/InboxOrganizer.tsx

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
  Undo2,
  Calendar as CalendarIcon,
  Hourglass,
  UserCheck,
} from "lucide-react";

import TagPicker from "../TagPicker";
import DurationPicker from "../DurationPicker";
import InboxStorageExplorer from "./InboxStorageExplorer";
import {
  AppData,
  CalendarFormData,
  DestinationType,
  GtdProjectFormData,
  InboxItem,
  InboxSortPayload,
  NextActionFormData,
  ParaFolderFormData,
  UndoSnapshot,
  WaitingForFormData,
} from "@/types/productivity";
import { InboxSortResult, isInboxSortReady } from "@/utils/projectHelpers";

interface InboxOrganizerProps {
  appData: AppData;
  onSortItem: (
    targetItemId: string,
    payload: InboxSortPayload,
  ) => InboxSortResult;
  onTrashItem: (targetItemId: string) => void;
  onRestoreSnapshot: (previousData: AppData) => void;
  onClose: () => void;
}

const PRIORITY_OPTIONS = ["High", "Med", "Low"];
const ENERGY_OPTIONS = ["High (Fokus Penuh)", "Low (Admin Ringan)"];
const CONTEXT_OPTIONS = ["@Computer", "@Home", "@Phone", "@Office", "@Errands"];

export default function InboxOrganizer({
  appData,
  onSortItem,
  onTrashItem,
  onRestoreSnapshot,
  onClose,
}: InboxOrganizerProps) {
  const {
    inboxQueue,
    projects,
    paraFolders,
    tasks,
    calendarItems,
    waitingForItems,
    notes,
  } = appData;

  // 1. STATE SELEKSI ITEM AKTIF (KOLOM 1)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    inboxQueue.length > 0 ? inboxQueue[0].id : null,
  );

  const currentItem =
    inboxQueue.find((item) => item.id === selectedItemId) ||
    inboxQueue[0] ||
    null;

  // 2. STATE INPUT LOKAL (KOLOM 2)
  const [localTitle, setLocalTitle] = useState("");
  const [localDesc, setLocalDesc] = useState("");
  const [dropdownMenu, setDropdownMenu] = useState<"action" | "idea" | null>(
    null,
  );
  const [selectedDest, setSelectedDest] = useState<DestinationType>(null);

  const [nextActionData, setNextActionData] = useState<NextActionFormData>({
    priority: "",
    energy: "",
    duration: "",
    context: "",
  });

  const [isNewGtdProject, setIsNewGtdProject] = useState(false);
  const [gtdProjectData, setGtdProjectData] = useState<GtdProjectFormData>({
    existingProjectId: "",
    newProjectName: "",
    firstNextAction: "",
  });

  const [calendarData, setCalendarData] = useState<CalendarFormData>({
    calendarType: "appointment",
    date: "",
    time: "",
  });

  const [waitingData, setWaitingData] = useState<WaitingForFormData>({
    waitingFor: "",
    followUpDate: "",
  });

  const [isNewParaFolder, setIsNewParaFolder] = useState(false);
  const [paraFolderData, setParaFolderData] = useState<ParaFolderFormData>({
    selectedFolderId: "",
    newFolderName: "",
  });

  // 3. STATE KONTROL VISUAL KOLOM 3 & UNDO
  const [storageTab, setStorageTab] = useState<"action" | "idea">("action");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    group_active_projects: true,
    group_general_actions: true,
    group_calendar: true,
    group_waiting_for: true,
    group_para_project: true,
  });
  const [undoSnapshot, setUndoSnapshot] = useState<UndoSnapshot | null>(null);

  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentItem) {
      setLocalTitle(currentItem.title);
      setLocalDesc(currentItem.description);
      resetDestination();
    }
  }, [currentItem?.id]);

  const toggleFolder = (folderKey: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderKey]: !prev[folderKey],
    }));
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

  const handleCreateCustomTag = (
    category: keyof NextActionFormData,
    newValue: string,
  ) => {
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

  const saveReady = isInboxSortReady({
    title: localTitle,
    description: localDesc,
    destination: selectedDest,
    nextActionData,
    isNewGtdProject,
    gtdProjectData,
    calendarData,
    waitingData,
    isNewParaFolder,
    paraFolderData,
  });

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
    if (!currentItem || !selectedDest || !saveReady) return;

    const snapshot: UndoSnapshot = {
      previousData: {
        inboxQueue: [...inboxQueue],
        projects: [...projects],
        paraFolders: [...paraFolders],
        tasks: [...tasks],
        calendarItems: [...calendarItems],
        waitingForItems: [...waitingForItems],
        notes: [...notes],
      },
      selectedItemId: currentItem.id,
      message: `"${localTitle}" berhasil disimpan.`,
    };

    const result = onSortItem(currentItem.id, {
      title: localTitle,
      description: localDesc,
      destination: selectedDest,
      nextActionData,
      isNewGtdProject,
      gtdProjectData,
      calendarData,
      waitingData,
      isNewParaFolder,
      paraFolderData,
    });

    setStorageTab(result.targetStorageTab);
    setOpenFolders((prev) => ({ ...prev, ...result.foldersToAutoOpen }));
    setUndoSnapshot(snapshot);
    advanceToNextInboxItem(currentItem.id, result.nextData.inboxQueue);
  };

  const handleTrashItem = () => {
    if (!currentItem) return;

    const snapshot: UndoSnapshot = {
      previousData: {
        inboxQueue: [...inboxQueue],
        projects: [...projects],
        paraFolders: [...paraFolders],
        tasks: [...tasks],
        calendarItems: [...calendarItems],
        waitingForItems: [...waitingForItems],
        notes: [...notes],
      },
      selectedItemId: currentItem.id,
      message: `"${currentItem.title}" dihapus dari Inbox.`,
    };

    const remainingInbox = inboxQueue.filter(
      (item) => item.id !== currentItem.id,
    );

    onTrashItem(currentItem.id);
    setUndoSnapshot(snapshot);
    advanceToNextInboxItem(currentItem.id, remainingInbox);
  };

  const handleUndo = () => {
    if (!undoSnapshot) return;
    onRestoreSnapshot(undoSnapshot.previousData);
    setSelectedItemId(undoSnapshot.selectedItemId);
    setUndoSnapshot(null);
  };

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
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          Kembali ke Dashboard
        </button>
      </div>

      {/* GRID 3 KOLOM */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1.15fr] gap-6 max-w-[1600px] w-full mx-auto flex-1 p-4 md:p-8 pt-0">
        {/* KOLOM 1: DRAFT CATATAN */}
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

        {/* KOLOM 2: MEJA INSPEKSI & EKSEKUSI */}
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
                  {/* SISI KIRI: TINDAKAN (GTD) */}
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
                          type="button"
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
                            type="button"
                            onClick={resetDestination}
                            className="p-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-400 rounded-xl transition-colors"
                          >
                            <X className="size-5" />
                          </button>
                        )}
                      </div>

                      {/* DROP-UP TINDAKAN */}
                      <div
                        className={`w-full grid transition-all duration-300 ease-out origin-bottom absolute bottom-full left-0 z-30 ${
                          dropdownMenu === "action"
                            ? "grid-rows-[1fr] opacity-100 mb-2"
                            : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
                        }`}
                      >
                        <div className="overflow-hidden flex flex-col gap-1.5 bg-white border border-emerald-100 p-2 rounded-2xl shadow-lg">
                          <button
                            type="button"
                            onClick={() => selectDestination("quick_task")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <Clock className="size-4 text-emerald-500" /> Tugas
                            Ringan (&lt; 2m)
                          </button>
                          <button
                            type="button"
                            onClick={() => selectDestination("next_action")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <ArrowRight className="size-4 text-blue-500" />{" "}
                            Jadikan Next Action
                          </button>
                          <button
                            type="button"
                            onClick={() => selectDestination("action_project")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <FolderGit2 className="size-4 text-indigo-500" />{" "}
                            Masukkan ke Project
                          </button>
                          <div className="border-t border-slate-100 my-0.5" />
                          <button
                            type="button"
                            onClick={() => selectDestination("calendar")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-rose-50 rounded-xl text-slate-600 hover:text-rose-700 font-medium transition-colors text-sm"
                          >
                            <CalendarIcon className="size-4 text-rose-500" />{" "}
                            Jadwalkan di Calendar
                          </button>
                          <button
                            type="button"
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

                  {/* SISI KANAN: IDE (PARA) */}
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
                          type="button"
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
                            type="button"
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
                            type="button"
                            onClick={() => selectDestination("para_project")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-indigo-50 rounded-xl text-slate-600 hover:text-indigo-700 font-medium transition-colors text-sm"
                          >
                            <FolderGit2 className="size-4 text-indigo-500" />{" "}
                            Kirim ke Project
                          </button>
                          <button
                            type="button"
                            onClick={() => selectDestination("para_area")}
                            className="flex items-center gap-3 p-2.5 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <Layers className="size-4 text-emerald-500" /> Kirim
                            ke Area
                          </button>
                          <button
                            type="button"
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
                        daftarTag={PRIORITY_OPTIONS}
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
                        daftarTag={ENERGY_OPTIONS}
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
                        daftarTag={CONTEXT_OPTIONS}
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
                        type="button"
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
                        type="button"
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
                        type="button"
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
                        type="button"
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
                    type="button"
                    disabled={!saveReady}
                    onClick={handleCommitSave}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors text-sm shadow-sm"
                  >
                    {!selectedDest
                      ? "Pilih destinasi dulu..."
                      : !saveReady
                        ? "Lengkapi data rincian..."
                        : "Simpan Data"}
                  </button>
                  <button
                    type="button"
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

        {/* KOLOM 3: TEMPAT PENYIMPANAN (FILE EXPLORER M3) */}
        <InboxStorageExplorer
          projects={projects}
          paraFolders={paraFolders}
          tasks={tasks}
          calendarItems={calendarItems}
          waitingForItems={waitingForItems}
          notes={notes}
          storageTab={storageTab}
          onChangeTab={setStorageTab}
          openFolders={openFolders}
          onToggleFolder={toggleFolder}
        />
      </div>

      {/* TOAST UNDO MAKRO */}
      {undoSnapshot && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{undoSnapshot.message}</span>
          <button
            type="button"
            onClick={handleUndo}
            className="flex items-center gap-1.5 text-blue-300 hover:text-blue-100 text-xs font-bold uppercase tracking-wider bg-slate-700/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Undo2 className="size-3.5" /> Batal (Undo)
          </button>
          <button
            type="button"
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
