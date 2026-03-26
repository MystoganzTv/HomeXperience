import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  showTagline?: boolean;
  compact?: boolean;
};

export function BrandLogo({
  href,
  showTagline = false,
  compact = false,
}: BrandLogoProps) {
  const content = (
    <div className="flex items-center gap-3">
      <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--accent-soft-strong)] bg-[linear-gradient(180deg,rgba(88,196,182,0.22)_0%,rgba(10,21,36,0.96)_100%)] shadow-[0_14px_30px_rgba(7,17,28,0.32)]">
        <span className="absolute inset-[1px] rounded-[15px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_48%),linear-gradient(180deg,rgba(9,17,29,0.12)_0%,rgba(9,17,29,0.5)_100%)]" />
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className="relative h-7 w-7"
          fill="none"
        >
          <path
            d="M16 30.5L32 17L48 30.5"
            stroke="rgba(216,251,245,0.96)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 29.5V45C21 47.2 22.8 49 25 49H39C41.2 49 43 47.2 43 45V29.5"
            stroke="rgba(88,196,182,0.98)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M29 49V38C29 36.9 29.9 36 31 36H33C34.1 36 35 36.9 35 38V49"
            stroke="rgba(216,251,245,0.9)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M46.5 18L47.6 21.1L50.8 22.2L47.6 23.3L46.5 26.5L45.4 23.3L42.2 22.2L45.4 21.1L46.5 18Z"
            fill="rgba(216,251,245,0.96)"
          />
        </svg>
      </span>

      <span className="min-w-0">
        <span className={`${compact ? "text-base" : "text-lg"} block font-semibold tracking-[-0.05em] text-slate-100`}>
          Hostlyx
        </span>
        {showTagline ? (
          <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Finance OS for rental hosts
          </span>
        ) : null}
      </span>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex">
      {content}
    </Link>
  );
}
