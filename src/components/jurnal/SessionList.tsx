"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { HydratedSession } from "@/types/jurnal";
import IconButton from "../IconButon";
import TaskList from "./TaskList";
import ReflectionList from "./ReflectionList";

interface SessionListProps {
  session: HydratedSession;
  tagStorage: string[];
  onSave: (updatedSession: HydratedSession) => void;
  onDelete: (id: string) => void;
  onCreateTag: (newTag: string) => void;
}

export default function SessionList({
  session,
  tagStorage,
  onSave,
  onDelete,
  onCreateTag,
}: SessionListProps) {
  // Kotak pasir (sandbox) lokal untuk mengedit sesi secara atomik
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<HydratedSession>(session);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleSave = () => {
    // Hitung ulang tag unik berdasarkan daftar tugas terbaru di dalam kotak pasir
    const updatedUniqueTags = Array.from(
      new Set(draft.tasks.map((t) => t.tag)),
    );

    onSave({ ...draft, uniqueTags: updatedUniqueTags });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity mb-6">
      {isEditing ? (
        // Mode Edit Total (Sandbox Aktif)
        <div className="flex flex-col gap-5 bg-blue-50/40 p-5 rounded-3xl border border-blue-200/60 shadow-inner">
          {/* Header Edit (Jam & Tuas Simpan) */}
          <div className="flex justify-between items-center border-b border-blue-200/50 pb-4">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-300 shadow-sm">
              <input
                type="time"
                value={draft.startingTime}
                onChange={(e) =>
                  setDraft({ ...draft, startingTime: e.target.value })
                }
                className="text-sm font-bold outline-none bg-transparent text-slate-700"
              />
              <span className="text-slate-400 font-medium">→</span>
              <input
                type="time"
                value={draft.finishingTime}
                onChange={(e) =>
                  setDraft({ ...draft, finishingTime: e.target.value })
                }
                className="text-sm font-bold outline-none bg-transparent text-slate-700"
              />
            </div>
            <div className="flex gap-2">
              <IconButton
                icon={Check}
                onClick={handleSave}
                className="!bg-emerald-500 !text-white hover:!bg-emerald-600 size-9 shadow-sm"
              />
              <IconButton
                icon={X}
                onClick={() => {
                  setIsEditing(false);
                  setDraft(session);
                }}
                className="!bg-slate-200 !text-slate-600 hover:!bg-slate-300 size-9"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Area Edit Tugas */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <h3 className="text-[10px] font-bold text-blue-800/50 uppercase tracking-wider ml-1">
                Edit Tugas
              </h3>
              {draft.tasks.map((taskItem) => (
                <TaskList
                  key={taskItem.id}
                  task={taskItem}
                  tagStorage={tagStorage}
                  onSave={(updatedTask) => {
                    const nextTasks = draft.tasks.map((t) =>
                      t.id === updatedTask.id ? updatedTask : t,
                    );
                    setDraft({ ...draft, tasks: nextTasks });
                  }}
                  onDelete={(id) => {
                    const remainingTasks = draft.tasks.filter(
                      (t) => t.id !== id,
                    );
                    setDraft({ ...draft, tasks: remainingTasks });
                  }}
                  onCreateTag={onCreateTag}
                />
              ))}
            </div>

            {/* Area Edit Refleksi */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <h3 className="text-[10px] font-bold text-blue-800/50 uppercase tracking-wider ml-1">
                Edit Refleksi
              </h3>
              {draft.reflections.map((reflectionItem) => (
                <ReflectionList
                  key={reflectionItem.id}
                  reflection={reflectionItem}
                  onSave={(updatedReflection) => {
                    const nextReflections = draft.reflections.map((r) =>
                      r.id === updatedReflection.id ? updatedReflection : r,
                    );
                    setDraft({ ...draft, reflections: nextReflections });
                  }}
                  onDelete={(id) => {
                    const remainingReflections = draft.reflections.filter(
                      (r) => r.id !== id,
                    );
                    setDraft({ ...draft, reflections: remainingReflections });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Mode Baca Normal & Konfirmasi Hapus
        <>
          <div className="group flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConfirmingDelete ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200/80 px-2 py-1 rounded-full shadow-sm z-10 animate-in fade-in slide-in-from-left-2 duration-200">
                  <span className="text-xs font-bold text-red-600 pl-2">
                    Hapus sesi ini?
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <IconButton
                      icon={Trash2}
                      onClick={() => onDelete(session.id)}
                      className="w-6 h-6 !bg-white !text-red-500 hover:!bg-red-500 hover:!text-white shadow-sm"
                    />
                    <IconButton
                      icon={X}
                      onClick={() => setIsConfirmingDelete(false)}
                      className="w-6 h-6 !bg-white !text-slate-500 hover:!bg-slate-100 border border-slate-200"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-0 opacity-0 overflow-hidden group-hover:w-[3.5rem] group-hover:opacity-100 transition-all duration-300 delay-300 ease-out flex shrink-0 gap-1">
                    <IconButton
                      icon={Pencil}
                      onClick={() => {
                        setIsEditing(true);
                        setDraft({
                          ...session,
                          tasks: [...session.tasks],
                          reflections: [...session.reflections],
                        });
                      }}
                      className="w-6 h-6 !text-blue-500 hover:!bg-blue-50 focus:opacity-100"
                    />
                    <IconButton
                      icon={Trash2}
                      onClick={() => setIsConfirmingDelete(true)}
                      className="w-6 h-6 !text-red-400 hover:!bg-red-50 focus:opacity-100"
                    />
                  </div>

                  <p className="whitespace-nowrap shrink-0 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 -ml-2 group-hover:ml-0 delay-300 transition-all duration-300 rounded-full tracking-wide">
                    {session.startingTime} - {session.finishingTime}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 border-t-2 border-dashed border-slate-200 min-w-4" />

            <div className="flex gap-1.5 shrink-0">
              {session.uniqueTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Konten Log Selesai */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.tasks.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-wrap mb-1">
                  Tugas Selesai
                </h3>
                {session.tasks.map((taskItem) => (
                  <div
                    key={taskItem.id}
                    className="flex justify-between items-center border-l-2 border-blue-400 pl-3 gap-2"
                  >
                    <p className="font-medium text-sm text-slate-700 break-all">
                      {taskItem.name}
                    </p>
                    <span className="text-xs text-slate-500 font-medium shrink-0">
                      {taskItem.duration}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {session.reflections.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Refleksi
                </h3>
                {session.reflections.map((reflectionItem) => (
                  <p
                    key={reflectionItem.id}
                    className="text-sm text-slate-600 border-l-2 border-slate-300 pl-3"
                  >
                    {reflectionItem.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
