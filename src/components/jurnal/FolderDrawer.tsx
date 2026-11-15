"use client";

import { useState } from "react";
import { FolderGit2, Pencil, X } from "lucide-react";
import { DailyJournal, JournalFolder } from "@/types/jurnal";
import IconButton from "../IconButon";

interface FolderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  folders: JournalFolder[];
  journals: DailyJournal[];
  activeFolderId: string | null;
  activeJournalId: string | null;
  onSelectFolder: (folderId: string) => void;
  onSelectJournal: (journalId: string) => void;
  onCreateFolder: () => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onMoveJournal: (journalId: string, targetFolderId: string | null) => void;
}

export default function FolderDrawer({
  isOpen,
  onClose,
  folders,
  journals,
  activeFolderId,
  activeJournalId,
  onSelectFolder,
  onSelectJournal,
  onCreateFolder,
  onRenameFolder,
  onMoveJournal,
}: FolderDrawerProps) {
  // State lokal khusus interaksi pengeditan nama folder di dalam laci
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderNameDraft, setFolderNameDraft] = useState("");

  const activeFolderName =
    folders.find((f) => f.id === activeFolderId)?.name || "";

  const handleSaveFolderName = (folderId: string) => {
    if (folderNameDraft.trim()) {
      onRenameFolder(folderId, folderNameDraft);
    }
    setEditingFolderId(null);
  };

  return (
    <>
      {/* Backdrop Gelap */}
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Fisik Laci Kanan */}
      <div
        className={`fixed top-0 right-0 h-full w-[clamp(16rem,30vw,24rem)] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header Laci */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-500" />
            Direktori Jurnal
          </h2>
          <IconButton
            icon={X}
            onClick={onClose}
            className="w-8 h-8 !bg-slate-50 hover:!bg-slate-100 !text-slate-500"
          />
        </div>

        {/* Area Daftar Folder */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {folders.map((folder) => {
            // Saring halaman jurnal milik folder ini dari tabel sejajar
            const folderJournals = journals.filter(
              (journal) => journal.folderId === folder.id,
            );

            return (
              <div key={folder.id} className="flex flex-col gap-1">
                {/* Kepala Folder */}
                <div
                  className={`group flex justify-between items-center px-3 py-2 rounded-xl transition-colors ${
                    activeFolderId === folder.id
                      ? "bg-blue-50 border border-blue-100"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {editingFolderId === folder.id ? (
                    <input
                      autoFocus
                      value={folderNameDraft}
                      onChange={(e) => setFolderNameDraft(e.target.value)}
                      onBlur={() => handleSaveFolderName(folder.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveFolderName(folder.id);
                        if (e.key === "Escape") setEditingFolderId(null);
                      }}
                      className="flex-1 min-w-0 bg-white border border-blue-300 rounded px-2 py-1 text-sm font-semibold outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => onSelectFolder(folder.id)}
                      className="flex-1 min-w-0 text-left text-sm font-bold text-slate-700 truncate"
                    >
                      {folder.name}
                    </button>
                  )}

                  <div className="flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <IconButton
                      icon={Pencil}
                      onClick={() => {
                        setFolderNameDraft(folder.name);
                        setEditingFolderId(folder.id);
                      }}
                      className="w-6 h-6 !bg-transparent hover:!bg-slate-200 !text-slate-500"
                    />
                  </div>
                </div>

                {/* Daftar Halaman Jurnal di dalam Folder */}
                <div className="flex flex-col pl-4 border-l-2 border-slate-100 ml-4 gap-1 mt-1">
                  {folderJournals.map((journal) => (
                    <div
                      key={journal.id}
                      className="group/page flex items-center justify-between"
                    >
                      <button
                        onClick={() => {
                          onSelectJournal(journal.id);
                          onClose();
                        }}
                        className={`flex-1 text-left text-xs font-medium px-3 py-1.5 rounded-lg truncate transition-colors ${
                          activeJournalId === journal.id
                            ? "text-blue-700 bg-blue-50/50"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {journal.title || journal.date}
                      </button>

                      {/* Tampilkan tombol pindah hanya jika jurnal berada di luar folder aktif */}
                      {activeFolderId &&
                        journal.folderId !== activeFolderId && (
                          <div className="relative group/tooltip shrink-0 opacity-0 group-hover/page:opacity-100">
                            <IconButton
                              icon={FolderGit2}
                              onClick={() =>
                                onMoveJournal(journal.id, activeFolderId)
                              }
                              className="w-5 h-5 !bg-transparent hover:!bg-blue-100 !text-blue-400"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 w-max bg-slate-800 text-white text-[10px] px-2 py-1 rounded hidden group-hover/tooltip:block">
                              Pindah ke {activeFolderName}
                            </span>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Laci */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onCreateFolder}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-600 rounded-xl transition-colors shadow-sm"
          >
            <FolderGit2 className="w-4 h-4" />
            Buat Folder Baru
          </button>
        </div>
      </div>
    </>
  );
}
