import { useInView } from '../hooks/useInView';
import { SectionHeader } from '../components/ui/SectionHeader';

export function About() {
  const [ref, isVisible] = useInView();

  const stats = [
    ['320gsm', 'Archival matte stock'],
    ['∞', 'Expected archival lifespan'],
    ['01', 'Edition per trip, always'],
  ];

  return (
    <section ref={ref} className="py-28 px-[max(40px,5vw)] border-t border-[var(--border)]">
      <SectionHeader
        label="What We Make"
        title={
          <>
            Not an album.
            <br />
            An <em className="italic text-[var(--sienna)]">archive.</em>
          </>
        }
        visible={isVisible}
      />

      <div className="grid md:grid-cols-2 gap-[7vw] items-start mt-12">
        <div>
          <blockquote className={`font-cormorant text-[clamp(1.4rem,2.4vw,2rem)] italic font-light leading-[1.5] text-[var(--sienna)] border-l border-[var(--gold)] pl-7 mt-10 reveal d2 ${isVisible ? 'in' : ''}`}>
            "Each trip deserves its own volume. When you retire, you'll hold a shelf of journeys — every one of them real."
          </blockquote>
        </div>

        <div className={`text-[0.97rem] leading-[2] text-[var(--ink-60)] flex flex-col gap-6 reveal d2 ${isVisible ? 'in' : ''}`}>
          <p>
            Send us your photographs from a trip. We design a bound edition — structured, sequenced, and printed on 320gsm archival matte stock. One book per journey.
          </p>
          <p>
            Over years and decades, your shelf fills up. Rome, 2019. Kyoto, 2022. Patagonia, 2025. When retirement comes, you don't open a photo app — you open a book.
          </p>
          <p>
            We build these to last generations. Smyth-sewn. Acid-free. Leatherette-bound. Blind-embossed with your trip title. Not a product. A permanent form.
          </p>
        </div>
      </div>

<div
  className={`mt-20 border-t border-[var(--border)] reveal d3 ${
    isVisible ? "in" : ""
  }`}
>
  <div className="flex flex-col md:grid md:grid-cols-3">
    {stats.map((stat, i) => (
      <div
        key={stat[0]}
        className={`
          py-[6vh] text-center md:text-left
          md:border-r md:border-[var(--border)] 
          md:last:border-r-0
          ${i > 0 ? "md:pl-8" : ""}
          border-b md:border-b-0 border-[var(--border)]
          last:border-b-0
        `}
      >
        <div className="font-cormorant text-5xl md:text-4xl font-light text-[var(--sienna)] leading-none mb-2">
          {stat[0]}
        </div>
        <div className="text-[0.7rem] md:text-[0.65rem] tracking-[0.15em] md:tracking-[0.18em] uppercase text-[var(--ink-35)]">
          {stat[1]}
        </div>
      </div>
    ))}
  </div>
</div>
    </section>
  );
}
