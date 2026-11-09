import Link from "next/link";
import Wordmark from "./Wordmark";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import SiteNav from "./SiteNav";
import HeroAgents from "./HeroAgents";
import AgentCards from "./AgentCards";
import Pipeline from "./Pipeline";
import DashboardPreview from "./DashboardPreview";
import PricingCard from "./PricingCard";
import { AVAILABLE_MODELS } from "@/lib/models";

/* --------------------------------------------------------------------------
 * Content. Everything here is true of the product; nothing is aspirational.
 * ------------------------------------------------------------------------ */

const FACTS = [
  { value: "3", unit: "agents", note: "one role each, enforced in code" },
  { value: "1", unit: "gate", note: "only the Tester can ship" },
  { value: "≈20", unit: "min", note: "from idea to a tested pull request" },
  { value: "$0", unit: "markup", note: "metered at the model's list price" },
];

const CONTROLS = [
  ["Schedule", "Continuous · Nightly · Manual", "Continuous, 5 min cooldown"],
  ["Merge mode", "Pull request · Direct merge", "Pull request"],
  ["Auto-merge", "On · Off", "Off"],
  ["Idea approval", "On · Off", "Off"],
  ["Merge approval", "On · Off", "Off"],
  ["Model", AVAILABLE_MODELS.map((m) => m.label.replace("Claude ", "")).join(" · "), "Per repository"],
  ["Deploy hook", "Any POST webhook", "None"],
  ["Health check", "Any URL returning 200", "None"],
];

const SAFETY = [
  ["Sandboxed workspace", "Path traversal is rejected. git push, sudo and destructive commands are blocked at the tool layer."],
  ["Scrubbed environment", "Agent subprocesses run without your API keys or tokens in their environment."],
  ["Secret scan", "Every diff is scanned before it is pushed. Findings stop the cycle."],
  ["Encrypted tokens", "Repository tokens are encrypted at rest with AES-256-GCM and scoped per repository."],
  ["Automatic rollback", "A failed health check reverts the merge and opens an issue with the details."],
  ["Persistent memory", "Past bugs, failed experiments and wins are kept per repository, so mistakes are not repeated."],
];

const DASHBOARD_NOTES = [
  ["Every tool call", "Commands with their output and file edits as colored diffs, as they happen."],
  ["Every commit, explained", "A plain-English account of what changed and why, next to the SHA."],
  ["Every cent", "Input and output tokens per cycle and all time, with the cost beside them."],
];

/* --------------------------------------------------------------------------
 * Pieces
 * ------------------------------------------------------------------------ */

function Intro({
  n,
  title,
  heading,
  children,
}: {
  n: string;
  title: string;
  heading: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Reveal>
      <SectionHead n={n} title={title} />
      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <h2 className="font-serif text-4xl leading-[1.02] text-ink sm:text-5xl lg:col-span-7">{heading}</h2>
        {children && (
          <p className="max-w-md text-[15px] leading-relaxed text-ink-2 lg:col-span-4 lg:col-start-9">{children}</p>
        )}
      </div>
    </Reveal>
  );
}

/* --------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------ */

export default function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-page px-5 sm:px-8">
        {/* 01 · Hero */}
        <section className="grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-24">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-7">
              <span className="text-accent">01</span>&ensp;An autonomous software company
            </p>
            <h1 className="font-serif text-[clamp(2.9rem,7.2vw,5.6rem)] leading-[0.95] text-ink">
              The night shift
              <br />
              for your <em>codebase.</em>
            </h1>
            <p className="mt-7 max-w-[34rem] text-[16px] leading-relaxed text-ink-2 sm:text-[17px]">
              Three agents take turns on your GitHub repository. An Ideator proposes, a Coder
              builds, a Tester checks. Only the Tester can ship. You review pull requests in the
              morning.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/login" className="btn-accent btn-lg">
                Sign in with GitHub
              </Link>
              <a href="#workflow" className="btn-secondary btn-lg">
                See how a cycle runs
              </a>
            </div>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
              $1 starter credit · no card · metered per token at list price
            </p>
          </div>
          <div className="lg:col-span-6">
            <HeroAgents />
          </div>
        </section>

        {/* Facts */}
        <Reveal>
          <section
            className="grid grid-cols-2 overflow-hidden rounded-lg border border-rule lg:grid-cols-4"
            aria-label="At a glance"
          >
            {FACTS.map((f, i) => (
              <div
                key={f.unit}
                className={`px-5 py-5 sm:px-6 ${i % 2 === 1 ? "border-l border-rule" : ""} ${
                  i >= 2 ? "border-t border-rule lg:border-t-0" : ""
                } ${i === 2 ? "lg:border-l" : ""}`}
              >
                <p className="flex items-baseline gap-2 font-serif text-4xl leading-none text-ink tnum">
                  {f.value}
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2">{f.unit}</span>
                </p>
                <p className="mt-2 text-[12px] text-ink-2">{f.note}</p>
              </div>
            ))}
          </section>
        </Reveal>

        {/* 02 · Roster */}
        <section id="roster" className="scroll-mt-20 py-20 sm:py-28">
          <Intro n="02" title="The roster" heading="Three roles with hard boundaries, like a team that actually works.">
            Each agent has one job and is prevented, in code, from doing anyone else&apos;s. The
            agent that built a change is never the agent that signs it off.
          </Intro>
          <div className="mt-14">
            <AgentCards />
          </div>
        </section>

        {/* 03 · Workflow */}
        <section id="workflow" className="scroll-mt-20 py-20 sm:py-28">
          <Intro n="03" title="The cycle" heading="One cycle, start to finish.">
            Six stages, in order. The engine records twelve finer-grained phases underneath, so a
            cycle can pause, resume after a crash, or wait for your approval at the points you
            choose. Each stage below lists the phases it contains.
          </Intro>
          <Reveal className="mt-14" delay={80}>
            <Pipeline />
          </Reveal>
        </section>

        {/* 04 · Dashboard */}
        <section id="dashboard" className="scroll-mt-20 py-20 sm:py-28">
          <Intro n="04" title="The dashboard" heading="Watch the work, not a progress bar.">
            The dashboard is a ledger of everything the agents did, said and spent, refreshed
            every few seconds while a cycle runs. Below is a simulated run of the real layout.
          </Intro>
          <Reveal className="mt-14" delay={80}>
            <DashboardPreview />
          </Reveal>
          <ol className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-3">
            {DASHBOARD_NOTES.map(([k, v], i) => (
              <Reveal as="li" key={k} delay={i * 60} className="border-t border-rule pt-4">
                <p className="text-[14px] text-ink">{k}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{v}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* 05 · Controls and safety */}
        <section className="py-20 sm:py-28">
          <Intro n="05" title="Controls and safety" heading="You set the terms. The code enforces them.">
            Pull requests by default, approval gates where you want them, pause at any time. The
            guard rails are checks the agents cannot talk their way past.
          </Intro>
          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
            <Reveal className="min-w-0 lg:col-span-7">
              <p className="eyebrow mb-3">Per-repository settings</p>
              <div className="panel overflow-x-auto px-5 py-2">
                <table className="ledger">
                  <thead>
                    <tr>
                      <th>Setting</th>
                      <th>Options</th>
                      <th className="pr-0">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONTROLS.map(([k, opts, def]) => (
                      <tr key={k}>
                        <td className="whitespace-nowrap text-ink">{k}</td>
                        <td className="min-w-[10rem] text-ink-2">{opts}</td>
                        <td className="pr-0 font-mono text-[12px] text-ink-2 sm:whitespace-nowrap">{def}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
            <Reveal className="min-w-0 lg:col-span-4 lg:col-start-9" delay={80}>
              <p className="eyebrow mb-3">Enforced in code</p>
              <dl className="divide-y divide-rule border-t border-rule">
                {SAFETY.map(([k, v]) => (
                  <div key={k} className="py-3.5">
                    <dt className="text-[14px] text-ink">{k}</dt>
                    <dd className="mt-1 text-[13px] leading-relaxed text-ink-2">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* 06 · Pricing */}
        <section id="pricing" className="scroll-mt-20 py-20 sm:py-28">
          <Reveal>
            <SectionHead n="06" title="Pricing" />
          </Reveal>
          <Reveal className="mt-10" delay={60}>
            <PricingCard />
          </Reveal>
        </section>

        {/* Closing */}
        <section className="border-t border-rule py-24 sm:py-32">
          <Reveal>
            <h2 className="max-w-3xl font-serif text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98] text-ink">
              Your repository sat still today. It doesn&apos;t have to <em>tomorrow.</em>
            </h2>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/login" className="btn-accent btn-lg">
                Sign in with GitHub
              </Link>
              <span className="px-2 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
                Two minutes to connect a repository
              </span>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-page flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Wordmark small />
          <p className="text-[13px] text-ink-2">
            Want to book a call?{" "}
            <a href="mailto:roninkmehta@gmail.com" className="link text-ink">
              roninkmehta@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
