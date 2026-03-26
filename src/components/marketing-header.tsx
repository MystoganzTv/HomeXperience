import Link from "next/link";

function navLinkClassName(active: boolean) {
  return active
    ? "text-white"
    : "text-slate-400 transition hover:text-white";
}

export function MarketingHeader({
  activePage,
  signedIn,
}: {
  activePage: "home" | "pricing" | "showcase";
  signedIn: boolean;
}) {
  return (
    <header className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 xl:px-8">
      <div className="card-surface flex flex-col gap-4 rounded-[28px] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100">
            HomeXperience
          </span>
          <span className="text-sm text-slate-400">
            Accounting SaaS for short-term rentals
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/" className={navLinkClassName(activePage === "home")}>
              Home
            </Link>
            <Link href="/pricing" className={navLinkClassName(activePage === "pricing")}>
              Pricing
            </Link>
            <Link href="/showcase" className={navLinkClassName(activePage === "showcase")}>
              Showcase
            </Link>
          </nav>

          <Link
            href={signedIn ? "/dashboard" : "/login"}
            className="rounded-2xl bg-teal-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
          >
            {signedIn ? "Open dashboard" : "Sign in"}
          </Link>
        </div>
      </div>
    </header>
  );
}
