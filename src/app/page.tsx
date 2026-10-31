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

  return (
    <div className="grid grid-cols-[1fr_16fr] grid-rows-[auto_1fr] h-screen ">
      <Navigation viewAktif={viewAktif} onUbahView={setViewAktif} />
      <TopBar />
      {/*-----[ Main Page ]-----*/}
      <div
        className="bg-slate-100 px-6 flex-1 pb-2 overflow-y-auto no-scrollbar relative"
        onScroll={tanganiScroll}
      >
        <div className="max-w-250 mx-auto bg-white rounded-3xl SHADOW-SM relative">
          <header
            className={`sticky top-0 z-20 flex justify-between items-center p-4 bg-white/75 backdrop-blur-sm transition-all duration-300 border-b
            ${
              isScrolled
                ? "rounded-none shadow-md border-transparent" // Kondisi 2: Saat di-scroll (Tegas & Melayang)
                : "rounded-t-3xl shadow-none border-slate-100" // Kondisi 1: Saat diam di atas (Menyatu dengan kartu)
            }`}
          >
            <h1 className="font-semibold text-xl">Sabtu, 31 Oktober 2026</h1>
            <IconButton
              icon={CircleStar}
              className={`size-[clamp(2.5rem,4vw,3.5rem)] ${
                isFavorite
                  ? "!text-amber-500 !bg-amber-50 hover:!bg-amber-100 hover:!text-amber-600"
                  : ""
              }`}
              onClick={() => setIsFavorite(!isFavorite)}
            />
          </header>
          <div className="bg-white rounded-b-3xl  min-h-max p-4 pt-2">
            <section id="log-sesi">
              <div className="flex items-center gap-2">
                {/* Teks Jam: Ditahan agar tidak pernah patah baris atau menyusut */}
                <p className="whitespace-nowrap shrink-0 text-sm">
                  08.00 - 10.00
                </p>

                {/* Garis Pembatas: Fleksibel mengambil sisa ruang kosong */}
                <div className="flex-1 border border-slate-200" />

                {/* Kontainer Tag: Mengembang ke kiri tanpa menumpuk ke bawah */}
                <div className="flex gap-1.5 whitespace-nowrap shrink-0">
                  <span className="px-2 py-0.5 text-sm bg-green-100 rounded-md">
                    Education
                  </span>
                  <span className="px-2 py-0.5 text-sm bg-blue-100 rounded-md">
                    Skills
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row p-4 gap-4">
                <div className="bg-slate-100 rounded-2xl w-full min-h-15 px-3 py-4 flex flex-col gap-3">
                  <div className="flex justify-between border-l border-blue-400 rounded-b-sm px-2">
                    <h3 className="font-semibold">Belajar UTBK</h3>
                    <span className="text-gray-500">1 jam</span>
                  </div>
                  <div className="flex justify-between border-l border-blue-400 rounded-b-sm px-2">
                    <h3 className="font-semibold">Lanjut Projek Koding</h3>
                    <span className="text-gray-500">1 jam</span>
                  </div>
                </div>
                <div className="bg-slate-100 rounded-2xl w-full min-h-15 p-3 flex flex-col gap-3">
                  <div className="w-full border-l border-blue-400 rounded-b-sm px-2">
                    <h3 className="font-semibold">Seru belajar sama temen</h3>
                  </div>
                  <div className="w-full border-l border-blue-400 rounded-b-sm px-2">
                    <h3 className="font-semibold">
                      Pusing nyari soal-soal latihan
                    </h3>
                  </div>
                  <div className="w-full border-l border-blue-400 rounded-b-sm px-2">
                    <h3 className="font-semibold">
                      Bingung sama konsep logika
                    </h3>
                  </div>
                </div>
              </div>
            </section>
            <div className="flex gap-2 mt-4 justify-between items-center">
              <div className="w-full h-0 border rounded-full border-slate-300 "></div>
            </div>
            <div className="flex flex-col p-4 gap-4">
              <div className="bg-slate-100 rounded-2xl w-full px-5 py-2 flex flex-col md:flex-row gap-3 items-center md:justify-between">
                <h2 className="font-semibold text-lg text-center md:text-left w-full border-b md:border-b-0">
                  Sesi
                </h2>
                <div className="flex gap-3">
                  <input type="time" name="" id=""></input>
                  <p>sampai</p>
                  <input type="time" name="" id=""></input>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="bg-slate-100 border border-slate-200/60 rounded-2xl w-full min-h-15 p-3 gap-3 flex flex-col items-center justify-start">
                  <h2 className="border-b border-slate-200 w-full text-left font-semibold text-sm text-slate-500 pb-2 uppercase tracking-wider">
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
                        <div className="flex items-center w-full gap-2">
                          {/* Tombol Aksi Kiri */}
                          <div className="flex shrink-0 gap-1">
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
                            className="flex-1 text-sm font-medium text-slate-700 outline-none bg-slate-50 px-2 py-1.5 rounded-md border border-blue-300 focus:border-blue-500 transition-colors min-w-0"
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
                            />
                            <TagPicker
                              daftarTag={daftarTagGlobal}
                              tagTerpilih={tagEditTugas}
                              onPilihTag={setTagEditTugas}
                              onBuatTagBaru={(tag) => {
                                setDaftarTagGlobal([...daftarTagGlobal, tag]);
                                setTagEditTugas(tag);
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        // ==========================
                        // 📖 MODE BACA (TIDAK BERUBAH)
                        // ==========================
                        <>
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="w-0 opacity-0 overflow-hidden group-hover:w-[4.5rem] group-hover:opacity-100 transition-all duration-300 ease-out flex shrink-0 gap-1 mr-2">
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
                            <h3 className="text-left font-medium text-slate-700 truncate">
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
                <div className="bg-slate-100 border border-slate-200/60 rounded-2xl w-full p-4 flex flex-col gap-3">
                  <h2 className="border-b border-slate-200 w-full text-left font-semibold text-sm text-slate-500 pb-2 uppercase tracking-wider">
                    Bagaimana kondisi energi?
                  </h2>

                  {/* --- DAFTAR REFLEKSI YANG SUDAH JADI --- */}
                  {/* --- DAFTAR REFLEKSI YANG SUDAH JADI --- */}
                  <div className="flex flex-col gap-2 w-full">
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
                            <p className="text-sm text-slate-700">{ref.teks}</p>

                            {/* Kontainer Tombol Aksi (Sejajar di Kanan, Muncul saat Hover) */}
                            <div className="w-0 opacity-0 overflow-hidden group-hover:w-[4.5rem] group-hover:opacity-100 transition-all duration-300 ease-out flex shrink-0 gap-1 mr-2">
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
                  </div>

                  {/* --- AREA INPUT REFLEKSI --- */}
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
              <div className="bg-blue-600 text-white rounded-2xl w-full">
                <button className="p-2 w-full flex items-center justify-center gap-3">
                  <p className="font-medium">Catat Sesi</p>
                  <PencilSparkles className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
