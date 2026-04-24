interface PageSpreadProps {
  currentPage: number;
}

const PAGE_PALETTES = [
  ['#C4B49A', '#A89478'],
  ['#8AA49C', '#6E8C84'],
  ['#C0A498', '#A48878'],
  ['#B4C4AC', '#98A890'],
  ['#C8B8A4', '#AC9C88'],
];

const CAPTIONS = [
  ['First light over the valley', 'The morning market'],
  ['Through the old city gate', 'Afternoon, the river'],
  ['The courtyard at noon', 'Steps ascending'],
  ['A table set for one', 'The last street'],
  ['Returning, the harbour', 'Departure platform'],
];

export function PageSpread({ currentPage }: PageSpreadProps) {
  const palette = PAGE_PALETTES[currentPage % PAGE_PALETTES.length];
  const captions = CAPTIONS[currentPage % CAPTIONS.length];

  return (
    <div className="relative w-full aspect-[2/1.35] mt-6 bg-[var(--cream-d)] border border-[var(--border)] overflow-hidden flex shadow-[0_4px_20px_rgba(24,21,15,0.06)]">
      <div className="w-1/2 relative overflow-hidden flex flex-col border-r border-[var(--border)]">
        <div className="absolute top-0 bottom-0 right-0 w-5 bg-gradient-to-r from-[rgba(24,21,15,0.05)] to-transparent pointer-events-none z-[1]" />
        <div className="p-6 flex-1 flex flex-col">
          <div className="text-[0.58rem] tracking-[0.2em] text-[var(--ink-35)] mb-4 flex-shrink-0">
            — {currentPage * 2 + 1} —
          </div>
          <div
            className="flex-1 overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})` }}
          />
          <div className="font-cormorant text-[0.82rem] italic text-[var(--ink-60)] mt-3 text-center flex-shrink-0">
            {captions[0]}
          </div>
        </div>
      </div>

      <div className="w-1/2 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 bottom-0 left-0 w-5 bg-gradient-to-l from-[rgba(24,21,15,0.05)] to-transparent pointer-events-none z-[1]" />
        <div className="p-6 flex-1 flex flex-col">
          <div className="text-[0.58rem] tracking-[0.2em] text-[var(--ink-35)] mb-4 text-right flex-shrink-0">
            — {currentPage * 2 + 2} —
          </div>
          <div
            className="flex-1 overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${palette[1]}, ${palette[0]})` }}
          />
          <div className="font-cormorant text-[0.82rem] italic text-[var(--ink-60)] mt-3 text-center flex-shrink-0">
            {captions[1]}
          </div>
        </div>
      </div>
    </div>
  );
}
