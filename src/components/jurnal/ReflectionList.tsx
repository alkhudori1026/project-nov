"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { JournalReflection } from "@/types/jurnal";
import IconButton from "../IconButon";

interface ReflectionListProps {
  reflection: JournalReflection;
  onSave: (updatedReflection: JournalReflection) => void;
  onDelete: (id: string) => void;
}

export default function ReflectionList({
  reflection,
  onSave,
  onDelete,
}: ReflectionListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textDraft, setTextDraft] = useState(reflection.text);

  const handleSave = () => {
    if (!textDraft.trim()) return;
    onSave({ ...reflection, text: textDraft });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTextDraft(reflection.text);
    setIsEditing(false);
  };

  return (
    <div className="group relative flex justify-between items-center w-full bg-white rounded-r-md pl-4 pr-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-slate-400 hover:before:w-[4px] before:transition-all before:duration-300 before:ease-out">
      {isEditing ? (
        // Mode Edit
        <div className="flex items-center w-full gap-2 z-10">
          <input
            type="text"
            className="w-full text-sm outline-none bg-slate-50 px-2 py-1.5 rounded-md border border-blue-300 focus:border-blue-500 transition-colors"
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            autoFocus
          />
          <div className="flex shrink-0 gap-1">
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
        </div>
      ) : (
        // Mode Baca
        <>
          <p className="text-sm text-slate-700 flex-1 min-w-0 truncate">
            {reflection.text}
          </p>
          <div className="w-0 opacity-0 overflow-hidden group-hover:w-[4.5rem] group-hover:opacity-100 transition-all duration-300 delay-300 ease-out flex shrink-0 gap-1 ml-2 justify-end">
            <IconButton
              icon={Pencil}
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 !text-blue-500 hover:!bg-blue-50 focus:opacity-100"
            />
            <IconButton
              icon={Trash2}
              onClick={() => onDelete(reflection.id)}
              className="w-8 h-8 !text-red-400 hover:!text-red-600 hover:!bg-red-50 focus:opacity-100"
            />
          </div>
        </>
      )}
    </div>
  );
}
