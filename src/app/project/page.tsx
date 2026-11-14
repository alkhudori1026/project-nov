"use client";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";
import InboxOrganizer from "@/components/InboxOrganizer";
import { AppData } from "@/types/productivity";
import { Inbox, Plus, X } from "lucide-react";

const STORAGE_KEY = "anais_gtd_para_vault_v1";

const INITIAL_APP_DATA: AppData = {
  inboxQueue: [
    {
      id: "inb-1",
      title: "Perbaiki atap bocor",
      description: "Bocor di atas kasur saat hujan deras.",
    },
    {
      id: "inb-2",
      title: "Artikel arsitektur Micro-frontend",
      description: "Referensi pola pemisahan state untuk proyek web.",
    },
  ],
  projects: [
    { id: "p1", name: "Portofolio V2" },
    { id: "p2", name: "Riset Beasiswa 2027" },
  ],
  paraFolders: [
    { id: "a1", name: "Pengembangan Karir & Coding", category: "area" },
    { id: "a2", name: "Kesehatan & Calisthenics", category: "area" },
    { id: "r1", name: "Arsitektur Software & React", category: "reference" },
    { id: "r2", name: "Desain UI/UX & Material 3", category: "reference" },
  ],
  tasks: [
    {
      id: "t1",
      title: "Tulis draf navigasi sidebar",
      description: "",
      type: "next_action",
      projectId: "p1",
      priority: "High",
      energy: "High (Fokus Penuh)",
      duration: "0 j 30 m",
      context: "@Computer",
      isCompleted: false,
    },
  ],
  calendarItems: [
    {
      id: "cal-1",
      title: "Kirim laporan mingguan",
      description: "",
      calendarType: "day_action",
      date: "2026-11-20",
      time: "17:00",
    },
  ],
  waitingForItems: [
    {
      id: "wait-1",
      title: "Revisi aset ilustrasi dari desainer",
      description: "",
      waitingFor: "Raka (Desainer)",
      followUpDate: "2026-11-18",
    },
  ],
  notes: [
    {
      id: "n1",
      title: "Palet warna pastel Material 3",
      description: "Gunakan tonal surface slate untuk latar belakang.",
      paraCategory: "project",
      targetId: "p1",
    },
  ],
};

export default function Project() {
  const [isScrolled, setIsScrolled] = useState(false);
  const onScrolling = (e: React.UIEvent<HTMLDivElement>) => {
    // Jika guliran melewati batas 10px, anggap statusnya "sedang di-scroll"
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  const [mode, setMode] = useState<"dashboard" | "clarify">("dashboard");

  const [isCaptureOpen, setCaptureOpen] = useState(false);
  const [captureTitle, setCaptureTitle] = useState("");
  const [captureDesc, setCaptureDesc] = useState("");

  const [appData, setAppData] = useState<AppData>(INITIAL_APP_DATA);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed: AppData = JSON.parse(savedData);
        setAppData(parsed);
      }
    } catch (error) {
      console.error("Gagal membaca brankas localStorage:", error);
    } finally {
      setIsHydrated(true); // Buka gerbang izin tulis
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (error) {
      console.error("Gagal menyimpan ke localStorage:", error);
    }
  }, [appData, isHydrated]);

  const handleSaveCapture = () => {
    if (captureTitle.trim() === "") return;

    const newInboxItem = {
      id: `inb-${Date.now()}`,
      title: captureTitle.trim(),
      description: captureDesc.trim(),
      createdAt: new Date().toISOString(),
    };

    setAppData((prev) => ({
      ...prev,
      inboxQueue: [newInboxItem, ...prev.inboxQueue], // Taruh di antrean paling atas
    }));

    setCaptureTitle("");
    setCaptureDesc("");
    setCaptureOpen(false);
  };
  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr]  md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr]  h-screen">
      {/* Nanti kita perbarui cara kerja navigasinya */}
      <Navigation />
      <TopBar />

      <div
        className="bg-slate-100 flex-1 p-6 md:py-8 md:px-12 overflow-y-auto no-scrollbar"
        onScroll={onScrolling}
      >
        {mode === "dashboard" ? (
          <>
            {/* Bento Layout: 60/40 split using 3fr 2fr */}
            <div className="p-4 md:p-8">
              <div className="max-w-[1600px] mx-auto mb-6 flex justify-end">
                <button
                  onClick={() => setMode("clarify")}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
                >
                  <Inbox className="size-5" />
                  Mulai Sortir Inbox ({appData.inboxQueue.length})
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 md:gap-6 max-w-[1600px] mx-auto min-h-[85vh]">
                {/* Zona 60% Kiri */}
                <div className="bg-white border border-slate-200 md:row-span-2 w-full p-6 md:p-8 rounded-[2rem] shadow-sm">
                  <h2 className="font-semibold text-2xl text-slate-800 tracking-tight mb-2">
                    Take Action ({appData.tasks.length})
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Siap dihubungkan dengan data tugas tersimpan.
                  </p>
                </div>

                {/* Zona 40% Kanan */}
                <div className="bg-white border border-slate-200 w-full p-6 md:p-8 rounded-[2rem] shadow-sm min-h-[300px]">
                  <h2 className="font-semibold text-xl text-slate-800 mb-2">
                    Calendar ({appData.calendarItems.length})
                  </h2>
                </div>
                <div className="bg-white border border-slate-200 w-full p-6 md:p-8 rounded-[2rem] shadow-sm min-h-[300px]">
                  <h2 className="font-semibold text-xl text-slate-800 mb-2">
                    Active Projects ({appData.projects.length})
                  </h2>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <InboxOrganizer
              appData={appData}
              onUpdateAppData={setAppData}
              onClose={() => setMode("dashboard")}
            />
          </>
        )}
      </div>
      {mode === "dashboard" && (
        <button
          onClick={() => setCaptureOpen(true)}
          title="Tangkap Ide Cepat"
          className="fixed bottom-8 right-8 md:bottom-12 md:right-12 size-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
        >
          <Plus className="size-8 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* OVERLAY LACI CAPTURE */}
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isCaptureOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setCaptureOpen(false)}
      />

      {/* LACI SLIDE-OUT CAPTURE (Judul & Deskripsi) */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[420px] bg-slate-50 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isCaptureOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-slate-200">
          <h2 className="font-semibold text-xl text-slate-800">
            Tumpahkan Ide
          </h2>
          <button
            onClick={() => setCaptureOpen(false)}
            className="size-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Judul / Inti Pikiran
            </label>
            <input
              type="text"
              value={captureTitle}
              onChange={(e) => setCaptureTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && captureTitle.trim() !== "") {
                  handleSaveCapture();
                }
              }}
              placeholder="Misal: Beli buku Atomic Habits..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              value={captureDesc}
              onChange={(e) => setCaptureDesc(e.target.value)}
              placeholder="Detail, konteks, atau tautan..."
              className="w-full flex-1 bg-white border border-slate-200 rounded-2xl p-4 text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed custom-scrollbar"
            />
          </div>
        </div>

        <div className="px-6 py-5 bg-white border-t border-slate-200 flex justify-end gap-3">
          <button
            disabled={captureTitle.trim() === ""}
            onClick={handleSaveCapture}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors"
          >
            Simpan ke Inbox
          </button>
        </div>
      </div>
    </div>
  );
}
