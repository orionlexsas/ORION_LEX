import { Link } from 'react-router';
import { cn } from '@/lib/cn';

interface LogoProps {
  name: string;
  tagline: string;
  className?: string;
}

/** Escudo con columnas y estrellas + nombre del despacho. */
export function Logo({ name, tagline, className }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label={`${name}, ir al inicio`}
      className={cn('flex items-center gap-3', className)}
    >
      <ShieldMark className="h-12 w-auto shrink-0 sm:h-16" />
      <span className="flex flex-col leading-none">
        <span className="bg-gold-gradient bg-clip-text font-display text-xl font-semibold tracking-wide text-transparent uppercase sm:text-[1.9rem]">
          {name}
        </span>
        <span className="mt-1.5 text-center font-display text-[0.5rem] tracking-[0.3em] text-gold/90 uppercase sm:text-[0.6rem]">
          {tagline}
        </span>
      </span>
    </Link>
  );
}

function ShieldMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3d99f" />
          <stop offset="1" stopColor="#c2974b" />
        </linearGradient>
      </defs>
      {/* Escudo */}
      <path
        d="M32 3 59 10v24c0 18-12 30-27 35C17 64 5 52 5 34V10Z"
        fill="#10131a"
        stroke="#fff"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M8 12.5 32 6.3l24 6.2v7.5H8Z" fill="#1d2a44" />
      {/* Estrellas */}
      {[20, 32, 44].map((x) => (
        <path
          key={x}
          transform={`translate(${x} 13.2)`}
          d="m0-3.2.9 2.1 2.3.2-1.7 1.5.5 2.2L0 1.7-2 2.8l.5-2.2-1.7-1.5 2.3-.2Z"
          fill="url(#logo-gold)"
        />
      ))}
      {/* Frontón y columnas */}
      <path d="M17 31h30l-15-7Z" fill="#fff" />
      <rect x="18" y="32.5" width="28" height="2.4" fill="#fff" />
      {[21, 28.5, 36, 43].map((x) => (
        <rect key={x} x={x - 1.6} y="36" width="3.2" height="16" rx="0.6" fill="#fff" />
      ))}
      <rect x="16.5" y="53" width="31" height="2.6" fill="#fff" />
      <rect x="15" y="56.6" width="34" height="2.4" fill="url(#logo-gold)" />
    </svg>
  );
}
