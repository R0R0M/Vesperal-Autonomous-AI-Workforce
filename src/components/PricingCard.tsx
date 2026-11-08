import Link from "next/link";
import { AVAILABLE_MODELS } from "@/lib/models";

const FACTS: [string, string][] = [
  ["$1 starter credit", "applied on sign-up"],
  ["No card required", "add credit only when you want more"],
  ["$0 markup", "tokens billed at the model's list price"],
  ["No seats or minimums", "if nothing runs, nothing is billed"],
];

function Tick() {
  return (
    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-1 shrink-0 text-ok" aria-hidden>
      <path d="M1.5 5.5l2.3 2.3L8.5 2.5" />
    </svg>
  );
}

/** Usage-based pricing: one card, four facts, three model prices. */
export default function PricingCard() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-6">
        <h2 className="font-serif text-4xl leading-[1.02] text-ink sm:text-5xl">
          Pay for the work.
          <br />
          <em>Nothing else.</em>
        </h2>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-2">
          You are charged what your agents consume, metered to the token and shown live on the
          dashboard. There is no subscription and no per-seat fee.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {FACTS.map(([k, v]) => (
            <li key={k} className="flex gap-3">
              <Tick />
              <div>
                <p className="text-[14px] text-ink">{k}</p>
                <p className="text-[12px] text-ink-2">{v}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-5 lg:col-start-8">
        <div className="panel-3 relative overflow-hidden p-6 sm:p-7">
          <span className="absolute inset-x-0 top-0 h-px bg-accent/70" aria-hidden />
          <p className="eyebrow">Usage-based</p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-6xl leading-none text-ink tnum">$0</span>
            <span className="text-[13px] text-ink-2">per month, per seat, per repository</span>
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-2">
            Pick a model per repository. You pay its list price for the tokens the agents use,
            and nothing on top.
          </p>
          <Link href="/login" className="btn-accent btn-lg mt-6 w-full">
            Start with $1 of credit
          </Link>

          <table className="ledger mt-7">
            <thead>
              <tr>
                <th>Model</th>
                <th className="whitespace-nowrap pr-0 text-right">in / out per 1M</th>
              </tr>
            </thead>
            <tbody>
              {AVAILABLE_MODELS.map((m) => (
                <tr key={m.id}>
                  <td className="whitespace-nowrap text-ink">{m.label}</td>
                  <td className="whitespace-nowrap pr-0 text-right font-mono text-[12px] text-ink tnum">
                    {m.pricing.replace(" per 1M tokens", "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
