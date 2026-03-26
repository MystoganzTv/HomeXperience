import type { ReactNode } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth-buttons";
import { formatDateLabel } from "@/lib/format";
import type { CurrencyCode, ImportSummary } from "@/lib/types";

function navClassName(active: boolean) {
  return active
    ? "rounded-2xl bg-teal-300 px-4 py-2.5 text-sm font-semibold text-slate-950"
    : "rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]";
}

export function WorkspaceHeader({
  activePage,
  businessName,
  userName,
  userEmail,
  currencyCode,
  latestImport,
  actions,
}: {
  activePage: "dashboard" | "profile";
  businessName: string;
  userName: string;
  userEmail: string;
  currencyCode: CurrencyCode;
  latestImport: ImportSummary | null;
  actions?: ReactNode;
}) {
  return (
    <header className="card-surface rounded-[30px] px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100">
                HomeXperience
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                {latestImport?.fileName ?? "No workbook imported"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                {latestImport
                  ? `Last import ${formatDateLabel(latestImport.importedAt.slice(0, 10))}`
                  : "No imports yet"}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {businessName}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Accounting workspace for short-term rental operators.
              </p>
            </div>

            <nav className="flex flex-wrap gap-3">
              <Link href="/dashboard" className={navClassName(activePage === "dashboard")}>
                Dashboard
              </Link>
              <Link href="/profile" className={navClassName(activePage === "profile")}>
                Profile
              </Link>
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {actions}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-slate-400">
                {userEmail} • {currencyCode}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
