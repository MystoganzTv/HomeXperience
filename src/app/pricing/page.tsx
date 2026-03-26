import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

const plans = [
  {
    name: "Starter",
    price: "$19",
    audience: "Solo host",
    features: [
      "1 business workspace",
      "Excel imports and manual entries",
      "USD or EUR reporting",
      "Core KPI dashboard",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    audience: "Growing operator",
    featured: true,
    features: [
      "Everything in Starter",
      "More booking history and import volume",
      "Advanced charts and exports",
      "Priority support",
    ],
  },
  {
    name: "Portfolio",
    price: "$99",
    audience: "Property manager",
    features: [
      "Multiple team members",
      "Multi-property reporting",
      "Custom onboarding",
      "White-glove migration help",
    ],
  },
];

export default async function PricingPage() {
  const session = await getAuthSession();
  const signedIn = Boolean(session?.user?.email);

  return (
    <>
      <MarketingHeader activePage="pricing" signedIn={signedIn} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-6 pt-8 sm:px-6 xl:px-8">
        <section className="card-surface rounded-[34px] p-8 sm:p-10">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100">
              Pricing
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Simple pricing for hosts who want accounting clarity.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Start with a single business, then grow into a multi-property workflow as your portfolio grows.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-[32px] p-6 ${
                plan.featured
                  ? "card-surface border border-teal-300/25 shadow-[0_24px_80px_rgba(45,212,191,0.08)]"
                  : "card-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100/85">
                    {plan.name}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{plan.audience}</p>
                </div>
                {plan.featured ? (
                  <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">
                    Popular
                  </span>
                ) : null}
              </div>

              <div className="mt-8">
                <p className="text-5xl font-semibold tracking-tight text-white">{plan.price}</p>
                <p className="mt-2 text-sm text-slate-400">per month</p>
              </div>

              <div className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />
                    <p className="text-sm text-slate-200">{feature}</p>
                  </div>
                ))}
              </div>

              <Link
                href={signedIn ? "/dashboard" : "/login"}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-teal-300 text-slate-950 hover:bg-teal-200"
                    : "border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                }`}
              >
                {signedIn ? "Go to workspace" : "Get started"}
              </Link>
            </article>
          ))}
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
