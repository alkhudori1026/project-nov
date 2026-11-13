"use client";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";
import InboxOrganizer from "@/components/InboxOrganizer";
import { Inbox } from "lucide-react";

export default function Beranda() {
  const [mode, setMode] = useState<"dashboard" | "clarify">("dashboard");
  const [isCaptureOpen, setCaptureOpen] = useState(false);
  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr]  md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr]  h-screen">
      {/* Nanti kita perbarui cara kerja navigasinya */}
      <Navigation />
      <TopBar />

      <div className="bg-slate-100 flex-1 p-6 md:py-8 md:px-12">
        {mode === "dashboard" ? (
          <>
            {/* Bento Layout: 60/40 split using 3fr 2fr */}
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 md:gap-6 max-w-350 mx-auto min-h-[90%]">
              {/* Zona Eksekusi (60%) */}
              {/* M3 Surface Container: White with subtle border and large radius */}
              <div className="flex flex-col gap-6 bg-white border border-slate-200 md:row-span-2 w-full h-full p-6 md:p-8 rounded-[2rem] shadow-sm">
                <h2 className="font-semibold text-2xl text-slate-800 tracking-tight">
                  Take Action
                </h2>

                {/* Mapping untuk Next Actions akan ditaruh di dalam container ini */}
                <div className="flex flex-col gap-3">
                  {/* Task Item Card - Interactive Surface */}
                  <div
                    className="group relative flex flex-col justify-center bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-2xl p-4 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => {
                      // Fungsi ini akan membuka Pop-up/Dialog detail tugas
                      console.log(
                        "Buka dialog rincian tugas untuk melihat deskripsi tambahan",
                      );
                    }}
                  >
                    {/* Top Metadata Area - Animasi Akordeon Mulus */}
                    {/* Menggunakan trik grid-rows dari 0fr ke 1fr untuk transisi height yang organik */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                      <div className="overflow-hidden flex justify-between items-center w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-2 pb-3">
                          {" "}
                          {/* Padding bottom ditaruh di dalam agar hilang saat h-0 */}
                          <span className="text-red-700 bg-red-100 px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider">
                            Prioritas 1
                          </span>
                          <span className="text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide">
                            @Computer
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex justify-between items-center w-full">
                      {/* Transisi font-size diganti dengan scale agar lebih ringan di-render GPU */}
                      <h3 className="font-medium text-slate-700 text-lg group-hover:text-base group-hover:font-semibold transition-all duration-300 origin-left">
                        Tulis draf navigasi sidebar
                      </h3>

                      <div className="flex items-center gap-4">
                        {/* Right Metadata Area */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="py-1 px-3 border border-green-200 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                            15m
                          </span>
                          <span className="py-1 px-3 border border-amber-200 bg-amber-50 text-amber-700 text-xs rounded-full font-medium">
                            Fokus
                          </span>
                        </div>

                        {/* M3 Style Checkbox/Button */}
                        <button
                          onClick={(e) => {
                            // e.stopPropagation() ADALAH KUNCI!
                            // Ini mencegah klik pada tombol menembus ke Kartu Induk yang membuka Dialog
                            e.stopPropagation();
                            console.log(
                              "Tugas dicentang! (Dialog tidak akan terbuka)",
                            );
                          }}
                          className="flex items-center justify-center size-8 rounded-full border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 z-10"
                        >
                          {/* Titik indikator interaksi saat di-hover */}
                          <div className="size-3 rounded-full bg-transparent group-hover:bg-blue-400 transition-colors" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zona Referensi (40%) */}
              <div className="bg-white border border-slate-200 w-full h-full p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col gap-6">
                {/* Header Kalender */}
                <div className="flex justify-between items-center w-full">
                  <h2 className="font-semibold text-xl text-slate-800 tracking-tight">
                    Calendar
                  </h2>
                  {/* Indikator Hari Ini */}
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                    Hari Ini
                  </span>
                </div>

                {/* Kontainer Daftar Agenda */}
                <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                  {/* --- GRUP HARI INI --- */}
                  <div className="flex flex-col gap-3">
                    {/* Label Tanggal */}
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1">
                      Kamis, 12 Nov
                    </h3>

                    {/* 1. JANJI TEMU WAKTU SPESIFIK (Time-Blocked) */}
                    {/* Desain: Kontras tinggi, ada indikator waktu tegas di sebelah kiri */}
                    <div className="flex gap-4 items-center bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl border border-transparent hover:border-slate-200 transition-colors cursor-default">
                      <div className="flex flex-col items-center justify-center min-w-[3rem]">
                        <span className="text-slate-800 font-bold text-sm">
                          14:00
                        </span>
                        <span className="text-slate-400 text-[10px] font-medium">
                          1j 30m
                        </span>
                      </div>
                      {/* Garis vertikal sebagai penanda janji temu */}
                      <div className="w-1 h-10 bg-blue-500 rounded-full"></div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 text-sm">
                          Meeting Klien (UI/UX Review)
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          📍 Google Meet
                        </span>
                      </div>
                    </div>

                    {/* 2. AKSI HARI TERTENTU (Deadline / Day-Specific Action) */}
                    {/* Desain: Terdapat elemen peringatan (merah/oranye) dan opsional checkbox jika harus diselesaikan */}
                    <div className="flex gap-4 items-center bg-red-50 hover:bg-red-100 p-3 rounded-2xl border border-red-100 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center justify-center min-w-[3rem]">
                        <span className="text-red-700 font-bold text-sm text-center leading-tight">
                          Due
                        </span>
                      </div>
                      <div className="w-1 h-10 bg-red-400 rounded-full"></div>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col">
                          <span className="font-semibold text-red-900 text-sm">
                            Kirim Laporan Mingguan
                          </span>
                          <span className="text-red-600 text-xs">
                            Sebelum jam 17:00
                          </span>
                        </div>
                        {/* Checkbox khusus untuk aksi hari tertentu */}
                        <button className="size-6 rounded-md border-2 border-red-300 hover:bg-red-200 transition-colors"></button>
                      </div>
                    </div>

                    {/* 3. INFORMASI HARI TERTENTU (Day-Specific Info) */}
                    {/* Desain: Sangat pasif, warna pucat/halus, tidak menuntut klik atau interaksi */}
                    <div className="flex gap-4 items-center bg-transparent p-3 rounded-2xl border border-slate-100 opacity-80">
                      <div className="flex flex-col items-center justify-center min-w-[3rem]">
                        <span className="text-slate-400 text-lg">ℹ️</span>
                      </div>
                      <div className="w-1 h-6 bg-slate-200 rounded-full"></div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-500 text-sm">
                          Ulang Tahun Sarah
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* --- GRUP BESOK (Contoh) --- */}
                  <div className="flex flex-col gap-3 mt-2">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1">
                      Jumat, 13 Nov
                    </h3>
                    {/* Item kalender besok dimasukkan di sini... */}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 w-full h-full p-6 md:p-8 rounded-[2rem] shadow-sm flex flex-col gap-6">
                {/* Header Active Projects */}
                <div className="flex justify-between items-center w-full">
                  <h2 className="font-semibold text-xl text-slate-800 tracking-tight">
                    Active Projects
                  </h2>
                  {/* Indikator Kapasitas (WIP Limit) */}
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                    3 Aktif
                  </span>
                </div>

                {/* Kontainer Daftar Proyek */}
                <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                  {/* 1. PROYEK PRIORITAS / MENDESAK (Urutan Teratas) */}
                  {/* Desain: Klik pada kartu ini akan membuka halaman/sheet detail Proyek (PARA) */}
                  <div className="group flex flex-col gap-3 bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start w-full">
                      <h3 className="font-semibold text-slate-800 text-base leading-tight group-hover:text-blue-700 transition-colors">
                        Rilis Portofolio V2
                      </h3>
                      {/* Tenggat Waktu Makro - Warna Merah untuk urgensi */}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                        Due 15 Nov
                      </span>
                    </div>

                    {/* Indikator PARA / Resource (Tanda bahwa ada catatan/file di proyek ini) */}
                    <div className="flex gap-3 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        ✅ 12/18 Aksi Selesai
                      </span>
                      <span className="flex items-center gap-1">
                        📄 3 Catatan
                      </span>
                    </div>

                    {/* Progress Bar (Momentum) */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                      {/* Lebar w-[66%] ini nantinya dinamis dari perhitungan (12 dibagi 18 tugas) */}
                      <div className="bg-blue-600 h-1.5 rounded-full w-[66%] transition-all duration-500"></div>
                    </div>
                  </div>

                  {/* 2. PROYEK REGULER */}
                  <div className="group flex flex-col gap-3 bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start w-full">
                      <h3 className="font-semibold text-slate-800 text-base leading-tight group-hover:text-blue-700 transition-colors">
                        Riset Beasiswa 2027
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        Due Dec 2026
                      </span>
                    </div>

                    <div className="flex gap-3 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        ✅ 2/10 Aksi Selesai
                      </span>
                      <span className="flex items-center gap-1">
                        📄 8 Referensi
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full w-[20%] transition-all duration-500"></div>
                    </div>
                  </div>

                  {/* Tombol Lihat Semua (Jika proyek lebih dari limit UI) */}
                  <button className="mt-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 font-medium text-sm hover:bg-slate-50 hover:text-slate-700 transition-colors">
                    Lihat Semua Proyek →
                  </button>
                </div>
              </div>
            </div>

            {/* 1. TOMBOL CAPTURE (FAB - Floating Action Button) */}
            <div className="group fixed bottom-4 right-4 md:bottom-8 md:right-8">
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                <button
                  onClick={() => setMode("clarify")}
                  className="overflow-hidden w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium shadow-sm p-2"
                >
                  <Inbox className="size-10" />
                </button>
              </div>
              <button
                onClick={() => setCaptureOpen(true)}
                className="size-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                <span className="text-3xl font-light group-hover:scale-110 transition-transform">
                  +
                </span>
              </button>
            </div>
            {/* 2. OVERLAY MEREDUP (Background Dim) */}
            {/* Mematikan zona eksekusi sementara agar fokus penuh pada penangkapan ide */}
            <div
              className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${isCaptureOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
              onClick={() => setCaptureOpen(false)}
            />
            {/* 3. LACI CAPTURE (Slide-out Sheet dari Kanan) */}
            <div
              className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-slate-50 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isCaptureOpen ? "translate-x-0" : "translate-x-full"}`}
            >
              {/* Header Laci */}
              <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-slate-200">
                <h2 className="font-semibold text-xl text-slate-800">
                  Tumpahkan Ide
                </h2>
                <button
                  onClick={() => setCaptureOpen(false)}
                  className="size-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Area Ketik (Input) */}
              <div className="flex-1 p-6 flex flex-col gap-4">
                <label className="text-sm font-medium text-slate-500">
                  Apa yang sedang menarik perhatianmu?
                </label>

                {/* Menggunakan textarea agar pengguna leluasa mengetik ide panjang */}
                <textarea
                  autoFocus={isCaptureOpen} // Otomatis fokus saat laci terbuka
                  placeholder="Misal: Perlu diskusi dengan atasan tentang proyek X..."
                  className="w-full flex-1 bg-white border border-slate-200 rounded-2xl p-4 text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow custom-scrollbar text-lg leading-relaxed"
                />
              </div>

              {/* Area Aksi Bawah */}
              <div className="px-6 py-5 bg-white border-t border-slate-200 flex justify-end gap-3">
                <span className="text-xs font-medium text-slate-400 self-center mr-auto">
                  Tekan Enter untuk menyimpan
                </span>
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                  Simpan ke Inbox
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <InboxOrganizer onClose={() => setMode("dashboard")} />
          </>
        )}
      </div>
    </div>
  );
}
