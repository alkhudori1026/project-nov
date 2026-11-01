"use client";
import IconButton from "@/components/IconButon";
import Navigation from "@/components/Navigasi";
import TopBar from "@/components/TopBar";
import DurationPicker from "@/components/DurationPicker";
import TagPicker from "@/components/TagPicker";
import {
  CircleStar,
  ListPlus,
  Tag,
  PencilSparkles,
  PenLine,
  Trash2,
  Pencil,
  Check,
  X,
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
  teks: string;
}

interface Sesi {
  id: string;
  waktuMulai: string;
  waktuSelesai: string;
  tagUnik: string[];
  tugas: Tugas[];
  refleksi: Refleksi[];
}

import { useState } from "react";

export default function Home() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [viewAktif, setViewAktif] = useState("Home");
  const [durasiTugas, setDurasiTugas] = useState("");
  const [daftarTagGlobal, setDaftarTagGlobal] = useState([
    "Education",
    "Skills",
    "Hobby",
  ]);
  const [tagAktif, setTagAktif] = useState("");
  const tanganiBuatTagBaru = (tagBaru: string) => {
    // Tambahkan tag baru ke daftar memori global
    setDaftarTagGlobal([...daftarTagGlobal, tagBaru]);
    // Langsung jadikan tag baru tersebut sebagai yang terpilih
    setTagAktif(tagBaru);
  };
  const [isScrolled, setIsScrolled] = useState(false);

  // 2. Fungsi membaca pergerakan scroll
  const tanganiScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Jika guliran melewati batas 10px, anggap statusnya "sedang di-scroll"
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  // 2. Gudang Penyimpanan: Array yang menampung tugas jadi
  const [daftarTugas, setDaftarTugas] = useState<Tugas[]>([]);

  // 3. Ban Berjalan (Bahan Baku Sementara)
  const [inputNamaTugas, setInputNamaTugas] = useState("");
  const [inputDurasi, setInputDurasi] = useState("");
  const [inputTag, setInputTag] = useState("");

  const tanganiTambahTugas = () => {
    // A. Validasi: Jangan proses jika nama tugas kosong
    if (!inputNamaTugas.trim()) return;

    // B. Rakit Objek Baru
    const tugasBaru: Tugas = {
      id: crypto.randomUUID(), // Menghasilkan ID unik standar industri
      nama: inputNamaTugas,
      durasi: inputDurasi || "0 j 0 m", // Fallback jika lupa diisi
      tag: inputTag || "Tanpa Tag", // Fallback jika lupa diisi
    };

    // C. Pindahkan ke Gudang (Gabungkan dengan data yang sudah ada)
    setDaftarTugas([...daftarTugas, tugasBaru]);

    // D. Bersihkan Ban Berjalan (Reset form ke kosong)
    setInputNamaTugas("");
    setInputDurasi("");
    setInputTag("");
  };

  const tanganiHapusTugas = (idYangDihapus: string) => {
    // Filter akan menghasilkan array baru yang hanya berisi tugas
    // yang ID-nya TIDAK SAMA dengan idYangDihapus
    const daftarBaru = daftarTugas.filter(
      (tugas) => tugas.id !== idYangDihapus,
    );

    // Timpa gudang lama dengan array baru yang sudah bersih
    setDaftarTugas(daftarBaru);
  };

  const [daftarRefleksi, setDaftarRefleksi] = useState<Refleksi[]>([]);

  // 3. Ban Berjalan (Input Teks Sementara)
  const [inputRefleksi, setInputRefleksi] = useState("");

  const tanganiTambahRefleksi = () => {
    if (!inputRefleksi.trim()) return; // Cegah input kosong

    const refleksiBaru: Refleksi = {
      id: crypto.randomUUID(),
      teks: inputRefleksi,
    };

    setDaftarRefleksi([...daftarRefleksi, refleksiBaru]);
    setInputRefleksi(""); // Bersihkan kolom input
  };

  const tanganiHapusRefleksi = (idYangDihapus: string) => {
    setDaftarRefleksi(daftarRefleksi.filter((r) => r.id !== idYangDihapus));
  };
  // ... di dalam Home()
  const [idEditRefleksi, setIdEditRefleksi] = useState<string | null>(null);
  const [teksEditRefleksi, setTeksEditRefleksi] = useState("");

  const tanganiSimpanEditRefleksi = (id: string) => {
    if (!teksEditRefleksi.trim()) return; // Jangan simpan jika draf kosong

    // Saring dan timpa teks pada ID yang cocok
    const daftarBaru = daftarRefleksi.map((ref) =>
      ref.id === id ? { ...ref, teks: teksEditRefleksi } : ref,
    );

    setDaftarRefleksi(daftarBaru);
    setIdEditRefleksi(null); // Matikan mode edit
  };

  // State untuk menyimpan ID tugas yang sedang diedit
  const [idEditTugas, setIdEditTugas] = useState<string | null>(null);
  // State untuk menyimpan teks sementara saat mengetik
  const [teksEditTugas, setTeksEditTugas] = useState("");
  const [tagEditTugas, setTagEditTugas] = useState(""); // Memori baru
  const [durasiEditTugas, setDurasiEditTugas] = useState(""); // Memori baru

  const tanganiSimpanEditTugas = (id: string) => {
    if (!teksEditTugas.trim()) return;

    const daftarBaru = daftarTugas.map((tugas) =>
      tugas.id === id
        ? {
            ...tugas,
            nama: teksEditTugas,
            tag: tagEditTugas,
            durasi: durasiEditTugas,
          }
        : tugas,
    );

    setDaftarTugas(daftarBaru);
    setIdEditTugas(null); // Tutup mode edit
  };

  // State untuk jam mulai dan selesai
  const [waktuMulai, setWaktuMulai] = useState("08:00");
  const [waktuSelesai, setWaktuSelesai] = useState("10:00");

  // FUNGSI PINTAR: Mengekstrak tag secara dinamis dari daftar tugas
  // Menggunakan 'Set' agar tidak ada tag yang ganda/duplikat di pembatas
  const tagSesiAktif = Array.from(
    new Set(daftarTugas.map((tugas) => tugas.tag)),
  );

  const [riwayatSesi, setRiwayatSesi] = useState<Sesi[]>([]);

  const tanganiCatatSesi = () => {
    // A. Validasi Keamanan: Cegah penyimpanan jika meja kerja kosong
    if (daftarTugas.length === 0 && daftarRefleksi.length === 0) return;

    // B. Proses Perakitan (Bungkus ke dalam Objek Sesi)
    const sesiBaru: Sesi = {
      id: crypto.randomUUID(),
      waktuMulai: waktuMulai || "00:00",
      waktuSelesai: waktuSelesai || "00:00",
      tagUnik: tagSesiAktif, // Menggunakan variabel pintar 'Set' yang kita buat sebelumnya
      tugas: [...daftarTugas],
      refleksi: [...daftarRefleksi],
    };

    // C. Kirim ke Gudang Utama (Riwayat Sesi)
    // Letakkan sesi baru di urutan paling atas (...sesiBaru, lalu ...riwayatSesi)
    setRiwayatSesi([...riwayatSesi, sesiBaru]);

    // D. Operasi Pembersihan (Reset Draft)
    setDaftarTugas([]);
    setDaftarRefleksi([]);
    // Opsional: Kamu bisa mereset waktuMulai ke waktu saat ini jika mau,
    // atau membiarkannya sebagai default.
  };

  // State Memori Edit Sesi
  const [idEditSesi, setIdEditSesi] = useState<string | null>(null);
  const [draftEditSesi, setDraftEditSesi] = useState<Sesi | null>(null);

  // Fungsi Eksekutor
  const tanganiSimpanEditSesi = () => {
    if (!draftEditSesi) return;

    // Ekstrak ulang tag unik berjaga-jaga jika ada tag yang diganti saat edit
    const tagBaru = Array.from(new Set(draftEditSesi.tugas.map((t) => t.tag)));
    const sesiFinal = { ...draftEditSesi, tagUnik: tagBaru };

    // Timpa data lama dengan data dari Kotak Pasir
    setRiwayatSesi(
      riwayatSesi.map((s) => (s.id === idEditSesi ? sesiFinal : s)),
    );

    // Tutup mode edit & bersihkan kotak pasir
    setIdEditSesi(null);
    setDraftEditSesi(null);
  };

  return (
    <div className="grid grid-cols-[1fr_16fr] grid-rows-[auto_1fr] h-screen ">
      <Navigation viewAktif={viewAktif} onUbahView={setViewAktif} />
      <TopBar />
      {/*-----[ Main Page ]-----*/}

      <div
        className="bg-slate-100 px-6 flex-1 py-4 overflow-y-auto no-scrollbar relative"
        onScroll={tanganiScroll}
      >
        <div className="max-w-250 mx-auto bg-white rounded-3xl shadow-sm relative pb-4">
          {/* --- HEADER STICKY --- */}
          <header
            className={`sticky -top-4 z-30 flex justify-between items-center p-4 bg-white/80 backdrop-blur-md transition-all duration-300 border-b ${isScrolled ? "rounded-none shadow-md border-transparent" : "rounded-t-3xl shadow-none border-slate-100"}`}
          >
            <h1 className="font-semibold text-xl text-slate-800">
              Sabtu, 31 Oktober 2026
            </h1>
            <IconButton
              icon={CircleStar}
              className={`size-[clamp(2.5rem,4vw,3.5rem)] ${isFavorite ? "!text-amber-500 !bg-amber-50 hover:!bg-amber-100" : ""}`}
              onClick={() => setIsFavorite(!isFavorite)}
            />
          </header>

          <div className="p-4 pt-4 flex flex-col gap-8">
            {/* =========================================
          1. LOG SESI TERSIMPAN (HISTORY) 
          Desain dibuat lebih solid dan "read-only"
      ========================================= */}
            <section className="flex flex-col gap-4 opacity-75 hover:opacity-100 transition-opacity">
              {/* Pembatas Waktu & Tag (Statis untuk history) */}
              <div className="flex items-center gap-3">
                <p className="whitespace-nowrap shrink-0 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full tracking-wide">
                  08.00 - 10.00
                </p>
                <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                <div className="flex gap-1.5 shrink-0">
                  <span className="px-2.5 py-0.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md">
                    Education
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md">
                    Skills
                  </span>
                </div>
              </div>

              {/* Konten Log Selesai */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tugas Selesai
                  </h3>
                  <div className="flex justify-between items-center border-l-2 border-blue-400 pl-3">
                    <p className="font-medium text-sm text-slate-700">
                      Belajar UTBK
                    </p>
                    <span className="text-xs text-slate-500 font-medium">
                      1 jam
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-l-2 border-blue-400 pl-3">
                    <p className="font-medium text-sm text-slate-700">
                      Lanjut Projek Koding
                    </p>
                    <span className="text-xs text-slate-500 font-medium">
                      1 jam
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Refleksi
                  </h3>
                  <p className="text-sm text-slate-600 border-l-2 border-slate-300 pl-3">
                    Seru belajar sama temen
                  </p>
                  <p className="text-sm text-slate-600 border-l-2 border-slate-300 pl-3">
                    Pusing nyari soal-soal latihan
                  </p>
                  <p className="text-sm text-slate-600 border-l-2 border-slate-300 pl-3">
                    Bingung sama konsep logika
                  </p>
                </div>
              </div>
            </section>
            {/* =========================================
    1. LOG SESI TERSIMPAN (HISTORY) 
========================================= */}
            <section id="log-sesi" className="flex flex-col gap-6">
              {riwayatSesi.map((sesi) => (
                <div
                  key={sesi.id}
                  className="flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity mb-6"
                >
                  {idEditSesi === sesi.id && draftEditSesi ? (
                    // ==========================================
                    // 🛠️ MODE EDIT TOTAL (SANDBOX AKTIF)
                    // ==========================================
                    <div className="flex flex-col gap-5 bg-blue-50/40 p-5 rounded-3xl border border-blue-200/60 shadow-inner">
                      {/* --- HEADER EDIT (Jam & Tuas Simpan) --- */}
                      <div className="flex justify-between items-center border-b border-blue-200/50 pb-4">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-300 shadow-sm">
                          <input
                            type="time"
                            value={draftEditSesi.waktuMulai}
                            onChange={(e) =>
                              setDraftEditSesi({
                                ...draftEditSesi,
                                waktuMulai: e.target.value,
                              })
                            }
                            className="text-sm font-bold outline-none bg-transparent text-slate-700"
                          />
                          <span className="text-slate-400 font-medium">→</span>
                          <input
                            type="time"
                            value={draftEditSesi.waktuSelesai}
                            onChange={(e) =>
                              setDraftEditSesi({
                                ...draftEditSesi,
                                waktuSelesai: e.target.value,
                              })
                            }
                            className="text-sm font-bold outline-none bg-transparent text-slate-700"
                          />
                        </div>
                        <div className="flex gap-2">
                          <IconButton
                            icon={Check}
                            onClick={tanganiSimpanEditSesi}
                            className="!bg-emerald-500 !text-white hover:!bg-emerald-600 size-9 shadow-sm"
                          />
                          <IconButton
                            icon={X}
                            onClick={() => {
                              setIdEditSesi(null);
                              setDraftEditSesi(null);
                            }}
                            className="!bg-slate-200 !text-slate-600 hover:!bg-slate-300 size-9"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-3 ">
                        {/* --- AREA EDIT TUGAS --- */}
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                          <h3 className="text-[10px] font-bold text-blue-800/50 uppercase tracking-wider ml-1">
                            Edit Tugas
                          </h3>
                          {draftEditSesi.tugas.map((t) => (
                            <div
                              key={t.id}
                              className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-white p-2 rounded-xl border border-blue-100 shadow-sm"
                            >
                              <input
                                type="text"
                                value={t.nama}
                                onChange={(e) => {
                                  // Memanipulasi array di dalam objek Kotak Pasir
                                  const newTugas = draftEditSesi.tugas.map(
                                    (x) =>
                                      x.id === t.id
                                        ? { ...x, nama: e.target.value }
                                        : x,
                                  );
                                  setDraftEditSesi({
                                    ...draftEditSesi,
                                    tugas: newTugas,
                                  });
                                }}
                                className="flex-1 text-sm font-medium text-slate-700 outline-none bg-slate-50 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-blue-100 min-w-[200px]"
                              />
                              <div className="flex gap-1 shrink-0 ml-auto md:ml-0">
                                <DurationPicker
                                  isCompact
                                  durasiTerpilih={t.durasi}
                                  onPilihDurasi={(val) => {
                                    const newTugas = draftEditSesi.tugas.map(
                                      (x) =>
                                        x.id === t.id
                                          ? { ...x, durasi: val }
                                          : x,
                                    );
                                    setDraftEditSesi({
                                      ...draftEditSesi,
                                      tugas: newTugas,
                                    });
                                  }}
                                />
                                <TagPicker
                                  isCompact
                                  daftarTag={daftarTagGlobal}
                                  tagTerpilih={t.tag}
                                  onPilihTag={(val) => {
                                    const newTugas = draftEditSesi.tugas.map(
                                      (x) =>
                                        x.id === t.id ? { ...x, tag: val } : x,
                                    );
                                    setDraftEditSesi({
                                      ...draftEditSesi,
                                      tugas: newTugas,
                                    });
                                  }}
                                  onBuatTagBaru={(val) => {
                                    setDaftarTagGlobal([
                                      ...daftarTagGlobal,
                                      val,
                                    ]);
                                    const newTugas = draftEditSesi.tugas.map(
                                      (x) =>
                                        x.id === t.id ? { ...x, tag: val } : x,
                                    );
                                    setDraftEditSesi({
                                      ...draftEditSesi,
                                      tugas: newTugas,
                                    });
                                  }}
                                />
                                <IconButton
                                  icon={Trash2}
                                  onClick={() => {
                                    const newTugas = draftEditSesi.tugas.filter(
                                      (x) => x.id !== t.id,
                                    );
                                    setDraftEditSesi({
                                      ...draftEditSesi,
                                      tugas: newTugas,
                                    });
                                  }}
                                  className="w-8 h-8 !text-red-400 hover:!bg-red-50 ml-1"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* --- AREA EDIT REFLEKSI --- */}
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                          <h3 className="text-[10px] font-bold text-blue-800/50 uppercase tracking-wider ml-1">
                            Edit Refleksi
                          </h3>
                          {draftEditSesi.refleksi.map((r) => (
                            <div
                              key={r.id}
                              className="flex gap-2 items-center bg-white p-2 rounded-xl border border-blue-100 shadow-sm"
                            >
                              <input
                                type="text"
                                value={r.teks}
                                onChange={(e) => {
                                  const newRef = draftEditSesi.refleksi.map(
                                    (x) =>
                                      x.id === r.id
                                        ? { ...x, teks: e.target.value }
                                        : x,
                                  );
                                  setDraftEditSesi({
                                    ...draftEditSesi,
                                    refleksi: newRef,
                                  });
                                }}
                                className="flex-1 text-sm font-medium text-slate-700 outline-none bg-slate-50 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-blue-100"
                              />
                              <IconButton
                                icon={Trash2}
                                onClick={() => {
                                  const newRef = draftEditSesi.refleksi.filter(
                                    (x) => x.id !== r.id,
                                  );
                                  setDraftEditSesi({
                                    ...draftEditSesi,
                                    refleksi: newRef,
                                  });
                                }}
                                className="w-8 h-8 !text-red-400 hover:!bg-red-50 shrink-0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // ==========================================
                    // 📖 MODE BACA (Batas Waktu, Tombol Hover, dan Konten)
                    // ==========================================
                    <>
                      {/* PEMBATAS SESI (Sama persis seperti yang kamu rancang sebelumnya) */}
                      <div className="group flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-0 opacity-0 overflow-hidden group-hover:w-[3.5rem] group-hover:opacity-100 transition-all duration-300 delay-300 ease-out flex shrink-0 gap-1">
                            <IconButton
                              icon={Pencil}
                              onClick={() => {
                                setIdEditSesi(sesi.id);
                                // 1. Saat tombol Edit ditekan, SALIN seluruh data sesi ke Sandbox
                                setDraftEditSesi({
                                  ...sesi,
                                  tugas: [...sesi.tugas],
                                  refleksi: [...sesi.refleksi],
                                });
                              }}
                              className="w-6 h-6 !text-blue-500 hover:!bg-blue-50 focus:opacity-100"
                            />
                            <IconButton
                              icon={Trash2}
                              onClick={() => tanganiHapusRiwayatSesi(sesi.id)}
                              className="w-6 h-6 !text-red-400 hover:!bg-red-50 focus:opacity-100"
                            />
                          </div>
                          <p className="whitespace-nowrap shrink-0 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 -ml-2 group-hover:ml-0 delay-300 transition-all duration-300 rounded-full tracking-wide">
                            {sesi.waktuMulai} - {sesi.waktuSelesai}
                          </p>
                        </div>
                        <div className="flex-1 border-t-2 border-dashed border-slate-200 min-w-4" />
                        <div className="flex gap-1.5 shrink-0">
                          {sesi.tagUnik.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {/* Konten Log Selesai (Render Dinamis) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kolom Tugas */}
                    {sesi.tugas.length > 0 && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-wrap mb-1">
                          Tugas Selesai
                        </h3>
                        {sesi.tugas.map((t) => (
                          <div
                            key={t.id}
                            className="flex justify-between items-center border-l-2 border-blue-400 pl-3 gap-2"
                          >
                            <p className="font-medium text-sm text-slate-700 break-all">
                              {t.nama}
                            </p>
                            <span className="text-xs text-slate-500 font-medium shrink-0">
                              {t.durasi}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Kolom Refleksi */}
                    {sesi.refleksi.length > 0 && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Refleksi
                        </h3>
                        {sesi.refleksi.map((r) => (
                          <p
                            key={r.id}
                            className="text-sm text-slate-600 border-l-2 border-slate-300 pl-3"
                          >
                            {r.teks}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
            {/* =========================================
          2. AREA INPUT SESI AKTIF (DRAFT)
          Desain menonjol dengan elevasi form
      ========================================= */}
            <section id="input-sesi" className="flex flex-col gap-4 mt-2">
              {/* PEMBATAS DINAMIS (Bereaksi terhadap form di bawahnya) */}
              <div className="flex items-center gap-3">
                <p className="whitespace-nowrap shrink-0 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full tracking-wide transition-all">
                  {waktuMulai || "--:--"} - {waktuSelesai || "--:--"}
                </p>
                <div className="flex-1 border-t-2 border-blue-100" />
                <div className="flex gap-1.5 shrink-0 transition-all">
                  {tagSesiAktif.length > 0 ? (
                    tagSesiAktif.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-medium text-slate-400 italic">
                      Belum ada tag
                    </span>
                  )}
                </div>
              </div>

              {/* BUNGKUSAN FORM (Kanvas Kerja) */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-4 flex flex-col gap-6 shadow-sm">
                {/* Header Form & Input Waktu yang Dipercantik */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <h2 className="font-bold text-lg text-slate-700">
                    Draf Sesi Baru
                  </h2>

                  {/* Input Waktu Kustom M3 */}
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <input
                      type="time"
                      value={waktuMulai}
                      onChange={(e) => setWaktuMulai(e.target.value)}
                      className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                    />
                    <span className="text-slate-300 text-sm font-medium">
                      →
                    </span>
                    <input
                      type="time"
                      value={waktuSelesai}
                      onChange={(e) => setWaktuSelesai(e.target.value)}
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
                    {daftarTugas.map((tugas) => (
                      <div
                        key={tugas.id}
                        // PERHATIKAN: overflow-visible aktif saat diedit agar laci popover tidak terpotong!
                        className={`group relative flex justify-between items-center w-full bg-white rounded-r-md pl-4 pr-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-blue-600 hover:before:w-[4px] before:transition-all before:duration-300 before:ease-out
      ${idEditTugas === tugas.id ? "overflow-visible z-20" : "overflow-hidden"}
    `}
                      >
                        {idEditTugas === tugas.id ? (
                          // ==========================
                          // 🛠️ MODE EDIT MENYELURUH
                          // ==========================
                          <div className="flex flex-wrap items-center justify-end w-full gap-2">
                            {/* Tombol Aksi Kiri */}
                            <div className="flex shrink-0 gap-1 w-16 ">
                              <IconButton
                                icon={Check}
                                onClick={() => tanganiSimpanEditTugas(tugas.id)}
                                className="w-8 h-8 !text-emerald-600 hover:!bg-emerald-50"
                              />
                              <IconButton
                                icon={X}
                                onClick={() => setIdEditTugas(null)}
                                className="w-8 h-8 !text-slate-400 hover:!bg-slate-100"
                              />
                            </div>

                            {/* Input Nama Tugas */}
                            <input
                              type="text"
                              className="text-sm font-medium text-slate-700 outline-none bg-slate-50 px-2 py-1.5 rounded-md border border-blue-300 focus:border-blue-500 transition-colors min-w-35 flex-1"
                              value={teksEditTugas}
                              onChange={(e) => setTeksEditTugas(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  tanganiSimpanEditTugas(tugas.id);
                                if (e.key === "Escape") setIdEditTugas(null);
                              }}
                              autoFocus
                            />

                            {/* Mesin Picker Tag & Durasi (Di-render ulang untuk baris ini) */}
                            <div className="flex gap-1 shrink-0">
                              <DurationPicker
                                onPilihDurasi={setDurasiEditTugas}
                                // Opsional: jika DurationPicker milikmu belum memiliki prop ini,
                                // abaikan atau tambahkan agar ia bisa menampilkan nilai saat ini
                                durasiTerpilih={durasiEditTugas}
                                isCompact={true}
                              />
                              <TagPicker
                                daftarTag={daftarTagGlobal}
                                tagTerpilih={tagEditTugas}
                                onPilihTag={setTagEditTugas}
                                onBuatTagBaru={(tag) => {
                                  setDaftarTagGlobal([...daftarTagGlobal, tag]);
                                  setTagEditTugas(tag);
                                }}
                                isCompact={true}
                              />
                            </div>
                          </div>
                        ) : (
                          // ==========================
                          // 📖 MODE BACA (TIDAK BERUBAH)
                          // ==========================
                          <>
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="w-0 opacity-0 overflow-hidden group-hover:w-[4.5rem] group-hover:opacity-100 transition-all duration-300 delay-300 ease-out flex shrink-0 gap-1 mr-2">
                                {/* Tombol Pemicu Mode Edit */}
                                <IconButton
                                  icon={Pencil}
                                  onClick={() => {
                                    setIdEditTugas(tugas.id);
                                    setTeksEditTugas(tugas.nama);
                                    setTagEditTugas(tugas.tag); // Muat tag yang ada
                                    setDurasiEditTugas(tugas.durasi); // Muat durasi yang ada
                                  }}
                                  className="w-8 h-8 !text-blue-500 hover:!bg-blue-50 focus:opacity-100 shrink-0"
                                />
                                <IconButton
                                  icon={Trash2}
                                  onClick={() => tanganiHapusTugas(tugas.id)}
                                  className="w-8 h-8 !text-red-400 hover:!text-red-600 hover:!bg-red-50 focus:opacity-100 shrink-0"
                                />
                              </div>
                              <h3 className="text-left font-medium text-slate-700 truncate flex-1 min-w-0">
                                {tugas.nama}
                              </h3>
                            </div>

                            <div className="flex gap-2 shrink-0 ml-4">
                              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md px-2 py-1">
                                {tugas.tag}
                              </span>
                              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 rounded-md px-2 py-1">
                                {tugas.durasi}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div className=" bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between w-full gap-2">
                      <input
                        type="text"
                        placeholder=" tulis judul tugas ..."
                        className="outline-none h-8"
                        value={inputNamaTugas} // Layar membaca dari state
                        onChange={(e) => setInputNamaTugas(e.target.value)}
                      ></input>
                      <div className="flex gap-2 w-full justify-between">
                        <div className="flex gap-2">
                          <DurationPicker
                            onPilihDurasi={setInputDurasi}
                            durasiTerpilih={inputDurasi}
                          />
                          <TagPicker
                            daftarTag={daftarTagGlobal}
                            tagTerpilih={inputTag} // Sambungkan ke ban berjalan inputTag, bukan tagAktif
                            onPilihTag={setInputTag}
                            onBuatTagBaru={(tag) => {
                              setDaftarTagGlobal([...daftarTagGlobal, tag]);
                              setInputTag(tag); // Langsung masukkan tag baru ke ban berjalan
                            }}
                          />
                        </div>

                        <IconButton
                          icon={ListPlus}
                          onClick={tanganiTambahTugas}
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
                    {daftarRefleksi.map((ref) => (
                      <div
                        key={ref.id}
                        className="group relative flex justify-between items-center w-full bg-white rounded-r-md pl-4 pr-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-slate-400 hover:before:w-[4px] before:transition-all before:duration-300 before:ease-out"
                      >
                        {idEditRefleksi === ref.id ? (
                          // ==========================
                          // 🛠️ MODE EDIT
                          // ==========================
                          <div className="flex items-center w-full gap-2 z-10">
                            <input
                              type="text"
                              className="w-full text-sm outline-none bg-slate-50 px-2 py-1.5 rounded-md border border-blue-300 focus:border-blue-500 transition-colors"
                              value={teksEditRefleksi}
                              onChange={(e) =>
                                setTeksEditRefleksi(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  tanganiSimpanEditRefleksi(ref.id);
                                if (e.key === "Escape") setIdEditRefleksi(null);
                              }}
                              autoFocus // Kursor langsung berkedip di sini saat mode edit terbuka
                            />
                            <div className="flex shrink-0 gap-1">
                              <IconButton
                                icon={Check}
                                onClick={() =>
                                  tanganiSimpanEditRefleksi(ref.id)
                                }
                                className="w-8 h-8 !text-emerald-600 hover:!bg-emerald-50"
                              />
                              <IconButton
                                icon={X}
                                onClick={() => setIdEditRefleksi(null)}
                                className="w-8 h-8 !text-slate-400 hover:!bg-slate-100"
                              />
                            </div>
                          </div>
                        ) : (
                          // ==========================
                          // 📖 MODE BACA
                          // ==========================
                          <>
                            <p className="text-sm text-slate-700 flex-1 min-w-0 truncate">
                              {ref.teks}
                            </p>

                            {/* Kontainer Tombol Aksi (Sejajar di Kanan, Muncul saat Hover) */}
                            <div className="w-0 opacity-0 overflow-hidden group-hover:w-[4.5rem] group-hover:opacity-100 transition-all duration-300 delay-300 ease-out flex shrink-0 gap-1 ml-2 justify-end">
                              {/* Tombol Edit */}
                              <IconButton
                                icon={Pencil}
                                onClick={() => {
                                  setIdEditRefleksi(ref.id);
                                  setTeksEditRefleksi(ref.teks);
                                }}
                                className="w-8 h-8 !text-blue-500 hover:!bg-blue-50 focus:opacity-100"
                              />

                              {/* Tombol Hapus */}
                              <IconButton
                                icon={Trash2}
                                onClick={() => tanganiHapusRefleksi(ref.id)}
                                className="w-8 h-8 !text-red-400 hover:!text-red-600 hover:!bg-red-50 focus:opacity-100"
                              />
                            </div>
                          </>
                        )}
                      </div>
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
                          if (e.key === "Enter") tanganiTambahRefleksi();
                        }}
                      />
                      <IconButton
                        icon={PenLine}
                        onClick={tanganiTambahRefleksi}
                        className="!bg-slate-100 hover:!bg-slate-200 !text-slate-600 shrink-0"
                      />
                    </div>
                  </div>
                </div>
                {/* Tombol Eksekusi Final */}
                <button
                  onClick={tanganiCatatSesi}
                  disabled={
                    daftarTugas.length === 0 && daftarRefleksi.length === 0
                  }
                  className="mt-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <PencilSparkles className="size-5" />
                  <span>Catat Sesi ke Jurnal</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
