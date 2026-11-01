"use client";

import { useState, useRef, useEffect } from "react";
import { Tag as TagIcon, Plus, Search } from "lucide-react";

// Kontrak data untuk mesin TagPicker
interface TagPickerProps {
  daftarTag: string[]; // Contoh: ["Education", "Skills", "Hobby"]
  tagTerpilih: string;
  onPilihTag: (tag: string) => void;
  onBuatTagBaru: (tagBaru: string) => void;
  isCompact?: boolean; // 👈 PROPERTI BARU
}

export default function TagPicker({
  daftarTag,
  tagTerpilih,
  onPilihTag,
  onBuatTagBaru,
  isCompact = false,
}: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [kataKunci, setKataKunci] = useState("");

  // Sensor penutup otomatis (Click Outside)
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

  // --- LOGIKA MESIN PENYARING & PABRIK ---

  // 1. Saring tag yang mengandung huruf dari kata kunci
  const tagTersaring = daftarTag.filter((t) =>
    t.toLowerCase().includes(kataKunci.toLowerCase()),
  );

  // 2. Cek apakah ketikan persis sama dengan salah satu tag (agar tidak duplikat)
  const apakahAdaPencocokanPenuh = daftarTag.some(
    (t) => t.toLowerCase() === kataKunci.trim().toLowerCase(),
  );

  // 3. Izin mencetak tag baru jika ada teks dan belum ada yang persis sama
  const bisaBuatBaru = kataKunci.trim() !== "" && !apakahAdaPencocokanPenuh;

  // Fungsi saat tag dipilih atau dicetak
  const konfirmasiPilihan = (tag: string, apakahBaru: boolean = false) => {
    if (apakahBaru) {
      onBuatTagBaru(tag);
    } else {
      onPilihTag(tag);
    }
    setIsOpen(false); // Tutup laci
    setKataKunci(""); // Bersihkan memori ketikan
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Saklar Pemicu yang Dimodifikasi */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group/picker flex items-center transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
          ${
            isCompact
              ? `h-8 px-1.5 rounded-full ${tagTerpilih ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`
              : `px-4 py-2 rounded-full gap-2 font-medium text-sm ${tagTerpilih ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`
          }
        `}
      >
        <TagIcon className={`${isCompact ? "w-4 h-4 shrink-0" : "w-4 h-4"}`} />

        {/* Trik Mesin Grid Ekspansi */}
        <div
          className={`grid transition-all duration-300 delay-700 ease-out ${
            isCompact
              ? isOpen
                ? "grid-cols-[1fr]"
                : "grid-cols-[0fr] group-hover/picker:grid-cols-[1fr]"
              : "grid-cols-[1fr]"
          }`}
        >
          <span
            className={`overflow-hidden whitespace-nowrap ${isCompact ? "text-xs font-semibold" : ""}`}
          >
            <span className={isCompact ? "pl-1.5 pr-1" : ""}>
              {tagTerpilih ? tagTerpilih : "Tag"}
            </span>
          </span>
        </div>
      </button>

      {/* LACI OPERASIONAL (COMBOBOX) */}
      {isOpen && (
        <div className="absolute left-0 left-0 mb-2 z-50 w-56 origin-top-right bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden flex flex-col">
          {/* Area Pencarian */}
          <div className="flex items-center gap-2 px-3 border-b border-slate-100 bg-slate-50">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Cari atau buat tag..."
              className="w-full py-2.5 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-700"
              autoFocus // Otomatis aktifkan kursor saat laci terbuka
            />
          </div>

          {/* Area Daftar Pilihan */}
          <div className="max-h-48 overflow-y-auto no-scrollbar py-1 flex flex-col">
            {/* Opsi: Buat Tag Baru */}
            {bisaBuatBaru && (
              <button
                onClick={() => konfirmasiPilihan(kataKunci.trim(), true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-left text-blue-600 hover:bg-blue-50 transition-colors w-full"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">Buat "{kataKunci.trim()}"</span>
              </button>
            )}

            {/* Opsi: Daftar Tag Tersaring */}
            {tagTersaring.length > 0
              ? tagTersaring.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => konfirmasiPilihan(tag)}
                    className={`flex items-center px-3 py-2 text-sm text-left transition-colors w-full ${
                      tagTerpilih === tag
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{tag}</span>
                  </button>
                ))
              : // Kondisi: Tidak ketemu dan input kosong
                !bisaBuatBaru && (
                  <div className="px-3 py-3 text-sm text-slate-400 text-center italic">
                    Tidak ada tag.
                  </div>
                )}
          </div>
        </div>
      )}
    </div>
  );
}
