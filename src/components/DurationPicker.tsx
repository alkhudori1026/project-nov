"use client";

import { useState, useRef, useEffect } from "react";
import { Timer } from "lucide-react";

interface DurationPickerProps {
  onPilihDurasi: (durasiTeks: string) => void;
  durasiTerpilih?: string;
}

export default function DurationPicker({
  onPilihDurasi,
  durasiTerpilih = "",
}: DurationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jam, setJam] = useState(0);
  const [menit, setMenit] = useState(0);

  // Sensor perimeter untuk menutup popover jika area luar diklik
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tanganiKlikLuar = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", tanganiKlikLuar);
    return () => document.removeEventListener("mousedown", tanganiKlikLuar);
  }, [isOpen]);

  // 2. Sensor Pembersih: Jika page.tsx mengirim teks kosong, reset jam & menit ke 0
  useEffect(() => {
    if (durasiTerpilih === "") {
      setJam(0);
      setMenit(0);
    }
  }, [durasiTerpilih]);

  // Fungsi mesin pengonversi format
  const konfirmasiDurasi = () => {
    // Mengubah nilai angka murni menjadi format string M3: "1 j 30 m"
    const teksHasil = `${jam} j ${menit} m`;

    // Kirim hasilnya ke atas (ke page.tsx)
    onPilihDurasi(teksHasil);

    // Tutup mesin setelah eksekusi
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left min-w-fit" ref={popoverRef}>
      {/* Saklar Pemicu (Trigger) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Timer className="w-5 h-5 text-slate-500" />
        <span>{durasiTerpilih ? durasiTerpilih : "Durasi"}</span>
      </button>

      {/* Mesin Popover (Laci Operasional) */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-64 p-4 origin-top-right bg-white border border-slate-200 shadow-xl rounded-3xl">
          <p className="text-sm font-semibold text-slate-700 mb-4 text-center">
            Atur Durasi
          </p>

          <div className="flex gap-4 mb-6">
            {/* Kolom Jam */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">
                Jam
              </span>
              <div className="h-32 w-full overflow-y-auto no-scrollbar flex flex-col items-center gap-1 border-y border-slate-100 py-2 scroll-smooth">
                {Array.from({ length: 7 }).map(
                  (
                    _,
                    i, // 0 sampai 12 jam
                  ) => (
                    <button
                      key={`jam-${i}`}
                      onClick={() => setJam(i)}
                      className={`w-full py-1.5 text-center rounded-lg text-sm font-medium transition-colors ${
                        jam === i
                          ? "bg-blue-100 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {i}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Kolom Menit */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">
                Menit
              </span>
              <div className="h-32 w-full overflow-y-auto no-scrollbar flex flex-col items-center gap-1 border-y border-slate-100 py-2 scroll-smooth">
                {[0, 10, 20, 30, 40, 50].map(
                  (
                    m, // Kelipatan 5 menit
                  ) => (
                    <button
                      key={`menit-${m}`}
                      onClick={() => setMenit(m)}
                      className={`w-full py-1.5 text-center rounded-lg text-sm font-medium transition-colors ${
                        menit === m
                          ? "bg-blue-100 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {m}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <button
            onClick={konfirmasiDurasi}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Terapkan
          </button>
        </div>
      )}
    </div>
  );
}
