import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

function navLinkClassName(active: boolean) {
  return active
    ? "text-slate-100"
    : "text-slate-400 transition hover:text-slate-100";
}

export function MarketingHeader({
  activePage,
  signedIn,
  primaryHref,
}: {
  activePage: "home" | "pricing";
  signedIn: boolean;
  primaryHref: string;
}) {
  const navItems = [
    { label: "Inicio", href: activePage === "home" ? "#hero" : "/#hero", active: activePage === "home" },
    { label: "Problema", href: activePage === "home" ? "#problem" : "/#problem", active: false },
    { label: "Solución", href: activePage === "home" ? "#solution" : "/#solution", active: false },
    { label: "Funciones", href: activePage === "home" ? "#features" : "/#features", active: false },
    { label: "Precios", href: activePage === "pricing" ? "/pricing" : "#pricing", active: activePage === "pricing" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(9,16,28,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-8 px-4 py-4 sm:px-6 xl:px-8">
        <div className="shrink-0">
          <BrandLogo href="/" showTagline />
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-10 text-sm font-medium lg:flex xl:gap-14">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={navLinkClassName(item.active)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <Link
            href={signedIn ? primaryHref : "/login"}
            className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.04] hover:text-slate-100"
          >
            {signedIn ? "Dashboard" : "Iniciar sesión"}
          </Link>
          <Link
            href={primaryHref}
            className="brand-button inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition"
          >
            {signedIn ? "Abrir app" : "Empieza gratis"}
          </Link>
        </div>
      </div>
    </header>
  );
}
