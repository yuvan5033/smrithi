interface SectionHeaderProps {
  label: string;
  title: string | React.ReactNode;
  subtitle?: string;
  className?: string;
  visible?: boolean;
}

export function SectionHeader({ label, title, subtitle, className = '', visible = true }: SectionHeaderProps) {
  return (
    <div className={className}>
      <div className={`flex items-center gap-4 mb-7 text-[0.6rem] tracking-[0.38em] uppercase text-[var(--sienna)] reveal ${visible ? 'in' : ''}`}>
        <div className="w-6 h-px bg-[var(--sienna)] opacity-50 flex-shrink-0" />
        {label}
      </div>
      <h2 className={`font-cormorant text-[clamp(2.2rem,4.5vw,4.2rem)] font-light leading-[1.1] text-[var(--ink)] reveal d1 ${visible ? 'in' : ''}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-[0.92rem] text-[var(--ink-60)] max-w-[480px] mt-4 leading-[1.95] reveal d2 ${visible ? 'in' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
