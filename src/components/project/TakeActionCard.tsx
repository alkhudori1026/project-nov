// src/components/project/TakeActionCard.tsx

import {
  CheckCircle2,
  Circle,
  Zap,
  FolderGit2,
  Tag,
  Clock,
  Hourglass,
} from "lucide-react";
import { ProjectItem, TaskItem, WaitingForItem } from "@/types/productivity";

interface TakeActionCardProps {
  tasks: TaskItem[];
  activeTaskCount: number;
  projects: ProjectItem[];
  waitingForItems: WaitingForItem[];
  onToggleTask: (taskId: string) => void;
}

export default function TakeActionCard({
  tasks,
  activeTaskCount,
  projects,
  waitingForItems,
  onToggleTask,
}: TakeActionCardProps) {
  return (
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
        {tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 border-2 border-dashed border-slate-100 rounded-2xl">
            <CheckCircle2 className="size-10 text-slate-200 mb-2" />
            <p className="text-sm font-medium">Belum ada Next Action aktif.</p>
            <p className="text-xs">
              Tangkap ide lewat tombol + atau sortir Inbox.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const linkedProject = projects.find((p) => p.id === task.projectId);

            return (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
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
                        <FolderGit2 className="size-3" /> {linkedProject.name}
                      </span>
                    )}

                    {task.context && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                        <Tag className="size-3 text-slate-400" /> {task.context}
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
      {waitingForItems.length > 0 && (
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <Hourglass className="size-3.5" /> Waiting For (
            {waitingForItems.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {waitingForItems.map((wait) => (
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
  );
}
