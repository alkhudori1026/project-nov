// src/components/project/CalendarCard.tsx

import { Calendar as CalendarIcon } from "lucide-react";
import { CalendarItem } from "@/types/productivity";
import { formatShortDate, getCalendarBadge } from "@/utils/projectHelpers";

interface CalendarCardProps {
  calendarItems: CalendarItem[];
}

export default function CalendarCard({ calendarItems }: CalendarCardProps) {
  return (
    <div className="bg-white border border-slate-200 w-full p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl text-slate-800 tracking-tight">
          Calendar
        </h2>
        <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">
          {calendarItems.length} Jadwal
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
        {calendarItems.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-6 text-center">
            Tidak ada komitmen waktu terjadwal.
          </p>
        ) : (
          calendarItems.map((cal) => {
            const badge = getCalendarBadge(cal.calendarType);
            return (
              <div
                key={cal.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shrink-0 min-w-[54px]">
                    <span className="text-xs font-bold text-slate-800">
                      {formatShortDate(cal.date)}
                    </span>
                    {cal.time && (
                      <span className="text-[10px] font-semibold text-rose-600">
                        {cal.time}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {cal.title}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badge.style}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                <CalendarIcon className="size-4 text-slate-300 shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
