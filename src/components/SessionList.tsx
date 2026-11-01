import { useState } from "react";
import IconButton from "./IconButon";
import TaskList from "./TaskList";
import ReflectionList from "./ReflectionList"; // Sekalian kita gunakan untuk refleksi!
import { Check, X, Pencil, Trash2 } from "lucide-react";

// (Pastikan interface Sesi, Tugas, Refleksi di-import atau didefinisikan di sini)

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

interface ItemSesiProps {
  sesi: Sesi;
  daftarTagGlobal: string[];
  onSimpan: (sesiBaru: Sesi) => void;
  onHapus: (id: string) => void;
  onBuatTagBaru: (tag: string) => void;
}

export default function ItemSesi({
  sesi,
  daftarTagGlobal,
  onSimpan,
  onHapus,
  onBuatTagBaru,
}: ItemSesiProps) {
  // 1. Memori Mode Edit & Kotak Pasir
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Sesi>(sesi);

  // 2. Memori Konfirmasi Hapus (Tadinya idHapusSesi di page.tsx)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // 3. Fungsi Internal Penyimpan
  const tanganiSimpan = () => {
    // Ekstrak ulang tag unik berjaga-jaga jika ada tag tugas yang diganti
    const tagBaru = Array.from(new Set(draft.tugas.map((t) => t.tag)));

    // Telepon Direktur, laporkan data final
    onSimpan({ ...draft, tagUnik: tagBaru });
    setIsEditing(false);
  };

  // ==========================================
  // 🛠️ TAMPILAN
  // ==========================================
  return (
    <div className="flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity mb-6">
      {isEditing ? (
        // ----------------------------------------------------
        // MASUKKAN KODE "MODE EDIT TOTAL (SANDBOX AKTIF)" DI SINI
        // ----------------------------------------------------
        // Catatan: Ganti semua kata 'draft' menjadi 'draft'.
        // Ganti 'tanganiSimpanEditSesi' menjadi 'tanganiSimpan'.
        // Saat batal (tombol X): panggil setIsEditing(false) dan setDraft(sesi).
        <div className="flex flex-col gap-5 bg-blue-50/40 p-5 rounded-3xl border border-blue-200/60 shadow-inner">
          {/* --- HEADER EDIT (Jam & Tuas Simpan) --- */}
          <div className="flex justify-between items-center border-b border-blue-200/50 pb-4">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-300 shadow-sm">
              <input
                type="time"
                value={draft.waktuMulai}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    waktuMulai: e.target.value,
                  })
                }
                className="text-sm font-bold outline-none bg-transparent text-slate-700"
              />
              <span className="text-slate-400 font-medium">→</span>
              <input
                type="time"
                value={draft.waktuSelesai}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    waktuSelesai: e.target.value,
                  })
                }
                className="text-sm font-bold outline-none bg-transparent text-slate-700"
              />
            </div>
            <div className="flex gap-2">
              <IconButton
                icon={Check}
                onClick={tanganiSimpan}
                className="!bg-emerald-500 !text-white hover:!bg-emerald-600 size-9 shadow-sm"
              />
              <IconButton
                icon={X}
                onClick={() => {
                  setIsEditing(false);
                  setDraft(sesi);
                }}
                className="!bg-slate-200 !text-slate-600 hover:!bg-slate-300 size-9"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 ">
            {/* --- AREA EDIT TUGAS --- */}
            {/* --- AREA EDIT TUGAS (Versi Ramping) --- */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <h3 className="text-[10px] font-bold text-blue-800/50 uppercase tracking-wider ml-1">
                Edit Tugas
              </h3>
              {draft.tugas.map((t) => (
                <TaskList
                  key={t.id}
                  tugas={t}
                  daftarTagGlobal={daftarTagGlobal}
                  onSimpan={(tugasBaru) => {
                    // Perbarui HANYA data draf lokal di Kotak Pasir
                    const tugasUpdate = draft.tugas.map((x) =>
                      x.id === tugasBaru.id ? tugasBaru : x,
                    );
                    setDraft({ ...draft, tugas: tugasUpdate });
                  }}
                  onHapus={(id) => {
                    const tugasSisa = draft.tugas.filter((x) => x.id !== id);
                    setDraft({ ...draft, tugas: tugasSisa });
                  }}
                  onBuatTagBaru={onBuatTagBaru} // Teruskan kabel telepon ke Direktur
                />
              ))}
            </div>

            {/* --- AREA EDIT REFLEKSI (Versi Ramping) --- */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <h3 className="text-[10px] font-bold text-blue-800/50 uppercase tracking-wider ml-1">
                Edit Refleksi
              </h3>
              {draft.refleksi.map((r) => (
                <ReflectionList
                  key={r.id}
                  refleksi={r}
                  onSimpan={(refleksiBaru) => {
                    const refUpdate = draft.refleksi.map((x) =>
                      x.id === refleksiBaru.id ? refleksiBaru : x,
                    );
                    setDraft({ ...draft, refleksi: refUpdate });
                  }}
                  onHapus={(id) => {
                    const refSisa = draft.refleksi.filter((x) => x.id !== id);
                    setDraft({ ...draft, refleksi: refSisa });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // ----------------------------------------------------
        // MASUKKAN KODE "MODE BACA NORMAL & KONFIRMASI HAPUS" DI SINI
        // ----------------------------------------------------
        // Catatan: Ganti 'idHapusSesi === sesi.id' menjadi 'isConfirmingDelete'.
        // Tombol hapus memanggil: setIsConfirmingDelete(true).
        // Tombol setuju hapus memanggil: onHapus(sesi.id).
        <>
          <div className="group flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConfirmingDelete ? (
                // ==========================================
                // ⚠️ MODE KONFIRMASI HAPUS (INLINE)
                // ==========================================
                <div className="flex items-center gap-3 bg-red-50 border border-red-200/80 px-2 py-1 rounded-full shadow-sm z-10 animate-in fade-in slide-in-from-left-2 duration-200">
                  <span className="text-xs font-bold text-red-600 pl-2">
                    Hapus sesi ini?
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <IconButton
                      icon={Trash2}
                      onClick={() => onHapus(sesi.id)}
                      className="w-6 h-6 !bg-white !text-red-500 hover:!bg-red-500 hover:!text-white shadow-sm"
                    />
                    <IconButton
                      icon={X}
                      onClick={() => setIsConfirmingDelete(false)}
                      className="w-6 h-6 !bg-white !text-slate-500 hover:!bg-slate-100 border border-slate-200"
                    />
                  </div>
                </div>
              ) : (
                // ==========================================
                // 📖 MODE BACA NORMAL (Jam & Tombol Hover)
                // ==========================================
                <div className="flex items-center gap-2">
                  {/* Tombol Aksi Kiri (Mendorong dari kiri ke kanan) */}
                  <div className="w-0 opacity-0 overflow-hidden group-hover:w-[3.5rem] group-hover:opacity-100 transition-all duration-300 delay-300 ease-out flex shrink-0 gap-1">
                    <IconButton
                      icon={Pencil}
                      onClick={() => {
                        setIsEditing(true);
                        setDraft({
                          ...sesi,
                          tugas: [...sesi.tugas],
                          refleksi: [...sesi.refleksi],
                        });
                      }}
                      className="w-6 h-6 !text-blue-500 hover:!bg-blue-50 focus:opacity-100"
                    />
                    <IconButton
                      icon={Trash2}
                      // PERHATIKAN: Tombol ini sekarang hanya MEMICU state konfirmasi, bukan langsung menghapus
                      onClick={() => setIsConfirmingDelete(true)}
                      className="w-6 h-6 !text-red-400 hover:!bg-red-50 focus:opacity-100"
                    />
                  </div>

                  {/* Teks Waktu Sesi (Menyusut/Bergeser sesuai animasi hover-mu) */}
                  <p className="whitespace-nowrap shrink-0 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 -ml-2 group-hover:ml-0 delay-300 transition-all duration-300 rounded-full tracking-wide">
                    {sesi.waktuMulai} - {sesi.waktuSelesai}
                  </p>
                </div>
              )}
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
    </div>
  );
}
