// src/components/project/CaptureDrawer.tsx

"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CaptureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
}

export default function CaptureDrawer({
  isOpen,
  onClose,
  onSave,
}: CaptureDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (title.trim() === "") return;
    onSave(title, description);
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <>
      {/* OVERLAY LACI CAPTURE */}
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* LACI SLIDE-OUT CAPTURE */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[420px] bg-slate-50 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-slate-200">
          <h2 className="font-semibold text-xl text-slate-800">
            Tumpahkan Ide
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Judul / Inti Pikiran
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim() !== "") {
                  handleSubmit();
                }
              }}
              placeholder="Misal: Beli buku Atomic Habits..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail, konteks, atau tautan..."
              className="w-full flex-1 bg-white border border-slate-200 rounded-2xl p-4 text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed custom-scrollbar"
            />
          </div>
        </div>

        <div className="px-6 py-5 bg-white border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            disabled={title.trim() === ""}
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors"
          >
            Simpan ke Inbox
          </button>
        </div>
      </div>
    </>
  );
}
