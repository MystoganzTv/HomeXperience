import {
  eachDayOfInterval,
  format,
  getDay,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import { formatCurrency, formatNumber } from "@/lib/format";
import { SectionCard } from "@/components/section-card";
import type {
  BookingRecord,
  CalendarClosureRecord,
  CurrencyCode,
} from "@/lib/types";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarDays(anchor: Date) {
  const monthStart = startOfMonth(anchor);
  const startOffset = getDay(monthStart);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - startOffset);
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridStart.getDate() + 41);

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function CalendarPanel({
  monthLabel,
  anchorDate,
  bookings,
  closures,
  currencyCode,
}: {
  monthLabel: string;
  anchorDate: Date;
  bookings: BookingRecord[];
  closures: CalendarClosureRecord[];
  currencyCode: CurrencyCode;
}) {
  const days = buildCalendarDays(anchorDate);
  const checkIns = bookings.filter((booking) => booking.checkIn.startsWith(format(anchorDate, "yyyy-MM")));
  const checkOuts = bookings.filter((booking) => booking.checkout.startsWith(format(anchorDate, "yyyy-MM")));
  const monthClosures = closures.filter((closure) => closure.date.startsWith(format(anchorDate, "yyyy-MM")));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="workspace-card rounded-[24px] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--workspace-muted)]">Month</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--workspace-text)]">{monthLabel}</p>
        </div>
        <div className="workspace-card rounded-[24px] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--workspace-muted)]">Check-ins</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--workspace-text)]">{formatNumber(checkIns.length)}</p>
        </div>
        <div className="workspace-card rounded-[24px] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--workspace-muted)]">Check-outs</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--workspace-text)]">{formatNumber(checkOuts.length)}</p>
        </div>
        <div className="workspace-card rounded-[24px] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--workspace-muted)]">Closed days</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--workspace-text)]">{formatNumber(monthClosures.length)}</p>
        </div>
      </div>

      <SectionCard
        title="Booking Calendar"
        subtitle="Each day shows check-ins, active stays, check-outs, and imported closure notes."
      >
        <div className="overflow-x-auto">
          <div className="grid min-w-[860px] grid-cols-7 gap-2">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="px-2 pb-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--workspace-muted)]"
              >
                {label}
              </div>
            ))}

            {days.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const dayBookings = bookings.filter(
                (booking) => booking.checkIn <= dayKey && booking.checkout > dayKey,
              );
              const dayCheckIns = bookings.filter((booking) => booking.checkIn === dayKey);
              const dayCheckOuts = bookings.filter((booking) => booking.checkout === dayKey);
              const dayClosure = closures.find((closure) => closure.date === dayKey);

              return (
                <article
                  key={dayKey}
                  className={`min-h-[160px] rounded-[22px] border p-3 ${
                    isSameMonth(day, anchorDate)
                      ? "workspace-soft-card"
                      : "border-[var(--workspace-border)] bg-[rgba(10,21,36,0.46)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${isSameMonth(day, anchorDate) ? "text-[var(--workspace-text)]" : "text-[var(--workspace-muted)]"}`}>
                      {format(day, "d")}
                    </p>
                    {dayClosure ? (
                      <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-200">
                        Closed
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-2">
                    {dayCheckIns.map((booking) => (
                      <div key={`in-${booking.id ?? booking.guestName}-${dayKey}`} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200">Check-in</p>
                        <p className="mt-1 text-sm font-medium text-[var(--workspace-text)]">{booking.guestName}</p>
                      </div>
                    ))}

                    {dayBookings
                      .filter((booking) => booking.checkIn !== dayKey)
                      .slice(0, 2)
                      .map((booking) => (
                        <div key={`stay-${booking.id ?? booking.guestName}-${dayKey}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--workspace-muted)]">Booked</p>
                          <p className="mt-1 text-sm font-medium text-[var(--workspace-text)]">{booking.guestName}</p>
                          <p className="mt-1 text-xs text-[var(--workspace-muted)]">
                            {booking.channel} • {formatCurrency(booking.payout, false, currencyCode)}
                          </p>
                        </div>
                      ))}

                    {dayBookings.length > 2 ? (
                      <p className="text-xs text-[var(--workspace-muted)]">
                        +{dayBookings.length - 2} more stays
                      </p>
                    ) : null}

                    {dayCheckOuts.map((booking) => (
                      <div key={`out-${booking.id ?? booking.guestName}-${dayKey}`} className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-200">Check-out</p>
                        <p className="mt-1 text-sm font-medium text-[var(--workspace-text)]">{booking.guestName}</p>
                      </div>
                    ))}

                    {dayClosure ? (
                      <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-200">
                          {dayClosure.reason}
                        </p>
                        {dayClosure.note ? (
                          <p className="mt-1 whitespace-pre-line text-xs text-rose-100/90">{dayClosure.note}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
