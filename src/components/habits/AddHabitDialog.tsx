"use client";

import { useState, useEffect } from "react";
import { X, GitBranch, Unlink, Hammer } from "lucide-react";

interface AddHabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode: "build" | "deconstruct";
  onAddHabit: (payload: {
    name: string;
    anchor: string;
    isRerouting: boolean;
    replacedRoutine?: string;
    frictionPatch?: string;
  }) => void;
  onAddBadHabit: (name: string, initialTriggers: string[]) => void;
}

export default function AddHabitDialog({
  isOpen,
  onClose,
  defaultMode,
  onAddHabit,
  onAddBadHabit,
}: AddHabitDialogProps) {
  const [mode, setMode] = useState<"build" | "deconstruct">(defaultMode);

  // State untuk Mode Membangun
  const [name, setName] = useState("");
  const [anchor, setAnchor] = useState("");
  const [isRerouting, setIsRerouting] = useState(false);
  const [replacedRoutine, setReplacedRoutine] = useState("");
  const [frictionPatch, setFrictionPatch] = useState("");

  // State untuk Mode Mengurai
  const [badHabitName, setBadHabitName] = useState("");
  const [triggersInput, setTriggersInput] = useState("");

  // Sinkronkan mode dialog dengan tab yang sedang dibuka user
  useEffect(() => {
    if (isOpen) setMode(defaultMode);
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setName("");
    setAnchor("");
    setIsRerouting(false);
    setReplacedRoutine("");
    setFrictionPatch("");
    setBadHabitName("");
    setTriggersInput("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "build") {
      if (!name.trim() || !anchor.trim()) return;
      onAddHabit({
        name,
        anchor,
        isRerouting,
        replacedRoutine: isRerouting ? replacedRoutine : undefined,
        frictionPatch: isRerouting ? frictionPatch : undefined,
      });
    } else {
      if (!badHabitName.trim()) return;
      // Pisahkan input koma menjadi array tag pemicu
      const parsedTriggers = triggersInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      onAddBadHabit(badHabitName, parsedTriggers);
    }

    resetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        {/* Header Dialog */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Tambah Entri Baru
          </h2>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pemilih Mode (Membangun vs Mengurai) */}
        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => setMode("build")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
              mode === "build"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Hammer className="h-3.5 w-3.5" />
            <span>Bangun Rutinitas</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("deconstruct")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
              mode === "deconstruct"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Unlink className="h-3.5 w-3.5" />
            <span>Urai Kebiasaan Lama</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "build" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kebiasaan yang Ingin Dibangun *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Baca buku 5 halaman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pemicu / Anchor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Setelah menyeduh kopi pagi"
                  value={anchor}
                  onChange={(e) => setAnchor(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Gunakan jangkar konkret: waktu spesifik, lokasi, atau aksi
                  yang sudah rutin.
                </p>
              </div>

              {/* Toggle Opsional Mode Re-routing */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsRerouting(!isRerouting)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition cursor-pointer ${
                    isRerouting
                      ? "border-blue-300 bg-blue-50/70 text-blue-800"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-blue-600" />
                    <span>Gantikan rutinitas lama di pemicu ini</span>
                  </span>
                  <span className="text-[11px] font-semibold">
                    {isRerouting ? "Aktif" : "Opsional"}
                  </span>
                </button>
              </div>

              {/* Kolom Tambahan Jika Re-routing Aktif */}
              {isRerouting && (
                <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Rutinitas lama yang digeser
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Buka media sosial 30 menit"
                      value={replacedRoutine}
                      onChange={(e) => setReplacedRoutine(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Pemutus jalur lama (Friction Patch)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Log out akun atau taruh HP di meja lain"
                      value={frictionPatch}
                      onChange={(e) => setFrictionPatch(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kebiasaan yang Ingin Dihentikan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Begadang scroll tanpa tujuan"
                  value={badHabitName}
                  onChange={(e) => setBadHabitName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pemicu Awal (Opsional, pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bosan, Jam 10 malam, Sendirian"
                  value={triggersInput}
                  onChange={(e) => setTriggersInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Kamu bisa menambah pemicu lain nanti setiap kali pola baru
                  terdeteksi.
                </p>
              </div>
            </>
          )}

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetAndClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-2xs hover:bg-blue-700 cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
