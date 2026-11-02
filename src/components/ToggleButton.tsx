"use client";

// Kontrak Kabel Komunikasi
interface ToggleButtonProps {
  isOn: boolean; // Saklar sedang nyala (true) atau mati (false)?
  onToggle: (statusBaru: boolean) => void; // Laporan ke Manajer saat ditekan
  label?: string; // (Opsional) Teks keterangan di sebelah saklar
}

export default function ToggleButton({
  isOn,
  onToggle,
  label,
}: ToggleButtonProps) {
  return (
    // Kita gunakan label agar jika teksnya diklik, saklarnya ikut tertekan (Aksesibilitas UX)
    <label className="flex items-center gap-3 cursor-pointer group">
      {/* Trek Latar Belakang (Warna berubah tergantung isOn) */}
      <div
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out
          ${isOn ? "bg-blue-500" : "bg-slate-300 group-hover:bg-slate-400"}
        `}
        // Memicu laporan balik ke Induk dengan nilai kebalikan dari saat ini
        onClick={() => onToggle(!isOn)}
        role="switch"
        aria-checked={isOn}
      >
        {/* Tuas Lingkaran (Bergerak dari kiri ke kanan) */}
        <div
          className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ease-out
            ${isOn ? "translate-x-6" : "translate-x-0"}
          `}
        />
      </div>

      {/* Teks Label (Hanya dirender jika Manajer mengirimkan prop label) */}
      {label && (
        <span
          className={`text-sm font-medium select-none transition-colors duration-300
          ${isOn ? "text-blue-700" : "text-slate-600"}
        `}
        >
          {label}
        </span>
      )}
    </label>
  );
}
