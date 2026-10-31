"use client";
import IconButton from "@/components/IconButon";
import Navigation from "@/components/Navigasi";
import TopBar from "@/components/TopBar";
import DurationPicker from "@/components/DurationPicker";
import {
  CircleStar,
  ListPlus,
  Tag,
  PencilSparkles,
  PenLine,
  Timer,
} from "lucide-react";

import { useState } from "react";

export default function Home() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [viewAktif, setViewAktif] = useState("Home");
  const [durasiTugas, setDurasiTugas] = useState("");
  return (
    <div className="grid grid-cols-[1fr_16fr] grid-rows-[auto_1fr] h-screen ">
      <Navigation viewAktif={viewAktif} onUbahView={setViewAktif} />
      <TopBar />
      {/*-----[ Main Page ]-----*/}
      <div className="bg-slate-100 px-6 flex-1 pb-2 overflow-y-auto no-scrollbar">
        <header className="bg-white rounded-t-3xl flex justify-between items-center p-4 shadow-md max-w-250 min-w-[90%] fixed z-50">
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
        <div className="bg-white rounded-b-3xl max-w-250 mx-auto min-h-max p-4 pt-0 mt-16 ">
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
                  <h3 className="font-semibold">Bingung sama konsep logika</h3>
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
              <div className="bg-slate-100 rounded-2xl w-full min-h-15 p-3 gap-3 flex flex-col items-center justify-center">
                <h2 className="border-b border-slate-400 w-full text-center font-semibold text-lg pb-2">
                  Tugas apa yang diselesaikan?
                </h2>
                <div className="flex justify-between w-full border-l border-blue-400 rounded-b-sm px-2">
                  <h3 className="font-semibold">Membaca Buku</h3>
                  <div className="flex gap-2">
                    <span className="text-gray-500 bg-red-100 rounded-md px-3">
                      Hobby
                    </span>
                    <span className="text-gray-500 bg-amber-100 rounded-md px-3">
                      1 jam
                    </span>
                  </div>
                </div>
                <div className=" bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between w-full gap-2">
                  <input
                    type="text"
                    placeholder=" tulis judul tugas ..."
                    className="outline-none"
                  ></input>
                  <div className="flex gap-2 w-full justify-between">
                    <div>
                      <DurationPicker
                        onPilihDurasi={(hasil) => setDurasiTugas(hasil)}
                      />
                      <button className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                        <Tag className="size-[clamp(1rem,3vw,1.75rem)]" />
                      </button>
                    </div>

                    <button className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                      <ListPlus className="size-[clamp(1rem,3vw,1.75rem)]" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-slate-100 rounded-2xl w-full min-h-15 p-3 flex flex-col gap-3 items-center justify-center">
                <h2 className="border-b border-slate-400 w-full text-center font-semibold text-lg pb-2">
                  Bagaimana kondisi energi?
                </h2>
                <div className="w-full border-l border-blue-400 rounded-b-sm px-2">
                  <h3 className="font-semibold">Seru belajar sama temen</h3>
                </div>
                <div className="w-full flex justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Apa yang sedang dirasakan?"
                    className="w-full outline-none"
                  ></input>
                  <button className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                    <PenLine className="size-[clamp(1rem,3vw,1.75rem)]" />
                  </button>
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
  );
}
