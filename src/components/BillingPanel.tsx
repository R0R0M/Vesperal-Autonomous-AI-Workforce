"use client";

import { useState } from "react";

/** Balance and top-up controls, laid out as a single ledger line. */
export default function BillingPanel({
  balanceUsd,
  enabled,
  packs,
}: {
  balanceUsd: number;
  enabled: boolean;
  packs: number[];
}) {
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(amountUsd: number) {
    setPending(amountUsd);
    setError(null);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountUsd }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) {
      setError(typeof body.error === "string" ? body.error : "Could not start checkout");
      setPending(null);
      return;
    }
    window.location.href = body.url;
  }

  const low = balanceUsd <= 0.1;

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-y border-rule py-5">
      <div>
        <p className="eyebrow">Credit balance</p>
        <p className={`mt-1 font-serif text-4xl leading-none tnum ${low ? "text-bad" : "text-ink"}`}>
          ${balanceUsd.toFixed(2)}
        </p>
        {low && <p className="mt-2 text-[13px] text-warn">Balance is empty. Agents pause until you add credit.</p>}
        {error && <p className="mt-2 text-[13px] text-bad">{error}</p>}
      </div>
      {enabled ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">Add</span>
          {packs.map((amount) => (
            <button
              key={amount}
              onClick={() => buy(amount)}
              disabled={pending !== null}
              className="btn-secondary btn-sm tnum"
            >
              {pending === amount ? "Redirecting" : `$${amount}`}
            </button>
          ))}
          <span className="eyebrow ml-2 !normal-case !tracking-normal">via Stripe, at cost</span>
        </div>
      ) : (
        <p className="font-mono text-[12px] text-mute">Billing is not configured on this server.</p>
      )}
    </div>
  );
}
