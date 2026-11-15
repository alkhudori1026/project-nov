// src/utils/projectHelpers.ts

import {
  AppData,
  CalendarItem,
  CalendarItemType,
  DestinationType,
  InboxSortPayload,
  NoteItem,
  ParaFolderItem,
  ProjectItem,
  ProjectProgressSummary,
  TaskItem,
  WaitingForItem,
} from "@/types/productivity";

// Kunci penyimpanan utama di localStorage
export const STORAGE_KEY = "anais_gtd_para_vault_v1";

// Data bawaan saat brankas localStorage masih kosong
export const INITIAL_APP_DATA: AppData = {
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

// --- HELPER PEMFORMATAN & LABEL UI ---

// Memformat string tanggal ISO menjadi tampilan ringkas (Contoh: "20 Nov")
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

// Mengembalikan label dan kelas warna Tailwind untuk tipe jadwal GTD
export function getCalendarBadge(type: CalendarItemType): {
  label: string;
  style: string;
} {
  if (type === "appointment") {
    return { label: "Janji Temu", style: "bg-rose-100 text-rose-700" };
  }
  if (type === "day_action") {
    return { label: "Tenggat", style: "bg-amber-100 text-amber-700" };
  }
  return { label: "Info Hari", style: "bg-sky-100 text-sky-700" };
}

// --- KALKULASI DATA TURUNAN (DAPAT DIPAKAI LINTAS HALAMAN) ---

// Mengurutkan tugas: yang belum selesai di atas, yang selesai di bawah
export function getSortedTasks(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort(
    (a, b) => Number(Boolean(a.isCompleted)) - Number(Boolean(b.isCompleted)),
  );
}

// Mengurutkan agenda kalender berdasarkan tanggal terdekat
export function getSortedCalendarItems(
  calendarItems: CalendarItem[],
): CalendarItem[] {
  return [...calendarItems].sort((a, b) => a.date.localeCompare(b.date));
}

// Menghitung metrik penyelesaian aksi dan jumlah catatan PARA untuk setiap proyek
export function getProjectProgressSummaries(
  projects: ProjectItem[],
  tasks: TaskItem[],
  notes: NoteItem[],
): ProjectProgressSummary[] {
  return projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const completedCount = projectTasks.filter((t) => t.isCompleted).length;
    const totalCount = projectTasks.length;
    const progressPercent =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const noteCount = notes.filter(
      (n) => n.paraCategory === "project" && n.targetId === project.id,
    ).length;

    return {
      project,
      completedCount,
      totalCount,
      progressPercent,
      noteCount,
    };
  });
}

// --- VALIDASI & PEMROSESAN SORTIR INBOX (GTD & PARA) ---

type SortValidationInput = Omit<InboxSortPayload, "destination"> & {
  destination: DestinationType;
};

// Memvalidasi kelengkapan input form sebelum item Inbox diizinkan untuk disimpan
export function isInboxSortReady(input: SortValidationInput): boolean {
  const {
    title,
    destination,
    nextActionData,
    isNewGtdProject,
    gtdProjectData,
    calendarData,
    waitingData,
    isNewParaFolder,
    paraFolderData,
  } = input;

  if (!destination || title.trim() === "") return false;
  if (destination === "quick_task") return true;

  if (destination === "next_action") {
    return (
      nextActionData.priority !== "" &&
      nextActionData.energy !== "" &&
      nextActionData.duration !== "" &&
      nextActionData.context !== ""
    );
  }

  if (destination === "action_project") {
    return isNewGtdProject
      ? gtdProjectData.newProjectName.trim() !== "" &&
          gtdProjectData.firstNextAction.trim() !== ""
      : gtdProjectData.existingProjectId !== "";
  }

  if (destination === "calendar") {
    if (calendarData.date === "") return false;
    if (calendarData.calendarType === "appointment") {
      return calendarData.time !== "";
    }
    return true;
  }

  if (destination === "waiting_for") {
    return waitingData.waitingFor.trim() !== "";
  }

  if (
    destination === "para_project" ||
    destination === "para_area" ||
    destination === "para_reference"
  ) {
    return isNewParaFolder
      ? paraFolderData.newFolderName.trim() !== ""
      : paraFolderData.selectedFolderId !== "";
  }

  return false;
}

export interface InboxSortResult {
  nextData: AppData;
  foldersToAutoOpen: Record<string, boolean>;
  targetStorageTab: "action" | "idea";
}

// Fungsi murni untuk memindahkan satu item Inbox ke destinasi GTD/PARA secara atomik
export function applyInboxSort(
  currentData: AppData,
  targetItemId: string,
  payload: InboxSortPayload,
  timestampId: string = Date.now().toString(),
): InboxSortResult {
  const {
    title,
    description,
    destination,
    nextActionData,
    isNewGtdProject,
    gtdProjectData,
    calendarData,
    waitingData,
    isNewParaFolder,
    paraFolderData,
  } = payload;

  const cleanTitle = title.trim();
  const cleanDesc = description.trim();

  const updatedProjects: ProjectItem[] = [...currentData.projects];
  const updatedParaFolders: ParaFolderItem[] = [...currentData.paraFolders];
  const updatedTasks: TaskItem[] = [...currentData.tasks];
  const updatedCalendar: CalendarItem[] = [...currentData.calendarItems];
  const updatedWaiting: WaitingForItem[] = [...currentData.waitingForItems];
  const updatedNotes: NoteItem[] = [...currentData.notes];

  const foldersToAutoOpen: Record<string, boolean> = {};
  let targetStorageTab: "action" | "idea" = "action";

  if (destination === "quick_task") {
    updatedTasks.push({
      id: `task-${timestampId}`,
      title: cleanTitle,
      description: cleanDesc,
      type: "quick_task",
      projectId: null,
      isCompleted: false,
    });
    foldersToAutoOpen["group_general_actions"] = true;
    foldersToAutoOpen["folder_quick_tasks"] = true;
  } else if (destination === "next_action") {
    updatedTasks.push({
      id: `task-${timestampId}`,
      title: cleanTitle,
      description: cleanDesc,
      type: "next_action",
      projectId: null,
      isCompleted: false,
      ...nextActionData,
    });
    foldersToAutoOpen["group_general_actions"] = true;
    foldersToAutoOpen["folder_next_actions"] = true;
  } else if (destination === "action_project") {
    let targetProjId = gtdProjectData.existingProjectId;
    let taskTitleToSave = cleanTitle;

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
      description: cleanDesc,
      type: "next_action",
      projectId: targetProjId,
      isCompleted: false,
    });
    foldersToAutoOpen["group_active_projects"] = true;
    foldersToAutoOpen[`gtd_proj_${targetProjId}`] = true;
  } else if (destination === "calendar") {
    updatedCalendar.push({
      id: `cal-${timestampId}`,
      title: cleanTitle,
      description: cleanDesc,
      calendarType: calendarData.calendarType,
      date: calendarData.date,
      time: calendarData.time || undefined,
    });
    foldersToAutoOpen["group_calendar"] = true;
  } else if (destination === "waiting_for") {
    updatedWaiting.push({
      id: `wait-${timestampId}`,
      title: cleanTitle,
      description: cleanDesc,
      waitingFor: waitingData.waitingFor.trim(),
      followUpDate: waitingData.followUpDate || undefined,
    });
    foldersToAutoOpen["group_waiting_for"] = true;
  } else if (destination === "para_project") {
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
      title: cleanTitle,
      description: cleanDesc,
      paraCategory: "project",
      targetId: targetProjId,
    });
    foldersToAutoOpen["group_para_project"] = true;
    foldersToAutoOpen[`para_proj_${targetProjId}`] = true;
    targetStorageTab = "idea";
  } else if (destination === "para_area" || destination === "para_reference") {
    const category = destination === "para_area" ? "area" : "reference";
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
      title: cleanTitle,
      description: cleanDesc,
      paraCategory: category,
      targetId: targetFolderId,
    });
    foldersToAutoOpen[`group_para_${category}`] = true;
    foldersToAutoOpen[`para_folder_${targetFolderId}`] = true;
    targetStorageTab = "idea";
  }

  const remainingInbox = currentData.inboxQueue.filter(
    (item) => item.id !== targetItemId,
  );

  return {
    nextData: {
      inboxQueue: remainingInbox,
      projects: updatedProjects,
      paraFolders: updatedParaFolders,
      tasks: updatedTasks,
      calendarItems: updatedCalendar,
      waitingForItems: updatedWaiting,
      notes: updatedNotes,
    },
    foldersToAutoOpen,
    targetStorageTab,
  };
}
