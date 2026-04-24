import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="border-t border-[var(--border)] py-10 px-[max(40px,5vw)] flex items-center justify-between flex-wrap gap-6">
      <div className="font-cormorant text-base tracking-[0.34em] uppercase text-[var(--sienna)]">
        Smrithi
      </div>
      <ul className="flex gap-8 list-none">
        {[
          ['Gallery', 'gallery'],
          ['Process', 'process'],
          ['FAQ', 'faq'],
          ['Begin', 'upload'],
        ].map(([label, id]) => (
          <li key={id}>
            <button
              onClick={() => navigate(`/${id}`)}
              className="text-[0.62rem] tracking-[0.16em] uppercase text-[var(--ink-35)] bg-none border-none cursor-pointer transition-colors duration-200 font-jost hover:text-[var(--sienna)]"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-[0.62rem] tracking-[0.1em] text-[var(--ink-35)]">
        © 2025 Smrithi. All rights reserved.
      </p>
    </footer>
  );
}
