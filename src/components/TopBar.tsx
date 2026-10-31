export default function TopBar() {
  return (
    <div className="bg-slate-100 px-8 py-[clamp(0.5rem,2vw,1rem)] flex flex-col md:flex-row gap-2 justify-between items-center">
      <p className="font-bold text-[clamp(1.5rem,2vw,2.5rem)] w-full">
        Productivity Go
      </p>
      <div className="flex gap-6 items-center justify-between md:justify-end w-full">
        <span className="text-[clamp(1rem,2vw,1.25rem)] bg-blue-200 px-3 rounded-md">
          08.00
        </span>
        <p className="text-[clamp(1.5rem,2vw,2.5rem)] font-medium">
          Jurnal Harian
        </p>
      </div>
    </div>
  );
}
