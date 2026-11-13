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
  Save,
} from "lucide-react";
import { text } from "stream/consumers";

export default function InboxOrganizer({ onClose }: { onClose: () => void }) {
  // Simulasi Antrean Inbox
  const [inboxQueue, setInboxQueue] = useState([
    { id: 1, text: "Perpanjang domain portofolio web" },
    { id: 2, text: "Artikel bagus tentang Micro-frontend" },
    { id: 3, text: "Beli kopi bubuk" },
  ]);

  const [selectedItemId, setSelectedItemId] = useState<number | null>(
    inboxQueue.length > 0 ? inboxQueue[0].id : null,
  );

  // State untuk mode meja tengah: "pilih_destinasi" atau "isi_form"
  const [activeStep, setActiveStep] = useState<"pilih_destinasi" | "isi_form">(
    "pilih_destinasi",
  );
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Ambil data teratas
  const currentItem =
    inboxQueue.find((item) => item.id === selectedItemId) || null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-350 mx-auto">
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
        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 flex flex-col gap-5 max-h-[85vh] overflow-hidden flex-shrink-0">
          <h2 className="font-semibold text-slate-500 uppercase tracking-widest text-sm flex justify-between items-center">
            Draft Catatan
            {/* Lencana (Badge) indikator jumlah sisa */}
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">
              {inboxQueue.length}
            </span>
          </h2>

          <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-4 h-full">
            {inboxQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                <CheckCircle2 className="size-8 opacity-50" />
                <p className="text-sm text-center">
                  Tidak ada draf.
                  <br />
                  Kotak masuk bersih!
                </p>
              </div>
            ) : (
              // Looping semua item di antrean
              inboxQueue.map((item) => {
                // Evaluasi apakah kotak ini adalah kotak yang sedang aktif
                const isActive = currentItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-white border-blue-400 shadow-sm ring-1 ring-blue-100" // Desain saat aktif
                        : "bg-transparent border-slate-200 opacity-60 hover:opacity-100 hover:bg-white hover:shadow-sm" // Desain saat diam (pasif)
                    }`}
                  >
                    <p
                      className={`text-sm line-clamp-2 leading-relaxed ${
                        isActive
                          ? "text-blue-800 font-medium"
                          : "text-slate-600"
                      }`}
                    >
                      {item.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KOLOM 2: MEJA INSPEKSI (ZONA TENGAH) */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col relative">
          {currentItem ? (
            <>
              <p className="text-sm font-semibold text-blue-600 tracking-widest mb-4">
                Dimana ide ini ditempatkan?
              </p>
              <div className="flex flex-1 flex-col gap-4 mb-4">
                <input
                  type="text"
                  value={currentItem.text}
                  className="text-3xl font-medium text-center text-slate-800 leading-tight outline-none"
                ></input>
                <div className="rounded-2xl border border-slate-200 bg-slate-100 h-full p-2 gap-2 ">
                  <p className="text-slate-400 text-sm italic">description</p>
                  <input
                    type="text"
                    id="description"
                    className="outline-none size-full"
                  ></input>
                </div>
              </div>
              {/* Pergantian State: Nunggu Keputusan vs Ngisi Form */}
              <div className="flex flex-col gap-4 bg-blue-50 border border-blue-100 rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                {/* 
    KUNCI PERBAIKAN: Gunakan flex-wrap dan w-full. 
    Ini membuat tombol di baris atas dan panel di baris bawah menjadi saudara (siblings) satu level,
    sehingga fungsi peer bisa bekerja dengan sempurna.
  */}
                <div className="flex flex-wrap gap-x-3 w-full">
                  {/* PEER 1: Tombol Tindakan */}
                  <button className="peer/action flex-1 flex items-center gap-2 p-2 mb-2 bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl text-emerald-700 font-medium transition-all text-left group">
                    <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <span className="text-sm">Tindakan</span>
                  </button>

                  {/* PEER 2: Tombol Ide */}
                  <button className="peer/idea flex-1 flex items-center gap-2 p-2 mb-2 bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-blue-700 font-medium transition-all text-left group">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200">
                      <ArrowRight className="size-5" />
                    </div>
                    <span className="text-sm">Ide (PARA)</span>
                  </button>

                  {/* --- AREA PANEL BAWAH --- */}

                  {/* PANEL TINDAKAN (Action) */}
                  {/* hover:grid-rows-[1fr] mencegah menu tertutup saat kursor mouse pindah ke area panel ini */}
                  <div className="w-full grid grid-rows-[0fr] peer-hover/action:grid-rows-[1fr] hover:grid-rows-[1fr] transition-all delay-300 duration-300 ease-out">
                    {/* pt-3 (padding top) diletakkan di elemen dalam agar tidak merusak animasi dari 0px */}
                    <div className="overflow-hidden flex flex-col gap-2 transition-opacity duration-300">
                      <button className="flex items-center gap-2 p-2 w-full bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl text-emerald-700 font-medium transition-all text-left group">
                        <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200">
                          <CheckCircle2 className="size-4" />
                        </div>
                        <span className="text-sm">Tugas Ringan (2m)</span>
                      </button>
                      <button className="flex items-center gap-2 p-2 w-full bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl text-emerald-700 font-medium transition-all text-left group">
                        <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200">
                          <FolderGit2 className="size-4" />
                        </div>
                        <span className="text-sm">Jadikan Next Action</span>
                      </button>
                      <button className="flex items-center gap-2 p-2 w-full bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl text-emerald-700 font-medium transition-all text-left group">
                        <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200">
                          <FolderGit2 className="size-4" />
                        </div>
                        <span className="text-sm">Masukkan ke Project</span>
                      </button>
                    </div>
                  </div>

                  {/* PANEL IDE (PARA) */}
                  <div className="w-full grid grid-rows-[0fr] peer-hover/idea:grid-rows-[1fr] hover:grid-rows-[1fr] transition-all delay-300 duration-300 ease-out">
                    <div className="overflow-hidden flex flex-col gap-2 transition-opacity duration-300">
                      <button className="flex items-center gap-2 p-2 w-full bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-indigo-700 font-medium transition-all text-left group">
                        <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200">
                          <FolderGit2 className="size-4" />
                        </div>
                        <span className="text-sm">Kirim ke Project</span>
                      </button>
                      <button className="flex items-center gap-2 p-2 w-full bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-indigo-700 font-medium transition-all text-left group">
                        <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200">
                          <FolderGit2 className="size-4" />
                        </div>
                        <span className="text-sm">Kirim ke Area</span>
                      </button>
                      <button className="flex items-center gap-2 p-2 w-full bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-xl text-amber-700 font-medium transition-all text-left group">
                        <div className="bg-amber-100 p-2 rounded-lg group-hover:bg-amber-200">
                          <BookOpen className="size-4" />
                        </div>
                        <span className="text-sm">Jadikan Referensi</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Area Tombol Aksi Bawah */}
                <div className="grid grid-cols-[1fr_auto] gap-3 mt-auto pt-6 border-t border-blue-200/50">
                  <button className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm">
                    Simpan Data Mentah
                  </button>
                  <button className="group flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors">
                    <Trash2 className="size-4" />
                    <div className="grid grid-cols-[0fr] group-hover:ml-2 group-hover:grid-cols-[1fr] transition-all duration-300 ease-out">
                      <p className="text-nowrap w-full opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out overflow-hidden text-sm">
                        Hapus Catatan
                      </p>
                    </div>
                  </button>
                </div>
              </div>
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
          <h2>Tempat Penyimpanan</h2>
          <div className="flex flex-col gap-2 bg-white border border-slate-100 rounded-2xl p-4">
            <h3 className="text-slate-400 mb-2">Second Brain [PARA]</h3>
            <div className="group bg-blue-100 rounded-lg">
              <h4 className="bg-blue-200 border border-blue-300 p-2 text-lg rounded-lg">
                Project
              </h4>
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out">
                <div className="flex flex-col gap-1 ml-2 opacity-60 overflow-hidden">
                  <p>item</p>
                  <p>item</p>
                  <p>item</p>
                </div>
              </div>
            </div>
            <div className="group bg-green-100 rounded-lg">
              <h4 className="bg-green-200 border border-green-300 p-2 text-lg rounded-lg">
                Area
              </h4>
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out">
                <div className="flex flex-col gap-1 ml-2 opacity-60 overflow-hidden">
                  <p>item</p>
                  <p>item</p>
                  <p>item</p>
                </div>
              </div>
            </div>
            <div className="group bg-yellow-100 rounded-lg">
              <h4 className="bg-yellow-200 border border-yellow-300 p-2 text-lg rounded-lg">
                References
              </h4>
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out">
                <div className="flex flex-col gap-1 ml-2 opacity-60 overflow-hidden">
                  <p>item</p>
                  <p>item</p>
                  <p>item</p>
                </div>
              </div>
            </div>
            <div className="group bg-gray-100 rounded-lg">
              <h4 className="bg-gray-200 border border-gray-300 p-2 text-lg rounded-lg">
                Archives
              </h4>
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out">
                <div className="flex flex-col gap-1 ml-2 opacity-60 overflow-hidden">
                  <p>item</p>
                  <p>item</p>
                  <p>item</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <h3 className="text-slate-400 mb-2">Tindakan</h3>
            <div className="flex flex-col gap-2 bg-white border border-slate-100 rounded-2xl p-4">
              <h3 className="text-slate-400 mb-2">Tindakan lanjutan</h3>
              <div className="group flex justify-between items-center w-full">
                {/* Transisi font-size diganti dengan scale agar lebih ringan di-render GPU */}
                <h3 className="flex flex-1 font-medium w-full text-slate-700 text-base group-hover:text-sm group-hover:font-semibold transition-all duration-300 origin-left truncate">
                  Tulis draf navigasi sidebar
                </h3>

                {/* Right Metadata Area */}
                <div className="grid grid-cols-[0fr_0fr] group-hover:grid-cols-2 group-hover:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                  <span className="group-hover:py-1 group-hover:px-3 border border-green-200 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                    15m
                  </span>
                  <span className="group-hover:py-1 group-hover:px-3 border border-amber-200 bg-amber-50 text-amber-700 text-xs rounded-full font-medium">
                    Fokus
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 bg-white border border-slate-100 rounded-2xl p-4">
              <h3 className="text-slate-400 mb-2">Projek Aktif</h3>
              <div className="group bg-blue-100 rounded-lg">
                <h4 className="bg-blue-200 border border-blue-300 p-2 text-lg rounded-lg">
                  Project
                </h4>

                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out">
                  <div className="flex flex-col gap-1 ml-2 opacity-60 overflow-hidden">
                    <p>item</p>
                    <p>item</p>
                    <p>item</p>
                  </div>
                </div>
              </div>
            </div>
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
