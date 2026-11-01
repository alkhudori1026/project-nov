"use client";

// 1. Impor mesin navigasi Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";

import IconButton from "./IconButon";
import {
  LayoutPanelLeft,
  CalendarRange,
  FolderGit2,
  NotepadText,
} from "lucide-react";

export default function Navigation() {
  // 2. Sensor URL: Menggantikan fungsi viewAktif secara otomatis
  const pathname = usePathname();

  return (
    <div className="bg-slate-50 row-span-2 flex justify-center items-center md:justify-start md:flex-col gap-8 py-6 px-[clamp(0.5rem,2vw,1.5rem)] order-last md:order-first">
      {/* --- TOMBOL HOME --- */}
      <Link
        href="/"
        className="flex flex-col items-center group cursor-pointer"
      >
        <IconButton
          icon={LayoutPanelLeft}
          // Pointer-events-none agar klik diteruskan murni ke komponen Link
          className={`size-[clamp(2.5rem,5vw,3.75rem)] pointer-events-none ${pathname === "/" ? "!text-blue-500" : ""}`}
        />
        <p
          className={`mt-[clamp(0.25rem,1.5rem-4vw,0.5rem)] text-[clamp(14px,2vw,16px)] font-medium ${pathname === "/" ? "text-blue-700" : "text-slate-500 group-hover:text-slate-700"}`}
        >
          Home
        </p>
      </Link>

      {/* --- TOMBOL HABITS --- */}
      <Link
        href="/habits"
        className="flex flex-col items-center group cursor-pointer"
      >
        <IconButton
          icon={CalendarRange}
          className={`size-[clamp(2.5rem,5vw,3.75rem)] pointer-events-none ${pathname === "/habits" ? "!text-blue-500" : ""}`}
        />
        <p
          className={`mt-[clamp(0.25rem,1.5rem-4vw,0.5rem)] text-[clamp(14px,2vw,16px)] font-medium ${pathname === "/habits" ? "text-blue-700" : "text-slate-500 group-hover:text-slate-700"}`}
        >
          Habits
        </p>
      </Link>

      {/* --- TOMBOL PROJECT --- */}
      <Link
        href="/project"
        className="flex flex-col items-center group cursor-pointer"
      >
        <IconButton
          icon={FolderGit2}
          className={`size-[clamp(2.5rem,5vw,3.75rem)] pointer-events-none ${pathname === "/project" ? "!text-blue-500" : ""}`}
        />
        <p
          className={`mt-[clamp(0.25rem,1.5rem-4vw,0.5rem)] text-[clamp(12px,2vw,16px)] font-medium ${pathname === "/project" ? "text-blue-700" : "text-slate-500 group-hover:text-slate-700"}`}
        >
          Project
        </p>
      </Link>

      {/* --- TOMBOL JURNAL --- */}
      <Link
        href="/jurnal"
        className="flex flex-col items-center group cursor-pointer"
      >
        <IconButton
          icon={NotepadText}
          className={`size-[clamp(2.5rem,5vw,3.75rem)] pointer-events-none ${pathname.startsWith("/jurnal") ? "!text-blue-500" : ""}`}
        />
        <p
          className={`mt-[clamp(0.25rem,1.5rem-4vw,0.5rem)] text-[clamp(14px,2vw,16px)] font-medium ${pathname.startsWith("/jurnal") ? "text-blue-700" : "text-slate-500 group-hover:text-slate-700"}`}
        >
          Jurnals
        </p>
      </Link>
    </div>
  );
}
