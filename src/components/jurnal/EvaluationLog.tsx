"use client";

import {
  AlertTriangle,
  BatteryLow,
  Bed,
  Coffee,
  Pencil,
  XCircle,
  Zap,
} from "lucide-react";
import { HydratedEvaluation } from "@/types/jurnal";
import IconButton from "../IconButon";

interface EvaluationLogProps {
  evaluation: HydratedEvaluation;
  onEdit: (data: HydratedEvaluation) => void;
}

export default function EvaluationLog({
  evaluation,
  onEdit,
}: EvaluationLogProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm group relative">
      {/* Tombol Edit Mengambang */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <IconButton
          icon={Pencil}
          onClick={() => onEdit(evaluation)}
          className="w-8 h-8 !bg-blue-50 !text-blue-500 hover:!bg-blue-100"
        />
      </div>

      <h3 className="font-bold text-slate-800 mb-4">Laporan Evaluasi</h3>

      {/* Grid Data Tunggal */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Bed className="w-4 h-4" />
            <span className="text-xs font-bold">Tidur Semalam</span>
          </div>
          <p className="font-medium text-slate-700">
            {evaluation.sleepDuration || "-"} •{" "}
            {evaluation.morningFeeling || "-"}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <BatteryLow className="w-4 h-4" />
            <span className="text-xs font-bold">Titik Lelah (Crash)</span>
          </div>
          <p className="font-medium text-slate-700">
            {evaluation.crashTime || "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Kartu Flow State */}
        {evaluation.flowStates.length > 0 && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Puncak Fokus (Flow)
              </h3>
            </div>
            {evaluation.flowStates.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-l-2 border-blue-400 pl-3"
              >
                <span className="font-medium text-sm text-slate-700">
                  Sesi Mendalam
                </span>
                <span className="text-xs text-slate-500 font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100 shrink-0">
                  {item.start} - {item.end}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 2. Kartu Tugas Terlewat */}
        {evaluation.missedTasks.length > 0 && (
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">
                Tertunda / Terlewat
              </h3>
            </div>
            {evaluation.missedTasks.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-l-2 border-red-400 pl-3 gap-2"
              >
                <p className="font-medium text-sm text-slate-700 truncate">
                  {item.task}
                </p>
                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md shrink-0">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 3. Kartu Distraksi */}
        {evaluation.distractions.length > 0 && (
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Distraksi
              </h3>
            </div>
            {evaluation.distractions.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-l-2 border-amber-400 pl-3 gap-2"
              >
                <p className="font-medium text-sm text-slate-700 truncate">
                  {item.distraction}
                </p>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">
                  {item.start} - {item.end}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 4. Kartu Pemulihan */}
        {evaluation.restingActivities.length > 0 && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Pengisi Energi
              </h3>
            </div>
            {evaluation.restingActivities.map((item) => (
              <div
                key={item.id}
                className="flex items-center border-l-2 border-emerald-400 pl-3"
              >
                <p className="font-medium text-sm text-slate-700">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
