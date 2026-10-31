import {
  LayoutPanelLeft,
  CalendarRange,
  FolderGit2,
  NotepadText,
  CircleStar,
  ListPlus,
  Tag,
  PencilSparkles,
  PenLine,
  Timer,
} from "lucide-react";

export default function Home() {
  return (
    <div className="grid grid-cols-[1fr_16fr] grid-rows-[auto_1fr] h-screen ">
      {/*-----[ Navigasi ]-----*/}
      <div className="bg-gray-300 row-span-2 flex flex-col gap-8 py-6 px-[clamp(0.5rem,2vw,1.5rem)]">
        <div className="flex flex-col items-center">
          <LayoutPanelLeft className="size-[clamp(1.75rem,3vw,3.75rem)]" />
          <p className="mt-2">Home</p>
        </div>
        {/* 
        Ukuran minimum: 1.25rem (20px)
        Ukuran fleksibel: 3vw (3% dari lebar layar)
        Ukuran maksimum: 2.5rem (40px)
      */}
        <div className="flex flex-col items-center">
          <CalendarRange className="size-[clamp(1.75rem,3vw,3.75rem)]" />
          <p className="mt-2">Habits</p>
        </div>
        <div className="flex flex-col items-center">
          <FolderGit2 className="size-[clamp(1.75rem,3vw,3.75rem)]" />
          <p className="mt-2">Projects</p>
        </div>
        <div className="flex flex-col items-center">
          <NotepadText className="size-[clamp(1.75rem,3vw,3.75rem)]" />
          <p className="mt-2">Jurnals</p>
        </div>
      </div>
      {/*-----[ Top Bar ]-----*/}
      <div className="bg-slate-100 px-8 py-[clamp(0.5rem,2vw,1rem)] flex justify-between items-center">
        <p className="font-bold text-[clamp(1.5rem,2vw,2.5rem)]">
          Productivity Go
        </p>
        <div className="flex gap-6 items-center">
          <span className="text-[clamp(1rem,2vw,1.25rem)] bg-blue-200 px-3 rounded-md">
            08.00
          </span>
          <p className="text-[clamp(1.5rem,2vw,2.5rem)] font-medium">
            Jurnal Harian
          </p>
        </div>
      </div>
      {/*-----[ Main Page ]-----*/}
      <div className="bg-slate-100 px-6 flex-1 py-2 overflow-y-auto no-scrollbar">
        <header className="bg-white rounded-t-3xl flex justify-between items-center p-4">
          <h1 className="font-semibold text-xl">Sabtu, 31 Oktober 2026</h1>
          <button>
            <CircleStar />
          </button>
        </header>
        <div className="bg-white rounded-b-3xl max-w-250 mx-auto min-h-max p-4 pt-0 ">
          <div className="flex items-center gap-2">
            {/* Teks Jam: Ditahan agar tidak pernah patah baris atau menyusut */}
            <p className="whitespace-nowrap shrink-0 text-sm">08.00 - 10.00</p>

            {/* Garis Pembatas: Fleksibel mengambil sisa ruang kosong */}
            <div className="flex-1 border border-gray-300" />

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
            <div className="bg-gray-200 rounded-2xl w-full min-h-15 px-3 py-4 flex flex-col gap-3">
              <div className="flex justify-between border-l border-blue-900 rounded-b-sm px-2">
                <h3 className="font-semibold">Belajar UTBK</h3>
                <span className="text-gray-500">1 jam</span>
              </div>
              <div className="flex justify-between border-l border-blue-900 rounded-b-sm px-2">
                <h3 className="font-semibold">Lanjut Projek Koding</h3>
                <span className="text-gray-500">1 jam</span>
              </div>
            </div>
            <div className="bg-gray-200 rounded-2xl w-full min-h-15 p-3 flex flex-col gap-3">
              <div className="w-full border-l border-blue-900 rounded-b-sm px-2">
                <h3 className="font-semibold">Seru belajar sama temen</h3>
              </div>
              <div className="w-full border-l border-blue-900 rounded-b-sm px-2">
                <h3 className="font-semibold">
                  Pusing nyari soal-soal latihan
                </h3>
              </div>
              <div className="w-full border-l border-blue-900 rounded-b-sm px-2">
                <h3 className="font-semibold">Bingung sama konsep logika</h3>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-between items-center">
            <div className="w-full h-0 border-b "></div>
          </div>
          <div className="flex flex-col p-4 gap-4">
            <div className="bg-gray-200 rounded-2xl w-full px-5 py-2 flex flex-col md:flex-row gap-3 items-center md:justify-between">
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
              <div className="bg-gray-200 rounded-2xl w-full min-h-15 p-3 flex flex-col items-center justify-center">
                <h2 className="border-b w-full text-center font-semibold text-lg pb-2">
                  Tugas apa yang diselesaikan?
                </h2>
                <div className="flex justify-between w-full mt-3 border-l border-blue-900 rounded-b-sm px-2">
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
                <div className="flex justify-between w-full gap-2">
                  <input
                    type="text"
                    placeholder="tugas-tugas"
                    className="w-full py-2"
                  ></input>
                  <button>
                    <Timer />
                  </button>
                  <button>
                    <Tag />
                  </button>
                  <button>
                    <ListPlus />
                  </button>
                </div>
              </div>
              <div className="bg-gray-200 rounded-2xl w-full min-h-15 p-3 flex flex-col gap-3 items-center justify-center">
                <h2 className="border-b w-full text-center font-semibold text-lg pb-2">
                  Bagaimana kondisi energi?
                </h2>
                <div className="w-full border-l border-blue-900 rounded-b-sm px-2">
                  <h3 className="font-semibold">Seru belajar sama temen</h3>
                </div>
                <div className="w-full flex justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Apa yang sedang dirasakan?"
                    className="w-full"
                  ></input>
                  <PenLine />
                </div>
              </div>
            </div>
            <div className="bg-gray-300 rounded-2xl w-full">
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
