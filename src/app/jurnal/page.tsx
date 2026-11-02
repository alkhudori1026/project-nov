"use client";
import IconButton from "@/components/IconButon";
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";
import DurationPicker from "@/components/DurationPicker";
import TagPicker from "@/components/TagPicker";
import TaskList from "@/components/TaskList";
import ReflectionList from "@/components/ReflectionList";
import SessionList from "@/components/SessionList";
import { CircleStar, ListPlus, PencilSparkles, PenLine } from "lucide-react";

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

import { useState, useEffect } from "react";

export default function Jurnals() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [tagAktif, setTagAktif] = useState("");

  const [riwayatSesi, setRiwayatSesi] = useState<Sesi[]>([]);
  const [daftarTagGlobal, setDaftarTagGlobal] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Indikator bahwa halaman sudah mendarat di browser

  // ====================================================
  // 1. PEKERJA BONGKAR AWAL (Hanya jalan setelah mendarat di Browser)
  // ====================================================
  useEffect(() => {
    setIsMounted(true); // Beritahu sistem bahwa kita aman untuk mengakses localStorage

    const memoriSesi = localStorage.getItem("jurnal_riwayatSesi");
    const memoriTag = localStorage.getItem("jurnal_daftarTagGlobal");

    if (memoriSesi) setRiwayatSesi(JSON.parse(memoriSesi));
    if (memoriTag) {
      setDaftarTagGlobal(JSON.parse(memoriTag));
    } else {
      // Jika laci tag kosong (pengguna baru), berikan tag bawaan
      setDaftarTagGlobal(["Education", "Skills", "Hobby"]);
    }
  }, []); //kalau depedensinya kosong berarti cman dijalankan sekali saat browser buka halman

  // ====================================================
  // 2. PEKERJA SIMPAN SESI (Jalan setiap riwayatSesi berubah)
  // ====================================================
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("jurnal_riwayatSesi", JSON.stringify(riwayatSesi));
    }
  }, [riwayatSesi, isMounted]);

  // ====================================================
  // 3. PEKERJA SIMPAN TAG (Jalan setiap daftarTagGlobal berubah)
  // ====================================================
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "jurnal_daftarTagGlobal",
        JSON.stringify(daftarTagGlobal),
      );
    }
  }, [daftarTagGlobal, isMounted]); // kalau depndensinya diisi, berarti jadi semacam sensor. jika array di dalam dependensi itu berubah, lakukan useEffect

  const tanganiBuatTagBaru = (tagBaru: string) => {
    setDaftarTagGlobal([...daftarTagGlobal, tagBaru]); // Tambahkan tag baru ke daftar memori global
    setTagAktif(tagBaru); // Langsung jadikan tag baru tersebut sebagai yang terpilih
  };

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

  // State untuk jam mulai dan selesai
  const [waktuMulai, setWaktuMulai] = useState("08:00");
  const [waktuSelesai, setWaktuSelesai] = useState("10:00");

  // FUNGSI PINTAR: Mengekstrak tag secara dinamis dari daftar tugas
  // Menggunakan 'Set' agar tidak ada tag yang ganda/duplikat di pembatas
  const tagSesiAktif = Array.from(
    new Set(daftarTugas.map((tugas) => tugas.tag)),
  );

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

  const riwayatSesiTerurut = [...riwayatSesi].sort((a, b) =>
    a.waktuMulai.localeCompare(b.waktuMulai),
  );

  const tanganiHapusSesiLengkap = (id: string) => {
    setRiwayatSesi(riwayatSesi.filter((s) => s.id !== id));
  };

  if (!isMounted) return null;

  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr] md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr]  h-screen">
      <Navigation />
      <TopBar />
      {/*-----[ Main Page ]-----*/}

      <div
        className="bg-slate-100 px-12 flex-1 py-4 overflow-y-auto no-scrollbar relative"
        onScroll={tanganiScroll}
      >
        <div className="max-w-250 mx-auto bg-white rounded-3xl shadow-sm relative pb-4">
          {/* --- HEADER STICKY --- */}
          <header
            className={`sticky -top-4 z-30 flex justify-between items-center p-4 bg-white/80 backdrop-blur-md transition-all duration-300 border-b ${isScrolled ? "rounded-none shadow-md border-transparent" : "rounded-t-3xl shadow-none border-slate-100"}`}
          >
            <h1 className="font-semibold text-[clamp(1.25rem,3vw,1.75rem)] text-slate-800">
              Sabtu, 31 Oktober 2026
            </h1>
            <IconButton
              icon={CircleStar}
              className={`size-[clamp(2.5rem,4vw,3.5rem)] ${isFavorite ? "!text-amber-500 !bg-amber-50 hover:!bg-amber-100" : ""}`}
              onClick={() => setIsFavorite(!isFavorite)}
            />
          </header>

          <div className="p-4 pt-4 flex flex-col gap-8">
            {/*1. LOG SESI TERSIMPAN (HISTORY) */}
            <section id="log-sesi" className="flex flex-col gap-6">
              {riwayatSesiTerurut.map((sesi) => (
                <div
                  key={sesi.id}
                  className="flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity mb-6"
                >
                  <SessionList
                    key={sesi.id}
                    sesi={sesi}
                    daftarTagGlobal={daftarTagGlobal}
                    onSimpan={(sesiDiperbarui) => {
                      setRiwayatSesi(
                        riwayatSesi.map((s) =>
                          s.id === sesiDiperbarui.id ? sesiDiperbarui : s,
                        ),
                      );
                    }}
                    onHapus={tanganiHapusSesiLengkap}
                    onBuatTagBaru={tanganiBuatTagBaru}
                  />
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
                      <TaskList
                        key={tugas.id}
                        tugas={tugas}
                        daftarTagGlobal={daftarTagGlobal}
                        // 1. Saat pekerja melapor tugas selesai diedit:
                        onSimpan={(tugasYangDiedit) => {
                          setDaftarTugas(
                            daftarTugas.map((t) =>
                              t.id === tugasYangDiedit.id ? tugasYangDiedit : t,
                            ),
                          );
                        }}
                        // 2. Saat pekerja menekan tombol tong sampah:
                        onHapus={tanganiHapusTugas}
                        // 3. Saat pekerja mengetik tag baru di dalam TagPicker:
                        onBuatTagBaru={tanganiBuatTagBaru}
                      />
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
                      <ReflectionList
                        key={ref.id}
                        refleksi={ref}
                        onSimpan={(refleksiBaru) => {
                          // Manajer menimpa data gudang dengan laporan refleksi baru dari Pekerja
                          setDaftarRefleksi(
                            daftarRefleksi.map((r) =>
                              r.id === refleksiBaru.id ? refleksiBaru : r,
                            ),
                          );
                        }}
                        onHapus={tanganiHapusRefleksi}
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
