import { useInView } from '../hooks/useInView';
import { SectionHeader } from './ui/SectionHeader';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';

export function Pricing() {
  const [ref, isVisible] = useInView();

  const inclusions = [
    'Handcrafted 40-page archival album',
    'Curated layout by our editorial team',
    '320gsm archival matte stock',
    '12" x 16" Framed Fine-Art Print',
    'Premium presentation packaging'
  ];

  return (
    <section ref={ref} className="relative py-28 px-[max(20px,5vw)] bg-[#F9F6F1] border-t border-[var(--border)] overflow-hidden">
      {/* Brandmark Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-cormorant italic text-[40vw] text-[var(--sienna)] opacity-[0.03] pointer-events-none select-none z-0">
        S
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <SectionHeader
          label="The Investment"
          title={
            <>
              One Edition.
              <br />
              All Your <em className="italic text-[var(--sienna)]">Memories.</em>
            </>
          }
          subtitle="A complete physical archive of your journey, designed to last generations."
          visible={isVisible}
          className="mb-16"
        />

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-stretch">
          {/* Main Pricing Card */}
          <div className={`relative bg-white border border-[var(--border)] p-7 md:p-14 flex flex-col justify-between reveal d2 ${isVisible ? 'in' : ''}`}>
            {/* Top Badge */}
            <div className="absolute top-0 right-0 bg-[var(--sienna)] text-[var(--cream)] px-6 py-2 text-[0.65rem] tracking-[0.2em] uppercase font-medium">
              Launch exclusive
            </div>

            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-4 mb-6">
                <div>
                  <h3 className="font-cormorant text-4xl font-light text-[var(--ink)] mt-8 mb-2">Smrithi Edition</h3>
                  <div className="w-12 h-px bg-[var(--gold)] mb-2" />
                </div>
                <div className="sm:text-right">
                  <div className="font-cormorant text-5xl font-light text-[var(--sienna)]">₹5,000</div>
                  <div className="text-[0.6rem] tracking-[0.1em] uppercase text-[var(--ink-35)] mt-1">Inclusive of all taxes</div>
                </div>
              </div>

              <p className="text-[0.98rem] leading-[1.8] text-[var(--ink-60)] mb-10 max-w-sm">
                A 40-page archival album composed from your journey, bound as a keepsake to be preserved for years to come.
              </p>

              <div className="space-y-4 mb-12">
                <div className="text-[0.7rem] tracking-[0.15em] uppercase text-[var(--gold)] font-medium mb-6">What's Included</div>
                {inclusions.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 text-[0.9rem] text-[var(--ink)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/upload" className="block w-full">
              <Button className="w-full py-6 text-sm uppercase tracking-[0.2em]" variant="primary">
                Begin Your Journey
              </Button>
            </Link>
          </div>

          {/* Visual Side / Additional Info */}
          <div className={`flex flex-col gap-6 lg:gap-8 reveal d3 ${isVisible ? 'in' : ''}`}>
            <div className="flex-1 bg-[var(--cream-d)] relative min-h-[300px] overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1544123089-18214df3b1a1?auto=format&fit=crop&q=72&w=1000"
                alt="Smrithi Album Preview"
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-4 sm:p-6 bg-white/90 backdrop-blur-sm border border-white/20">
                <div className="font-cormorant italic text-lg sm:text-xl text-[var(--sienna)] mb-1">"The tactile reality of a journey."</div>
                <div className="text-[0.6rem] sm:text-[0.65rem] tracking-[0.15em] uppercase text-[var(--ink-35)]">Archival Matte Edition</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 lg:gap-8">
              <div className="p-6 sm:p-8 border border-[var(--border)] flex flex-col justify-center">
                <div className="text-2xl sm:text-3xl font-cormorant italic text-[var(--gold)] mb-2">40</div>
                <div className="text-[0.55rem] sm:text-[0.6rem] tracking-[0.15em] uppercase text-[var(--ink-60)] leading-tight">Custom Pages</div>
              </div>
              <div className="p-6 sm:p-8 border border-[var(--border)] flex flex-col justify-center">
                <div className="text-2xl sm:text-3xl font-cormorant italic text-[var(--gold)] mb-2">100%</div>
                <div className="text-[0.55rem] sm:text-[0.6rem] tracking-[0.15em] uppercase text-[var(--ink-60)] leading-tight">Acid-Free Paper</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-20 flex flex-col md:flex-row items-center justify-between gap-10 py-10 border-t border-b border-[var(--border)] reveal d4 ${isVisible ? 'in' : ''}`}>
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full border border-[var(--border)] flex-shrink-0 flex items-center justify-center font-cormorant italic text-xl text-[var(--sienna)]">S</div>
            <p className="text-[0.8rem] text-[var(--ink-60)] max-w-xs">
              Every Smrithi Edition is verified for archival quality before shipping.
            </p>
          </div>
          <div className="flex gap-12 sm:gap-16">
            <div className="text-center">
              <div className="text-[0.6rem] tracking-[0.2em] uppercase text-[var(--ink-35)] mb-1">Lead Time</div>
              <div className="text-[0.85rem] font-medium tracking-wide">7-10 Days</div>
            </div>
            <div className="text-center">
              <div className="text-[0.6rem] tracking-[0.2em] uppercase text-[var(--ink-35)] mb-1">Shipping</div>
              <div className="text-[0.85rem] font-medium tracking-wide">Pan-India</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
