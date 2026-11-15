// src/components/project/InboxStorageExplorer.tsx

import {
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Folder,
  FolderOpen,
  Zap,
  Calendar as CalendarIcon,
  Hourglass,
} from "lucide-react";
import {
  CalendarItem,
  NoteItem,
  ParaFolderItem,
  ProjectItem,
  TaskItem,
  WaitingForItem,
} from "@/types/productivity";
import { formatShortDate } from "@/utils/projectHelpers";

interface InboxStorageExplorerProps {
  projects: ProjectItem[];
  paraFolders: ParaFolderItem[];
  tasks: TaskItem[];
  calendarItems: CalendarItem[];
  waitingForItems: WaitingForItem[];
  notes: NoteItem[];
  storageTab: "action" | "idea";
  onChangeTab: (tab: "action" | "idea") => void;
  openFolders: Record<string, boolean>;
  onToggleFolder: (folderKey: string) => void;
}

// Konfigurasi kelas warna statis untuk setiap kategori PARA
const PARA_THEME = {
  indigo: {
    headerText: "text-indigo-700",
    chevron: "text-indigo-400",
    badge: "bg-indigo-50 text-indigo-700",
    groupBorder: "border-indigo-100",
    folderOpen: "text-indigo-600",
    folderHover: "group-hover:text-indigo-600",
    itemBorder: "border-indigo-200/70",
    itemHover: "hover:bg-indigo-50/50",
    dot: "bg-indigo-400",
  },
  emerald: {
    headerText: "text-emerald-700",
    chevron: "text-emerald-400",
    badge: "bg-emerald-50 text-emerald-700",
    groupBorder: "border-emerald-100",
    folderOpen: "text-emerald-600",
    folderHover: "group-hover:text-emerald-600",
    itemBorder: "border-emerald-200/70",
    itemHover: "hover:bg-emerald-50/50",
    dot: "bg-emerald-400",
  },
  amber: {
    headerText: "text-amber-700",
    chevron: "text-amber-400",
    badge: "bg-amber-50 text-amber-700",
    groupBorder: "border-amber-100",
    folderOpen: "text-amber-600",
    folderHover: "group-hover:text-amber-600",
    itemBorder: "border-amber-200/70",
    itemHover: "hover:bg-amber-50/50",
    dot: "bg-amber-400",
  },
} as const;

interface ParaCategorySectionProps {
  title: string;
  groupKey: string;
  folderKeyPrefix: string;
  folders: { id: string; name: string }[];
  notes: NoteItem[];
  theme: (typeof PARA_THEME)[keyof typeof PARA_THEME];
  openFolders: Record<string, boolean>;
  onToggleFolder: (folderKey: string) => void;
}

// Sub-komponen internal untuk merender satu grup folder PARA secara seragam
function ParaCategorySection({
  title,
  groupKey,
  folderKeyPrefix,
  folders,
  notes,
  theme,
  openFolders,
  onToggleFolder,
}: ParaCategorySectionProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
      <button
        type="button"
        onClick={() => onToggleFolder(groupKey)}
        className="flex items-center justify-between w-full text-left py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <span
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${theme.headerText}`}
        >
          <ChevronRight
            className={`size-3.5 ${theme.chevron} transition-transform duration-200 ${
              openFolders[groupKey] ? "rotate-90" : ""
            }`}
          />
          {title}
        </span>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${theme.badge}`}
        >
          {notes.length}
        </span>
      </button>

      <div
        className={`grid transition-all duration-200 ease-out ${
          openFolders[groupKey] ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr]"
        }`}
      >
        <div
          className={`overflow-hidden flex flex-col gap-1.5 pl-2 border-l-2 ${theme.groupBorder} ml-2`}
        >
          {folders.map((folder) => {
            const folderNotes = notes.filter((n) => n.targetId === folder.id);
            const folderKey = `${folderKeyPrefix}${folder.id}`;
            const isOpen = !!openFolders[folderKey];

            return (
              <div key={folder.id} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => onToggleFolder(folderKey)}
                  className="flex items-center justify-between w-full py-1.5 px-2 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {isOpen ? (
                      <FolderOpen
                        className={`size-4 ${theme.folderOpen} shrink-0`}
                      />
                    ) : (
                      <Folder
                        className={`size-4 text-slate-400 ${theme.folderHover} shrink-0`}
                      />
                    )}
                    <span
                      title={folder.name}
                      className="text-xs font-medium text-slate-700 truncate"
                    >
                      {folder.name}
                    </span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 ml-2 shrink-0">
                    {folderNotes.length}
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr] mt-1" : "grid-rows-[0fr]"
                  }`}
                >
                  <div
                    className={`overflow-hidden flex flex-col gap-1 pl-3 border-l ${theme.itemBorder} ml-3.5`}
                  >
                    {folderNotes.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic py-1">
                        Belum ada catatan
                      </span>
                    ) : (
                      folderNotes.map((note) => (
                        <div
                          key={note.id}
                          title={note.title}
                          className={`flex items-center gap-2 py-1 px-1.5 rounded-lg ${theme.itemHover} text-xs text-slate-600`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${theme.dot} shrink-0`}
                          />
                          <span className="truncate">{note.title}</span>
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
  );
}

export default function InboxStorageExplorer({
  projects,
  paraFolders,
  tasks,
  calendarItems,
  waitingForItems,
  notes,
  storageTab,
  onChangeTab,
  openFolders,
  onToggleFolder,
}: InboxStorageExplorerProps) {
  const standaloneNextActions = tasks.filter(
    (t) => t.type === "next_action" && t.projectId === null,
  );
  const quickTasks = tasks.filter((t) => t.type === "quick_task");

  const projectNotes = notes.filter((n) => n.paraCategory === "project");
  const areaNotes = notes.filter((n) => n.paraCategory === "area");
  const referenceNotes = notes.filter((n) => n.paraCategory === "reference");

  const areaFolders = paraFolders.filter((f) => f.category === "area");
  const referenceFolders = paraFolders.filter(
    (f) => f.category === "reference",
  );

  const totalActionCount =
    tasks.length + calendarItems.length + waitingForItems.length;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5 flex flex-col gap-4 max-h-[85vh] overflow-hidden">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-semibold text-slate-500 uppercase tracking-widest text-xs">
          Penyimpanan
        </h2>
      </div>

      {/* SEGMENTED CONTROL (TAB SWITCHER) */}
      <div className="grid grid-cols-2 bg-slate-200/70 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => onChangeTab("action")}
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
          type="button"
          onClick={() => onChangeTab("idea")}
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
          <>
            {/* GRUP 1: PROJEK AKTIF */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
              <button
                type="button"
                onClick={() => onToggleFolder("group_active_projects")}
                className="flex items-center justify-between w-full text-left py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <ChevronRight
                    className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                      openFolders["group_active_projects"] ? "rotate-90" : ""
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
                          type="button"
                          onClick={() => onToggleFolder(folderKey)}
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
                            isOpen ? "grid-rows-[1fr] mt-1" : "grid-rows-[0fr]"
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
                                  <span className="truncate">{task.title}</span>
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

            {/* GRUP 2: TINDAKAN UMUM */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
              <button
                type="button"
                onClick={() => onToggleFolder("group_general_actions")}
                className="flex items-center justify-between w-full text-left py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <ChevronRight
                    className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                      openFolders["group_general_actions"] ? "rotate-90" : ""
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
                  {/* Next Action */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => onToggleFolder("folder_next_actions")}
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

                  {/* Tugas Ringan (< 2m) */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => onToggleFolder("folder_quick_tasks")}
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

            {/* GRUP 3: CALENDAR */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
              <button
                type="button"
                onClick={() => onToggleFolder("group_calendar")}
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

            {/* GRUP 4: WAITING FOR */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col">
              <button
                type="button"
                onClick={() => onToggleFolder("group_waiting_for")}
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
          <>
            <ParaCategorySection
              title="Project"
              groupKey="group_para_project"
              folderKeyPrefix="para_proj_"
              folders={projects}
              notes={projectNotes}
              theme={PARA_THEME.indigo}
              openFolders={openFolders}
              onToggleFolder={onToggleFolder}
            />
            <ParaCategorySection
              title="Area"
              groupKey="group_para_area"
              folderKeyPrefix="para_folder_"
              folders={areaFolders}
              notes={areaNotes}
              theme={PARA_THEME.emerald}
              openFolders={openFolders}
              onToggleFolder={onToggleFolder}
            />
            <ParaCategorySection
              title="Referensi"
              groupKey="group_para_reference"
              folderKeyPrefix="para_folder_"
              folders={referenceFolders}
              notes={referenceNotes}
              theme={PARA_THEME.amber}
              openFolders={openFolders}
              onToggleFolder={onToggleFolder}
            />
          </>
        )}
      </div>
    </div>
  );
}
