import { useInView } from '../hooks/useInView';
import { useSEO } from '../hooks/useSEO';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface ProcessProps {
  isFullPage?: boolean;
}

export function Process({ isFullPage = false }: ProcessProps) {
  const navigate = useNavigate();
  const [ref, isVisible] = useInView();

  useSEO({
    title: 'How It Works — Our Process | Smrithi Atelier',
    description: 'Upload your trip photos, we design and sequence the layout, preview together on a call, then print and ship your Smyth-sewn archival edition within two weeks.',
    canonical: 'https://smrithi.online/process',
  });

  const steps = [
    {
      n: '01',
      t: 'Upload',
      d: 'Share your trip photos through our intake form. Add context — where you went, what it meant. We read every word.',
    },
    {
      n: '02',
      t: 'We Design',
      d: 'Your photos are sequenced and laid out within a precise typographic grid. You receive a digital preview within a few hours.',
    },
    {
      n: '03',
      t: 'We Call You',
      d: 'Before printing, we have a short conversation. We want to understand the significance of the trip. Then we print.',
    },
    {
      n: '04',
      t: 'Bound & Shipped',
      d: 'Smyth-sewn, leatherette-covered, blind-embossed. Your edition ships within two weeks. Built for the shelf.',
    },
  ];

  if (isFullPage) {
    const specs = [
      ['Paper Stock', '320gsm archival matte, acid-free and UV-resistant. The same spec used in conservation printing.'],
      ['Binding', 'Smyth-sewn — the gold standard for books that need to last. Lays completely flat when open.'],
      ['Cover', 'Leatherette over boards, with your trip title blind-embossed. Six colours to choose from.'],
      ['Timeline', 'Digital preview in hours. Printed and shipped within two weeks of your approval.'],
    ];

    return (
      <div ref={ref} className="py-28 px-[max(40px,5vw)] pt-[120px]">
        <div className={`flex items-center gap-4 mb-7 text-[0.6rem] tracking-[0.38em] uppercase text-[var(--sienna)] reveal ${isVisible ? 'in' : ''}`}>
          <div className="w-6 h-px bg-[var(--sienna)] opacity-50 flex-shrink-0" />
          How It Works
        </div>
        <h2 className={`font-cormorant text-[clamp(2.2rem,4.5vw,4.2rem)] font-light leading-[1.1] text-[var(--ink)] reveal d1 ${isVisible ? 'in' : ''}`}>
          Craft you can <em className="italic text-[var(--sienna)]">feel.</em>
        </h2>
        <p className={`text-[0.93rem] text-[var(--ink-60)] max-w-[520px] mt-4 mb-16 leading-[1.95] reveal d2 ${isVisible ? 'in' : ''}`}>
          Every book we make follows the same four steps. It's a slow, careful process — because that's the only way to do it right.
        </p>

        <div className="grid md:grid-cols-2 gap-16 md:gap-x-[6vw] max-w-[900px]">
          {steps.map((step, i) => (
            <div key={i} className={`reveal d${i + 1} ${isVisible ? 'in' : ''}`}>
              <div className="font-cormorant text-[2.2rem] font-light text-[rgba(78,52,32,0.1)] leading-none mb-4">
                {step.n}
              </div>
              <div className="font-cormorant text-[1.45rem] font-light text-[var(--ink)] mb-2.5">
                {step.t}
              </div>
              <p className="text-[0.9rem] leading-[1.95] text-[var(--ink-60)]">{step.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 border-t border-[var(--border)] pt-16 grid md:grid-cols-2 gap-8 max-w-[700px]">
          {specs.map((spec) => (
            <div key={spec[0]} className="border-l border-[var(--border)] pl-6">
              <div className="text-[0.6rem] tracking-[0.28em] uppercase text-[var(--sienna)] mb-2">
                {spec[0]}
              </div>
              <p className="text-[0.87rem] leading-[1.88] text-[var(--ink-60)]">{spec[1]}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-20">
          <Button onClick={() => navigate('/upload')}>Begin Your Edition</Button>
        </div>
      </div>
    );
  }

  return (
  <div
    ref={ref}
    className="bg-[var(--sienna)] py-24 md:py-28 px-6 md:px-[5vw] md:mx-[-5vw]"
  >
    <div className="max-w-6xl mx-auto">

      <div className="flex items-center gap-4 mb-7">
        <span className="w-6 h-px bg-[rgba(243,237,227,0.4)] inline-block" />
        <span className="text-[0.6rem] tracking-[0.38em] uppercase text-[rgba(243,237,227,0.4)]">
          How It Works
        </span>
      </div>

      <h2
        className={`font-cormorant text-[clamp(2rem,5vw,4rem)] font-light leading-[1.1] text-[var(--cream)] reveal d1 ${
          isVisible ? "in" : ""
        }`}
      >
        Craft you can{" "}
        <em className="italic text-[var(--gold)]">feel.</em>
      </h2>

      <div className="grid md:grid-cols-4 border-t border-[rgba(243,237,227,0.1)] mt-14">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`
              py-12 px-0 md:pr-10
              md:border-r border-[rgba(243,237,227,0.08)] 
              md:last:border-r-0
              ${i > 0 ? "md:pl-10" : ""}
              border-b md:border-b-0
              reveal d${i + 2} ${isVisible ? "in" : ""}
            `}
          >
            <div className="font-cormorant text-5xl md:text-6xl font-light text-[rgba(243,237,227,0.08)] leading-none mb-5">
              {step.n}
            </div>

            <div className="font-cormorant text-[2rem] md:text-[1.7rem] font-light text-[var(--cream)] mb-3">
              {step.t}
            </div>

            <p className="text-[0.9rem] leading-[1.9] text-[rgba(243,237,227,0.55)] max-w-md">
              {step.d}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
