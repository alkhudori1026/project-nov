// src/components/project/ActiveProjectsCard.tsx

import { CheckCircle2, FileText } from "lucide-react";
import { ProjectProgressSummary } from "@/types/productivity";

interface ActiveProjectsCardProps {
  projectSummaries: ProjectProgressSummary[];
}

export default function ActiveProjectsCard({
  projectSummaries,
}: ActiveProjectsCardProps) {
  return (
    <div className="bg-white border border-slate-200 w-full p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl text-slate-800 tracking-tight">
          Active Projects
        </h2>
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
          {projectSummaries.length} Aktif
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
        {projectSummaries.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-6 text-center">
            Belum ada proyek aktif.
          </p>
        ) : (
          projectSummaries.map(
            ({
              project,
              completedCount,
              totalCount,
              progressPercent,
              noteCount,
            }) => (
              <div
                key={project.id}
                className="flex flex-col gap-2.5 bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-transparent hover:border-slate-200 transition-colors"
              >
                <div className="flex justify-between items-center gap-2">
                  <h3 className="font-semibold text-slate-800 text-sm truncate">
                    {project.name}
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
            ),
          )
        )}
      </div>
    </div>
  );
}
