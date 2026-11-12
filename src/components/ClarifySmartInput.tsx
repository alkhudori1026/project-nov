// components/ClarifySmartInput.tsx
"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  FolderGit2,
  BookOpen,
  Trash2,
  Undo2,
  ArrowRight,
  Inbox,
} from "lucide-react";

export default function ClarifyVisualLayout({
  onClose,
}: {
  onClose: () => void;
}) {
  // Simulasi Antrean Inbox
  const [inboxQueue, setInboxQueue] = useState([
    { id: 1, text: "Perpanjang domain portofolio web" },
    { id: 2, text: "Artikel bagus tentang Micro-frontend" },
    { id: 3, text: "Beli kopi bubuk" },
  ]);

  // State untuk mode meja tengah: "pilih_destinasi" atau "isi_form"
  const [activeStep, setActiveStep] = useState<"pilih_destinasi" | "isi_form">(
    "pilih_destinasi",
  );
  const [selectedDest, setSelectedDest] = useState<string | null>(null);

  // Simulasi Notifikasi Undo Makro
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Ambil data teratas
  const currentItem = inboxQueue[0];

  // Fungsi saat tombol destinasi (Kanan) diklik
  const handleSelectDestination = (dest: string) => {
    if (dest === "trash" || dest === "do_now") {
      // Tindakan instan, tidak butuh form
      commitAction();
    } else {
      // Buka form untuk melengkapi data
      setSelectedDest(dest);
      setActiveStep("isi_form");
    }
  };

  // Fungsi eksekusi (Membuang dari antrean)
  const commitAction = () => {
    const processedItem = inboxQueue.shift(); // Ambil dari antrean
    setInboxQueue([...inboxQueue]);
    setActiveStep("pilih_destinasi");

    // Munculkan jaring pengaman makro
    setShowUndoToast(true);
    setTimeout(() => setShowUndoToast(false), 5000); // Hilang dalam 5 detik
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col p-4 md:p-8">
      {/* Header / Navigasi Keluar */}
      <div className="flex justify-between items-center mb-6 max-w-[1600px] w-full mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Inbox className="size-6 text-blue-600" /> Mode Sortir
        </h1>
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>

      {/* Grid 3 Kolom ala Kantor Pos */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6 max-w-[1600px] w-full mx-auto flex-1">
        {/* KOLOM 1: ANTREAN INBOX (ZONA KIRI) */}
        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-slate-500 uppercase tracking-widest text-sm flex justify-between">
            Sisa Antrean <span>{inboxQueue.length}</span>
          </h2>
          <div className="flex flex-col gap-3 opacity-60 pointer-events-none">
            {/* Tampilkan sisa antrean sebagai konteks visual (dimmed) */}
            {inboxQueue.slice(1).map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 truncate"
              >
                {item.text}
              </div>
            ))}
            {inboxQueue.length <= 1 && (
              <p className="text-sm text-slate-400 text-center mt-4">
                Tidak ada antrean lain.
              </p>
            )}
          </div>
        </div>

        {/* KOLOM 2: MEJA INSPEKSI (ZONA TENGAH) */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col relative">
          {currentItem ? (
            <>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">
                Sedang Diproses
              </p>
              <h2 className="text-3xl font-medium text-slate-800 leading-tight mb-8">
                "{currentItem.text}"
              </h2>

              {/* Pergantian State: Nunggu Keputusan vs Ngisi Form */}
              {activeStep === "pilih_destinasi" ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 font-medium text-lg">
                  <ArrowRight className="size-6 mr-2" /> Pilih rumah di kolom
                  kanan
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 bg-blue-50 border border-blue-100 rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="font-semibold text-blue-800 text-lg">
                    Lengkapi Detail {selectedDest}
                  </h3>
                  {/* Contoh Form sederhana */}
                  <input
                    type="text"
                    placeholder="Tambahkan konteks/catatan..."
                    className="w-full p-3 rounded-xl border border-slate-200 mt-2"
                  />

                  <div className="flex justify-end gap-3 mt-auto pt-4">
                    {/* PENGAMAN LAPIS 1: Tombol Batal untuk kembali milih destinasi */}
                    <button
                      onClick={() => setActiveStep("pilih_destinasi")}
                      className="px-5 py-2.5 text-slate-500 font-medium hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={commitAction}
                      className="px-6 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                    >
                      Simpan Data
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <CheckCircle2 className="size-16 mb-4 text-emerald-400" />
              <p className="text-xl font-medium text-slate-600">
                Inbox Kosong (Zero Inbox)
              </p>
              <p className="text-sm">Semua ide sudah disortir.</p>
            </div>
          )}
        </div>

        {/* KOLOM 3: DESTINASI (ZONA KANAN) */}
        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Jalur GTD (Action)
            </h3>
            <button
              onClick={() => handleSelectDestination("do_now")}
              className="flex items-center gap-3 p-4 bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl text-emerald-700 font-medium transition-all text-left group"
            >
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200">
                <CheckCircle2 className="size-5" />
              </div>
              <span>Lakukan Sekarang (&lt; 2m)</span>
            </button>
            <button
              onClick={() => handleSelectDestination("Next Action")}
              className="flex items-center gap-3 p-4 bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-blue-700 font-medium transition-all text-left group"
            >
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200">
                <ArrowRight className="size-5" />
              </div>
              <span>Jadikan Next Action</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Jalur PARA (Informasi)
            </h3>
            <button
              onClick={() => handleSelectDestination("Project")}
              className="flex items-center gap-3 p-4 bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-indigo-700 font-medium transition-all text-left group"
            >
              <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200">
                <FolderGit2 className="size-5" />
              </div>
              <span>Kirim ke Project</span>
            </button>
            <button
              onClick={() => handleSelectDestination("Reference")}
              className="flex items-center gap-3 p-4 bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-xl text-amber-700 font-medium transition-all text-left group"
            >
              <div className="bg-amber-100 p-2 rounded-lg group-hover:bg-amber-200">
                <BookOpen className="size-5" />
              </div>
              <span>Jadikan Referensi</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-200">
            <button
              onClick={() => handleSelectDestination("trash")}
              className="flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors"
            >
              <Trash2 className="size-4" /> Hapus / Trash
            </button>
          </div>
        </div>
      </div>

      {/* PENGAMAN LAPIS 2: Toast Undo Makro (Melayang di bawah) */}
      {showUndoToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">
            Ide dipindahkan ke destinasi.
          </span>
          <button
            onClick={() => setShowUndoToast(false)}
            className="flex items-center gap-1 text-blue-300 hover:text-blue-100 text-sm font-bold uppercase tracking-wide"
          >
            <Undo2 className="size-4" /> Batal (Undo)
          </button>
        </div>
      )}
    </div>
  );
}
