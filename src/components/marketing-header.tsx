import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

function navLinkClassName(active: boolean) {
  return active
    ? "text-slate-100"
    : "text-slate-400 transition hover:text-slate-100";
}

export function MarketingHeader({
  activePage,
}: {
  activePage: "home" | "pricing";
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
      </div>
    </header>
  );
}
