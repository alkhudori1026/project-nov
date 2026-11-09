"use client";
import IconButton from "@/components/IconButon";
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";
import DurationPicker from "@/components/DurationPicker";
import TagPicker from "@/components/TagPicker";
import TaskList from "@/components/TaskList";
import ReflectionList from "@/components/ReflectionList";
import SessionList from "@/components/SessionList";
import ToggleButton from "@/components/ToggleButton";
import EvaluationLog from "@/components/EvaluationLog";
import {
  CircleStar,
  ListPlus,
  PencilSparkles,
  PenLine,
  Trash2,
  ChevronDown,
  FolderGit2,
} from "lucide-react";

// 1. Kontrak Tipe Data: Bentuk pasti dari satu objek tugas
interface Tugas {
  id: string; // Identitas unik (penting untuk React Key)
  nama: string; // Hasil dari input teks
  durasi: string; // Hasil dari DurationPicker
  tag: string; // Hasil dari TagPicker
}

interface Refleksi {
  id: string;
  text: string;
}

interface Sesi {
  id: string;
  startingTime: string;
  finishingTime: string;
  tagUnik: string[];
  tugas: Tugas[];
  refleksi: Refleksi[];
}

interface FlowState {
  id: string;
  start: string;
  end: string;
}

interface MissTask {
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
  missedTasks: MissTask[];
  distractions: Distraction[];
  sleepDuration: string; // Data tunggal (sebelumnya inputSleepTag/sleepTime)
  morningFeeling: string; // Data tunggal
  restingActivities: RestingActivity[];
}

interface JurnalHarian {
  id: string;
  date: string;
  title: string;
  favorite: boolean;
  sessions: Sesi[];
  evaluation: EvaluasiHarian | null;
}

interface FolderBulan {
  id: string;
  name: string;
  pages: JurnalHarian[];
}

import { useState, useEffect } from "react";

export default function Jurnals() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [bukaMenuFolder, setBukaMenuFolder] = useState(false);
  const [evaluateMode, setEvaluateMode] = useState(false);
  const [activeTag, setActiveTag] = useState("");

  const [flowStateList, setFlowStateList] = useState<FlowState[]>([]);
  const [inputStartingFocus, setInputStartingFocus] = useState("");
  const [inputFinishingFocus, setInputFinishingFocus] = useState("");
  const [crashTime, setCrashTime] = useState("");

  const [missTaskList, setMissTaskList] = useState<MissTask[]>([]);
  const [inputMissTask, setInputMissTask] = useState("");

  const [distractions, setDistractions] = useState<Distraction[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [inputDistraction, setInputDistraction] = useState("");
  const [inputStartTime, setInputStartTime] = useState("");
  const [inputEndTime, setInputEndTime] = useState("");

  const [restingActivities, setRestingActivities] = useState<RestingActivity[]>(
    [],
  );
  const [inputRestingActivity, setInputRestingActivity] = useState("");

  const [idEditEvaluasi, setIdEditEvaluasi] = useState<string | null>(null); // Memori untuk fitur edit

  const [tagStorage, setTagStorage] = useState<string[]>([]);

  // Gudang utama yang menyimpan seluruh folder bulan
  const [arsipUtama, setArsipUtama] = useState<FolderBulan[]>([]);
  // Meja kerjamu hari ini (koper yang sedang dibuka)
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeJournal, setActiveJournal] = useState<JurnalHarian | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Indikator bahwa halaman sudah mendarat di browser

  // ====================================================
  // 1. PEKERJA BONGKAR AWAL (Hanya jalan setelah mendarat di Browser)
  // ====================================================
  useEffect(() => {
    setIsMounted(true);

    // 1. Tentukan Identitas Hari Ini
    const hariIni = new Date().toISOString().split("T")[0]; // "2026-11-09"
    const idBulanIni = hariIni.substring(0, 7); // "2026-11"

    // 2. Ambil Brankas
    const savedArsip = localStorage.getItem("jurnal_arsipUtama");
    let arsip: FolderBulan[] = savedArsip ? JSON.parse(savedArsip) : [];

    // 3. Cari Folder (Buat baru jika belum ada)
    let folderBulanIni = arsip.find((folder) => folder.id === idBulanIni);
    if (!folderBulanIni) {
      // Ubah nama bawaan sesuai permintaanmu
      folderBulanIni = { id: idBulanIni, name: "New Folder", pages: [] };
      arsip.push(folderBulanIni);
    }

    // 4. Cari Halaman Jurnal (Buat baru jika belum ada)
    let jurnalHariIni = folderBulanIni.pages.find(
      (page) => page.date === hariIni,
    );
    if (!jurnalHariIni) {
      jurnalHariIni = {
        id: crypto.randomUUID(),
        date: hariIni,
        title: "", // Biarkan kosong, nanti sistem UI yang memberikan fallback format tanggal
        favorite: false,
        sessions: [],
        evaluation: null,
      };
      folderBulanIni.pages.push(jurnalHariIni);
    }

    // KUNCI UTAMA: Amankan brankas ke hard disk saat kertas baru saja dibuat
    localStorage.setItem("jurnal_arsipUtama", JSON.stringify(arsip));

    // 5. Distribusikan ke state React
    setArsipUtama(arsip);
    setActiveFolder(idBulanIni);
    setActiveJournal(jurnalHariIni);
  }, []);

  const tanganiEditEvaluasi = (laporanLama: EvaluasiHarian) => {
    // 1. Sebar data dari laporan lama kembali ke form input (draf)
    setFlowStateList(laporanLama.flowStates);
    setCrashTime(laporanLama.crashTime);
    setMissTaskList(laporanLama.missedTasks);
    setDistractions(laporanLama.distractions);
    setSleepTime(laporanLama.sleepDuration);
    setInputSleepTag(laporanLama.morningFeeling);
    setRestingActivities(laporanLama.restingActivities);

    // 2. Tandai ID yang sedang diedit
    setIdEditEvaluasi(laporanLama.id);

    // 3. Buka form
    setEvaluateMode(true);
  };

  const addNewTag = (newTag: string) => {
    setTagStorage([...tagStorage, newTag]); // Tambahkan tag baru ke daftar memori global
    setActiveTag(newTag); // Langsung jadikan tag baru tersebut sebagai yang terpilih
  };

  // 2. Fungsi membaca pergerakan scroll
  const onScrolling = (e: React.UIEvent<HTMLDivElement>) => {
    // Jika guliran melewati batas 10px, anggap statusnya "sedang di-scroll"
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  // 2. Gudang Penyimpanan: Array yang menampung tugas jadi
  const [taskList, setTaskList] = useState<Tugas[]>([]);

  // 3. Ban Berjalan (Bahan Baku Sementara)
  const [inputTask, setInputTask] = useState("");
  const [inputTaskDuration, setInputTaskDuration] = useState("");
  const [inputTag, setInputTag] = useState("");

  const addTask = () => {
    // A. Validasi: Jangan proses jika nama tugas kosong
    if (!inputTask.trim()) return;

    // B. Rakit Objek Baru
    const newTask: Tugas = {
      id: crypto.randomUUID(), // Menghasilkan ID unik standar industri
      nama: inputTask,
      durasi: inputTaskDuration || "0 j 0 m", // Fallback jika lupa diisi
      tag: inputTag || "Tanpa Tag", // Fallback jika lupa diisi
    };

    // C. Pindahkan ke Gudang (Gabungkan dengan data yang sudah ada)
    setTaskList([...taskList, newTask]);

    // D. Bersihkan Ban Berjalan (Reset form ke kosong)
    setInputTask("");
    setInputTaskDuration("");
    setInputTag("");
  };

  const removeTask = (idYangDihapus: string) => {
    // Filter akan menghasilkan array baru yang hanya berisi tugas
    // yang ID-nya TIDAK SAMA dengan idYangDihapus
    const newTaskList = taskList.filter((tugas) => tugas.id !== idYangDihapus);

    // Timpa gudang lama dengan array baru yang sudah bersih
    setTaskList(newTaskList);
  };

  const [reflectionList, setReflectionList] = useState<Refleksi[]>([]);
  const [inputRefleksi, setInputRefleksi] = useState("");

  const addReflection = () => {
    if (!inputRefleksi.trim()) return; // Cegah input kosong

    const newReflection: Refleksi = {
      id: crypto.randomUUID(),
      text: inputRefleksi,
    };

    setReflectionList([...reflectionList, newReflection]);
    setInputRefleksi(""); // Bersihkan kolom input
  };

  const removeReflection = (idYangDihapus: string) => {
    setReflectionList(reflectionList.filter((r) => r.id !== idYangDihapus));
  };

  // State untuk jam mulai dan selesai
  const [startingTime, setStartingTime] = useState("08:00");
  const [finishingTime, setFinishingTime] = useState("10:00");

  // FUNGSI PINTAR: Mengekstrak tag secara dinamis dari daftar tugas
  // Menggunakan 'Set' agar tidak ada tag yang ganda/duplikat di pembatas
  const tagSession = Array.from(new Set(taskList.map((tugas) => tugas.tag)));

  const bookSession = () => {
    // A. Validasi: Jangan jalan jika draf kosong ATAU jika tidak ada koper (jurnal) yang terbuka
    if (taskList.length === 0 && reflectionList.length === 0) return;
    if (!activeJournal) return;

    // B. Rakit Objek Sesi
    const newSession: Sesi = {
      id: crypto.randomUUID(),
      startingTime: startingTime || "00:00",
      finishingTime: finishingTime || "00:00",
      tagUnik: tagSession,
      tugas: [...taskList],
      refleksi: [...reflectionList],
    };

    // C. Proses "Koper Bersarang"
    // 1. Ambil koper lama, dan tambahkan sesi baru ke slot 'sessions' miliknya
    const jurnalDiperbarui: JurnalHarian = {
      ...activeJournal, // bawa data tanggal, id, isFavorite yang lama
      sessions: [newSession, ...activeJournal.sessions], // tumpuk sesi baru di paling atas
    };

    // 2. Kirim koper yang sudah diperbarui ini ke fungsi penyimpanan arsip
    simpanJurnalKeArsip(jurnalDiperbarui);

    // D. Reset Ban Berjalan (Meja Kerja)
    setTaskList([]);
    setReflectionList([]);
  };

  const sessionHistorySorted = activeJournal
    ? [...activeJournal.sessions].sort((a, b) =>
        a.startingTime.localeCompare(b.startingTime),
      )
    : [];

  // const sessionHistorySorted = [...sessionHistory].sort((a, b) =>
  //   a.startingTime.localeCompare(b.startingTime),
  // );

  // const removeSession = (id: string) => {
  //   setSessionHistory(sessionHistory.filter((s) => s.id !== id));
  // };

  const removeSession = (idYangDihapus: string) => {
    // Pengaman: Jangan lakukan apa-apa kalau tidak ada jurnal yang aktif
    if (!activeJournal) return;

    // Langkah 1: Saring (Buang sesi yang ID-nya cocok)
    // Kita simpan array hasil saringannya ke dalam variabel 'sisaSesi'
    const sisaSesi = activeJournal.sessions.filter(
      (s) => s.id !== idYangDihapus,
    );

    // Langkah 2: Rakit ulang koper
    const jurnalDiperbarui: JurnalHarian = {
      ...activeJournal, // Bawa data tanggal, isFavorite, dan evaluasi yang lama
      sessions: sisaSesi, // Timpa daftar sesinya dengan yang baru saja disaring
    };

    // Langkah 3: Serahkan ke Mandor Gudang
    simpanJurnalKeArsip(jurnalDiperbarui);
  };

  const saveChanges = (sesiDiperbarui: Sesi) => {
    if (!activeJournal) return; // Pengaman

    // 1. Ganti data sesi lama dengan yang baru diedit
    const updatedSessions = activeJournal.sessions.map((s) =>
      s.id === sesiDiperbarui.id ? sesiDiperbarui : s,
    );

    // 2. Simpan koper utuh ke localStorage
    simpanJurnalKeArsip({
      ...activeJournal,
      sessions: updatedSessions,
    });
  };

  const addFlowStateTime = () => {
    if (!inputStartingFocus.trim() || !inputFinishingFocus.trim()) return;

    // B. Rakit Objek Baru
    const flowState: FlowState = {
      id: crypto.randomUUID(), // Menghasilkan ID unik standar industri
      start: inputStartingFocus,
      end: inputFinishingFocus || "Tanpa Tag", // Fallback jika lupa diisi
    };

    // C. Pindahkan ke Gudang (Gabungkan dengan data yang sudah ada)
    setFlowStateList([...flowStateList, flowState]);

    // D. Bersihkan Ban Berjalan (Reset form ke kosong)
    setInputStartingFocus("");
    setInputFinishingFocus("");
  };

  const addMissTask = () => {
    // A. Validasi: Jangan proses jika nama tugas kosong
    if (!inputMissTask.trim()) return;

    // B. Rakit Objek Baru
    const missTask: MissTask = {
      id: crypto.randomUUID(), // Menghasilkan ID unik standar industri
      task: inputMissTask,
      tag: inputTag || "Tanpa Tag", // Fallback jika lupa diisi
    };

    // C. Pindahkan ke Gudang (Gabungkan dengan data yang sudah ada)
    setMissTaskList([...missTaskList, missTask]);

    // D. Bersihkan Ban Berjalan (Reset form ke kosong)
    setInputMissTask("");
    setInputTag("");
  };

  const addDistraction = () => {
    // A. Validasi: Jangan proses jika nama tugas kosong
    if (!inputDistraction.trim()) return;

    // B. Rakit Objek Baru
    const distraction: Distraction = {
      id: crypto.randomUUID(), // Menghasilkan ID unik standar industri
      distraction: inputDistraction,
      start: inputStartTime || "lama", // Fallback jika lupa diisi
      end: inputEndTime || "pokoknya",
    };

    // C. Pindahkan ke Gudang (Gabungkan dengan data yang sudah ada)
    setDistractions([...distractions, distraction]);

    // D. Bersihkan Ban Berjalan (Reset form ke kosong)
    setInputDistraction("");
    setInputStartTime("");
    setInputEndTime("");
  };

  const [sleepTime, setSleepTime] = useState("");
  const [inputSleepTag, setInputSleepTag] = useState("");
  const [tagSleepStorage, setTagSleepStorage] = useState<string[]>([]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "jurnal_tagSleepStorage",
        JSON.stringify(tagSleepStorage),
      );
    }
  }, [tagSleepStorage, isMounted]); // kalau depndensinya diisi, berarti jadi semacam sensor. maka ketika array di dalam dependensi itu berubah, useEffect akan dilakukan

  const addNewSleepTag = (newTag: string) => {
    setTagSleepStorage([...tagSleepStorage, newTag]); // Tambahkan tag baru ke daftar memori global
    setInputSleepTag(newTag); // Langsung jadikan tag baru tersebut sebagai yang terpilih
  };

  const addRestingActivity = () => {
    // A. Validasi: Jangan proses jika nama tugas kosong
    if (!inputRestingActivity.trim()) return;

    // B. Rakit Objek Baru
    const restingActivity: RestingActivity = {
      id: crypto.randomUUID(), // Menghasilkan ID unik standar industri
      name: inputRestingActivity,
    };

    // C. Pindahkan ke Gudang (Gabungkan dengan data yang sudah ada)
    setRestingActivities([...restingActivities, restingActivity]);

    // D. Bersihkan Ban Berjalan (Reset form ke kosong)
    setInputRestingActivity("");
    setInputStartTime("");
    setInputEndTime("");
  };

  const bookEvaluation = () => {
    if (!activeJournal) return;

    // 1. Rakit Laporan Utuh
    const laporanBaru: EvaluasiHarian = {
      id: idEditEvaluasi ? idEditEvaluasi : crypto.randomUUID(),
      flowStates: [...flowStateList],
      crashTime: crashTime,
      missedTasks: [...missTaskList],
      distractions: [...distractions],
      sleepDuration: sleepTime,
      morningFeeling: inputSleepTag,
      restingActivities: [...restingActivities],
    };

    // 2. Proses "Koper Bersarang"
    // Timpa slot evaluasi di koper hari ini dengan laporan yang baru
    const jurnalDiperbarui: JurnalHarian = {
      ...activeJournal,
      evaluation: laporanBaru,
    };

    // 3. Kirim ke arsip utama (otomatis menimpa yang lama jika mode edit, atau mengisi jika baru)
    simpanJurnalKeArsip(jurnalDiperbarui);

    // 4. Bersihkan Meja Kerja (Reset Draf)
    setFlowStateList([]);
    setCrashTime("");
    setMissTaskList([]);
    setDistractions([]);
    setSleepTime("");
    setInputSleepTag("");
    setRestingActivities([]);
    setEvaluateMode(false);
    setIdEditEvaluasi(null);
  };

  const formatTanggalIndo = (tanggalISO: string) => {
    if (!tanggalISO) return "";
    const date = new Date(tanggalISO);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const buatFolderBaru = (namaFolderBaru: string) => {
    if (!namaFolderBaru.trim()) return;

    const folderBaru: FolderBulan = {
      id: crypto.randomUUID(),
      name: namaFolderBaru,
      pages: [], // Koper halamannya masih kosong saat pertama dibuat
    };

    // Masukkan folder baru ke arsip utama
    setArsipUtama([...arsipUtama, folderBaru]);
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // Fungsi untuk mengekstrak data folder yang sedang aktif
  const activeFolderData = arsipUtama.find((f) => f.id === activeFolder);

  const toggleFavorite = () => {
    if (!activeJournal) return;
    simpanJurnalKeArsip({
      ...activeJournal,
      favorite: !activeJournal.favorite, // Balikkan nilai boolean-nya
    });
  };

  const tanganiSimpanJudul = () => {
    if (!activeJournal) return;
    simpanJurnalKeArsip({
      ...activeJournal,
      title: titleDraft,
    });
    setIsEditingTitle(false);
  };

  const simpanJurnalKeArsip = (jurnalYangDiperbarui: JurnalHarian) => {
    if (!activeFolder) return;

    // 1. Perbarui meja kerja agar layar langsung merender sesi baru
    setActiveJournal(jurnalYangDiperbarui);

    // 2. Proses bongkar koper dan SIMPAN LANGSUNG ke brankas fisik
    setArsipUtama((arsipSekarang) => {
      const arsipBaru = arsipSekarang.map((folder) => {
        if (folder.id === activeFolder) {
          return {
            ...folder,
            pages: folder.pages.map((page) =>
              page.id === jurnalYangDiperbarui.id ? jurnalYangDiperbarui : page,
            ),
          };
        }
        return folder;
      });

      // KUNCI UTAMA: Tulis langsung ke hard disk detik ini juga!
      localStorage.setItem("jurnal_arsipUtama", JSON.stringify(arsipBaru));

      return arsipBaru; // Kembalikan data baru ke memori React
    });
  };

  if (!isMounted) return null;

  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr] md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr]  h-screen">
      <Navigation />
      <TopBar />
      {/*-----[ Main Page ]-----*/}

      <div
        className="bg-slate-100 px-12 flex-1 py-4 overflow-y-auto no-scrollbar relative"
        onScroll={onScrolling}
      >
        <div className="max-w-250 mx-auto bg-white rounded-3xl shadow-sm relative pb-4">
          {/* --- HEADER STICKY --- */}
          <header
            className={`sticky -top-4 z-30 flex justify-between items-center p-4 bg-white/80 backdrop-blur-md transition-all duration-300 border-b ${
              isScrolled
                ? "rounded-none shadow-md border-transparent"
                : "rounded-t-3xl shadow-none border-slate-100"
            }`}
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0 pr-4">
              {isEditingTitle ? (
                // ==========================
                // MODE EDIT NAMA HALAMAN
                // ==========================
                <input
                  type="text"
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") tanganiSimpanJudul();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  onBlur={tanganiSimpanJudul} // Otomatis simpan jika klik di luar area
                  className="font-semibold text-[clamp(1.25rem,3vw,1.75rem)] text-slate-800 outline-none border-b-2 border-blue-500 bg-transparent w-full"
                  placeholder={formatTanggalIndo(activeJournal?.date || "")}
                />
              ) : (
                // ==========================
                // MODE BACA (TAMPILAN DEFAULT)
                // ==========================
                <h1 className="font-semibold text-[clamp(1.25rem,3vw,1.75rem)] text-slate-800 truncate">
                  {/* Jika judul kosong, gunakan fallback format tanggal Indo */}
                  {activeJournal?.title ||
                    formatTanggalIndo(activeJournal?.date || "")}
                </h1>
              )}

              {/* NAMA FOLDER AKTIF */}
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 opacity-70"></span>
                {activeFolderData?.name || "Memuat Folder..."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* TOMBOL RENAME */}
              <IconButton
                icon={PenLine} // Pastikan PenLine sudah di-import dari lucide-react
                className="size-[clamp(2.5rem,4vw,3.5rem)] !bg-slate-50 hover:!bg-slate-100 !text-slate-500"
                onClick={() => {
                  // Saat tombol ditekan, salin nama saat ini (atau tanggal default) ke draft
                  setTitleDraft(
                    activeJournal?.title ||
                      formatTanggalIndo(activeJournal?.date || ""),
                  );
                  setIsEditingTitle(true);
                }}
              />

              {/* TOMBOL FAVORIT (Terhubung ke brankas) */}
              <IconButton
                icon={CircleStar}
                className={`size-[clamp(2.5rem,4vw,3.5rem)] transition-colors ${
                  activeJournal?.favorite
                    ? "!text-amber-500 !bg-amber-50 hover:!bg-amber-100"
                    : "!bg-slate-50 hover:!bg-slate-100 !text-slate-400"
                }`}
                onClick={toggleFavorite}
              />
              <IconButton
                icon={FolderGit2}
                className="size-[clamp(2.5rem,4vw,3.5rem)] !bg-slate-50 hover:!bg-slate-100 !text-slate-500"
                onClick={() => setBukaMenuFolder(true)}
              />
            </div>
          </header>

          <div className="p-4 pt-4 flex flex-col gap-8">
            {/*1. LOG SESI TERSIMPAN (HISTORY) */}
            <section id="log-sesi" className="flex flex-col gap-6">
              {sessionHistorySorted.map((sesi) => (
                <div
                  key={sesi.id}
                  className="flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity mb-6"
                >
                  <SessionList
                    key={sesi.id}
                    sesi={sesi}
                    tagStorage={tagStorage}
                    onSimpan={saveChanges}
                    onHapus={removeSession}
                    onBuatTagBaru={addNewTag}
                  />
                </div>
              ))}
              {activeJournal?.evaluation && !evaluateMode && (
                <div className="mt-8 border-t-2 border-dashed border-slate-200 pt-8">
                  <h2 className="font-bold text-lg text-slate-700 mb-6">
                    Ringkasan Evaluasi Harian
                  </h2>

                  <div className="flex flex-col gap-6">
                    {/* Tidak perlu .map() karena hanya ada SATU laporan di koper ini */}
                    <EvaluationLog
                      evaluasi={activeJournal.evaluation}
                      onEdit={tanganiEditEvaluasi}
                    />
                  </div>
                </div>
              )}
            </section>
            {/* =========================================
          2. AREA INPUT SESI AKTIF (DRAFT)
          Desain menonjol dengan elevasi form
      ========================================= */}
            <section id="input-sesi" className="flex flex-col gap-4 mt-2">
              {/* PEMBATAS DINAMIS (Bereaksi terhadap form di bawahnya) */}
              <div className="flex items-center gap-3">
                <ToggleButton
                  isOn={evaluateMode}
                  onToggle={setEvaluateMode}
                  label="Mode Evaluasi"
                />

                <div className="flex-1 border-t-2 border-blue-100" />
              </div>

              {/* BUNGKUSAN FORM (Kanvas Kerja) */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-4 flex flex-col gap-6 shadow-sm">
                {/* Header Form & Input Waktu yang Dipercantik */}
                {evaluateMode ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <h2 className="font-bold text-lg text-slate-700">
                        Evaluasi Akhir Hari
                      </h2>
                    </div>
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                      {/* Area Pencatatan Kurva Fokus */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Kapan Fokusku meningkat / memasuki flow-state?
                        </h2>
                        {/* Draf Puncak Fokus */}
                        {flowStateList.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-white border border-blue-100 p-2 rounded-xl shadow-sm"
                          >
                            <div className="flex gap-2 items-center">
                              <span className="text-sm font-bold text-blue-700">
                                {item.start} - {item.end}
                              </span>
                            </div>
                            <IconButton
                              icon={Trash2}
                              onClick={() =>
                                setFlowStateList(
                                  flowStateList.filter((x) => x.id !== item.id),
                                )
                              }
                              className="w-8 h-8 !text-red-400 hover:!bg-red-50"
                            />
                          </div>
                        ))}
                        <div className="bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between items-center w-full gap-2">
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                            <input
                              type="time"
                              value={inputStartingFocus}
                              onChange={(e) =>
                                setInputStartingFocus(e.target.value)
                              }
                              className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                            />
                            <span className="text-slate-300 text-sm font-medium">
                              →
                            </span>
                            <input
                              type="time"
                              value={inputFinishingFocus}
                              onChange={(e) =>
                                setInputFinishingFocus(e.target.value)
                              }
                              className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                            />
                          </div>
                          <IconButton
                            icon={ListPlus}
                            onClick={addFlowStateTime}
                            // Karena kita butuh ListPlus lebih mencolok dari tombol lain,
                            // kita timpa warnanya dengan palu godam (!)
                            className="!bg-blue-600 !text-white hover:!bg-blue-700 size-[clamp(2rem,3vw,2.5rem)]"
                          />
                        </div>
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Kapan mulai merasa kesulitan untuk fokus?
                        </h2>

                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                          <input
                            type="time"
                            value={crashTime}
                            onChange={(e) => setCrashTime(e.target.value)}
                            className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Area Tugas yang Terlewatkan */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Tugas apa yang tertunda/tergeser?
                        </h2>
                        {/* Draf Tugas Tertunda */}
                        {missTaskList.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-white border border-red-100 p-2 rounded-xl shadow-sm"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-slate-700 truncate">
                                {item.task}
                              </span>
                              <span className="text-[10px] font-bold text-red-500 uppercase">
                                {item.tag}
                              </span>
                            </div>
                            <IconButton
                              icon={Trash2}
                              onClick={() =>
                                setMissTaskList(
                                  missTaskList.filter((x) => x.id !== item.id),
                                )
                              }
                              className="w-8 h-8 !text-red-400 hover:!bg-red-50 shrink-0"
                            />
                          </div>
                        ))}
                        <div className=" bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between items-center w-full gap-2">
                          <div className="flex flex-1 items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                            <input
                              type="text"
                              placeholder=" Tugas yang aku lewatkan ..."
                              className="outline-none h-8 flex-1 "
                              value={inputMissTask} // Layar membaca dari state
                              onChange={(e) => setInputMissTask(e.target.value)}
                            ></input>
                          </div>
                          <TagPicker
                            daftarTag={tagStorage}
                            tagTerpilih={inputTag} // Sambungkan ke ban berjalan inputTag, bukan activeTag
                            onPilihTag={setInputTag}
                            onBuatTagBaru={(tag) => {
                              setTagStorage([...tagStorage, tag]);
                              setInputTag(tag); // Langsung masukkan tag baru ke ban berjalan
                            }}
                          />
                          <IconButton
                            icon={ListPlus}
                            onClick={addMissTask}
                            // Karena kita butuh ListPlus lebih mencolok dari tombol lain,
                            // kita timpa warnanya dengan palu godam (!)
                            className="!bg-blue-600 !text-white hover:!bg-blue-700 size-[clamp(2rem,3vw,2.5rem)]"
                          />
                        </div>
                      </div>

                      {/* Area Pencatatan Distraksi */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Apa sumber distraksiku hari ini?
                        </h2>
                        {/* Draf Distraksi */}
                        {distractions.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-white border border-amber-100 p-2 rounded-xl shadow-sm"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-slate-700 truncate">
                                {item.distraction}
                              </span>
                              <span className="text-[10px] font-bold text-amber-600">
                                {item.start} - {item.end}
                              </span>
                            </div>
                            <IconButton
                              icon={Trash2}
                              onClick={() =>
                                setDistractions(
                                  distractions.filter((x) => x.id !== item.id),
                                )
                              }
                              className="w-8 h-8 !text-red-400 hover:!bg-red-50 shrink-0"
                            />
                          </div>
                        ))}
                        <div className=" bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between items-center w-full gap-2">
                          <div className="flex flex-1 items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                            <input
                              type="text"
                              placeholder=" Distraksiku adalah ..."
                              className="outline-none h-8 flex-1 "
                              value={inputDistraction} // Layar membaca dari state
                              onChange={(e) =>
                                setInputDistraction(e.target.value)
                              }
                            ></input>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                            <input
                              type="time"
                              value={inputStartTime}
                              onChange={(e) =>
                                setInputStartTime(e.target.value)
                              }
                              className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                            />
                            <span className="text-slate-300 text-sm font-medium">
                              →
                            </span>
                            <input
                              type="time"
                              value={inputEndTime}
                              onChange={(e) => setInputEndTime(e.target.value)}
                              className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                            />
                          </div>
                          <IconButton
                            icon={ListPlus}
                            onClick={addDistraction}
                            // Karena kita butuh ListPlus lebih mencolok dari tombol lain,
                            // kita timpa warnanya dengan palu godam (!)
                            className="!bg-blue-600 !text-white hover:!bg-blue-700 size-[clamp(2rem,3vw,2.5rem)]"
                          />
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Apakah hari ini istirahat cukup?
                        </h2>

                        <div className=" bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between items-center w-full gap-2">
                          <div className="flex items-center justify-between w-full p-2 ">
                            <h3 className="text-slate-500 font-medium ">
                              Berapa lama durasi tidur semalam?
                            </h3>
                            <div className="shrink-0">
                              <DurationPicker
                                onPilihDurasi={setSleepTime}
                                durasiTerpilih={sleepTime}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between w-full p-2">
                            <h3 className="text-slate-500 font-medium">
                              Bagaimana perasaan saat bangun tidur?
                            </h3>
                            <div className="shrink-0">
                              <TagPicker
                                daftarTag={tagSleepStorage}
                                tagTerpilih={inputSleepTag} // Sambungkan ke ban berjalan inputTag, bukan activeTag
                                onPilihTag={setInputSleepTag}
                                onBuatTagBaru={(tag) => {
                                  setTagSleepStorage([...tagSleepStorage, tag]);
                                  setInputSleepTag(tag); // Langsung masukkan tag baru ke ban berjalan
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-start p-2 w-full">
                            <h3 className="text-slate-500 font-medium  w-full text-left pb-4">
                              Hal apa yang membuat energi terisi ulang?
                            </h3>
                            {/* Draf Aktivitas Pemulihan */}
                            {restingActivities.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center bg-white border border-emerald-100 p-2 rounded-xl shadow-sm"
                              >
                                <span className="text-sm font-medium text-slate-700 truncate">
                                  {item.name}
                                </span>
                                <IconButton
                                  icon={Trash2}
                                  onClick={() =>
                                    setRestingActivities(
                                      restingActivities.filter(
                                        (x) => x.id !== item.id,
                                      ),
                                    )
                                  }
                                  className="w-8 h-8 !text-red-400 hover:!bg-red-50 shrink-0"
                                />
                              </div>
                            ))}
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="flex flex-1 min-w-0 items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                                <input
                                  type="text"
                                  placeholder=" Aktivitas yang mengisi energiku ..."
                                  className="outline-none h-8 flex-1 min-w-0 "
                                  value={inputRestingActivity} // Layar membaca dari state
                                  onChange={(e) =>
                                    setInputRestingActivity(e.target.value)
                                  }
                                ></input>
                              </div>
                              <IconButton
                                icon={ListPlus}
                                onClick={addRestingActivity}
                                // Karena kita butuh ListPlus lebih mencolok dari tombol lain,
                                // kita timpa warnanya dengan palu godam (!)
                                className="!bg-blue-600 !text-white hover:!bg-blue-700 size-[clamp(2rem,3vw,2.5rem)]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Tombol Eksekusi Final */}
                    <button
                      onClick={bookEvaluation} // (Gunakan fungsi transaksional yang baru)
                      disabled={
                        flowStateList.length === 0 ||
                        missTaskList.length === 0 ||
                        distractions.length === 0 ||
                        restingActivities.length === 0 ||
                        !crashTime || // String kosong bernilai false, tanda seru membalikkannya jadi true
                        !inputSleepTag // (Atau gunakan sleepTime, tergantung variabel utama tidurmu)
                      }
                      className="mt-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <PencilSparkles className="size-5" />
                      <span>Catat Evaluasi Hari Ini</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <h2 className="font-bold text-lg text-slate-700">
                        Draf Sesi Baru
                      </h2>

                      {/* Input Waktu Kustom M3 */}
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <input
                          type="time"
                          value={startingTime}
                          onChange={(e) => setStartingTime(e.target.value)}
                          className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                        />
                        <span className="text-slate-300 text-sm font-medium">
                          →
                        </span>
                        <input
                          type="time"
                          value={finishingTime}
                          onChange={(e) => setFinishingTime(e.target.value)}
                          className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Area Log Tugas (Kode map milikmu masuk ke sini) */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Tugas apa yang diselesaikan?
                        </h2>
                        {taskList.map((tugas) => (
                          <TaskList
                            key={tugas.id}
                            tugas={tugas}
                            tagStorage={tagStorage}
                            // 1. Saat pekerja melapor tugas selesai diedit:
                            onSimpan={(tugasYangDiedit) => {
                              setTaskList(
                                taskList.map((t) =>
                                  t.id === tugasYangDiedit.id
                                    ? tugasYangDiedit
                                    : t,
                                ),
                              );
                            }}
                            // 2. Saat pekerja menekan tombol tong sampah:
                            onHapus={removeTask}
                            // 3. Saat pekerja mengetik tag baru di dalam TagPicker:
                            onBuatTagBaru={addNewTag}
                          />
                        ))}
                        <div className=" bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between w-full gap-2">
                          <input
                            type="text"
                            placeholder=" tulis judul tugas ..."
                            className="outline-none h-8"
                            value={inputTask} // Layar membaca dari state
                            onChange={(e) => setInputTask(e.target.value)}
                          ></input>
                          <div className="flex gap-2 w-full justify-between">
                            <div className="flex gap-2">
                              <DurationPicker
                                onPilihDurasi={setInputTaskDuration}
                                durasiTerpilih={inputTaskDuration}
                              />
                              <TagPicker
                                daftarTag={tagStorage}
                                tagTerpilih={inputTag} // Sambungkan ke ban berjalan inputTag, bukan activeTag
                                onPilihTag={setInputTag}
                                onBuatTagBaru={(tag) => {
                                  setTagStorage([...tagStorage, tag]);
                                  setInputTag(tag); // Langsung masukkan tag baru ke ban berjalan
                                }}
                              />
                            </div>

                            <IconButton
                              icon={ListPlus}
                              onClick={addTask}
                              // Karena kita butuh ListPlus lebih mencolok dari tombol lain,
                              // kita timpa warnanya dengan palu godam (!)
                              className="!bg-blue-600 !text-white hover:!bg-blue-700 size-[clamp(2rem,3vw,2.5rem)]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Area Log Refleksi (Kode map milikmu masuk ke sini) */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Bagaimana kondisi energi?
                        </h2>
                        {reflectionList.map((ref) => (
                          <ReflectionList
                            key={ref.id}
                            refleksi={ref}
                            onSimpan={(newReflection) => {
                              // Manajer menimpa data gudang dengan laporan refleksi baru dari Pekerja
                              setReflectionList(
                                reflectionList.map((r) =>
                                  r.id === newReflection.id ? newReflection : r,
                                ),
                              );
                            }}
                            onHapus={removeReflection}
                          />
                        ))}
                        <div className="flex justify-between items-center w-full gap-2 mt-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                          <input
                            type="text"
                            placeholder="Ketik apa yang dirasakan..."
                            className="w-full py-1 px-3 outline-none bg-transparent text-sm text-slate-700"
                            value={inputRefleksi}
                            onChange={(e) => setInputRefleksi(e.target.value)}
                            onKeyDown={(e) => {
                              // Trik UX: Eksekusi fungsi jika tombol yang ditekan adalah Enter
                              if (e.key === "Enter") addReflection();
                            }}
                          />
                          <IconButton
                            icon={PenLine}
                            onClick={addReflection}
                            className="!bg-slate-100 hover:!bg-slate-200 !text-slate-600 shrink-0"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Tombol Eksekusi Final */}
                    <button
                      onClick={bookSession}
                      disabled={
                        taskList.length === 0 || reflectionList.length === 0
                      }
                      className="mt-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <PencilSparkles className="size-5" />
                      <span>Catat Sesi ke Jurnal</span>
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
