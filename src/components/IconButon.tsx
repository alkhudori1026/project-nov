import { ElementType, ButtonHTMLAttributes } from "react";

// Interface ini adalah kontrak tipe data. Ia memastikan TypeScript
// tahu persis apa saja yang boleh dan tidak boleh dimasukkan ke dalam komponen ini.
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ElementType;
}

export default function IconButton({
  icon: Icon,
  className = "h-10 w-10  ",
  ...props
}: IconButtonProps) {
  return (
    <button
      // Anatomi M3: Area klik 40x40px, melingkar penuh, dengan transisi warna hover
      className={`flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0 ${className}`}
      {...props}
    >
      {/* Ikon dirender dengan ukuran standar 20x20px */}
      <Icon className="w-1/2 h-1/2" />
    </button>
  );
}
