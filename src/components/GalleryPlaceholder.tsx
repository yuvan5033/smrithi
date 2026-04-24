interface GalleryPlaceholderProps {
  color: string;
  dest: string;
  year: string;
  tall?: boolean;
}

export function GalleryPlaceholder({ color, dest, year, tall }: GalleryPlaceholderProps) {
  const minHeight = tall ? 500 : 260;

  return (
    <div
      className="w-full h-full flex flex-col justify-end p-6 relative overflow-hidden"
      style={{
        minHeight,
        background: `linear-gradient(160deg, ${color}18 0%, ${color}38 100%)`,
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{
          background: `linear-gradient(to bottom, ${color}80, ${color}40)`,
        }}
      />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 font-cormorant text-7xl font-light whitespace-nowrap tracking-[0.1em] opacity-[0.07]"
        style={{ color }}
      >
        {dest.split(',')[0]}
      </div>
      <div
        className="absolute top-5 right-5 w-9 h-12 rounded-[1px_3px_3px_1px] opacity-[0.16]"
        style={{ background: color }}
      />
      <div className="relative z-[2] pl-2">
        <div className="text-[0.56rem] tracking-[0.3em] uppercase text-[rgba(24,21,15,0.32)] mb-1.5">
          Archival Edition
        </div>
        <div className="font-cormorant text-[1.15rem] italic text-[var(--ink)] mb-1">
          {dest}
        </div>
        <div className="text-[0.58rem] tracking-[0.18em] uppercase text-[var(--ink-35)]">
          {year}
        </div>
      </div>
    </div>
  );
}
