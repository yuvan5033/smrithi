import { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { RealisticBook } from '../components/book/RealisticBook';
import { PageSpread } from '../components/book/PageSpread';
import { useNavigate } from 'react-router-dom';

const COVER_COLORS = [
  { name: 'Espresso', hex: '#1E0E06', light: true },
  { name: 'Cordovan', hex: '#4E3420', light: true },
  { name: 'Slate', hex: '#263240', light: true },
  { name: 'Forest', hex: '#1E3020', light: true },
  { name: 'Cognac', hex: '#6E3E1C', light: true },
  { name: 'Parchment', hex: '#D8CEB8', light: false },
];

const FONT_OPTIONS = [
  { id: 'cormorant', name: 'Cormorant Garamond', preview: 'Kyoto' },
  { id: 'jost', name: 'Jost Light', preview: 'Kyoto' },
  { id: 'playfair', name: 'Playfair Display', preview: 'Kyoto' },
];

export function Preview() {
  const navigate = useNavigate();
  const [coverColorId, setCoverColorId] = useState(1);
  const [fontStyle, setFontStyle] = useState('cormorant');
  const [currentPage, setCurrentPage] = useState(0);
  const [tripName, setTripName] = useState('Kyoto, Japan');
  const [view, setView] = useState<'cover' | 'pages'>('cover');
  const [ref, isVisible] = useInView();

  const coverColor = COVER_COLORS[coverColorId];

  return (
    <div ref={ref} className="py-28 px-[max(40px,5vw)] pt-28">
      <SectionHeader
        label="Preview Engine"
        title={
          <>
            Your book, <em className="italic text-[var(--sienna)]">before it's made.</em>
          </>
        }
        subtitle="Customise the cover colour, typeface, and layout below. These preferences carry through to your actual edition."
        visible={isVisible}
      />

      <div className="flex gap-4 mb-8 mt-8">
        {(['cover', 'pages'] as const).map((v) => (
          <button
            key={v}
            className={`px-5 py-2.5 text-[0.62rem] tracking-[0.2em] uppercase cursor-pointer font-jost font-light transition-all duration-200 border ${
              view === v
                ? 'bg-[var(--sienna)] text-[var(--cream)] border-[var(--sienna)]'
                : 'border-[var(--border)] bg-transparent text-[var(--ink-60)]'
            }`}
            onClick={() => setView(v)}
          >
            {v === 'cover' ? 'Book Cover' : 'Interior Pages'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-16 items-start mt-16 max-lg:grid-cols-1 max-lg:gap-12">
        <div>
          {view === 'cover' ? (
            <RealisticBook coverColor={coverColor} fontStyle={fontStyle} tripName={tripName} />
          ) : (
            <div>
              <PageSpread currentPage={currentPage} />
              <div className="flex items-center justify-center gap-8 mt-5">
                <button
                  className="bg-none border border-[var(--border)] w-9 h-9 flex items-center justify-center cursor-pointer transition-colors duration-200 hover:border-[var(--sienna)] disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <svg className="w-3 h-3 stroke-[var(--sienna)]" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="text-[0.62rem] tracking-[0.14em] text-[var(--ink-35)]">
                  Spread {currentPage + 1} of 5
                </span>
                <button
                  className="bg-none border border-[var(--border)] w-9 h-9 flex items-center justify-center cursor-pointer transition-colors duration-200 hover:border-[var(--sienna)] disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}
                  disabled={currentPage === 4}
                >
                  <svg className="w-3 h-3 stroke-[var(--sienna)]" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="text-[0.6rem] tracking-[0.3em] uppercase text-[var(--sienna)] mb-1">
              Trip Title
            </div>
            <input
              className="bg-transparent border-none border-b border-[var(--border)] py-3 font-jost text-[0.93rem] font-light text-[var(--ink)] outline-none transition-colors duration-200 w-full focus:border-[var(--sienna)]"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="Destination or journey name"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-[0.6rem] tracking-[0.3em] uppercase text-[var(--sienna)] mb-1">
              Cover — {coverColor.name}
            </div>
            <div className="flex gap-2 flex-wrap">
              {COVER_COLORS.map((color, i) => (
                <div
                  key={i}
                  className={`w-[30px] h-[30px] rounded-sm cursor-pointer border-2 transition-all duration-200 hover:scale-110 ${
                    coverColorId === i ? 'border-[var(--gold)]' : 'border-transparent'
                  }`}
                  style={{
                    background: color.hex,
                    outline: color.hex === '#D8CEB8' ? '1px solid var(--border)' : 'none',
                  }}
                  onClick={() => setCoverColorId(i)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[0.6rem] tracking-[0.3em] uppercase text-[var(--sienna)] mb-1">
              Typeface
            </div>
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.id}
                className={`p-3 px-4 border cursor-pointer text-left bg-none transition-all duration-200 ${
                  fontStyle === font.id
                    ? 'border-[var(--sienna)] bg-[rgba(78,52,32,0.03)]'
                    : 'border-[var(--border)] hover:border-[var(--sienna)]'
                }`}
                onClick={() => setFontStyle(font.id)}
              >
                <div className="text-[0.68rem] text-[var(--ink-60)] mb-0.5">{font.name}</div>
                <div
                  className="text-[1.05rem] text-[var(--ink)] leading-tight"
                  style={{
                    fontFamily:
                      font.id === 'cormorant'
                        ? "'Cormorant Garamond', serif"
                        : font.id === 'jost'
                        ? "'Jost', sans-serif"
                        : "'Playfair Display', serif",
                    fontStyle: font.id !== 'jost' ? 'italic' : 'normal',
                  }}
                >
                  {font.preview}
                </div>
              </button>
            ))}
          </div>

          <Button className="w-full" onClick={() => navigate('/upload')}>
            Begin With These Settings
          </Button>
          <p className="text-[0.62rem] text-[var(--ink-35)] text-center tracking-[0.1em] leading-[1.65]">
            Your preferences carry through when you submit
          </p>
        </div>
      </div>
    </div>
  );
}
