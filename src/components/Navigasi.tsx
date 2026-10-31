"use client";
import { useState } from "react";

import IconButton from "./IconButon";
import {
  LayoutPanelLeft,
  CalendarRange,
  FolderGit2,
  NotepadText,
} from "lucide-react";

interface NavigationProps {
  viewAktif: string;
  onUbahView: (viewBaru: string) => void;
}

export default function Navigation({ viewAktif, onUbahView }: NavigationProps) {
  return (
    <div className="bg-slate-50 row-span-2 flex flex-col gap-8 py-6 px-[clamp(0.5rem,2vw,1.5rem)]">
      <div className="flex flex-col items-center">
        <IconButton
          icon={LayoutPanelLeft}
          className={`size-[clamp(2.5rem,5vw,3.75rem)] ${viewAktif === "Home" ? "!text-blue-500" : ""}`}
          onClick={() => onUbahView("Home")}
        />
        <p
          className={`mt-[clamp(0.25rem,5rem - 3vw,2.5rem)] text-[clamp(14px,2vw,16px)] font-medium ${viewAktif === "Home" ? "text-blue-700" : "text-slate-500"}`}
        >
          Home
        </p>
      </div>
      <div className="flex flex-col items-center">
        <IconButton
          icon={CalendarRange}
          className={`size-[clamp(2.5rem,5vw,3.75rem)] ${viewAktif === "Habits" ? "!text-blue-500" : ""}`}
          onClick={() => onUbahView("Habits")}
        />
        <p
          className={`mt-[clamp(0.25rem,5rem - 3vw,2.5rem)] text-[clamp(14px,2vw,16px)] font-medium ${viewAktif === "Habits" ? "text-blue-700" : "text-slate-500"}`}
        >
          Habits
        </p>
      </div>
      <div className="flex flex-col items-center">
        <IconButton
          icon={CalendarRange}
          className={`size-[clamp(2.5rem,5vw,3.75rem)] ${viewAktif === "Project" ? "!text-blue-500" : ""}`}
          onClick={() => onUbahView("Project")}
        />
        <p
          className={`mt-[clamp(0.25rem,5rem - 3vw,2.5rem)] text-[clamp(14px,2vw,16px)] font-medium ${viewAktif === "Project" ? "text-blue-700" : "text-slate-500"}`}
        >
          Project
        </p>
      </div>
      <div className="flex flex-col items-center">
        <IconButton
          icon={CalendarRange}
          className={`size-[clamp(2.5rem,5vw,3.75rem)] ${viewAktif === "Jurnals" ? "!text-blue-500" : ""}`}
          onClick={() => onUbahView("Jurnals")}
        />
        <p
          className={`mt-[clamp(0.25rem,5rem - 3vw,2.5rem)] text-[clamp(14px,2vw,16px)] font-medium ${viewAktif === "Jurnals" ? "text-blue-700" : "text-slate-500"}`}
        >
          Jurnals
        </p>
      </div>
      {/* 
        Ukuran minimum: 1.25rem (20px)
        Ukuran fleksibel: 3vw (3% dari lebar layar)
        Ukuran maksimum: 2.5rem (40px)
      */}
    </div>
  );
}
