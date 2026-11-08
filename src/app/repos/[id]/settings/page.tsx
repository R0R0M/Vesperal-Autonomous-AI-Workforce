import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import PhaseBadge from "@/components/PhaseBadge";
import RepoSettingsForm from "@/components/RepoSettingsForm";
import SectionHead from "@/components/SectionHead";
import { AVAILABLE_MODELS } from "@/lib/models";
import { estimateCostUsd, formatTokens } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Repository settings" };

function minutesBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60_000);
}

export default async function RepoSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const repo = await db.repository.findUnique({ where: { id } });
  if (!repo || repo.userId !== session.user.id) notFound();

  const [tokenAgg, completed, failed, shipped, bugsTotal, bugsFixed, prsOpened, recentRuns, doneRuns] =
    await Promise.all([
      db.cycleRun.aggregate({
        where: { repositoryId: id },
        _sum: { inputTokens: true, outputTokens: true },
        _count: true,
      }),
      db.cycleRun.count({ where: { repositoryId: id, phase: "COMPLETED" } }),
      db.cycleRun.count({ where: { repositoryId: id, phase: { in: ["FAILED", "ROLLED_BACK"] } } }),
      db.idea.count({ where: { repositoryId: id, status: "DONE" } }),
      db.bugReport.count({ where: { run: { repositoryId: id } } }),
      db.bugReport.count({ where: { run: { repositoryId: id }, status: "FIXED" } }),
      db.cycleRun.count({ where: { repositoryId: id, prNumber: { not: null } } }),
      db.cycleRun.findMany({
        where: { repositoryId: id },
        orderBy: { startedAt: "desc" },
        take: 10,
        include: { idea: true },
      }),
      db.cycleRun.findMany({
        where: { repositoryId: id, phase: "COMPLETED", finishedAt: { not: null } },
        select: { startedAt: true, finishedAt: true },
        take: 50,
        orderBy: { startedAt: "desc" },
      }),
    ]);

  const totalIn = tokenAgg._sum.inputTokens ?? 0;
  const totalOut = tokenAgg._sum.outputTokens ?? 0;
  const totalCost = estimateCostUsd(repo.model, totalIn, totalOut);
  const finished = completed + failed;
  const successRate = finished > 0 ? Math.round((completed / finished) * 100) : null;
  const avgMinutes =
    doneRuns.length > 0
      ? Math.round(
          doneRuns.reduce((acc, r) => acc + minutesBetween(r.startedAt, r.finishedAt!), 0) /
            doneRuns.length,
        )
      : null;

  const tiles: [string, string][] = [
    ["Improvements shipped", String(shipped)],
    ["Success rate", successRate === null ? "—" : `${successRate}%`],
    ["Average cycle", avgMinutes === null ? "—" : `${avgMinutes} min`],
    ["Pull requests", String(prsOpened)],
    ["Bugs caught", String(bugsTotal)],
    ["Bugs fixed", String(bugsFixed)],
    ["Tokens in / out", `${formatTokens(totalIn)} / ${formatTokens(totalOut)}`],
    ["Estimated spend", `$${totalCost.toFixed(2)}`],
  ];

  const fullName = `${repo.owner}/${repo.name}`;

  return (
    <main className="mx-auto max-w-page px-6 pb-24 sm:px-10">
      <AppHeader
        user={session.user}
        crumbs={[{ label: fullName, href: `/repos/${repo.id}` }, { label: "settings" }]}
      />

      <div className="py-12 sm:py-16">
        <p className="eyebrow">{fullName}</p>
        <h1 className="mt-3 font-serif text-5xl leading-none text-ink sm:text-6xl">Settings</h1>
      </div>

      {/* Analytics */}
      <section>
        <SectionHead n="01" title="Analytics" aside={`${tokenAgg._count} cycles`} />
        <dl className="grid grid-cols-2 border-b border-rule sm:grid-cols-4">
          {tiles.map(([label, value], i) => (
            <div
              key={label}
              className={`py-5 pr-4 ${i % 2 === 1 ? "border-l border-rule pl-4" : ""} ${
                i % 4 !== 0 ? "sm:border-l sm:pl-4" : "sm:border-l-0 sm:pl-0"
              } ${i >= 2 ? "border-t border-rule" : ""} ${i >= 4 ? "sm:border-t" : "sm:border-t-0"}`}
            >
              <dd className="font-serif text-3xl leading-none text-ink tnum">{value}</dd>
              <dt className="eyebrow mt-2">{label}</dt>
            </div>
          ))}
        </dl>

        <p className="eyebrow mb-2 mt-10">Recent cycles</p>
        {recentRuns.length === 0 ? (
          <p className="py-4 text-[13px] text-mute">No cycles yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Idea</th>
                  <th>Result</th>
                  <th className="text-right">Tokens</th>
                  <th className="text-right">Cost</th>
                  <th className="text-right">Duration</th>
                  <th className="pr-0 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run) => (
                  <tr key={run.id}>
                    <td className="max-w-64 truncate text-ink">{run.idea?.title ?? "Analysis"}</td>
                    <td>
                      <PhaseBadge phase={run.phase} />
                    </td>
                    <td className="whitespace-nowrap text-right font-mono text-[12px] text-ink-2 tnum">
                      {formatTokens(run.inputTokens)} / {formatTokens(run.outputTokens)}
                    </td>
                    <td className="text-right font-mono text-[12px] text-ink-2 tnum">
                      ${estimateCostUsd(repo.model, run.inputTokens, run.outputTokens).toFixed(3)}
                    </td>
                    <td className="whitespace-nowrap text-right font-mono text-[12px] text-ink-2 tnum">
                      {run.finishedAt ? `${minutesBetween(run.startedAt, run.finishedAt)} min` : "—"}
                    </td>
                    <td className="whitespace-nowrap pr-0 text-right font-mono text-[12px] text-mute tnum">
                      {new Date(run.startedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Settings */}
      <section className="mt-16">
        <SectionHead n="02" title="Configuration" />
        <div className="mt-8">
          <RepoSettingsForm
            repo={{
              id: repo.id,
              schedule: repo.schedule,
              mergeMode: repo.mergeMode,
              autoMergePr: repo.autoMergePr,
              requireHumanApproval: repo.requireHumanApproval,
              requireIdeaApproval: repo.requireIdeaApproval,
              model: repo.model,
              deployHookUrl: repo.deployHookUrl,
              healthCheckUrl: repo.healthCheckUrl,
            }}
            models={[...AVAILABLE_MODELS]}
          />
        </div>
      </section>
    </main>
  );
}
