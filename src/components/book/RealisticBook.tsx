import { useState } from 'react';

interface CoverColor {
  name: string;
  hex: string;
  light: boolean;
}

interface RealisticBookProps {
  coverColor: CoverColor;
  fontStyle: string;
  tripName: string;
}

const FONT_STYLES = {
  cormorant: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300 },
  jost: { fontFamily: "'Jost', sans-serif", fontWeight: 200, letterSpacing: '0.15em' },
  playfair: { fontFamily: "'Playfair Display', serif", fontStyle: 'italic' },
};

export function RealisticBook({ coverColor, fontStyle, tripName }: RealisticBookProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isLight = coverColor.light;
  const textColor = isLight ? 'var(--cream)' : 'var(--ink)';
  const subColor = isLight ? 'rgba(243,237,227,0.4)' : 'rgba(24,21,15,0.38)';
  const instColor = isLight ? 'rgba(243,237,227,0.28)' : 'rgba(24,21,15,0.26)';
  const stitchColor = isLight ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';
  const emboss = isLight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const sheen = isLight ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)';
  const sealColor = isLight ? 'rgba(184,148,74,0.55)' : 'rgba(78,52,32,0.4)';

  const fontStyleObj = FONT_STYLES[fontStyle as keyof typeof FONT_STYLES] || FONT_STYLES.cormorant;

  return (
    <div>
      <div className="perspective-[1800px] w-full flex justify-center py-8 pb-4">
        <div
          className={`relative w-[min(280px,50vw)] aspect-[0.72/1] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isOpen
              ? 'rotate-y-0 rotate-x-0 rotate-z-0 [filter:drop-shadow(0px_8px_30px_rgba(24,21,15,0.2))] cursor-default'
              : 'cursor-pointer [filter:drop-shadow(6px_14px_40px_rgba(24,21,15,0.35))] hover:[transform:rotateY(-10deg)_rotateX(2deg)_rotateZ(-0.5deg)]'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isOpen ? '' : 'rotateY(-20deg) rotateX(5deg) rotateZ(-1deg)',
            background: coverColor.hex,
          }}
          onClick={() => !isOpen && setIsOpen(true)}
        >
          <div
            className="absolute top-[3px] bottom-[3px] right-[-18px] w-[18px] rounded-r-[1px] overflow-hidden"
            style={{
              transformOrigin: 'left center',
              transform: 'rotateY(90deg) translateZ(-1px)',
              background: 'linear-gradient(to right, var(--cream-dd) 0%, var(--cream) 50%, var(--cream-d) 100%)',
            }}
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_3px,rgba(24,21,15,0.04)_3px,rgba(24,21,15,0.04)_4px)]" />
          </div>

          <div
            className="absolute top-[3px] bottom-[3px] left-[-24px] w-6 rounded-l-[2px] flex items-center justify-center overflow-hidden"
            style={{
              transformOrigin: 'right center',
              transform: 'rotateY(-90deg) translateZ(-1px)',
              background: `color-mix(in srgb, ${coverColor.hex} 80%, black)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.06)] via-transparent to-[rgba(0,0,0,0.18)]" />
            <span
              className="font-cormorant text-[0.52rem] tracking-[0.35em] uppercase [writing-mode:vertical-rl] rotate-180 relative z-[1] opacity-55"
              style={{ color: subColor }}
            >
              Smrithi · {tripName || 'Edition'}
            </span>
          </div>

          <div
            className={`absolute inset-0 transition-all duration-[1450ms] ease-[cubic-bezier(0.33,1,0.68,1)]`}
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              transform: isOpen ? 'rotateY(-172deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className="absolute inset-0 rounded-[1px_5px_5px_1px] overflow-hidden [backface-visibility:hidden] shadow-[inset_-1px_0_0_rgba(255,255,255,0.06),inset_1px_0_0_rgba(255,255,255,0.04)]"
              style={{ background: coverColor.hex }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-35 mix-blend-multiply"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='lt'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65 0.55' numOctaves='3' seed='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23lt)' opacity='0.4'/%3E%3C/svg%3E")`,
                }}
              />
              <div
                className="absolute top-3 bottom-3 left-4 w-px pointer-events-none"
                style={{
                  background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 4px, ${stitchColor} 4px, ${stitchColor} 8px)`,
                }}
              />
              <div
                className="absolute inset-4 pointer-events-none border"
                style={{ borderColor: emboss }}
              />
              <div
                className="absolute top-0 left-[8%] right-[45%] bottom-0 pointer-events-none"
                style={{
                  background: `linear-gradient(108deg, transparent 28%, ${sheen} 50%, transparent 72%)`,
                }}
              />

              <div className="absolute top-6 left-7 right-7 flex items-center gap-3" style={{ color: instColor }}>
                <span className="font-jost text-[0.48rem] font-normal tracking-[0.45em] uppercase">
                  Smrithi
                </span>
                <span className="flex-1 h-px" style={{ background: instColor }} />
              </div>

              <div
                className="absolute inset-0 flex flex-col justify-end p-7 pb-8 z-[2]"
                style={{ color: textColor }}
              >
                <div
                  className="text-[0.5rem] font-light tracking-[0.3em] uppercase mb-2"
                  style={{ color: subColor }}
                >
                  Archival Travel Book
                </div>
                <div
                  className="font-cormorant text-[clamp(1.4rem,3vw,2.1rem)] font-light leading-[1.08]"
                  style={fontStyleObj}
                >
                  {tripName || 'Kyoto, Japan'}
                </div>
                <div
                  className="text-[0.56rem] tracking-[0.22em] uppercase mt-2.5"
                  style={{ color: subColor }}
                >
                  Spring 2024
                </div>
              </div>

              <div
                className="absolute bottom-6 right-6 w-[34px] h-[34px] rounded-full flex items-center justify-center border"
                style={{ borderColor: sealColor }}
              >
                <span
                  className="font-cormorant text-[0.88rem]"
                  style={{ color: sealColor }}
                >
                  S
                </span>
              </div>

              {[
                [20, null, 20, null],
                [20, null, null, 20],
                [null, 20, 20, null],
                [null, 20, null, 20],
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full pointer-events-none border"
                  style={{
                    top: pos[0] !== null ? `${pos[0]}px` : undefined,
                    bottom: pos[1] !== null ? `${pos[1]}px` : undefined,
                    left: pos[2] !== null ? `${pos[2]}px` : undefined,
                    right: pos[3] !== null ? `${pos[3]}px` : undefined,
                    borderColor: stitchColor,
                  }}
                />
              ))}
            </div>

            <div
              className="absolute inset-0 [backface-visibility:hidden] flex flex-col items-center justify-center p-8 bg-[var(--cream-d)] text-[var(--ink)]"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div className="font-jost text-[0.58rem] tracking-[0.25em] uppercase text-center text-[var(--ink-35)] mb-2.5">
                Smrithi
              </div>
              <div className="w-9 h-px bg-[var(--gold)] opacity-40 my-3" />
              <div className="font-cormorant text-[1.3rem] font-light italic text-center leading-[1.4] text-[var(--ink)]">
                {tripName || 'Kyoto, Japan'}
              </div>
              <div className="text-[0.58rem] tracking-[0.25em] uppercase text-[var(--ink-35)] text-center mt-1.5">
                Archival Edition
              </div>
              <div className="w-9 h-px bg-[var(--gold)] opacity-40 my-3" />
              <div className="text-[0.6rem] leading-[1.85] text-[var(--ink-35)] text-center max-w-[190px] mt-4">
                One trip. One book. Built to last a hundred years.
              </div>
            </div>
          </div>

          <div
            className={`absolute inset-0 bg-[var(--cream-d)] flex flex-col p-8 transition-opacity duration-400 ${
              isOpen ? 'opacity-100 delay-[750ms]' : 'opacity-0'
            }`}
          >
            <div className="text-[0.55rem] tracking-[0.2em] text-right text-[var(--ink-35)] mb-5 flex-shrink-0">
              — 2 —
            </div>
            <div className="flex-1 min-h-0 overflow-hidden bg-gradient-to-br from-[#C4B49A] to-[#A89478]" />
            <div className="font-cormorant text-[0.8rem] italic text-center mt-3 text-[var(--ink-60)] flex-shrink-0">
              Morning, the city waking
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <button
          className="text-[0.6rem] tracking-[0.28em] uppercase text-[var(--sienna)] bg-none border-none cursor-pointer opacity-55 hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-2.5 font-jost"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-[13px] h-[13px] stroke-[var(--sienna)]" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            ) : (
              <path d="M4 6h6v12H4zM14 6h6v12h-6z" strokeLinejoin="round" />
            )}
          </svg>
          {isOpen ? 'Close the book' : 'Open the book'}
        </button>
      </div>
    </div>
  );
}
