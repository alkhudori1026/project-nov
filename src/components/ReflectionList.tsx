import { useState } from "react";
import IconButton from "./IconButon";
import { Check, X, Pencil, Trash2 } from "lucide-react";

// Kontrak Data (Sama dengan yang di page.tsx)
interface Refleksi {
  id: string;
  text: string;
}

// Kontrak Props (Kabel komunikasi ke Manajer/page.tsx)
interface ReflectionListProps {
  refleksi: Refleksi;
  onSimpan: (refleksiBaru: Refleksi) => void;
  onHapus: (id: string) => void;
}

export default function ReflectionList({
  refleksi,
  onSimpan,
  onHapus,
}: ReflectionListProps) {
  // State LOKAL: Hanya Pekerja ini yang tahu dia sedang diedit atau tidak
  const [isEditing, setIsEditing] = useState(false);
  const [teksDraft, setTeksDraft] = useState(refleksi.text);

  const tanganiSimpan = () => {
    if (!teksDraft.trim()) return;

    // Telepon Manajer (page.tsx) dan berikan data yang sudah diperbarui
    onSimpan({ ...refleksi, text: teksDraft });
    setIsEditing(false); // Matikan mode edit
  };

  return (
    // Pembungkus (Kotak Kaca) dipindahkan ke sini
    <div className="group relative flex justify-between items-center w-full bg-white rounded-r-md pl-4 pr-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-slate-400 hover:before:w-[4px] before:transition-all before:duration-300 before:ease-out">
      {isEditing ? (
        // ==========================
        // 🛠️ MODE EDIT
        // ==========================
        <div className="flex items-center w-full gap-2 z-10">
          <input
            type="text"
            className="w-full text-sm outline-none bg-slate-50 px-2 py-1.5 rounded-md border border-blue-300 focus:border-blue-500 transition-colors"
            value={teksDraft}
            onChange={(e) => setTeksDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") tanganiSimpan();
              if (e.key === "Escape") {
                setTeksDraft(refleksi.text); // Batal edit, kembalikan teks asli
                setIsEditing(false);
              }
            }}
            autoFocus
          />
          <div className="flex shrink-0 gap-1">
            <IconButton
              icon={Check}
              onClick={tanganiSimpan}
              className="w-8 h-8 !text-emerald-600 hover:!bg-emerald-50"
            />
            <IconButton
              icon={X}
              onClick={() => {
                setTeksDraft(refleksi.text); // Batal edit
                setIsEditing(false);
              }}
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
            {refleksi.text}
          </p>
          <div className="w-0 opacity-0 overflow-hidden group-hover:w-[4.5rem] group-hover:opacity-100 transition-all duration-300 delay-300 ease-out flex shrink-0 gap-1 ml-2 justify-end">
            <IconButton
              icon={Pencil}
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 !text-blue-500 hover:!bg-blue-50 focus:opacity-100"
            />
            <IconButton
              icon={Trash2}
              onClick={() => onHapus(refleksi.id)}
              className="w-8 h-8 !text-red-400 hover:!text-red-600 hover:!bg-red-50 focus:opacity-100"
            />
          </div>
        </>
      )}
    </div>
  );
}
