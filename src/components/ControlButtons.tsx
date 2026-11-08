"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ControlButtons({
  repoId,
  status,
  hasActiveRun,
  awaitingApproval,
  awaitingIdeaApproval,
  billingActive,
  hasCredit,
  packs,
}: {
  repoId: string;
  status: string;
  hasActiveRun: boolean;
  awaitingApproval: boolean;
  awaitingIdeaApproval: boolean;
  billingActive: boolean;
  hasCredit: boolean;
  packs: number[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [billingIntent, setBillingIntent] = useState<"start" | "run-once" | null>(null);
  const [buying, setBuying] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: string) {
    // Known-empty balance: skip the round trip and ask for billing directly.
    if (billingActive && !hasCredit && (action === "start" || action === "run-once")) {
      setBillingIntent(action);
      return;
    }
    setPending(action);
    const res = await fetch(`/api/repositories/${repoId}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setPending(null);
    if (res.status === 402 && (action === "start" || action === "run-once")) {
      setBillingIntent(action);
      return;
    }
    router.refresh();
  }

  async function buyAndRun(amountUsd: number) {
    setBuying(amountUsd);
    setError(null);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountUsd, repoId, action: billingIntent }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) {
      setError(typeof body.error === "string" ? body.error : "Could not start checkout");
      setBuying(null);
      return;
    }
    window.location.href = body.url;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {awaitingIdeaApproval && (
        <>
          <button className="btn-primary btn-sm" disabled={!!pending} onClick={() => act("approve-idea")}>
            {pending === "approve-idea" ? "Approving" : "Approve idea"}
          </button>
          <button className="btn-danger btn-sm" disabled={!!pending} onClick={() => act("reject-idea")}>
            {pending === "reject-idea" ? "Rejecting" : "Reject idea"}
          </button>
        </>
      )}
      {awaitingApproval && (
        <>
          <button className="btn-primary btn-sm" disabled={!!pending} onClick={() => act("approve")}>
            {pending === "approve" ? "Approving" : "Approve and merge"}
          </button>
          <button className="btn-danger btn-sm" disabled={!!pending} onClick={() => act("reject")}>
            {pending === "reject" ? "Rejecting" : "Reject"}
          </button>
        </>
      )}
      {status !== "RUNNING" ? (
        <button className="btn-primary btn-sm" disabled={!!pending} onClick={() => act("start")}>
          {pending === "start" ? "Starting" : "Start autonomous mode"}
        </button>
      ) : (
        <button className="btn-secondary btn-sm" disabled={!!pending} onClick={() => act("pause")}>
          {pending === "pause" ? "Pausing" : "Pause"}
        </button>
      )}
      {!hasActiveRun && (
        <button className="btn-secondary btn-sm" disabled={!!pending} onClick={() => act("run-once")}>
          {pending === "run-once" ? "Queuing" : "Run one cycle"}
        </button>
      )}

      {/* Billing prompt: shown when starting work with an empty balance. */}
      {billingIntent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-paper/70 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="credits-title"
        >
          <div className="panel-3 w-full max-w-md p-6">
            <p className="eyebrow">Balance empty</p>
            <h3 id="credits-title" className="mt-3 font-serif text-3xl leading-tight text-ink">
              Add credit to start the shift.
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
              Pick an amount. You check out with Stripe and the cycle starts the moment payment
              completes. Credit is only spent on work, metered to the token.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {packs.map((amount) => (
                <button
                  key={amount}
                  onClick={() => buyAndRun(amount)}
                  disabled={buying !== null}
                  className="btn-primary"
                >
                  {buying === amount ? "Redirecting" : `$${amount}`}
                </button>
              ))}
            </div>
            {error && <p className="mt-3 text-[13px] text-bad">{error}</p>}
            <button
              className="link mt-6 font-mono text-[11px] uppercase tracking-[0.16em]"
              onClick={() => {
                setBillingIntent(null);
                setError(null);
              }}
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
