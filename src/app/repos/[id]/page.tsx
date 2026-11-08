import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import AutoRefresh from "@/components/AutoRefresh";
import PhaseBadge from "@/components/PhaseBadge";
import ControlButtons from "@/components/ControlButtons";
import AgentFeed from "@/components/AgentFeed";
import BacklogTable from "@/components/BacklogTable";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import ChangesShelf from "@/components/ChangesShelf";
import AppHeader from "@/components/AppHeader";
import PipelineStepper from "@/components/PipelineStepper";
import SectionHead from "@/components/SectionHead";
import { formatTokens } from "@/lib/pricing";
import { billingEnabled, hasCredit, CREDIT_PACKS_USD } from "@/lib/billing";

export const dynamic = "force-dynamic";

const ACTIVE_PHASES = [
  "IDEATING", "AWAITING_IDEA_APPROVAL", "CODING", "TESTING", "FIXING", "SAFETY_CHECK",
  "PUSHING", "AWAITING_APPROVAL", "MERGING", "DEPLOYING", "VERIFYING",
] as const;

export default async function RepoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const repo = await db.repository.findUnique({ where: { id } });
  if (!repo || repo.userId !== session.user.id) notFound();

  const billingActive = billingEnabled();
  const userHasCredit = billingActive ? await hasCredit(session.user.id) : true;

  const [activeRun, ideas, messages, runs, deployments, logs, toolEvents] = await Promise.all([
    db.cycleRun.findFirst({
      where: { repositoryId: id, phase: { in: [...ACTIVE_PHASES] } },
      orderBy: { startedAt: "desc" },
      include: { idea: true },
    }),
    db.idea.findMany({
      where: { repositoryId: id },
      orderBy: [{ status: "asc" }, { priority: "desc" }],
      take: 30,
    }),
    db.agentMessage.findMany({
      where: { repositoryId: id },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    db.cycleRun.findMany({
      where: { repositoryId: id },
      orderBy: { startedAt: "desc" },
      take: 15,
      include: { idea: true, _count: { select: { bugs: true } } },
    }),
    db.deployment.findMany({
      where: { repositoryId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.activityLog.findMany({
      where: { repositoryId: id },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    db.toolEvent.findMany({
      where: { repositoryId: id },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
  ]);

  const shipped = ideas.filter((i) => i.status === "DONE").length;

  // The run the Changes shelf describes: the active one, else the most recent.
  const displayRun = activeRun ?? runs[0] ?? null;

  // All commit explanations across the repository's history (newest first),
  // plus all-time token totals.
  const [changeSummaryMsgs, tokenTotals] = await Promise.all([
    db.agentMessage.findMany({
      where: { repositoryId: id, type: "CHANGE_SUMMARY" },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { run: { include: { idea: true } } },
    }),
    db.cycleRun.aggregate({
      where: { repositoryId: id },
      _sum: { inputTokens: true, outputTokens: true },
    }),
  ]);

  // One shelf entry per commit (each coding phase commits once and explains it).
  const commits = changeSummaryMsgs.map((m) => {
    const c = m.content as {
      commitSha?: string;
      commitMessage?: string;
      overall?: string;
      changes?: { file: string; whatChanged: string; purpose: string }[];
    };
    return {
      sha: c.commitSha ?? null,
      message: c.commitMessage ?? "(commit)",
      overall: c.overall ?? "",
      files: c.changes ?? [],
      createdAt: m.createdAt,
      taskTitle: m.run.idea?.title ?? null,
      isCurrentCycle: displayRun ? m.runId === displayRun.id : false,
    };
  });

  const coderBusy = activeRun ? ["CODING", "FIXING"].includes(activeRun.phase) : false;
  const agentsBusy = activeRun ? ["CODING", "TESTING", "FIXING"].includes(activeRun.phase) : false;
  const displayIdeaTitle =
    displayRun && "idea" in displayRun ? (displayRun.idea?.title ?? null) : null;
  const modelName = repo.model;
  const fullName = `${repo.owner}/${repo.name}`;

  const meta: [string, string][] = [
    ["Shipped", String(shipped)],
    ["Schedule", repo.schedule.toLowerCase()],
    ["Merge", repo.mergeMode === "PULL_REQUEST" ? "pull requests" : "direct"],
    ["Approval gate", repo.requireHumanApproval ? "on" : "off"],
    ["Deploy hook", repo.deployHookUrl ? "configured" : "none"],
    ["Model", modelName],
  ];

  return (
    <main className="mx-auto max-w-page px-6 pb-24 sm:px-10">
      <AutoRefresh intervalMs={5000} />
      <AppHeader user={session.user} crumbs={[{ label: fullName }]} />

      {/* Title block */}
      <div className="grid gap-8 py-12 lg:grid-cols-12 lg:items-end sm:py-16">
        <div className="lg:col-span-7">
          <p className="flex items-center gap-4">
            <PhaseBadge phase={repo.status} />
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-none text-ink sm:text-6xl">
            <span className="text-mute">{repo.owner}/</span>
            <br className="sm:hidden" />
            {repo.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:col-span-5 lg:justify-end">
          <ControlButtons
            repoId={repo.id}
            status={repo.status}
            hasActiveRun={!!activeRun}
            awaitingApproval={activeRun?.phase === "AWAITING_APPROVAL"}
            awaitingIdeaApproval={activeRun?.phase === "AWAITING_IDEA_APPROVAL"}
            billingActive={billingActive}
            hasCredit={userHasCredit}
            packs={[...CREDIT_PACKS_USD]}
          />
          <Link href={`/repos/${repo.id}/settings`} className="btn-secondary btn-sm">
            Settings
          </Link>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 border-y border-rule py-4 sm:grid-cols-3 lg:grid-cols-6">
        {meta.map(([k, v]) => (
          <div key={k}>
            <dt className="eyebrow">{k}</dt>
            <dd className="mt-1 truncate font-mono text-[12px] text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-16 flex flex-col gap-16 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-16">
          {/* 01 · Current cycle */}
          <section>
            <SectionHead
              n="01"
              title="Current cycle"
              live={!!activeRun}
              aside={activeRun ? `started ${new Date(activeRun.startedAt).toLocaleTimeString([], { hour12: false })}` : undefined}
            />
            {activeRun ? (
              <div className="mt-8 space-y-6">
                <PipelineStepper
                  phase={activeRun.phase}
                  requireApproval={repo.requireHumanApproval}
                  requireIdeaApproval={repo.requireIdeaApproval}
                />
                <div className="grid gap-6 lg:grid-cols-12">
                  <p className="font-serif text-3xl leading-tight text-ink lg:col-span-8">
                    {activeRun.idea?.title ?? "Reading the repository"}
                  </p>
                  <dl className="space-y-1.5 font-mono text-[12px] lg:col-span-4">
                    {activeRun.branchName && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-mute">branch</dt>
                        <dd className="truncate text-ink">{activeRun.branchName}</dd>
                      </div>
                    )}
                    {activeRun.prNumber && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-mute">pull request</dt>
                        <dd className="text-ink tnum">#{activeRun.prNumber}</dd>
                      </div>
                    )}
                    {activeRun.fixIteration > 0 && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-mute">fix iteration</dt>
                        <dd className="text-warn tnum">{activeRun.fixIteration}</dd>
                      </div>
                    )}
                    {activeRun.inputTokens + activeRun.outputTokens > 0 && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-mute">tokens</dt>
                        <dd className="text-ink tnum">
                          {formatTokens(activeRun.inputTokens)} in · {formatTokens(activeRun.outputTokens)} out
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            ) : (
              <p className="py-6 text-[15px] text-ink-2">
                {repo.status === "RUNNING"
                  ? "Waiting for the next scheduled cycle."
                  : "Paused. Start autonomous mode or run a single cycle."}
              </p>
            )}
          </section>

          {/* 02 · Live activity */}
          <section>
            <SectionHead n="02" title="Tool activity" live={agentsBusy} aside={`${toolEvents.length} events`} />
            <div className="mt-4">
              <LiveActivityFeed events={toolEvents} />
            </div>
          </section>

          {/* 03 · Conversation */}
          <section>
            <SectionHead n="03" title="Correspondence" aside={`${messages.length} messages`} />
            <AgentFeed messages={messages} />
          </section>

          <div className="grid gap-16 lg:grid-cols-2">
            {/* 04 · Backlog */}
            <section>
              <SectionHead n="04" title="Backlog" aside={`${ideas.length}`} />
              <div className="mt-2">
                <BacklogTable ideas={ideas} />
              </div>
            </section>

            <div className="space-y-16">
              {/* 05 · History */}
              <section>
                <SectionHead n="05" title="Cycle history" />
                {runs.length === 0 ? (
                  <p className="py-6 text-[13px] text-mute">No cycles yet.</p>
                ) : (
                  <ol className="divide-y divide-rule">
                    {runs.map((run) => (
                      <li key={run.id} className="grid grid-cols-[1fr_auto] gap-x-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] text-ink">
                            {run.idea?.title ?? "No idea selected"}
                          </p>
                          <p className="mt-1 flex items-center gap-3">
                            <PhaseBadge phase={run.phase} />
                            {run._count.bugs > 0 && (
                              <span className="font-mono text-[11px] text-warn tnum">
                                {run._count.bugs} bug{run._count.bugs === 1 ? "" : "s"}
                              </span>
                            )}
                          </p>
                        </div>
                        <time
                          className="font-mono text-[11px] text-mute tnum"
                          dateTime={new Date(run.startedAt).toISOString()}
                        >
                          {new Date(run.startedAt).toLocaleDateString()}
                        </time>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {/* 06 · Deployments */}
              <section>
                <SectionHead n="06" title="Deployments" />
                {deployments.length === 0 ? (
                  <p className="py-6 text-[13px] text-mute">No deployments yet.</p>
                ) : (
                  <ol className="divide-y divide-rule">
                    {deployments.map((d) => (
                      <li key={d.id} className="grid grid-cols-[1fr_auto] gap-x-4 py-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-3">
                            <PhaseBadge phase={d.status} />
                            {d.commitSha && (
                              <span className="font-mono text-[12px] text-ink">{d.commitSha.slice(0, 8)}</span>
                            )}
                          </p>
                          {d.error && <p className="mt-1 truncate text-[12px] text-bad">{d.error}</p>}
                        </div>
                        <time
                          className="whitespace-nowrap font-mono text-[11px] text-mute tnum"
                          dateTime={new Date(d.createdAt).toISOString()}
                        >
                          {new Date(d.createdAt).toLocaleString()}
                        </time>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* Right shelf: what changed, why, and what it cost */}
        <div className="xl:w-80 xl:shrink-0">
          <ChangesShelf
            ideaTitle={displayIdeaTitle}
            commits={commits}
            coderBusy={coderBusy}
            inputTokens={displayRun?.inputTokens ?? 0}
            outputTokens={displayRun?.outputTokens ?? 0}
            totalInputTokens={tokenTotals._sum.inputTokens ?? 0}
            totalOutputTokens={tokenTotals._sum.outputTokens ?? 0}
            modelName={modelName}
            logs={logs}
          />
        </div>
      </div>
    </main>
  );
}
