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
  category: "area" | "reference";
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: "quick_task" | "next_action";
  projectId: string | null;
  priority?: string;
  energy?: string;
  duration?: string;
  context?: string;
  isCompleted?: boolean;
}

export interface CalendarItem {
  id: string;
  title: string;
  description: string;
  calendarType: "appointment" | "day_action" | "day_info";
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
  paraCategory: "project" | "area" | "reference";
  targetId: string;
}

// Wadah tunggal yang akan disimpan ke dalam localStorage
export interface AppData {
  inboxQueue: InboxItem[];
  projects: ProjectItem[];
  paraFolders: ParaFolderItem[];
  tasks: TaskItem[];
  calendarItems: CalendarItem[];
  waitingForItems: WaitingForItem[];
  notes: NoteItem[];
}
