import { useInView } from '../hooks/useInView';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

export function CTASection() {
  const navigate = useNavigate();
  const [ref, isVisible] = useInView();

  return (
    <div ref={ref} className="text-center py-32 px-[max(40px,5vw)] relative overflow-hidden">
      {[220, 380, 560, 740].map((size) => (
        <div
          key={size}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-[var(--border)] rounded-full pointer-events-none"
          style={{ width: size, height: size }}
        />
      ))}

      <h2
        className={`font-cormorant text-[clamp(3rem,8vw,6.5rem)] font-light leading-[1.06] relative z-[2] reveal ${
          isVisible ? 'in' : ''
        }`}
      >
        For <em className="italic text-[var(--sienna)]">Generations.</em>
      </h2>
      <p
        className={`text-[0.9rem] text-[var(--ink-60)] max-w-[420px] mx-auto my-6 mb-14 leading-[1.9] relative z-[2] reveal d1 ${
          isVisible ? 'in' : ''
        }`}
      >
        Start with one trip. Build an archive. Come retirement, you'll hold the whole shelf.
      </p>
      <div
        className={`flex justify-center gap-6 flex-wrap relative z-[2] reveal d2 ${
          isVisible ? 'in' : ''
        }`}
      >
        <Button onClick={() => navigate('/upload')}>Begin Your Edition</Button>
        <Button variant="ghost" onClick={() => navigate('/preview')}>
          Preview the Book
        </Button>
      </div>
    </div>
  );
}
