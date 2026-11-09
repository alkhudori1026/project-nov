"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function TopBar() {
  const pathname = usePathname();

  // State untuk jam dan tanggal
  const [waktu, setWaktu] = useState("");
  const [tanggal, setTanggal] = useState("");

  // Mandor penggerak jam real-time
  useEffect(() => {
    const perbaruiWaktu = () => {
      const sekarang = new Date();
      setWaktu(
        sekarang.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setTanggal(
        sekarang.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      );
    };

    perbaruiWaktu(); // Panggil sekali saat dimuat
    const interval = setInterval(perbaruiWaktu, 60000); // Perbarui setiap 1 menit

    return () => clearInterval(interval); // Bersihkan mandor jika komponen dihancurkan
  }, []);

  // Fungsi penerjemah URL menjadi Judul Halaman
  const getJudulHalaman = () => {
    if (pathname === "/") return "Dashboard Utama";
    if (pathname.startsWith("/habits")) return "Pelacakan Habit";
    if (pathname.startsWith("/project")) return "Manajemen Proyek";
    if (pathname.startsWith("/jurnal")) return "Jurnal Harian";
    return "Productivity Go";
  };

  return (
    <div className="bg-slate-100 px-12 py-[clamp(0.5rem,2vw,1rem)] flex flex-col md:flex-row gap-2 justify-between items-center">
      <div className="flex flex-col">
        <p className="font-bold text-[clamp(1.25rem,1.5vw,2rem)] text-slate-800 text-nowrap">
          Productivity Go
        </p>
        <p className="text-sm font-medium text-slate-500">
          {tanggal || "Memuat..."}
        </p>
      </div>

      <div className="flex gap-6 items-center justify-between md:justify-end w-full">
        <span className="text-[clamp(1rem,1.5vw,1.15rem)] bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-md border border-blue-200 shadow-sm">
          {waktu || "00.00"}
        </span>
        <p className="text-[clamp(1.25rem,1.5vw,2rem)] font-medium text-slate-700 text-nowrap">
          {getJudulHalaman()}
        </p>
      </div>
    </div>
  );
}
