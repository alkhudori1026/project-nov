// app/page.tsx
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";

export default function Beranda() {
  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr]  md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr]  h-screen">
      {/* Nanti kita perbarui cara kerja navigasinya */}
      <Navigation />
      <TopBar />

      <div className="bg-slate-100 flex-1 p-8">
        <h1 className="text-2xl font-bold">Ini adalah halaman Beranda Utama</h1>
        <p className="text-slate-600 mt-2">
          Nanti kita isi dengan dashboard ringkasan.
        </p>
      </div>
    </div>
  );
}
