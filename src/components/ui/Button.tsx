import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = 'inline-block px-9 py-3.5 font-jost text-[0.65rem] font-normal tracking-[0.24em] uppercase cursor-pointer transition-all duration-[220ms]';

  const variantStyles = {
    primary: 'bg-[var(--sienna)] text-[var(--cream)] border border-[var(--sienna)] hover:bg-transparent hover:text-[var(--sienna)]',
    ghost: 'bg-transparent text-[var(--sienna)] border border-[var(--border)] hover:border-[var(--sienna)]'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
