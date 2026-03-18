"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingDown, Zap, RefreshCw, Clock } from "lucide-react";

// ─── Anthropic top-up history (manual — from invoices) ────────────────────────
const ANTHROPIC_TOPUPS = [
  { date: "2026-02-16", amount: 20 },
  { date: "2026-02-23", amount: 83 },
  { date: "2026-02-26", amount: 100 },
  { date: "2026-03-14", amount: 100 },
  { date: "2026-03-17", amount: 100 },
];
const ANTHROPIC_TOTAL = ANTHROPIC_TOPUPS.reduce((s, t) => s + t.amount, 0);

// ─── OpenRouter top-up history (manual) ───────────────────────────────────────
const OR_TOPUPS = [
  { date: "2026-02-17", amount: 20 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function daysBetween(a: string, b: string) {
  return (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24);
}

function barWidth(val: number, max: number) {
  return Math.max(2, Math.min(100, (val / max) * 100));
}

// ─── Burn rate chart data (Anthropic topups as spend timeline) ────────────────
// We know total spent = sum of topups minus current balance.
// We reconstruct a running spend curve from topup dates.
function buildAnthropicCurve() {
  // We don't have per-day data from Anthropic API, so we reconstruct:
  // Each topup represents spend that burned through the previous balance.
  // Curve = cumulative topups over time (upper bound of spend).
  const today = new Date().toISOString().slice(0, 10);
  const points: { date: string; cumulative: number }[] = [];
  let cum = 0;
  for (const t of ANTHROPIC_TOPUPS) {
    // day before topup = just before refill
    points.push({ date: t.date, cumulative: cum });
    cum += t.amount;
    points.push({ date: t.date, cumulative: cum });
  }
  points.push({ date: today, cumulative: cum });
  return points;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ORData {
  usage: number;
  usage_daily: number;
  usage_weekly: number;
  usage_monthly: number;
  total_credits: number;
  balance: number;
}

export default function SpendPage() {
  const [or, setOr] = useState<ORData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshed, setRefreshed] = useState<string>("");

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/spend");
      const json = await res.json();
      setOr(json.openrouter);
      setRefreshed(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  // ─── Derived numbers ───────────────────────────────────────────────────────
  const orBalance = or?.balance ?? (20 - 12.09); // fallback to known values
  const orUsed = or?.usage ?? 12.09;
  const orTotal = or?.total_credits ?? 20;
  const orDailyBurn = or?.usage_daily ?? 0;
  const orWeeklyBurn = or?.usage_weekly ?? 0;

  // Anthropic: we don't have live API balance, estimate from topups + session context
  // Total topped up: $403. Estimated remaining: ~$100 (latest topup was today)
  const anthropicTotalTopped = ANTHROPIC_TOTAL;
  const anthropicEstSpent = ANTHROPIC_TOTAL - 100; // latest topup not burned yet
  const anthropicRemaining = 100; // latest topup

  // Days since first topup
  const firstDate = "2026-02-16";
  const today = new Date().toISOString().slice(0, 10);
  const totalDays = daysBetween(firstDate, today);
  const anthropicDailyBurn = totalDays > 0 ? anthropicEstSpent / totalDays : 0;

  // Runway estimates
  const orRunwayDays = orDailyBurn > 0 ? orBalance / orDailyBurn : null;
  const anthropicRunwayDays = anthropicDailyBurn > 0 ? anthropicRemaining / anthropicDailyBurn : null;

  const anthCurve = buildAnthropicCurve();
  const anthMaxY = anthCurve[anthCurve.length - 1].cumulative;

  return (
    <div className="px-10 py-10 max-w-5xl">

      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-2">Finance</p>
          <h1 className="text-2xl font-semibold text-white">Spend</h1>
          <p className="text-sm text-zinc-500 mt-1">Token usage and budget runway across Anthropic and OpenRouter</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          {refreshed ? `Updated ${refreshed}` : "Refresh"}
        </button>
      </div>

      {/* ── Hero: Total Spend ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border p-6 mb-6"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "#080808" }}>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-1">All-time invested</p>
        <div className="flex items-end gap-4 mb-6">
          <div className="text-5xl font-bold text-white tracking-tight">
            {fmt(anthropicTotalTopped + orTotal)}
          </div>
          <div className="text-sm text-zinc-500 mb-2">since Feb 16, 2026</div>
        </div>

        {/* Stacked bar: Anthropic vs OR */}
        <div className="space-y-3">
          {/* Anthropic bar */}
          <div>
            <div className="flex justify-between text-[10px] text-zinc-500 mb-1.5">
              <span>Anthropic (Claude)</span>
              <span className="font-mono">{fmt(anthropicTotalTopped)}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${barWidth(anthropicTotalTopped, anthropicTotalTopped + orTotal)}%`,
                  background: "linear-gradient(90deg, #a78bfa, #7c3aed)",
                }}
              />
            </div>
          </div>

          {/* OpenRouter bar */}
          <div>
            <div className="flex justify-between text-[10px] text-zinc-500 mb-1.5">
              <span>OpenRouter (heartbeats, search)</span>
              <span className="font-mono">{fmt(orTotal)}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${barWidth(orTotal, anthropicTotalTopped + orTotal)}%`,
                  background: "linear-gradient(90deg, #34d399, #059669)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-col: Anthropic + OpenRouter ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        {/* Anthropic card */}
        <div className="rounded-xl border p-5" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0a0a0a" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: "#a78bfa" }} />
            <span className="text-xs font-semibold text-zinc-300">Anthropic · Claude</span>
          </div>

          <div className="space-y-3 mb-5">
            <Stat label="Total topped up" value={fmt(anthropicTotalTopped)} />
            <Stat label="Est. spent" value={fmt(anthropicEstSpent)} />
            <Stat label="Current balance" value={fmt(anthropicRemaining)} highlight />
            <Stat label="Avg daily burn" value={`${fmt(anthropicDailyBurn)}/day`} />
          </div>

          {/* Topup timeline */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-700 mb-3">Top-up History</p>
            <div className="space-y-2">
              {ANTHROPIC_TOPUPS.map((t) => (
                <div key={t.date} className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-600">{t.date}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 w-16" style={{ background: "rgba(167,139,250,0.15)" }} />
                    <span className="text-[10px] font-mono text-violet-400">+{fmt(t.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Runway */}
          {anthropicRunwayDays != null && (
            <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={10} className="text-zinc-600" />
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Estimated runway</span>
              </div>
              <span className="text-lg font-semibold text-white">{Math.round(anthropicRunwayDays)} days</span>
              <span className="text-xs text-zinc-600 ml-2">at current burn rate</span>
            </div>
          )}
        </div>

        {/* OpenRouter card */}
        <div className="rounded-xl border p-5" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0a0a0a" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: "#34d399" }} />
            <span className="text-xs font-semibold text-zinc-300">OpenRouter</span>
            {loading && <span className="text-[10px] text-zinc-600 ml-auto">fetching…</span>}
          </div>

          <div className="space-y-3 mb-5">
            <Stat label="Total credits purchased" value={fmt(orTotal)} />
            <Stat label="All-time usage" value={fmt(orUsed)} />
            <Stat label="Current balance" value={fmt(orBalance)} highlight />
            <Stat label="Daily burn" value={`${fmt(orDailyBurn)}/day`} />
            <Stat label="Weekly burn" value={`${fmt(orWeeklyBurn)}/wk`} />
          </div>

          {/* Usage breakdown bars */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-700 mb-3">Usage Breakdown</p>
            <div className="space-y-2">
              {[
                { label: "Monthly", value: or?.usage_monthly ?? 0, max: orUsed },
                { label: "Weekly", value: orWeeklyBurn, max: orUsed },
                { label: "Today", value: orDailyBurn, max: orUsed },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-[10px] text-zinc-600 mb-1">
                    <span>{row.label}</span>
                    <span className="font-mono">{fmt(row.value)}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${barWidth(row.value, row.max || 1)}%`,
                        background: "linear-gradient(90deg, #34d399, #059669)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topup history */}
          <div className="mt-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-700 mb-3">Top-up History</p>
            {OR_TOPUPS.map((t) => (
              <div key={t.date} className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-600">{t.date}</span>
                <div className="flex items-center gap-2">
                  <div className="h-px w-16" style={{ background: "rgba(52,211,153,0.15)" }} />
                  <span className="text-[10px] font-mono text-emerald-400">+{fmt(t.amount)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Runway */}
          {orRunwayDays != null && orRunwayDays < 9999 && (
            <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={10} className="text-zinc-600" />
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Estimated runway</span>
              </div>
              <span className="text-lg font-semibold text-white">{Math.round(orRunwayDays)} days</span>
              <span className="text-xs text-zinc-600 ml-2">at daily burn rate</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Anthropic Topup Timeline Chart ───────────────────────────────── */}
      <div className="rounded-xl border p-5 mb-6" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0a0a0a" }}>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-4">Anthropic — Cumulative Credits Purchased</p>
        <div className="relative h-24">
          <svg
            viewBox={`0 0 800 96`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <line key={t} x1={0} x2={800} y1={96 - t * 96} y2={96 - t * 96}
                stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            ))}
            {/* step chart path */}
            {(() => {
              const allDates = [firstDate, ...ANTHROPIC_TOPUPS.map(t => t.date), today];
              const uniqueDates = [...new Set(allDates)].sort();
              const totalSpan = daysBetween(uniqueDates[0], uniqueDates[uniqueDates.length - 1]) || 1;

              // Build steps from curve
              const pts = anthCurve.map((p) => {
                const x = (daysBetween(firstDate, p.date) / totalSpan) * 800;
                const y = 96 - (p.cumulative / anthMaxY) * 88 - 4;
                return `${x},${y}`;
              });

              const area = `M ${pts[0]} ${pts.slice(1).map(p => `L ${p}`).join(" ")} L 800,96 L 0,96 Z`;
              const line = `M ${pts[0]} ${pts.slice(1).map(p => `L ${p}`).join(" ")}`;

              return (
                <>
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <path d={area} fill="url(#purpleGrad)" />
                  <path d={line} fill="none" stroke="#a78bfa" strokeWidth={2} />
                  {/* topup dots */}
                  {ANTHROPIC_TOPUPS.map((t) => {
                    const x = (daysBetween(firstDate, t.date) / totalSpan) * 800;
                    const entry = anthCurve.find(p => p.date === t.date && p.cumulative === anthCurve.filter(c => c.date === t.date)[1]?.cumulative);
                    const y = entry ? 96 - (entry.cumulative / anthMaxY) * 88 - 4 : 48;
                    return <circle key={t.date} cx={x} cy={y} r={3} fill="#a78bfa" />;
                  })}
                </>
              );
            })()}
          </svg>
        </div>
        {/* Date labels */}
        <div className="flex justify-between mt-2">
          {ANTHROPIC_TOPUPS.map((t) => (
            <span key={t.date} className="text-[9px] font-mono text-zinc-700">{t.date.slice(5)}</span>
          ))}
          <span className="text-[9px] font-mono text-zinc-700">today</span>
        </div>
      </div>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#080808" }}>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 mb-3">Notes</p>
        <ul className="space-y-2 text-xs text-zinc-500">
          <li>· OpenRouter data is live (pulled from /api/spend at load time)</li>
          <li>· Anthropic balance is estimated — no usage API available on the current plan tier. Actual balance = total topped up minus actual consumption.</li>
          <li>· Daily burn rate for Anthropic is averaged across the full window (Feb 16 → today). Session-heavy days are smoothed out.</li>
          <li>· Usage snapshots from pre-compaction archives in #memory will improve accuracy over time.</li>
          <li>· Add Anthropic Console API key under a paid plan to unlock per-day token breakdowns.</li>
        </ul>
      </div>

    </div>
  );
}

// ─── Stat row ─────────────────────────────────────────────────────────────────
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-600">{label}</span>
      <span className={`text-xs font-mono font-medium ${highlight ? "text-white" : "text-zinc-400"}`}>
        {value}
      </span>
    </div>
  );
}
