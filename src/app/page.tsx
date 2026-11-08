import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import AddRepoForm from "@/components/AddRepoForm";
import PhaseBadge from "@/components/PhaseBadge";
import AutoRefresh from "@/components/AutoRefresh";
import AppHeader from "@/components/AppHeader";
import Landing from "@/components/Landing";
import BillingPanel from "@/components/BillingPanel";
import SectionHead from "@/components/SectionHead";
import { billingEnabled, getBalanceUsd, CREDIT_PACKS_USD } from "@/lib/billing";

export const dynamic = "force-dynamic";

const ACTIVE_PHASES = [
  "IDEATING", "AWAITING_IDEA_APPROVAL", "CODING", "TESTING", "FIXING", "SAFETY_CHECK",
  "PUSHING", "AWAITING_APPROVAL", "MERGING", "DEPLOYING", "VERIFYING",
] as const;

export default async function HomePage() {
  const session = await auth();
  // Logged-out visitors get the marketing landing page.
  if (!session?.user?.id) return <Landing />;
  const userId = session.user.id;

  const balanceUsd = await getBalanceUsd(userId);
  const [repos, shippedCount, completedCycles, activeCycles] = await Promise.all([
    db.repository.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        runs: {
          where: { phase: { in: [...ACTIVE_PHASES] } },
          orderBy: { startedAt: "desc" },
          take: 1,
          include: { idea: true },
        },
        _count: { select: { ideas: { where: { status: "DONE" } } } },
      },
    }),
    db.idea.count({ where: { status: "DONE", repository: { userId } } }),
    db.cycleRun.count({ where: { phase: "COMPLETED", repository: { userId } } }),
    db.cycleRun.count({
      where: { phase: { in: [...ACTIVE_PHASES] }, repository: { userId } },
    }),
  ]);

  const stats = [
    { label: "Repositories", value: repos.length },
    { label: "Improvements shipped", value: shippedCount },
    { label: "Cycles completed", value: completedCycles },
    { label: "Working now", value: activeCycles, live: activeCycles > 0 },
  ];

  const firstName = (session.user.name ?? "").split(" ")[0];

  return (
    <main className="mx-auto max-w-page px-6 pb-24 sm:px-10">
      <AutoRefresh intervalMs={8000} />
      <AppHeader user={session.user} />

      <div className="flex flex-wrap items-end justify-between gap-6 py-12 sm:py-16">
        <div>
          <p className="eyebrow">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none text-ink sm:text-6xl">
            {firstName ? `${firstName}'s shop floor.` : "The shop floor."}
          </h1>
        </div>
        <AddRepoForm />
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 overflow-hidden rounded-lg border border-rule lg:grid-cols-4" aria-label="Totals">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-2 py-5 sm:px-6 ${i % 2 === 1 ? "border-l border-rule" : ""} ${
              i >= 2 ? "border-t border-rule lg:border-t-0" : ""
            } ${i === 2 ? "lg:border-l" : ""}`}
          >
            <p className="flex items-baseline gap-3 font-serif text-4xl leading-none text-ink tnum">
              {s.value}
              {s.live && <span className="tag tag-live text-accent" aria-label="live" />}
            </p>
            <p className="eyebrow mt-2">{s.label}</p>
          </div>
        ))}
      </section>

      <div className="mt-10">
        <BillingPanel balanceUsd={balanceUsd} enabled={billingEnabled()} packs={[...CREDIT_PACKS_USD]} />
      </div>

      <section className="mt-16">
        <SectionHead n="01" title="Repositories" aside={`${repos.length}`} />

        {repos.length === 0 ? (
          <div className="grid gap-8 py-16 lg:grid-cols-12">
            <h2 className="font-serif text-4xl leading-[1.02] text-ink lg:col-span-7">
              Nothing on the floor yet.
            </h2>
            <p className="max-w-md text-ink-2 lg:col-span-4 lg:col-start-9">
              Connect a GitHub repository and the Ideator starts reading it within a minute. The
              first tested pull request usually lands inside the hour.
            </p>
          </div>
        ) : (
          <ol>
            {repos.map((repo) => {
              const activeRun = repo.runs[0];
              return (
                <li key={repo.id} className="border-b border-rule">
                  <Link
                    href={`/repos/${repo.id}`}
                    className="group grid gap-x-8 gap-y-3 py-6 transition-colors hover:bg-paper-2 sm:-mx-4 sm:grid-cols-12 sm:px-4"
                  >
                    <div className="sm:col-span-4">
                      <p className="text-[17px] leading-tight text-ink">
                        <span className="text-mute">{repo.owner}/</span>
                        {repo.name}
                      </p>
                      <p className="mt-1.5">
                        <PhaseBadge phase={repo.status} />
                      </p>
                    </div>
                    <div className="min-w-0 sm:col-span-5">
                      {activeRun ? (
                        <>
                          <p className="truncate text-[15px] text-ink">
                            {activeRun.idea?.title ?? "Reading the repository"}
                          </p>
                          <p className="mt-1.5">
                            <PhaseBadge phase={activeRun.phase} />
                          </p>
                        </>
                      ) : (
                        <p className="text-[13px] text-mute">No cycle in progress</p>
                      )}
                    </div>
                    <div className="flex items-start justify-between font-mono text-[12px] text-ink-2 sm:col-span-3 sm:justify-end sm:gap-8">
                      <span className="tnum">{repo._count.ideas} shipped</span>
                      <span>{repo.schedule.toLowerCase()}</span>
                      <span className="text-mute transition-colors group-hover:text-accent" aria-hidden>
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
