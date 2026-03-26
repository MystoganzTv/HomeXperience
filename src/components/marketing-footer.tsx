import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="mx-auto mt-10 w-full max-w-7xl px-4 pb-10 sm:px-6 xl:px-8">
      <div className="card-surface flex flex-col gap-4 rounded-[28px] px-5 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-medium text-white">HomeXperience</p>
          <p className="mt-1">Short-term rental accounting that feels like software, not spreadsheet cleanup.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <Link href="/pricing" className="transition hover:text-white">
            Pricing
          </Link>
          <Link href="/showcase" className="transition hover:text-white">
            Showcase
          </Link>
          <Link href="/login" className="transition hover:text-white">
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
