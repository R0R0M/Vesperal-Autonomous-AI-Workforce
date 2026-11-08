import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";
import { billingEnabled, stripe, creditPurchase, getBalanceUsd } from "@/lib/billing";
import Wordmark from "@/components/Wordmark";

const ACTIVE_PHASES = [
  "IDEATING", "AWAITING_IDEA_APPROVAL", "CODING", "TESTING", "FIXING", "SAFETY_CHECK",
  "PUSHING", "AWAITING_APPROVAL", "MERGING", "DEPLOYING", "VERIFYING",
] as const;

/** Perform the action the user was attempting when checkout interrupted them. */
async function runPurchaseIntent(userId: string, repoId: string, action: string) {
  const repo = await db.repository.findUnique({ where: { id: repoId } });
  if (!repo || repo.userId !== userId) return false;

  await db.repository.update({ where: { id: repoId }, data: { status: "RUNNING" } });
  const active = await db.cycleRun.findFirst({
    where: { repositoryId: repoId, phase: { in: [...ACTIVE_PHASES] } },
  });
  if (!active && (action === "run-once" || action === "start")) {
    await db.cycleRun.create({ data: { repositoryId: repoId, phase: "IDEATING" } });
  }
  await logActivity(repoId, "info", "Credits added — starting cycle");
  return true;
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Credit added" };

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { session_id: sessionId } = await searchParams;
  if (!sessionId || !billingEnabled()) redirect("/");

  // Verify with Stripe directly — works locally without webhook forwarding.
  const checkout = await stripe().checkout.sessions.retrieve(sessionId);
  const paid =
    checkout.payment_status === "paid" && checkout.metadata?.userId === session.user.id;
  const amountUsd = Number(checkout.metadata?.amountUsd);

  if (paid && amountUsd > 0) {
    await creditPurchase(session.user.id, amountUsd, checkout.id);

    // If checkout was triggered by a "run cycle" click, run it now and land
    // the user back on their repo to watch the agents work.
    const repoId = checkout.metadata?.repoId;
    const action = checkout.metadata?.action;
    if (repoId && action) {
      const ran = await runPurchaseIntent(session.user.id, repoId, action);
      if (ran) redirect(`/repos/${repoId}`);
    }
  }

  const balance = await getBalanceUsd(session.user.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-page flex-col px-6 sm:px-10">
      <div className="py-6">
        <Wordmark />
      </div>
      <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow">
            <span className={paid ? "text-ok" : "text-bad"}>{paid ? "Receipt" : "Unconfirmed"}</span>
          </p>
          <h1 className="mt-6 font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] text-ink">
            {paid ? (
              <>
                ${amountUsd.toFixed(2)} <em>added.</em>
              </>
            ) : (
              <>Payment not confirmed.</>
            )}
          </h1>
          <p className="mt-8 max-w-md text-ink-2">
            {paid
              ? "Credit is only spent on work, metered to the token. The shop floor is ready."
              : "This checkout session could not be verified. If you were charged, the credit arrives via webhook shortly."}
          </p>
          <Link href="/" className="btn-primary btn-lg mt-10">
            Back to the shop floor
          </Link>
        </div>
        <dl className="divide-y divide-rule border-t border-rule-2 lg:col-span-4 lg:col-start-9">
          <div className="grid grid-cols-[8rem_1fr] gap-4 py-3 text-[13px]">
            <dt className="eyebrow">Balance</dt>
            <dd className="font-mono text-ink tnum">${balance.toFixed(2)}</dd>
          </div>
          <div className="grid grid-cols-[8rem_1fr] gap-4 py-3 text-[13px]">
            <dt className="eyebrow">Session</dt>
            <dd className="truncate font-mono text-ink-2">{checkout.id}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
