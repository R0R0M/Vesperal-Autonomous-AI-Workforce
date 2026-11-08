"use client";

import { useEffect, useState } from "react";
import PhaseBadge from "./PhaseBadge";
import PipelineStepper from "./PipelineStepper";

type Agent = "IDEATOR" | "CODER" | "TESTER" | "SYSTEM";
interface Row {
  t: string;
  agent: Agent;
  kind: string;
  text: string;
  diff?: string[];
}

interface Stage {
  phase: string;
  task: string;
  feed: Row[];
  commits: [string, string][];
  checks: [string, "pass" | "fail" | "pending"][];
  deploy: string | null;
  pr: string | null;
  tokens: [number, number]; // in, out (k)
}

const AGENT_TONE: Record<Agent, string> = {
  IDEATOR: "text-ideator",
  CODER: "text-coder",
  TESTER: "text-tester",
  SYSTEM: "text-ink-2",
};

const P = (phase: string, task: string, feed: Row[], rest: Partial<Stage>): Stage => ({
  phase,
  task,
  feed,
  commits: [],
  checks: [
    ["typecheck", "pending"],
    ["lint", "pending"],
    ["vitest", "pending"],
  ],
  deploy: null,
  pr: null,
  tokens: [0, 0],
  ...rest,
});

const F0: Row[] = [
  { t: "15:17:02", agent: "IDEATOR", kind: "read", text: "212 files · 14 routes · 38 tests" },
  { t: "15:17:41", agent: "IDEATOR", kind: "rank", text: "11 candidates scored on 11 dimensions" },
  { t: "15:17:58", agent: "IDEATOR", kind: "brief", text: "#3 Keyboard shortcuts for study sessions → Coder" },
];
const F1: Row[] = [
  { t: "15:18:07", agent: "CODER", kind: "run", text: "git switch -c foundry/idea-0412" },
  { t: "15:18:21", agent: "CODER", kind: "edit", text: "src/hooks/use-keyboard-shortcuts.ts" },
];
const F2: Row[] = [
  {
    t: "15:18:49",
    agent: "CODER",
    kind: "edit",
    text: "src/components/study/quiz-question.tsx",
    diff: [
      "@@ -12,6 +12,9 @@",
      "+ useKeyboardShortcuts({ Enter: submit, Escape: quit });",
      "- // TODO: keyboard shortcuts",
    ],
  },
  { t: "15:19:03", agent: "CODER", kind: "run", text: "npm run lint && npm run typecheck ✓" },
];
const F3: Row[] = [
  { t: "15:19:24", agent: "TESTER", kind: "run", text: "npm test -- --reporter=verbose   43 passed" },
  { t: "15:19:51", agent: "TESTER", kind: "verdict", text: "approved · 0 open bugs" },
];
const F4: Row[] = [
  { t: "15:19:56", agent: "SYSTEM", kind: "safety", text: "18 hunks · 0 secrets" },
  { t: "15:19:59", agent: "SYSTEM", kind: "pr", text: "opened #218 · merged into main" },
  { t: "15:20:02", agent: "SYSTEM", kind: "verify", text: "GET /api/health 200 · 1.2s" },
];

const STAGES: Stage[] = [
  P("IDEATING", "Scoring candidate improvements", F0, { tokens: [412, 9] }),
  P("CODING", "Keyboard shortcuts for study sessions", [...F1, ...F0], { tokens: [1480, 31] }),
  P("CODING", "Keyboard shortcuts for study sessions", [...F2, ...F1, ...F0], {
    tokens: [2210, 48],
    commits: [["a1f3c9e", "feat: keyboard shortcuts for flashcard and quiz sessions"]],
    checks: [
      ["typecheck", "pass"],
      ["lint", "pass"],
      ["vitest", "pending"],
    ],
  }),
  P("TESTING", "Keyboard shortcuts for study sessions", [...F3, ...F2, ...F1, ...F0], {
    tokens: [4120, 56],
    commits: [["a1f3c9e", "feat: keyboard shortcuts for flashcard and quiz sessions"]],
    checks: [
      ["typecheck", "pass"],
      ["lint", "pass"],
      ["vitest", "pass"],
    ],
  }),
  P("COMPLETED", "Keyboard shortcuts for study sessions", [...F4, ...F3, ...F2, ...F1, ...F0], {
    tokens: [4360, 60],
    commits: [["a1f3c9e", "feat: keyboard shortcuts for flashcard and quiz sessions"]],
    checks: [
      ["typecheck", "pass"],
      ["lint", "pass"],
      ["vitest", "pass"],
    ],
    pr: "#218 merged",
    deploy: "SUCCEEDED",
  }),
];

const STAGE_MS = 2800;
const COST_PER_K_IN = 0.001; // Haiku 4.5 list price, for the simulated meter
const COST_PER_K_OUT = 0.005;

/**
 * A simulated run of the real dashboard layout. Uses the product's own
 * PhaseBadge and PipelineStepper so the preview and the app stay in step.
 * Frontend only; labeled as simulated.
 */
export default function DashboardPreview() {
  const [i, setI] = useState(3);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % STAGES.length), STAGE_MS);
    return () => clearInterval(id);
  }, []);

  const s = STAGES[i];
  const cost = s.tokens[0] * COST_PER_K_IN + s.tokens[1] * COST_PER_K_OUT;

  return (
    <div className="panel-3 overflow-hidden text-[12px]" aria-label="Simulated dashboard">
      {/* window chrome */}
      <div className="flex items-center justify-between gap-3 border-b border-rule-2 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 font-mono text-[11px]">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent" aria-hidden />
          <span className="text-ink">Foundry</span>
          <span className="text-rule-2">/</span>
          <span className="truncate text-ink-2">acme/website</span>
        </div>
        <span className="eyebrow !text-warn">Simulated preview · not live data</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_17rem]">
        {/* main column */}
        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow !text-ink">
              <span className="text-accent">01</span>&ensp;Current cycle
            </span>
            <PhaseBadge phase={s.phase} />
          </div>
          <div className="mt-4">
            <PipelineStepper phase={s.phase} requireApproval={false} />
          </div>
          <p key={s.task} className="rise mt-4 font-serif text-2xl leading-tight text-ink">
            {s.task}
          </p>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-rule-2 pt-3">
            <span className="eyebrow !text-ink">
              <span className="text-accent">02</span>&ensp;Tool activity
            </span>
            <span className="eyebrow tnum">{s.feed.length} events</span>
          </div>
          <ol className="mt-2 h-[13.5rem] overflow-hidden font-mono text-[11px]">
            {s.feed.map((r, idx) => (
              <li key={`${r.t}-${r.kind}`} className={`border-b border-rule py-1.5 ${idx === 0 ? "rise" : ""}`}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 sm:grid sm:grid-cols-[4rem_3.5rem_3rem_1fr]">
                  <span className="text-mute tnum">{r.t}</span>
                  <span className={`text-[10px] uppercase tracking-[0.12em] ${AGENT_TONE[r.agent]}`}>
                    {r.agent.toLowerCase()}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-mute">{r.kind}</span>
                  <span className="w-full truncate text-ink-2 sm:w-auto">{r.text}</span>
                </div>
                {r.diff && (
                  <div className="well mt-1.5 px-2.5 py-1.5 sm:ml-[13rem]">
                    {r.diff.map((d) => (
                      <p key={d} className={d.startsWith("+") ? "text-ok" : d.startsWith("-") ? "text-bad" : "text-coder"}>
                        {d}
                      </p>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* shelf */}
        <aside className="border-t border-rule-2 bg-paper-2/60 p-4 font-mono text-[11px] lg:border-l lg:border-t-0 sm:p-5">
          <p className="eyebrow !text-ink">Meter</p>
          <dl className="mt-2 space-y-1.5 tnum">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">tokens</dt>
              <dd className="text-ink">
                {s.tokens[0].toLocaleString()}k in · {s.tokens[1]}k out
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">cost</dt>
              <dd className="text-ink">${cost.toFixed(3)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">model</dt>
              <dd className="text-ink-2">claude-haiku-4-5</dd>
            </div>
          </dl>

          <p className="eyebrow !text-ink mt-5 border-t border-rule-2 pt-3">Checks</p>
          <ul className="mt-2 space-y-1.5">
            {s.checks.map(([k, st]) => (
              <li key={k} className="flex items-center justify-between gap-3">
                <span className="text-ink-2">{k}</span>
                <span className={`tag ${st === "pass" ? "text-ok" : st === "fail" ? "text-bad" : "text-mute"}`}>{st}</span>
              </li>
            ))}
          </ul>

          <p className="eyebrow !text-ink mt-5 border-t border-rule-2 pt-3">Commits</p>
          {s.commits.length === 0 ? (
            <p className="mt-2 text-mute">none yet</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {s.commits.map(([sha, msg]) => (
                <li key={sha} className="rise">
                  <span className="text-accent">{sha}</span>
                  <p className="mt-0.5 text-ink-2">{msg}</p>
                </li>
              ))}
            </ul>
          )}

          <p className="eyebrow !text-ink mt-5 border-t border-rule-2 pt-3">Shipping</p>
          <dl className="mt-2 space-y-1.5">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">pull request</dt>
              <dd className={s.pr ? "text-ink" : "text-mute"}>{s.pr ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">deployment</dt>
              <dd>{s.deploy ? <PhaseBadge phase={s.deploy} /> : <span className="text-mute">—</span>}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
