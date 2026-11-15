"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { JournalTask } from "@/types/jurnal";
import DurationPicker from "../DurationPicker";
import TagPicker from "../TagPicker";
import IconButton from "../IconButon"; // Mempertahankan nama file asli proyek

interface TaskListProps {
  task: JournalTask;
  tagStorage: string[];
  onSave: (updatedTask: JournalTask) => void;
  onDelete: (id: string) => void;
  onCreateTag: (newTag: string) => void;
}

export default function TaskList({
  task,
  tagStorage,
  onSave,
  onDelete,
  onCreateTag,
}: TaskListProps) {
  // State lokal khusus draf saat mode edit baris aktif
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(task.name);
  const [durationDraft, setDurationDraft] = useState(task.duration);
  const [tagDraft, setTagDraft] = useState(task.tag);

  const handleSave = () => {
    if (!nameDraft.trim()) return;

    onSave({
      ...task,
      name: nameDraft,
      duration: durationDraft,
      tag: tagDraft,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNameDraft(task.name);
    setDurationDraft(task.duration);
    setTagDraft(task.tag);
    setIsEditing(false);
  };

  // Mode Edit
  if (isEditing) {
    return (
      <div className="group relative flex justify-between items-center w-full bg-white rounded-r-md pl-4 pr-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-visible z-30">
        <div className="flex flex-wrap items-center justify-end w-full gap-2">
          <div className="flex shrink-0 gap-1 w-16">
            <IconButton
              icon={Check}
              onClick={handleSave}
              className="w-8 h-8 !text-emerald-600 hover:!bg-emerald-50"
            />
            <IconButton
              icon={X}
              onClick={handleCancel}
              className="w-8 h-8 !text-slate-400 hover:!bg-slate-100"
            />
          </div>

          <input
            type="text"
            className="text-sm font-medium text-slate-700 outline-none bg-slate-50 px-2 py-1.5 rounded-md border border-blue-300 focus:border-blue-500 transition-colors min-w-35 flex-1"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            autoFocus
          />

          <div className="flex gap-1 shrink-0">
            <DurationPicker
              onPilihDurasi={setDurationDraft}
              durasiTerpilih={durationDraft}
              isCompact={true}
            />
            <TagPicker
              daftarTag={tagStorage}
              tagTerpilih={tagDraft}
              onPilihTag={setTagDraft}
              onBuatTagBaru={(newTag) => {
                setTagDraft(newTag);
                onCreateTag(newTag);
              }}
              isCompact={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // Mode Baca
  return (
    <div className="group relative flex justify-between items-center w-full bg-white rounded-r-md pl-4 pr-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-visible z-20">
      <div className="flex items-center flex-1 min-w-0">
        <div className="w-0 opacity-0 overflow-hidden group-hover:w-[4.5rem] group-hover:opacity-100 transition-all duration-300 delay-300 ease-out flex shrink-0 gap-1 mr-2">
          <IconButton
            icon={Pencil}
            onClick={() => setIsEditing(true)}
            className="w-8 h-8 !text-blue-500 hover:!bg-blue-50 focus:opacity-100 shrink-0"
          />
          <IconButton
            icon={Trash2}
            onClick={() => onDelete(task.id)}
            className="w-8 h-8 !text-red-400 hover:!text-red-600 hover:!bg-red-50 focus:opacity-100 shrink-0"
          />
        </div>
        <h3 className="text-left font-medium text-slate-700 truncate flex-1 min-w-0">
          {task.name}
        </h3>
      </div>

      <div className="flex gap-2 shrink-0 ml-4">
        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md px-2 py-1">
          {task.tag}
        </span>
        <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 rounded-md px-2 py-1">
          {task.duration}
        </span>
      </div>
    </div>
  );
}
