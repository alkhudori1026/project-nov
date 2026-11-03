"use client";

import IconButton from "./IconButon";
import {
  Zap,
  XCircle,
  AlertTriangle,
  Coffee,
  Pencil,
  Bed,
  BatteryLow,
} from "lucide-react";

// Kontrak data harus sama dengan yang ada di page.tsx
interface FlowState {
  id: string;
  start: string;
  end: string;
}
interface MissedTask {
  id: string;
  task: string;
  tag: string;
}
interface Distraction {
  id: string;
  distraction: string;
  start: string;
  end: string;
}
interface RestingActivity {
  id: string;
  name: string;
}

interface EvaluasiHarian {
  id: string;
  flowStates: FlowState[];
  crashTime: string; // Data tunggal
  missedTasks: MissedTask[];
  distractions: Distraction[];
  sleepDuration: string; // Data tunggal (sebelumnya inputSleepTag/sleepTime)
  morningFeeling: string; // Data tunggal
  restingActivities: RestingActivity[];
}

interface EvaluationLogProps {
  evaluasi: EvaluasiHarian;
  onEdit: (data: EvaluasiHarian) => void;
}

export default function EvaluationLog({
  evaluasi,
  onEdit,
}: EvaluationLogProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm group relative">
      {/* Tombol Edit Mengambang (Muncul saat Hover) */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <IconButton
          icon={Pencil}
          onClick={() => onEdit(evaluasi)}
          className="w-8 h-8 !bg-blue-50 !text-blue-500 hover:!bg-blue-100"
        />
      </div>

      <h3 className="font-bold text-slate-800 mb-4">Laporan Evaluasi</h3>

      {/* Grid untuk Data Tunggal */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Bed className="w-4 h-4" />{" "}
            <span className="text-xs font-bold">Tidur Semalam</span>
          </div>
          <p className="font-medium text-slate-700">
            {evaluasi.sleepDuration || "-"} • {evaluasi.morningFeeling || "-"}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <BatteryLow className="w-4 h-4" />{" "}
            <span className="text-xs font-bold">Titik Lelah (Crash)</span>
          </div>
          <p className="font-medium text-slate-700">
            {evaluasi.crashTime || "-"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. KARTU FLOW STATE (Fokus Optimal) */}
        {evaluasi.flowStates.length > 0 && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Puncak Fokus (Flow)
              </h3>
            </div>
            {evaluasi.flowStates.map((item) => (
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

        {/* 2. KARTU TUGAS TERLEWAT (Missed Tasks) */}
        {evaluasi.missedTasks.length > 0 && (
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">
                Tertunda / Terlewat
              </h3>
            </div>
            {evaluasi.missedTasks.map((item) => (
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

        {/* 3. KARTU DISTRAKSI (Hambatan) */}
        {evaluasi.distractions.length > 0 && (
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Distraksi
              </h3>
            </div>
            {evaluasi.distractions.map((item) => (
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

        {/* 4. KARTU PEMULIHAN (Resting) */}
        {evaluasi.restingActivities.length > 0 && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Pengisi Energi
              </h3>
            </div>
            {evaluasi.restingActivities.map((item) => (
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
