"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Plus,
  AlertCircle,
  ArrowRightCircle,
  ReceiptText,
} from "lucide-react";
import { BadHabit, EnvironmentPatch, SlipLog } from "@/types/habit";
import { detectDominantTrigger } from "@/utils/habitEngine";

interface DeconstructTabProps {
  badHabits: BadHabit[];
  patches: EnvironmentPatch[];
  slipLogs: SlipLog[];
  onAddTrigger: (badHabitId: string, trigger: string) => void;
  onAddPatch: (badHabitId: string, description: string) => void;
  onTogglePatch: (patchId: string) => void;
  onRecordSlip: (
    badHabitId: string,
    triggerUsed: string,
    costNote: string,
  ) => void;
  onPromoteToReroute: (anchorTrigger: string, badHabitName: string) => void;
}

export default function DeconstructTab({
  badHabits,
  patches,
  slipLogs,
  onAddTrigger,
  onAddPatch,
  onTogglePatch,
  onRecordSlip,
  onPromoteToReroute,
}: DeconstructTabProps) {
  // State lokal per kartu untuk input tambah pemicu, tambah patch, dan form slip log
  const [triggerDrafts, setTriggerDrafts] = useState<Record<string, string>>(
    {},
  );
  const [patchDrafts, setPatchDrafts] = useState<Record<string, string>>({});
  const [activeSlipFormId, setActiveSlipFormId] = useState<string | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const [costDraft, setCostDraft] = useState("");

  if (badHabits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
        Belum ada kebiasaan yang sedang diurai. Klik &ldquo;Kebiasaan
        Baru&rdquo; lalu pilih mode Urai Kebiasaan Lama.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {badHabits.map((bh) => {
        const habitPatches = patches.filter((p) => p.badHabitId === bh.id);
        const habitSlips = slipLogs.filter((s) => s.badHabitId === bh.id);
        const dominant = detectDominantTrigger(bh, slipLogs);

        return (
          <div
            key={bh.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
          >
            {/* Header Kartu */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800">{bh.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {habitSlips.length} catatan insiden •{" "}
                  {habitPatches.filter((p) => p.isApplied).length}/
                  {habitPatches.length} perisai aktif
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeSlipFormId === bh.id) {
                    setActiveSlipFormId(null);
                  } else {
                    setActiveSlipFormId(bh.id);
                    setSelectedTrigger(bh.triggers[0] || "");
                    setCostDraft("");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <ReceiptText className="h-3.5 w-3.5 text-slate-500" />
                <span>Catat Insiden</span>
              </button>
            </div>

            {/* Banner Saran Re-routing Otomatis (Jika 1 pemicu mendominasi >= 70%) */}
            {dominant && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                  <span>
                    <strong>{dominant.percentage}%</strong> insiden dipicu oleh{" "}
                    <strong>&ldquo;{dominant.trigger}&rdquo;</strong>. Alihkan
                    jalurnya ke kebiasaan baru?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onPromoteToReroute(dominant.trigger, bh.name)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
                >
                  <span>Buat Re-routing</span>
                  <ArrowRightCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Form Catat Insiden & Telemetri Biaya */}
            {activeSlipFormId === bh.id && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedTrigger.trim() || !costDraft.trim()) return;
                  onRecordSlip(bh.id, selectedTrigger, costDraft);
                  setActiveSlipFormId(null);
                  setCostDraft("");
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3"
              >
                <p className="text-xs font-semibold text-slate-700">
                  Audit Kejadian (Tanpa Reset Skor)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Pemicu yang Jebol
                    </label>
                    {bh.triggers.length > 0 ? (
                      <select
                        value={selectedTrigger}
                        onChange={(e) => setSelectedTrigger(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                      >
                        {bh.triggers.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="Tulis pemicunya..."
                        value={selectedTrigger}
                        onChange={(e) => setSelectedTrigger(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Biaya Riil Setelahnya *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Tidur telat 2 jam, pagi lemas"
                      value={costDraft}
                      onChange={(e) => setCostDraft(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSlipFormId(null)}
                    className="rounded-lg px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200/60 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-medium text-white hover:bg-slate-900 cursor-pointer"
                  >
                    Simpan Log Biaya
                  </button>
                </div>
              </form>
            )}

            {/* Bagian 1: Peta Multi-Pemicu */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-600">
                Peta Pemicu Terdeteksi
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {bh.triggers.map((trigger) => (
                  <span
                    key={trigger}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {trigger}
                  </span>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = triggerDrafts[bh.id] || "";
                    if (!val.trim()) return;
                    onAddTrigger(bh.id, val);
                    setTriggerDrafts((prev) => ({ ...prev, [bh.id]: "" }));
                  }}
                  className="inline-flex items-center gap-1"
                >
                  <input
                    type="text"
                    placeholder="+ Pemicu baru"
                    value={triggerDrafts[bh.id] || ""}
                    onChange={(e) =>
                      setTriggerDrafts((prev) => ({
                        ...prev,
                        [bh.id]: e.target.value,
                      }))
                    }
                    className="w-28 rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-700 focus:border-blue-400 focus:outline-none"
                  />
                </form>
              </div>
            </div>

            {/* Bagian 2: Tambalan Lingkungan (One-Time Setup) */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <span className="block text-xs font-semibold text-slate-600">
                Tambalan Lingkungan (Hambatan Sekali Pasang)
              </span>
              <div className="space-y-1.5">
                {habitPatches.map((patch) => (
                  <button
                    key={patch.id}
                    type="button"
                    onClick={() => onTogglePatch(patch.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1 text-left text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    <ShieldCheck
                      className={`h-4 w-4 shrink-0 ${
                        patch.isApplied ? "text-emerald-600" : "text-slate-300"
                      }`}
                    />
                    <span
                      className={
                        patch.isApplied
                          ? "text-slate-700 font-medium"
                          : "text-slate-500"
                      }
                    >
                      {patch.description}
                    </span>
                  </button>
                ))}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = patchDrafts[bh.id] || "";
                    if (!val.trim()) return;
                    onAddPatch(bh.id, val);
                    setPatchDrafts((prev) => ({ ...prev, [bh.id]: "" }));
                  }}
                  className="flex items-center gap-2 pt-1"
                >
                  <input
                    type="text"
                    placeholder="Tambah hambatan fisik/digital (misal: Taruh HP di luar kamar)..."
                    value={patchDrafts[bh.id] || ""}
                    onChange={(e) =>
                      setPatchDrafts((prev) => ({
                        ...prev,
                        [bh.id]: e.target.value,
                      }))
                    }
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-400 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-200/80 p-1.5 text-slate-600 hover:bg-slate-300 cursor-pointer"
                    title="Tambah hambatan"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Bagian 3: Struk Telemetri Biaya Terbaru */}
            {habitSlips.length > 0 && (
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Telemetri Dampak Terakhir
                </span>
                {habitSlips.slice(0, 3).map((slip) => (
                  <div
                    key={slip.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs"
                  >
                    <span className="text-slate-700">
                      <strong className="text-slate-800">
                        [{slip.triggerUsed}]
                      </strong>{" "}
                      {slip.costNote}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {slip.occurredAt.slice(0, 10)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
