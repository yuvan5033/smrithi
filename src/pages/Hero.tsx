import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export function Hero() {
  const navigate = useNavigate();

  useSEO({
    title: 'Smrithi Atelier — Archival Travel Photo Books | Custom Bound Editions',
    description: 'Smrithi Atelier crafts archival-quality, leatherette-bound travel photo books on 320gsm acid-free stock. One book per journey — built for generations. Starting at ₹4,800.',
    canonical: 'https://smrithi.online/',
  });

  return (
    <section className="min-h-screen grid place-items-center px-[max(40px,5vw)] pt-[130px] pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[
          { w: '140vw', h: '70vw', b: '-22%', o: 0.35 },
          { w: '105vw', h: '52vw', b: '-10%', o: 0.25 },
          { w: '70vw', h: '35vw', b: '2%', o: 0.15 },
        ].map((circle, i) => (
          <div
            key={i}
            className="absolute border border-[var(--border)] rounded-full left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: circle.w,
              height: circle.h,
              bottom: circle.b,
              opacity: circle.o,
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-[2] max-w-[800px]">
        <p
          className="text-[0.6rem] tracking-[0.42em] uppercase text-[var(--sienna)] mb-10 opacity-0"
          style={{ animation: 'fadeUp 1s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          Archival Travel Books · Made for Retirement
        </p>
        <h1
          className="font-cormorant text-[clamp(3rem,8vw,7.5rem)] font-light leading-[1.03] text-[var(--ink)] mb-8 opacity-0"
          style={{ animation: 'fadeUp 1.1s 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          Every trip, <em className="italic text-[var(--sienna)]">bound.</em>
          <br />
          Every memory, kept.
        </h1>
        <p
          className="text-[0.97rem] leading-[1.9] max-w-[480px] mx-auto mb-14 text-[var(--ink-60)] opacity-0 text-center"
          style={{ animation: 'fadeUp 1.1s 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          We turn your travel photographs into permanent archival albums — one book per journey, built to outlast everything digital.
        </p>
        <div
          className="flex gap-6 justify-center flex-wrap opacity-0"
          style={{ animation: 'fadeUp 1.1s 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          <Button onClick={() => navigate('/upload')}>Begin Your Edition</Button>
          <Button variant="ghost" onClick={() => navigate('/preview')}>
            Preview the Book
          </Button>
        </div>
      </div>
    </section>
  );
}
