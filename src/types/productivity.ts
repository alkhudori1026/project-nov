// src/types/productivity.ts

// Kategori utama dalam sistem PARA
export type ParaCategory = "project" | "area" | "reference";

// Klasifikasi jenis tindakan dalam GTD
export type TaskType = "next_action" | "quick_task";

// Klasifikasi komitmen waktu pada Calendar GTD (Hard Landscape)
export type CalendarItemType = "appointment" | "day_action" | "day_info";

// Seluruh opsi tujuan saat menyortir item dari Inbox
export type DestinationType =
  | "quick_task"
  | "next_action"
  | "action_project"
  | "calendar"
  | "waiting_for"
  | "para_project"
  | "para_area"
  | "para_reference"
  | null;

// --- ENTITAS DATA UTAMA (FLATTENED TABLES) ---

export interface InboxItem {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
}

export interface ParaFolderItem {
  id: string;
  name: string;
  category: Exclude<ParaCategory, "project">;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  projectId: string | null;
  priority?: string;
  energy?: string;
  duration?: string;
  context?: string;
  isCompleted: boolean;
}

export interface CalendarItem {
  id: string;
  title: string;
  description: string;
  calendarType: CalendarItemType;
  date: string;
  time?: string;
}

export interface WaitingForItem {
  id: string;
  title: string;
  description: string;
  waitingFor: string;
  followUpDate?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  description: string;
  paraCategory: ParaCategory;
  targetId: string;
}

// Struktur Single Source of Truth di localStorage
export interface AppData {
  inboxQueue: InboxItem[];
  projects: ProjectItem[];
  paraFolders: ParaFolderItem[];
  tasks: TaskItem[];
  calendarItems: CalendarItem[];
  waitingForItems: WaitingForItem[];
  notes: NoteItem[];
}

// --- KONTRAK STATE FORM & TRANSAKSI SORTIR ---

export interface NextActionFormData {
  priority: string;
  energy: string;
  duration: string;
  context: string;
}

export interface GtdProjectFormData {
  existingProjectId: string;
  newProjectName: string;
  firstNextAction: string;
}

export interface CalendarFormData {
  calendarType: CalendarItemType;
  date: string;
  time: string;
}

export interface WaitingForFormData {
  waitingFor: string;
  followUpDate: string;
}

export interface ParaFolderFormData {
  selectedFolderId: string;
  newFolderName: string;
}

// Payload lengkap yang dikirim saat pengguna menekan "Simpan Data" di Mode Sortir
export interface InboxSortPayload {
  title: string;
  description: string;
  destination: Exclude<DestinationType, null>;
  nextActionData: NextActionFormData;
  isNewGtdProject: boolean;
  gtdProjectData: GtdProjectFormData;
  calendarData: CalendarFormData;
  waitingData: WaitingForFormData;
  isNewParaFolder: boolean;
  paraFolderData: ParaFolderFormData;
}

// Rekam cadang state sebelum mutasi untuk fitur Undo
export interface UndoSnapshot {
  previousData: AppData;
  selectedItemId: string | null;
  message: string;
}

// Data turunan untuk kartu Active Projects (dapat dipakai ulang di Beranda)
export interface ProjectProgressSummary {
  project: ProjectItem;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  noteCount: number;
}
