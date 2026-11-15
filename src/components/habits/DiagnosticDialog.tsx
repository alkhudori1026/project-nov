"use client";

import { useState, useEffect } from "react";
import {
  X,
  ArrowLeft,
  ShieldAlert,
  Anchor,
  BatteryLow,
  PauseCircle,
  Trash2,
  Lock,
} from "lucide-react";
import { Habit } from "@/types/habit";
import { canDownscaleHabit } from "@/utils/habitEngine";

type DiagnosticStep = "select" | "patch" | "reanchor" | "energy";

interface DiagnosticDialogProps {
  habit: Habit | null;
  onClose: () => void;
  onUpdatePatch: (habitId: string, newPatch: string) => void;
  onRebindAnchor: (
    habitId: string,
    newAnchor: string,
    newReplacedRoutine?: string,
  ) => void;
  onDownscale: (habitId: string, smallerName: string) => void;
  onPauseWithTTL: (habitId: string, days: number) => void;
  onDelete: (habitId: string) => void;
}

export default function DiagnosticDialog({
  habit,
  onClose,
  onUpdatePatch,
  onRebindAnchor,
  onDownscale,
  onPauseWithTTL,
  onDelete,
}: DiagnosticDialogProps) {
  const [step, setStep] = useState<DiagnosticStep>("select");

  // State formulir untuk masing-masing cabang perbaikan
  const [patchDraft, setPatchDraft] = useState("");
  const [anchorDraft, setAnchorDraft] = useState("");
  const [routineDraft, setRoutineDraft] = useState("");
  const [smallerNameDraft, setSmallerNameDraft] = useState("");
  const [pauseDays, setPauseDays] = useState<number>(7);

  // Reset isi formulir setiap kali kartu habit yang dievaluasi berganti
  useEffect(() => {
    if (habit) {
      setStep("select");
      setPatchDraft(habit.frictionPatch || "");
      setAnchorDraft(habit.anchor);
      setRoutineDraft(habit.replacedRoutine || "");
      setSmallerNameDraft(habit.name);
      setPauseDays(7);
    }
  }, [habit]);

  if (!habit) return null;

  const isDownscaleAllowed = canDownscaleHabit(habit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header Dialog */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {step !== "select" && (
              <button
                type="button"
                onClick={() => setStep("select")}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                title="Kembali ke pilihan diagnosis"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Diagnostik Hambatan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{habit.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================================================================ */}
        {/* LANGKAH 1: PILIH AKAR MASALAH                                    */}
        {/* ================================================================ */}
        {step === "select" && (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-600 mb-3">
              Progresmu tidak di-reset. Pilih kondisi yang paling menggambarkan
              hambatanmu saat ini:
            </p>

            {/* Cabang 1: Khusus Mode Re-routing */}
            {habit.isRerouting && (
              <button
                type="button"
                onClick={() => setStep("patch")}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer"
              >
                <ShieldAlert className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Masih terbawa rutinitas lama
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Jalur menuju &ldquo;
                    {habit.replacedRoutine || "rutinitas lama"}&rdquo; masih
                    terlalu mudah diakses.
                  </p>
                </div>
              </button>
            )}

            {/* Cabang 2: Re-anchoring */}
            <button
              type="button"
              onClick={() => setStep("reanchor")}
              className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer"
            >
              <Anchor className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Pemicu hilang atau jadwal berubah
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jangkar &ldquo;{habit.anchor}&rdquo; sedang tidak terjadi
                  dalam rutinitasmu.
                </p>
              </div>
            </button>

            {/* Cabang 3: Downscaling, Jeda TTL, atau Hapus */}
            <button
              type="button"
              onClick={() => setStep("energy")}
              className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer"
            >
              <BatteryLow className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Terasa terlalu berat atau kehilangan dorongan
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perkecil dosis standar, ambil jeda terukur, atau evaluasi
                  relevansinya.
                </p>
              </div>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* CABANG 1: PERKUAT FRICTION PATCH (MODE RE-ROUTING)               */}
        {/* ================================================================ */}
        {step === "patch" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!patchDraft.trim()) return;
              onUpdatePatch(habit.id, patchDraft);
              onClose();
            }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900">
              Rutinitas lama{" "}
              <strong>{habit.replacedRoutine || "sebelumnya"}</strong> menang
              karena friksinya lebih rendah. Pasang penghalang yang lebih tegas.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pemutus Jalur Lama Baru (Friction Patch)
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Hapus aplikasi dari HP, bukan cuma log out"
                value={patchDraft}
                onChange={(e) => setPatchDraft(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
              Perbarui Penghalang & Lanjutkan
            </button>
          </form>
        )}

        {/* ================================================================ */}
        {/* CABANG 2: GANTI PEMICU (RE-ANCHORING)                            */}
        {/* ================================================================ */}
        {step === "reanchor" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!anchorDraft.trim()) return;
              onRebindAnchor(
                habit.id,
                anchorDraft,
                habit.isRerouting ? routineDraft : undefined,
              );
              onClose();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pemicu / Anchor Pengganti *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Tepat setelah makan siang"
                value={anchorDraft}
                onChange={(e) => setAnchorDraft(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {habit.isRerouting && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rutinitas Lama di Pemicu Baru (Opsional)
                </label>
                <input
                  type="text"
                  value={routineDraft}
                  onChange={(e) => setRoutineDraft(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
              Tempelkan ke Pemicu Baru
            </button>
          </form>
        )}

        {/* ================================================================ */}
        {/* CABANG 3: FILTER TUJUAN, DOWNSCALING, TTL PAUSE, & GARBAGE COLLECT */}
        {/* ================================================================ */}
        {step === "energy" && (
          <div className="space-y-5">
            {/* Filter Relevansi Tujuan (Jika sudah diisi via Progressive Profiling) */}
            {habit.purpose && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">
                  Tujuan awalmu:
                </span>{" "}
                &ldquo;{habit.purpose}&rdquo;
                <p className="text-slate-500 mt-1">
                  Jika tujuan ini sudah tidak sejalan dengan prioritasmu
                  sekarang, lepaskan saja di bagian bawah.
                </p>
              </div>
            )}

            {/* Bagian A: Perkecil Skala (Dilindungi Circuit Breaker 2x) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  1. Perkecil Dosis (Micro-Habit)
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Jatah: {habit.downscaleCount}/2x
                </span>
              </div>

              {isDownscaleAllowed ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!smallerNameDraft.trim()) return;
                    onDownscale(habit.id, smallerNameDraft);
                    onClose();
                  }}
                  className="space-y-2"
                >
                  <input
                    type="text"
                    required
                    placeholder="Ubah ke versi paling ringan yang mustahil gagal..."
                    value={smallerNameDraft}
                    onChange={(e) => setSmallerNameDraft(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    Terapkan Dosis Lebih Kecil
                  </button>
                </form>
              ) : (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <Lock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    <strong>Circuit Breaker aktif:</strong> Skala sudah
                    diperkecil 2x. Ambil jeda terukur di bawah atau hapus
                    sementara agar tidak menjadi beban mental.
                  </span>
                </div>
              )}
            </div>

            {/* Bagian B: Jeda Sementara dengan TTL Wajib */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <span className="block text-xs font-bold text-slate-800">
                2. Berhenti Sementara (Dengan Batas Waktu)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 7, 14, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setPauseDays(days)}
                    className={`rounded-lg border py-1.5 text-xs font-medium transition cursor-pointer ${
                      pauseDays === days
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {days} Hari
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  onPauseWithTTL(habit.id, pauseDays);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <PauseCircle className="h-4 w-4 text-slate-500" />
                <span>Tidurkan Selama {pauseDays} Hari</span>
              </button>
            </div>

            {/* Bagian C: Garbage Collection (Hapus Permanen) */}
            <div className="border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  onDelete(habit.id);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sudah Tidak Relevan (Hapus)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
