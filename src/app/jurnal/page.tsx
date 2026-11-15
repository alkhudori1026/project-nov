"use client";

import { useState } from "react";
import {
  CircleStar,
  FolderGit2,
  ListPlus,
  PenLine,
  PencilSparkles,
  Trash2,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import TopBar from "@/components/TopBar";
import IconButton from "@/components/IconButon"; // Mempertahankan nama file asli proyek
import DurationPicker from "@/components/DurationPicker";
import ToggleButton from "@/components/ToggleButton";
import TagPicker from "@/components/TagPicker";
import TaskList from "@/components/jurnal/TaskList";
import ReflectionList from "@/components/jurnal/ReflectionList";
import SessionList from "@/components/jurnal/SessionList";
import EvaluationLog from "@/components/jurnal/EvaluationLog";
import FolderDrawer from "@/components/jurnal/FolderDrawer";
import { useJurnalStore } from "@/hooks/useJurnalStore";
import { formatIndonesianDate } from "@/utils/jurnalSelectors";
import {
  HydratedEvaluation,
  JournalReflection,
  JournalTask,
} from "@/types/jurnal";

// Tipe lokal khusus item draf evaluasi sebelum disimpan ke database
interface DraftFlowState {
  id: string;
  start: string;
  end: string;
}

interface DraftMissedTask {
  id: string;
  task: string;
  tag: string;
}

interface DraftDistraction {
  id: string;
  distraction: string;
  start: string;
  end: string;
}

interface DraftRestingActivity {
  id: string;
  name: string;
}

export default function JournalPage() {
  // ==========================================================================
  // 1. KONEKSI KE PUSAT STATE & PENYIMPANAN
  // ==========================================================================
  const {
    isMounted,
    folders,
    journals,
    tags,
    sleepTags,
    activeFolderId,
    activeJournalId,
    activeSummary,
    selectFolder,
    selectJournal,
    createFolder,
    renameFolder,
    moveJournalToFolder,
    updateJournalTitle,
    toggleJournalFavorite,
    bookSession,
    updateSession,
    deleteSession,
    saveEvaluation,
    addTag,
    addSleepTag,
  } = useJurnalStore();

  const activeJournal = activeSummary.journal;

  // ==========================================================================
  // 2. STATE LOKAL UI & NAVIGASI LAYAR
  // ==========================================================================
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [evaluateMode, setEvaluateMode] = useState(false);

  // State edit judul halaman jurnal
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // ==========================================================================
  // 3. STATE DRAF SESI BARU (BAN BERJALAN SEMENTARA)
  // ==========================================================================
  const [startingTime, setStartingTime] = useState("08:00");
  const [finishingTime, setFinishingTime] = useState("10:00");

  const [draftTasks, setDraftTasks] = useState<JournalTask[]>([]);
  const [inputTaskName, setInputTaskName] = useState("");
  const [inputTaskDuration, setInputTaskDuration] = useState("");
  const [inputTaskTag, setInputTaskTag] = useState("");

  const [draftReflections, setDraftReflections] = useState<JournalReflection[]>(
    [],
  );
  const [inputReflectionText, setInputReflectionText] = useState("");

  // ==========================================================================
  // 4. STATE DRAF EVALUASI AKHIR HARI
  // ==========================================================================
  const [editingEvaluationId, setEditingEvaluationId] = useState<string | null>(
    null,
  );

  const [flowStateList, setFlowStateList] = useState<DraftFlowState[]>([]);
  const [inputStartingFocus, setInputStartingFocus] = useState("");
  const [inputFinishingFocus, setInputFinishingFocus] = useState("");
  const [crashTime, setCrashTime] = useState("");

  const [missedTaskList, setMissedTaskList] = useState<DraftMissedTask[]>([]);
  const [inputMissedTask, setInputMissedTask] = useState("");
  const [inputMissedTaskTag, setInputMissedTaskTag] = useState("");

  const [distractionList, setDistractionList] = useState<DraftDistraction[]>(
    [],
  );
  const [inputDistraction, setInputDistraction] = useState("");
  const [inputDistractionStart, setInputDistractionStart] = useState("");
  const [inputDistractionEnd, setInputDistractionEnd] = useState("");

  const [sleepDuration, setSleepDuration] = useState("");
  const [morningFeeling, setMorningFeeling] = useState("");

  const [restingActivityList, setRestingActivityList] = useState<
    DraftRestingActivity[]
  >([]);
  const [inputRestingActivity, setInputRestingActivity] = useState("");

  // ==========================================================================
  // 5. HANDLER INTERAKSI HEADER & DRAF SESI
  // ==========================================================================
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  const handleSaveTitle = () => {
    if (!activeJournal) return;
    updateJournalTitle(activeJournal.id, titleDraft);
    setIsEditingTitle(false);
  };

  const handleAddDraftTask = () => {
    if (!inputTaskName.trim()) return;

    const newDraftTask: JournalTask = {
      id: crypto.randomUUID(),
      sessionId: "draft",
      journalId: activeJournal?.id || "",
      name: inputTaskName,
      duration: inputTaskDuration || "0 j 0 m",
      tag: inputTaskTag || "Tanpa Tag",
    };

    setDraftTasks((prev) => [...prev, newDraftTask]);
    setInputTaskName("");
    setInputTaskDuration("");
    setInputTaskTag("");
  };

  const handleRemoveDraftTask = (taskId: string) => {
    setDraftTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddDraftReflection = () => {
    if (!inputReflectionText.trim()) return;

    const newDraftReflection: JournalReflection = {
      id: crypto.randomUUID(),
      sessionId: "draft",
      journalId: activeJournal?.id || "",
      text: inputReflectionText,
    };

    setDraftReflections((prev) => [...prev, newDraftReflection]);
    setInputReflectionText("");
  };

  const handleRemoveDraftReflection = (reflectionId: string) => {
    setDraftReflections((prev) => prev.filter((r) => r.id !== reflectionId));
  };

  const handleBookSession = () => {
    if (draftTasks.length === 0 && draftReflections.length === 0) return;

    bookSession({
      startingTime,
      finishingTime,
      tasks: draftTasks.map((t) => ({
        name: t.name,
        duration: t.duration,
        tag: t.tag,
      })),
      reflections: draftReflections.map((r) => ({
        text: r.text,
      })),
    });

    // Bersihkan draf setelah berhasil dicatat ke penyimpanan
    setDraftTasks([]);
    setDraftReflections([]);
  };

  // ==========================================================================
  // 6. HANDLER DRAF & EDIT EVALUASI HARIAN
  // ==========================================================================
  const handleStartEditEvaluation = (evaluation: HydratedEvaluation) => {
    setFlowStateList(
      evaluation.flowStates.map((f) => ({
        id: f.id,
        start: f.start,
        end: f.end,
      })),
    );
    setCrashTime(evaluation.crashTime);
    setMissedTaskList(
      evaluation.missedTasks.map((m) => ({
        id: m.id,
        task: m.task,
        tag: m.tag,
      })),
    );
    setDistractionList(
      evaluation.distractions.map((d) => ({
        id: d.id,
        distraction: d.distraction,
        start: d.start,
        end: d.end,
      })),
    );
    setSleepDuration(evaluation.sleepDuration);
    setMorningFeeling(evaluation.morningFeeling);
    setRestingActivityList(
      evaluation.restingActivities.map((r) => ({
        id: r.id,
        name: r.name,
      })),
    );

    setEditingEvaluationId(evaluation.id);
    setEvaluateMode(true);
  };

  const handleAddFlowState = () => {
    if (!inputStartingFocus.trim() || !inputFinishingFocus.trim()) return;

    setFlowStateList((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        start: inputStartingFocus,
        end: inputFinishingFocus,
      },
    ]);
    setInputStartingFocus("");
    setInputFinishingFocus("");
  };

  const handleAddMissedTask = () => {
    if (!inputMissedTask.trim()) return;

    setMissedTaskList((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        task: inputMissedTask,
        tag: inputMissedTaskTag || "Tanpa Tag",
      },
    ]);
    setInputMissedTask("");
    setInputMissedTaskTag("");
  };

  const handleAddDistraction = () => {
    if (!inputDistraction.trim()) return;

    setDistractionList((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        distraction: inputDistraction,
        start: inputDistractionStart || "00:00",
        end: inputDistractionEnd || "00:00",
      },
    ]);
    setInputDistraction("");
    setInputDistractionStart("");
    setInputDistractionEnd("");
  };

  const handleAddRestingActivity = () => {
    if (!inputRestingActivity.trim()) return;

    setRestingActivityList((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: inputRestingActivity,
      },
    ]);
    setInputRestingActivity("");
  };

  const handleBookEvaluation = () => {
    saveEvaluation({
      id: editingEvaluationId,
      crashTime,
      sleepDuration,
      morningFeeling,
      flowStates: flowStateList.map(({ start, end }) => ({ start, end })),
      missedTasks: missedTaskList.map(({ task, tag }) => ({ task, tag })),
      distractions: distractionList.map(({ distraction, start, end }) => ({
        distraction,
        start,
        end,
      })),
      restingActivities: restingActivityList.map(({ name }) => ({ name })),
    });

    // Reset seluruh form evaluasi
    setFlowStateList([]);
    setCrashTime("");
    setMissedTaskList([]);
    setDistractionList([]);
    setSleepDuration("");
    setMorningFeeling("");
    setRestingActivityList([]);
    setEditingEvaluationId(null);
    setEvaluateMode(false);
  };

  if (!isMounted) return null;

  return (
    <div className="grid grid-rows-[1fr_10fr_1.5fr] md:grid-cols-[1fr_16fr] md:grid-rows-[auto_1fr] h-screen">
      <Navigation />
      <TopBar />

      {/* Kontainer Utama Halaman */}
      <div
        className="bg-slate-100 px-6 md:px-12 flex-1 py-4 overflow-y-auto no-scrollbar relative"
        onScroll={handleScroll}
      >
        <div className="max-w-280 mx-auto bg-white rounded-3xl border border-slate-200 relative pb-4">
          {/* Header Sticky */}
          <header
            className={`sticky -top-4 z-30 flex justify-between items-center p-4 bg-white/80 backdrop-blur-md transition-all duration-300 border-b ${
              isScrolled
                ? "rounded-none shadow-md border-transparent"
                : "rounded-t-3xl shadow-none border-slate-100"
            }`}
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0 pr-4">
              {isEditingTitle ? (
                <input
                  type="text"
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  onBlur={handleSaveTitle}
                  className="font-semibold text-[clamp(1.25rem,3vw,1.75rem)] text-slate-800 outline-none border-b-2 border-blue-500 bg-transparent w-full"
                  placeholder={formatIndonesianDate(activeJournal?.date || "")}
                />
              ) : (
                <h1 className="font-semibold text-[clamp(1.25rem,3vw,1.75rem)] text-slate-800 truncate">
                  {activeJournal?.title ||
                    formatIndonesianDate(activeJournal?.date || "")}
                </h1>
              )}

              {/* Indikator Folder Aktif */}
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 opacity-70" />
                {activeSummary.folderName || "Memuat Folder..."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <IconButton
                icon={PenLine}
                className="size-[clamp(2.5rem,4vw,3.5rem)] !bg-slate-50 hover:!bg-slate-100 !text-slate-500"
                onClick={() => {
                  setTitleDraft(
                    activeJournal?.title ||
                      formatIndonesianDate(activeJournal?.date || ""),
                  );
                  setIsEditingTitle(true);
                }}
              />

              <IconButton
                icon={CircleStar}
                className={`size-[clamp(2.5rem,4vw,3.5rem)] transition-colors ${
                  activeJournal?.isFavorite
                    ? "!text-amber-500 !bg-amber-50 hover:!bg-amber-100"
                    : "!bg-slate-50 hover:!bg-slate-100 !text-slate-400"
                }`}
                onClick={() =>
                  activeJournal && toggleJournalFavorite(activeJournal.id)
                }
              />

              <IconButton
                icon={FolderGit2}
                className="size-[clamp(2.5rem,4vw,3.5rem)] !bg-slate-50 hover:!bg-slate-100 !text-slate-500"
                onClick={() => setIsDrawerOpen(true)}
              />
            </div>
          </header>

          <div className="p-4 pt-4 flex flex-col gap-8">
            {/* 1. LOG SESI & EVALUASI TERSIMPAN */}
            <section id="log-sesi" className="flex flex-col gap-6">
              {activeSummary.sessions.map((sessionItem) => (
                <SessionList
                  key={sessionItem.id}
                  session={sessionItem}
                  tagStorage={tags}
                  onSave={updateSession}
                  onDelete={deleteSession}
                  onCreateTag={addTag}
                />
              ))}

              {activeSummary.evaluation && !evaluateMode && (
                <div className="mt-8 border-t-2 border-dashed border-slate-200 pt-8">
                  <h2 className="font-bold text-lg text-slate-700 mb-6">
                    Ringkasan Evaluasi Harian
                  </h2>
                  <EvaluationLog
                    evaluation={activeSummary.evaluation}
                    onEdit={handleStartEditEvaluation}
                  />
                </div>
              )}
            </section>

            {/* 2. AREA INPUT SESI / EVALUASI (DRAFT) */}
            <section id="input-sesi" className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-3">
                <ToggleButton
                  isOn={evaluateMode}
                  onToggle={setEvaluateMode}
                  label="Mode Evaluasi"
                />
                <div className="flex-1 border-t-2 border-blue-100" />
              </div>

              <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-4 flex flex-col gap-6 shadow-sm">
                {evaluateMode ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <h2 className="font-bold text-lg text-slate-700">
                        Evaluasi Akhir Hari
                      </h2>
                    </div>

                    <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                      {/* Kartu Kurva Fokus & Titik Lelah */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Kapan Fokusku meningkat / memasuki flow-state?
                        </h2>

                        {flowStateList.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-white border border-blue-100 p-2 rounded-xl shadow-sm"
                          >
                            <span className="text-sm font-bold text-blue-700">
                              {item.start} - {item.end}
                            </span>
                            <IconButton
                              icon={Trash2}
                              onClick={() =>
                                setFlowStateList((prev) =>
                                  prev.filter((x) => x.id !== item.id),
                                )
                              }
                              className="w-8 h-8 !text-red-400 hover:!bg-red-50"
                            />
                          </div>
                        ))}

                        <div className="bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between items-center w-full gap-2">
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                            <input
                              type="time"
                              value={inputStartingFocus}
                              onChange={(e) =>
                                setInputStartingFocus(e.target.value)
                              }
                              className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                            />
                            <span className="text-slate-300 text-sm font-medium">
                              →
                            </span>
                            <input
                              type="time"
                              value={inputFinishingFocus}
                              onChange={(e) =>
                                setInputFinishingFocus(e.target.value)
                              }
                              className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                            />
                          </div>
                          <IconButton
                            icon={ListPlus}
                            onClick={handleAddFlowState}
                            className="!bg-blue-600 !text-white hover:!bg-blue-700 size-[clamp(2rem,3vw,2.5rem)]"
                          />
                        </div>

                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Kapan mulai merasa kesulitan untuk fokus?
                        </h2>

                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                          <input
                            type="time"
                            value={crashTime}
                            onChange={(e) => setCrashTime(e.target.value)}
                            className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Kartu Tugas Terlewat */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Tugas apa yang tertunda/tergeser?
                        </h2>

                        {missedTaskList.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-white border border-red-100 p-2 rounded-xl shadow-sm"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-slate-700 truncate">
                                {item.task}
                              </span>
                              <span className="text-[10px] font-bold text-red-500 uppercase">
                                {item.tag}
                              </span>
                            </div>
                            <IconButton
                              icon={Trash2}
                              onClick={() =>
                                setMissedTaskList((prev) =>
                                  prev.filter((x) => x.id !== item.id),
                                )
                              }
                              className="w-8 h-8 !text-red-400 hover:!bg-red-50 shrink-0"
                            />
                          </div>
                        ))}

                        <div className="bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between items-center w-full gap-2">
                          <div className="flex flex-1 items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                            <input
                              type="text"
                              placeholder=" Tugas yang aku lewatkan ..."
                              className="outline-none h-8 flex-1"
                              value={inputMissedTask}
                              onChange={(e) =>
                                setInputMissedTask(e.target.value)
                              }
                            />
                          </div>
                          <TagPicker
                            daftarTag={tags}
                            tagTerpilih={inputMissedTaskTag}
                            onPilihTag={setInputMissedTaskTag}
                            onBuatTagBaru={addTag}
                          />
                          <IconButton
                            icon={ListPlus}
                            onClick={handleAddMissedTask}
                            className="!bg-blue-600 !text-white hover:!bg-blue-700 size-[clamp(2rem,3vw,2.5rem)]"
                          />
                        </div>
                      </div>

                      {/* Kartu Sumber Distraksi */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Apa sumber distraksiku hari ini?
                        </h2>

                        {distractionList.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-white border border-amber-100 p-2 rounded-xl shadow-sm"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-slate-700 truncate">
                                {item.distraction}
                              </span>
                              <span className="text-[10px] font-bold text-amber-600">
                                {item.start} - {item.end}
                              </span>
                            </div>
                            <IconButton
                              icon={Trash2}
                              onClick={() =>
                                setDistractionList((prev) =>
                                  prev.filter((x) => x.id !== item.id),
                                )
                              }
                              className="w-8 h-8 !text-red-400 hover:!bg-red-50 shrink-0"
                            />
                          </div>
                        ))}

                        <div className="bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between items-center w-full gap-2">
                          <div className="flex flex-1 items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                            <input
                              type="text"
                              placeholder=" Distraksiku adalah ..."
                              className="outline-none h-8 flex-1"
                              value={inputDistraction}
                              onChange={(e) =>
                                setInputDistraction(e.target.value)
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                            <input
                              type="time"
                              value={inputDistractionStart}
                              onChange={(e) =>
                                setInputDistractionStart(e.target.value)
                              }
                              className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                            />
                            <span className="text-slate-300 text-sm font-medium">
                              →
                            </span>
                            <input
                              type="time"
                              value={inputDistractionEnd}
                              onChange={(e) =>
                                setInputDistractionEnd(e.target.value)
                              }
                              className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                            />
                          </div>
                          <IconButton
                            icon={ListPlus}
                            onClick={handleAddDistraction}
                            className="!bg-blue-600 !text-white hover:!bg-blue-700 size-[clamp(2rem,3vw,2.5rem)]"
                          />
                        </div>
                      </div>

                      {/* Kartu Istirahat & Pemulihan Energi */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Apakah hari ini istirahat cukup?
                        </h2>

                        <div className="bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between items-center w-full gap-2">
                          <div className="flex items-center justify-between w-full p-2">
                            <h3 className="text-slate-500 font-medium">
                              Berapa lama durasi tidur semalam?
                            </h3>
                            <div className="shrink-0">
                              <DurationPicker
                                onPilihDurasi={setSleepDuration}
                                durasiTerpilih={sleepDuration}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full p-2">
                            <h3 className="text-slate-500 font-medium">
                              Bagaimana perasaan saat bangun tidur?
                            </h3>
                            <div className="shrink-0">
                              <TagPicker
                                daftarTag={sleepTags}
                                tagTerpilih={morningFeeling}
                                onPilihTag={setMorningFeeling}
                                onBuatTagBaru={(newTag) => {
                                  addSleepTag(newTag);
                                  setMorningFeeling(newTag);
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-start p-2 w-full gap-2">
                            <h3 className="text-slate-500 font-medium w-full text-left pb-2">
                              Hal apa yang membuat energi terisi ulang?
                            </h3>

                            {restingActivityList.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center w-full bg-white border border-emerald-100 p-2 rounded-xl shadow-sm"
                              >
                                <span className="text-sm font-medium text-slate-700 truncate">
                                  {item.name}
                                </span>
                                <IconButton
                                  icon={Trash2}
                                  onClick={() =>
                                    setRestingActivityList((prev) =>
                                      prev.filter((x) => x.id !== item.id),
                                    )
                                  }
                                  className="w-8 h-8 !text-red-400 hover:!bg-red-50 shrink-0"
                                />
                              </div>
                            ))}

                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="flex flex-1 min-w-0 items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-slate-200 focus-within:ring-1 focus-within:ring-blue-50 transition-all">
                                <input
                                  type="text"
                                  placeholder=" Aktivitas yang mengisi energiku ..."
                                  className="outline-none h-8 flex-1 min-w-0"
                                  value={inputRestingActivity}
                                  onChange={(e) =>
                                    setInputRestingActivity(e.target.value)
                                  }
                                />
                              </div>
                              <IconButton
                                icon={ListPlus}
                                onClick={handleAddRestingActivity}
                                className="!bg-blue-600 !text-white hover:!bg-blue-700 size-[clamp(2rem,3vw,2.5rem)]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleBookEvaluation}
                      disabled={
                        flowStateList.length === 0 ||
                        missedTaskList.length === 0 ||
                        distractionList.length === 0 ||
                        restingActivityList.length === 0 ||
                        !crashTime ||
                        !morningFeeling
                      }
                      className="mt-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <PencilSparkles className="size-5" />
                      <span>Catat Evaluasi Hari Ini</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <h2 className="font-bold text-lg text-slate-700">
                        Draf Sesi Baru
                      </h2>

                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <input
                          type="time"
                          value={startingTime}
                          onChange={(e) => setStartingTime(e.target.value)}
                          className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                        />
                        <span className="text-slate-300 text-sm font-medium">
                          →
                        </span>
                        <input
                          type="time"
                          value={finishingTime}
                          onChange={(e) => setFinishingTime(e.target.value)}
                          className="outline-none bg-transparent text-sm font-bold text-slate-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Area Draf Tugas */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Tugas apa yang diselesaikan?
                        </h2>

                        {draftTasks.map((taskItem) => (
                          <TaskList
                            key={taskItem.id}
                            task={taskItem}
                            tagStorage={tags}
                            onSave={(updatedTask) =>
                              setDraftTasks((prev) =>
                                prev.map((t) =>
                                  t.id === updatedTask.id ? updatedTask : t,
                                ),
                              )
                            }
                            onDelete={handleRemoveDraftTask}
                            onCreateTag={addTag}
                          />
                        ))}

                        <div className="bg-slate-50 p-2 rounded-2xl flex flex-wrap justify-between w-full gap-2">
                          <input
                            type="text"
                            placeholder=" tulis judul tugas ..."
                            className="outline-none h-8 flex-1"
                            value={inputTaskName}
                            onChange={(e) => setInputTaskName(e.target.value)}
                          />
                          <div className="flex gap-2 w-full justify-between">
                            <div className="flex gap-2">
                              <DurationPicker
                                onPilihDurasi={setInputTaskDuration}
                                durasiTerpilih={inputTaskDuration}
                              />
                              <TagPicker
                                daftarTag={tags}
                                tagTerpilih={inputTaskTag}
                                onPilihTag={setInputTaskTag}
                                onBuatTagBaru={addTag}
                              />
                            </div>

                            <IconButton
                              icon={ListPlus}
                              onClick={handleAddDraftTask}
                              className="!bg-blue-600 !text-white hover:!bg-blue-700 size-[clamp(2rem,3vw,2.5rem)]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Area Draf Refleksi */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 min-w-0 gap-3 shadow-sm">
                        <h2 className="border-b border-slate-100 w-full text-left font-bold text-xs text-slate-400 pb-2 uppercase tracking-wider">
                          Bagaimana kondisi energi?
                        </h2>

                        {draftReflections.map((reflectionItem) => (
                          <ReflectionList
                            key={reflectionItem.id}
                            reflection={reflectionItem}
                            onSave={(updatedReflection) =>
                              setDraftReflections((prev) =>
                                prev.map((r) =>
                                  r.id === updatedReflection.id
                                    ? updatedReflection
                                    : r,
                                ),
                              )
                            }
                            onDelete={handleRemoveDraftReflection}
                          />
                        ))}

                        <div className="flex justify-between items-center w-full gap-2 mt-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                          <input
                            type="text"
                            placeholder="Ketik apa yang dirasakan..."
                            className="w-full py-1 px-3 outline-none bg-transparent text-sm text-slate-700"
                            value={inputReflectionText}
                            onChange={(e) =>
                              setInputReflectionText(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddDraftReflection();
                            }}
                          />
                          <IconButton
                            icon={PenLine}
                            onClick={handleAddDraftReflection}
                            className="!bg-slate-100 hover:!bg-slate-200 !text-slate-600 shrink-0"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleBookSession}
                      disabled={
                        draftTasks.length === 0 || draftReflections.length === 0
                      }
                      className="mt-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <PencilSparkles className="size-5" />
                      <span>Catat Sesi ke Jurnal</span>
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Laci Direktori Folder */}
      <FolderDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        folders={folders}
        journals={journals}
        activeFolderId={activeFolderId}
        activeJournalId={activeJournalId}
        onSelectFolder={selectFolder}
        onSelectJournal={selectJournal}
        onCreateFolder={() => createFolder("New Folder")}
        onRenameFolder={renameFolder}
        onMoveJournal={moveJournalToFolder}
      />
    </div>
  );
}
