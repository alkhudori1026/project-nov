import { useState } from "react";
import DurationPicker from "./DurationPicker";
import TagPicker from "./TagPicker";
import IconButton from "./IconButon";
import { Check, X, Pencil, Trash2 } from "lucide-react";

// 1. Kontrak Tipe Data Dasar
interface Tugas {
  id: string;
  nama: string;
  durasi: string;
  tag: string;
}

// 2. Kontrak Props (HT Walkie-Talkie untuk komunikasi ke Induk)
// Ini mendefinisikan apa saja yang BOLEH dilempar dari parent ke child
interface ItemTugasProps {
  tugas: Tugas; // Data 1 baris tugas
  daftarTagGlobal: string[]; // Diperlukan untuk dropdown TagPicker
  onSimpan: (tugasBaru: Tugas) => void; // Fungsi melapor saat save
  onHapus: (id: string) => void; // Fungsi melapor saat delete
  onBuatTagBaru: (tagBaru: string) => void; // Melapor jika ada tag baru
}

export default function TaskItem({
  tugas,
  daftarTagGlobal,
  onSimpan,
  onHapus,
  onBuatTagBaru,
}: ItemTugasProps) {
  // 3. State LOKAL (Hanya untuk keperluan draf saat mode edit)
  const [isEditing, setIsEditing] = useState(false);
  const [teksDraft, setTeksDraft] = useState(tugas.nama);
  const [durasiDraft, setDurasiDraft] = useState(tugas.durasi);
  const [tagDraft, setTagDraft] = useState(tugas.tag);

  // Fungsi internal untuk merakit data sebelum dilaporkan ke Induk
  const tanganiSimpan = () => {
    if (!teksDraft.trim()) return;

    // Panggil fungsi HT, kirim objek yang sudah diperbarui ke Manajer (Home)
    onSimpan({
      ...tugas,
      nama: teksDraft,
      durasi: durasiDraft,
      tag: tagDraft,
    });

    setIsEditing(false); // Tutup mode edit
  };

  // ==========================
  // 🛠️ MODE EDIT
  // ==========================
  if (isEditing) {
    return (
      <div className="group relative flex justify-between items-center w-full bg-white rounded-r-md pl-4 pr-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-visible z-30">
        <div className="flex flex-wrap items-center justify-end w-full gap-2">
          <div className="flex shrink-0 gap-1 w-16 ">
            <IconButton
              icon={Check}
              onClick={tanganiSimpan}
              className="w-8 h-8 !text-emerald-600 hover:!bg-emerald-50"
            />
            <IconButton
              icon={X}
              onClick={() => {
                // Reset draft kembali ke data asli jika batal
                setTeksDraft(tugas.nama);
                setDurasiDraft(tugas.durasi);
                setTagDraft(tugas.tag);
                setIsEditing(false);
              }}
              className="w-8 h-8 !text-slate-400 hover:!bg-slate-100"
            />
          </div>

          <input
            type="text"
            className="text-sm font-medium text-slate-700 outline-none bg-slate-50 px-2 py-1.5 rounded-md border border-blue-300 focus:border-blue-500 transition-colors min-w-35 flex-1"
            value={teksDraft}
            onChange={(e) => setTeksDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") tanganiSimpan();
              if (e.key === "Escape") setIsEditing(false);
            }}
            autoFocus
          />

          <div className="flex gap-1 shrink-0">
            <DurationPicker
              onPilihDurasi={setDurasiDraft}
              durasiTerpilih={durasiDraft}
              isCompact={true}
            />
            <TagPicker
              daftarTag={daftarTagGlobal}
              tagTerpilih={tagDraft}
              onPilihTag={setTagDraft}
              onBuatTagBaru={(tag) => {
                setTagDraft(tag);
                onBuatTagBaru(tag); // Lapor ke Induk agar memori global terupdate
              }}
              isCompact={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // 📖 MODE BACA
  // ==========================
  return (
    <>
      <div className="group relative flex justify-between items-center w-full bg-white rounded-r-md pl-4 pr-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-visible z-20">
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-0 opacity-0 overflow-hidden group-hover:w-[4.5rem] group-hover:opacity-100 transition-all duration-300 delay-300 ease-out flex shrink-0 gap-1 mr-2">
            <IconButton
              icon={Pencil}
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 !text-blue-500 hover:!bg-blue-50 focus:opacity-100 shrink-0"
            />
            <IconButton
              icon={Trash2}
              onClick={() => onHapus(tugas.id)}
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
      </div>
    </>
  );
}
