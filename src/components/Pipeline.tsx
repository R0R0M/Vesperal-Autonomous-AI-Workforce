"use client";

import { useEffect, useRef, useState } from "react";

interface Phase {
  n: string;
  title: string;
  who: string;
  hue: "ideator" | "coder" | "tester" | "system";
  summary: string;
  /** Engine phases (CycleRun.phase values) this stage contains. */
  engine: string[];
  output: [string, string][];
}

const PHASES: Phase[] = [
  {
    n: "01",
    title: "Ideate",
    who: "Ideator",
    hue: "ideator",
    summary:
      "The repository and the cycle memory are read in full. Candidate improvements are scored and ranked; the top one becomes a brief with acceptance criteria.",
    engine: ["IDEATING", "AWAITING_IDEA_APPROVAL*"],
    output: [
      ["read", "212 files · 14 routes · 38 tests"],
      ["rank", "11 candidates scored on 11 dimensions"],
      ["pick", "#3 Keyboard shortcuts for study sessions · impact 8 · risk 2"],
    ],
  },
  {
    n: "02",
    title: "Code",
    who: "Coder",
    hue: "coder",
    summary:
      "The brief is implemented on a fresh branch inside a sandboxed workspace. Your lint, types and tests run before the Coder reports back.",
    engine: ["CODING"],
    output: [
      ["$", "git switch -c vesperal/idea-0412"],
      ["+", "src/hooks/use-keyboard-shortcuts.ts"],
      ["~", "src/components/study/quiz-question.tsx"],
      ["$", "npm run lint && npm run typecheck   ✓"],
    ],
  },
  {
    n: "03",
    title: "Test and fix",
    who: "Tester · Coder",
    hue: "tester",
    summary:
      "The Tester runs everything and files bugs. The Coder fixes them. The loop repeats until the Tester approves or the fix cap is reached, in which case the cycle fails honestly.",
    engine: ["TESTING", "FIXING", "TESTING"],
    output: [
      ["$", "npm test   42 passed · 1 failed"],
      ["bug", "quiz-question: Enter submits twice · severity high"],
      ["fix", "iteration 1 of 3 → Coder"],
      ["$", "npm test   43 passed"],
      ["verdict", "approved"],
    ],
  },
  {
    n: "04",
    title: "Safety check",
    who: "System",
    hue: "system",
    summary:
      "The full diff is scanned for secrets and destructive commands. A single finding blocks the cycle before anything leaves the workspace.",
    engine: ["SAFETY_CHECK"],
    output: [
      ["scan", "18 hunks · 0 secrets · 0 blocked commands"],
      ["env", "agent subprocess environment scrubbed"],
      ["ok", "cycle may proceed"],
    ],
  },
  {
    n: "05",
    title: "Push and open a PR",
    who: "System",
    hue: "system",
    summary:
      "The branch is pushed and a pull request is opened with the change explained. If you enabled the approval gate, the cycle parks here until you decide.",
    engine: ["PUSHING", "AWAITING_APPROVAL*"],
    output: [
      ["push", "vesperal/idea-0412 → origin"],
      ["pr", "#218 Add keyboard shortcuts for study sessions"],
      ["note", "commit explained in plain English"],
    ],
  },
  {
    n: "06",
    title: "Merge, deploy, verify",
    who: "System",
    hue: "system",
    summary:
      "Auto-merge if you allow it. Your deploy hook fires and the health check is polled. A failed check reverts the merge and opens an issue. Then the next cycle starts.",
    engine: ["MERGING", "DEPLOYING", "VERIFYING", "COMPLETED"],
    output: [
      ["merge", "#218 → main · 39925875"],
      ["deploy", "hook POST 200"],
      ["verify", "GET /api/health 200 · 1.2s"],
      ["next", "cycle 0413 begins after cooldown"],
    ],
  },
];

const HUE_TEXT: Record<Phase["hue"], string> = {
  ideator: "text-ideator",
  coder: "text-coder",
  tester: "text-tester",
  system: "text-ink-2",
};

const AUTO_MS = 3600;

/**
 * Six-stage view of the cycle. Hover, focus or tap a stage to inspect it;
 * it advances on its own otherwise. Each stage lists the engine phases it
 * contains, which is how the six stages reconcile with the twelve phases
 * the dashboard tracks.
 */
export default function Pipeline() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused || reduced.current) return;
    const id = setInterval(() => setActive((a) => (a + 1) % PHASES.length), AUTO_MS);
    return () => clearInterval(id);
  }, [paused]);

  const p = PHASES[active];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {/* Stage rail */}
      <ol className="grid gap-2 md:grid-cols-6 md:gap-0" role="tablist" aria-label="Cycle stages">
        {PHASES.map((ph, i) => {
          const isActive = i === active;
          const done = i < active;
          return (
            <li key={ph.n} className="flex items-stretch md:flex-col">
              {/* connector + node (desktop: above the label) */}
              <div className="mr-3 flex flex-col items-center md:mr-0 md:w-full md:flex-row" aria-hidden>
                <span
                  className={`hidden h-px flex-1 transition-colors duration-300 md:block ${
                    i === 0 ? "opacity-0" : done || isActive ? "bg-accent" : "bg-rule-2"
                  }`}
                />
                <span
                  className={`block h-2.5 w-2.5 shrink-0 rounded-full border transition-colors duration-300 ${
                    isActive
                      ? "border-accent bg-accent"
                      : done
                        ? "border-accent bg-paper"
                        : "border-rule-2 bg-paper"
                  }`}
                />
                <span
                  className={`hidden h-px flex-1 transition-colors duration-300 md:block ${
                    i === PHASES.length - 1 ? "opacity-0" : done ? "bg-accent" : "bg-rule-2"
                  }`}
                />
                <span className={`w-px flex-1 md:hidden ${done ? "bg-accent" : "bg-rule-2"} ${i === PHASES.length - 1 ? "opacity-0" : ""}`} />
              </div>
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`mb-2 flex-1 rounded-md px-3 py-2 text-left transition-colors md:mb-0 md:mt-3 md:px-1 md:text-center ${
                  isActive ? "bg-paper-2 md:bg-transparent" : "hover:bg-paper-2 md:hover:bg-transparent"
                }`}
              >
                <span className={`block font-mono text-[10px] tracking-[0.14em] ${isActive ? "text-accent" : "text-mute"}`}>
                  {ph.n}
                </span>
                <span className={`mt-0.5 block text-[13px] leading-tight ${isActive ? "text-ink" : "text-ink-2"}`}>
                  {ph.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Detail */}
      <div className="panel mt-8 grid gap-0 md:grid-cols-2" role="tabpanel">
        <div className="p-6 md:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-3xl leading-none text-ink">{p.title}</h3>
            <span className={`font-mono text-[11px] uppercase tracking-[0.14em] ${HUE_TEXT[p.hue]}`}>{p.who}</span>
          </div>
          <p key={p.n} className="rise mt-4 text-[14px] leading-relaxed text-ink-2">
            {p.summary}
          </p>
          <div className="mt-6">
            <p className="eyebrow mb-2">Engine phases in this stage</p>
            <div className="flex flex-wrap gap-1.5">
              {p.engine.map((e, i) => (
                <span key={`${e}-${i}`} className="rounded-sm border border-rule-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2">
                  {e.replace("*", "").replaceAll("_", " ")}
                  {e.endsWith("*") && <span className="text-mute"> · optional</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-rule bg-paper p-6 font-mono text-[12px] leading-relaxed md:border-l md:border-t-0 md:p-7">
          <p className="mb-3 text-[10px] uppercase tracking-[0.14em] text-mute">Example output · simulated</p>
          <ol key={p.n} className="space-y-1.5">
            {p.output.map(([k, v], i) => (
              <li key={i} className="rise grid grid-cols-[4rem_1fr] gap-3" style={{ animationDelay: `${i * 60}ms` }}>
                <span className={k === "$" || k === "+" || k === "~" ? "text-mute" : "text-accent"}>{k}</span>
                <span className={k === "+" ? "text-ok" : k === "bug" ? "text-bad" : "text-ink-2"}>{v}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
