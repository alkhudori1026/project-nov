// components/ClarifySmartInput.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  FolderGit2,
  BookOpen,
  Trash2,
  ArrowRight,
  Undo2,
  Inbox,
  Clock,
  Battery,
  Tag,
  AlignLeft,
  X,
  AlertCircle,
  Plus,
} from "lucide-react";
import TagPicker from "./TagPicker";
import DurationPicker from "./DurationPicker";

export default function InboxOrganizer({ onClose }: { onClose: () => void }) {
  // Simulasi Antrean Inbox
  const [inboxQueue, setInboxQueue] = useState([
    {
      id: 1,
      title: "Perpanjang domain portofolio",
      description:
        "Domain habis tanggal 20. Harus cek saldo di kartu jenius dulu.",
    },
    {
      id: 2,
      title: "Artikel Micro-frontend",
      description: "https://medium.com/... baca nanti untuk arsitektur.",
    },
    {
      id: 3,
      title: "Beli kopi bubuk",
      description: "",
    },
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

  const [localTitle, setLocalTitle] = useState("");
  const [localDesc, setLocalDesc] = useState("");

  // "null" berarti sedang milih menu. String berarti sedang ngisi form.
  const [activeForm, setActiveForm] = useState<
    | null
    | "next_action"
    | "gtd_project"
    | "para_project"
    | "para_area"
    | "para_reference"
  >(null);

  // Sinkronisasi input form saat item yang diklik (di kolom 1) berubah
  useEffect(() => {
    if (currentItem) {
      setLocalTitle(currentItem.title);
      setLocalDesc(currentItem.description);
      setActiveForm(null); // Reset form jika pindah ide
    }
  }, [currentItem]);

  // Fungsi pura-pura untuk menyimpan (akan dikembangkan nanti di Kolom 3)
  const handleSimpanData = (tipe: string) => {
    console.log(`Menyimpan [${localTitle}] sebagai [${tipe}]`);
    // Nanti di sini logika pindah ke Kolom 3 dan hapus dari Kolom 1
  };

  // 3. STATE KOLOM 2: INTERAKSI DROPDOWN & MORPHING
  // Mengontrol menu mana yang sedang terbuka
  const [dropdownMenu, setDropdownMenu] = useState<"action" | "idea" | null>(
    null,
  );

  // Mengontrol destinasi akhir yang dipilih pengguna
  const [selectedDest, setSelectedDest] = useState<
    "quick_task" | "next_action" | "action_project" | null
  >(null);

  // State untuk parameter Next Action
  const [nextActionData, setNextActionData] = useState({
    priority: "",
    energy: "",
    duration: "",
    context: "",
  });

  const daftarPrioritas = ["High (Penting)", "Med (Sedang)", "Low (Rendah)"];
  const daftarEnergi = ["High (Fokus Penuh)", "Low (Admin Ringan)"];
  const daftarKonteks = ["@Computer", "@Home", "@Phone", "@Office", "@Errands"];

  const [isNewProject, setIsNewProject] = useState(false);
  const [projectData, setProjectData] = useState({
    existingProjectId: "",
    newProjectName: "",
    firstNextAction: "",
  });

  // Timer reference untuk mengatur delay hover
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentItem) {
      setLocalTitle(currentItem.title);
      setLocalDesc(currentItem.description);
      // Reset semua form saat pindah item
      setSelectedDest(null);
      setDropdownMenu(null);
      setNextActionData({
        priority: "",
        energy: "",
        duration: "",
        context: "",
      });
    }
  }, [currentItem]);

  // --- LOGIKA HOVER DELAY & KLIK ---
  const handleMouseEnter = (menu: "action" | "idea") => {
    if (selectedDest) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    // Menu hanya akan otomatis terbuka jika tidak ada menu lain yang sedang terbuka
    if (dropdownMenu === null) {
      hoverTimer.current = setTimeout(() => setDropdownMenu(menu), 300);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setDropdownMenu(null);
    }, 300); // Beri waktu kursor bergerak ke bawah tanpa menu langsung hilang
  };

  const handleClickMenu = (menu: "action" | "idea") => {
    // 1. BUNUH TIMER: Cegah hover menimpa klik
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    // 2. TOGGLE INSTAN: Jika menu yang diklik sudah terbuka, tutup. Jika beda/kosong, buka.
    setDropdownMenu((prev) => (prev === menu ? null : menu));
  };

  // --- LOGIKA PEMILIHAN DESTINASI ---
  const selectDestination = (
    dest: "quick_task" | "next_action" | "action_project",
  ) => {
    setSelectedDest(dest);
    setDropdownMenu(null);
  };

  const resetDestination = () => {
    setSelectedDest(null);
    setDropdownMenu(null);
    setNextActionData({ priority: "", energy: "", duration: "", context: "" });
    setIsNewProject(false);
    setProjectData({
      existingProjectId: "",
      newProjectName: "",
      firstNextAction: "",
    });
  };

  // --- LOGIKA VALIDASI TOMBOL SIMPAN ---
  const isSaveReady = () => {
    if (!selectedDest) return false;
    if (selectedDest === "quick_task") return true;
    if (selectedDest === "next_action") {
      return (
        nextActionData.priority !== "" &&
        nextActionData.energy !== "" &&
        nextActionData.duration !== "" &&
        nextActionData.context !== ""
      );
    }
    if (selectedDest === "action_project") {
      if (isNewProject) {
        return (
          projectData.newProjectName.trim() !== "" &&
          projectData.firstNextAction.trim() !== ""
        );
      } else {
        return projectData.existingProjectId !== "";
      }
    }
    return false;
  };

  const handleBuatTag = (kategori: string, nilaiBaru: string) => {
    setNextActionData((prev) => ({ ...prev, [kategori]: nilaiBaru }));
  };

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
        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 flex flex-col gap-5 max-h-[85vh] overflow-hidden">
          <h2 className="font-semibold text-slate-500 uppercase tracking-widest text-sm flex justify-between items-center">
            Draft Catatan
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">
              {inboxQueue.length}
            </span>
          </h2>

          <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-4 h-full">
            {inboxQueue.length === 0 ? (
              <div className="text-center text-slate-400 mt-10">
                Inbox Bersih!
              </div>
            ) : (
              inboxQueue.map((item) => {
                const isActive = currentItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-white border-blue-400 shadow-sm ring-1 ring-blue-100"
                        : "bg-transparent border-slate-200 opacity-60 hover:opacity-100 hover:bg-white"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium line-clamp-1 ${isActive ? "text-blue-800" : "text-slate-700"}`}
                    >
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KOLOM 2: MEJA INSPEKSI (ZONA TENGAH) */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col relative max-h-[85vh] overflow-y-auto custom-scrollbar">
          {currentItem ? (
            <>
              {/* AREA INPUT (JUDUL & DESKRIPSI) */}
              <div className="flex flex-col gap-4 mb-6">
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  placeholder="Judul catatan..."
                  className="text-2xl md:text-3xl font-medium text-slate-800 leading-tight outline-none w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-400 transition-colors py-1"
                />
                <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                  <label className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-2">
                    <AlignLeft className="size-3" /> Deskripsi
                  </label>
                  <textarea
                    value={localDesc}
                    onChange={(e) => setLocalDesc(e.target.value)}
                    placeholder="Tambahkan detail..."
                    className="outline-none w-full bg-transparent resize-none min-h-[4rem] text-sm text-slate-600 custom-scrollbar"
                  />
                </div>
              </div>

              {/* AREA KEPUTUSAN & MORPHING */}
              <div className="flex flex-col gap-4 bg-slate-50 border border-slate-200 rounded-3xl p-6 mt-auto relative transition-all duration-300">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 text-center">
                  Di mana ide ini ditempatkan?
                </p>

                {/* BARIS TOMBOL UTAMA */}
                <div className="flex flex-wrap gap-3 w-full relative">
                  {/* --- SISI KIRI: TINDAKAN --- */}
                  {(!selectedDest ||
                    ["quick_task", "next_action", "action_project"].includes(
                      selectedDest,
                    )) && (
                    <div
                      className={`relative flex flex-col flex-1 ${selectedDest ? "w-full flex-none" : ""}`}
                      onMouseEnter={() => handleMouseEnter("action")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() =>
                            !selectedDest && handleClickMenu("action")
                          }
                          className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl font-medium transition-all duration-300 ${selectedDest ? "bg-blue-100 border-blue-300 text-blue-800 shadow-sm" : "bg-white border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700"}`}
                        >
                          {selectedDest === "quick_task" ? (
                            <>
                              <Clock className="size-5" /> Tugas Ringan (&lt;
                              2m)
                            </>
                          ) : selectedDest === "next_action" ? (
                            <>
                              <ArrowRight className="size-5" /> Jadikan Next
                              Action
                            </>
                          ) : selectedDest === "action_project" ? (
                            <>
                              <FolderGit2 className="size-5" /> Masukkan ke
                              Project
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-5" /> Tindakan
                            </>
                          )}
                        </button>
                        {selectedDest && (
                          <button
                            onClick={resetDestination}
                            className="p-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-400 rounded-xl transition-colors"
                          >
                            <X className="size-5" />
                          </button>
                        )}
                      </div>

                      {/* DROPDOWN TINDAKAN */}
                      <div
                        className={`w-full grid transition-all duration-300 ease-out origin-bottom absolute bottom-full left-0 z-30 ${dropdownMenu === "action" ? "grid-rows-[1fr] opacity-100 mb-2" : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"}`}
                      >
                        <div className="overflow-hidden flex flex-col gap-2 bg-white border border-emerald-100 p-2 rounded-2xl shadow-lg">
                          <button
                            onClick={() => selectDestination("quick_task")}
                            className="flex items-center gap-3 p-3 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <Clock className="size-4 text-emerald-500" /> Tugas
                            Ringan (&lt; 2m)
                          </button>
                          <button
                            onClick={() => selectDestination("next_action")}
                            className="flex items-center gap-3 p-3 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <ArrowRight className="size-4 text-blue-500" />{" "}
                            Jadikan Next Action
                          </button>
                          {/* TOMBOL PROJECT DIAKTIFKAN */}
                          <button
                            onClick={() => selectDestination("action_project")}
                            className="flex items-center gap-3 p-3 w-full hover:bg-emerald-50 rounded-xl text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm"
                          >
                            <FolderGit2 className="size-4 text-indigo-500" />{" "}
                            Masukkan ke Project
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- SISI KANAN: IDE (PARA) --- */}
                  {!selectedDest && (
                    <div
                      className="relative flex flex-col flex-1"
                      onMouseEnter={() => handleMouseEnter("idea")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        onClick={() => handleClickMenu("idea")}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-indigo-700 font-medium transition-all group"
                      >
                        <BookOpen className="size-5" /> Ide (PARA)
                      </button>

                      {/* DROPDOWN IDE (Dikonversi menjadi DROP-UP) */}
                      <div
                        className={`w-full grid transition-all duration-300 ease-out origin-bottom absolute bottom-full left-0 z-10 ${dropdownMenu === "idea" ? "grid-rows-[1fr] opacity-100 mb-2" : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"}`}
                      >
                        <div className="overflow-hidden flex flex-col gap-2 bg-white border border-indigo-100 p-2 rounded-2xl shadow-lg shadow-indigo-900/5">
                          <p className="text-xs text-slate-400 p-2 text-center">
                            Fokus ke Tindakan dulu...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- RENDER PARAMETER FORM (NEXT ACTION) --- */}
                {selectedDest === "next_action" && (
                  <div className="mt-2 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-300 p-4 border border-blue-100 bg-white rounded-2xl">
                    {/* IMPLEMENTASI TAG PICKER UNTUK PRIORITAS */}
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <AlertCircle className="size-3" /> Prioritas
                      </label>
                      <TagPicker
                        daftarTag={daftarPrioritas}
                        tagTerpilih={nextActionData.priority}
                        onPilihTag={(tag) =>
                          setNextActionData({
                            ...nextActionData,
                            priority: tag,
                          })
                        }
                        onBuatTagBaru={(tag) => handleBuatTag("priority", tag)}
                        isCompact={false}
                      />
                    </div>

                    {/* IMPLEMENTASI TAG PICKER UNTUK ENERGI */}
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Battery className="size-3" /> Energi
                      </label>
                      <TagPicker
                        daftarTag={daftarEnergi}
                        tagTerpilih={nextActionData.energy}
                        onPilihTag={(tag) =>
                          setNextActionData({ ...nextActionData, energy: tag })
                        }
                        onBuatTagBaru={(tag) => handleBuatTag("energy", tag)}
                        isCompact={false}
                      />
                    </div>

                    {/* IMPLEMENTASI DURATION PICKER UNTUK DURASI */}
                    <div className="flex flex-col gap-2 relative z-20">
                      {" "}
                      {/* z-index ditinggikan agar popovernya menutupi elemen bawah */}
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="size-3" /> Durasi
                      </label>
                      <DurationPicker
                        durasiTerpilih={nextActionData.duration}
                        onPilihDurasi={(durasi) =>
                          setNextActionData({
                            ...nextActionData,
                            duration: durasi,
                          })
                        }
                        isCompact={false}
                      />
                    </div>

                    {/* IMPLEMENTASI TAG PICKER UNTUK KONTEKS */}
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Tag className="size-3" /> Konteks
                      </label>
                      <TagPicker
                        daftarTag={daftarKonteks}
                        tagTerpilih={nextActionData.context}
                        onPilihTag={(tag) =>
                          setNextActionData({ ...nextActionData, context: tag })
                        }
                        onBuatTagBaru={(tag) => handleBuatTag("context", tag)}
                        isCompact={false}
                      />
                    </div>
                  </div>
                )}
                {selectedDest === "action_project" && (
                  <div className="mt-2 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300 p-4 border border-indigo-100 bg-white rounded-2xl relative z-10">
                    {/* Switcher: Proyek Lama vs Proyek Baru */}
                    <div className="flex bg-slate-100 p-1 rounded-lg w-full mb-2">
                      <button
                        onClick={() => setIsNewProject(false)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${!isNewProject ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        Pilih Project Aktif
                      </button>
                      <button
                        onClick={() => {
                          setIsNewProject(true);
                          setProjectData((prev) => ({
                            ...prev,
                            newProjectName: localTitle,
                          }));
                        }}
                        className={`flex-1 flex justify-center items-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${isNewProject ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        <Plus className="size-3" /> Buat Project Baru
                      </button>
                    </div>

                    {!isNewProject ? (
                      // OPSI 1: PILIH PROYEK LAMA
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Pilih dari sistem
                        </label>
                        <select
                          value={projectData.existingProjectId}
                          onChange={(e) =>
                            setProjectData({
                              ...projectData,
                              existingProjectId: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none focus:border-indigo-400 text-sm font-medium"
                        >
                          <option value="" disabled>
                            -- Pilih Project Aktif --
                          </option>
                          <option value="p1">Portofolio V2</option>
                          <option value="p2">Riset Beasiswa 2027</option>
                        </select>
                      </div>
                    ) : (
                      // OPSI 2: BUAT PROYEK BARU
                      <div className="flex flex-col gap-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400">
                            Nama Project Baru
                          </label>
                          <input
                            type="text"
                            value={projectData.newProjectName}
                            onChange={(e) =>
                              setProjectData({
                                ...projectData,
                                newProjectName: e.target.value,
                              })
                            }
                            placeholder="Misal: Perbaiki Rumah..."
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-400"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                            <span>Next Action Pertama</span>
                            <span className="text-indigo-400 font-normal lowercase tracking-normal bg-indigo-100 px-2 rounded-sm">
                              wajib
                            </span>
                          </label>
                          <input
                            type="text"
                            value={projectData.firstNextAction}
                            onChange={(e) =>
                              setProjectData({
                                ...projectData,
                                firstNextAction: e.target.value,
                              })
                            }
                            placeholder="Apa langkah fisik pertamanya?"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AREA TOMBOL SIMPAN & HAPUS */}
                <div className="grid grid-cols-[1fr_auto] gap-3 mt-4 pt-4 border-t border-slate-200">
                  <button
                    disabled={!isSaveReady()}
                    onClick={() => console.log("Simpan")}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors text-sm shadow-sm"
                  >
                    {!selectedDest
                      ? "Pilih destinasi dulu..."
                      : !isSaveReady()
                        ? "Lengkapi data rincian..."
                        : "Simpan Data"}
                  </button>
                  <button className="flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 h-full">
              <CheckCircle2 className="size-16 mb-4 text-slate-200" />
              <p className="text-lg font-medium">Pilih draf di sebelah kiri</p>
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
