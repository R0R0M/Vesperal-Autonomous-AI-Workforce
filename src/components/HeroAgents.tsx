"use client";

import { useEffect, useState } from "react";
import PhaseBadge from "./PhaseBadge";

type Status = "idle" | "active" | "done";
type Agent = "ideator" | "coder" | "tester";

interface Step {
  phase: string;
  task: string;
  status: Record<Agent, Status>;
  line: Record<Agent, string>;
  /** Which connector is carrying the task: 0 = Ideator↔Coder, 1 = Coder↔Tester. */
  flow?: { link: 0 | 1; back?: boolean };
}

const AGENTS: { id: Agent; name: string; role: string }[] = [
  { id: "ideator", name: "Ideator", role: "Plans" },
  { id: "coder", name: "Coder", role: "Builds" },
  { id: "tester", name: "Tester", role: "Verifies" },
];

const IDLE = { ideator: "waiting", coder: "waiting", tester: "waiting" };

const SCRIPT: Step[] = [
  {
    phase: "IDEATING",
    task: "Reading the repository and scoring candidate improvements",
    status: { ideator: "active", coder: "idle", tester: "idle" },
    line: { ...IDLE, ideator: "212 files · 11 candidates" },
  },
  {
    phase: "IDEATING",
    task: "Brief handed to the Coder: keyboard shortcuts for study sessions",
    status: { ideator: "done", coder: "idle", tester: "idle" },
    line: { ...IDLE, ideator: "picked #3 · impact 8 · risk 2" },
    flow: { link: 0 },
  },
  {
    phase: "CODING",
    task: "Implementing on branch vesperal/idea-0412",
    status: { ideator: "done", coder: "active", tester: "idle" },
    line: { ...IDLE, ideator: "brief sent", coder: "edit use-keyboard-shortcuts.ts" },
  },
  {
    phase: "CODING",
    task: "Lint and typecheck pass. Branch handed to the Tester",
    status: { ideator: "done", coder: "done", tester: "idle" },
    line: { ...IDLE, ideator: "brief sent", coder: "3 files · commit a1f3c9e" },
    flow: { link: 1 },
  },
  {
    phase: "TESTING",
    task: "Running the full suite and probing edge cases",
    status: { ideator: "done", coder: "done", tester: "active" },
    line: { ideator: "brief sent", coder: "3 files · commit a1f3c9e", tester: "npm test · 42 passed · 1 failed" },
  },
  {
    phase: "FIXING",
    task: "Bug report returned: Enter submits the quiz answer twice",
    status: { ideator: "done", coder: "idle", tester: "done" },
    line: { ideator: "brief sent", coder: "bug received", tester: "1 bug · severity high" },
    flow: { link: 1, back: true },
  },
  {
    phase: "FIXING",
    task: "Fix iteration 1 of 3",
    status: { ideator: "done", coder: "active", tester: "idle" },
    line: { ideator: "brief sent", coder: "edit quiz-question.tsx", tester: "waiting for fix" },
  },
  {
    phase: "TESTING",
    task: "Retest",
    status: { ideator: "done", coder: "done", tester: "active" },
    line: { ideator: "brief sent", coder: "commit 7b2e410", tester: "npm test · 43 passed" },
    flow: { link: 1 },
  },
  {
    phase: "COMPLETED",
    task: "Approved. Safety check clean, PR #218 opened",
    status: { ideator: "done", coder: "done", tester: "done" },
    line: { ideator: "brief sent", coder: "commit 7b2e410", tester: "approved" },
  },
];

const STEP_MS = 2400;

function Dot({ status, agent }: { status: Status; agent: Agent }) {
  if (status === "done") {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ok/15 text-ok" aria-hidden>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M1.5 5.5l2.3 2.3L8.5 2.5" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className={`hue-${agent} inline-flex h-4 w-4 items-center justify-center`}
      aria-hidden
    >
      <span
        className={`block h-2 w-2 rounded-full ${
          status === "active" ? "bg-hue animate-[breathe_1.6s_ease-in-out_infinite]" : "bg-mute/50"
        }`}
      />
    </span>
  );
}

function Connector({ lit, back }: { lit: boolean; back?: boolean }) {
  const cls = lit ? "stroke-accent" : "stroke-rule-2";
  return (
    <div className="flex items-center justify-center px-1 sm:px-0" aria-hidden>
      {/* horizontal on sm+, vertical on mobile */}
      <svg className="hidden h-4 w-10 sm:block" viewBox="0 0 40 16" fill="none">
        <line x1="0" y1="8" x2="40" y2="8" className={`${cls} ${lit ? "march" : ""}`} strokeWidth="1.25" />
        {lit && (
          <path
            d={back ? "M8 4L3 8l5 4" : "M32 4l5 4-5 4"}
            className="stroke-accent"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <svg className="h-7 w-4 sm:hidden" viewBox="0 0 16 28" fill="none">
        <line x1="8" y1="0" x2="8" y2="28" className={`${cls} ${lit ? "march" : ""}`} strokeWidth="1.25" />
      </svg>
    </div>
  );
}

/**
 * Hero visualization: three agents, one task moving between them.
 * Frontend-only script of a representative cycle, labeled as such.
 */
export default function HeroAgents() {
  const [i, setI] = useState(2);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % SCRIPT.length), STEP_MS);
    return () => clearInterval(id);
  }, []);

  const step = SCRIPT[i];

  return (
    <div className="panel-3 overflow-hidden text-[13px]" aria-label="Simulated cycle">
      <div className="flex items-center justify-between gap-3 border-b border-rule-2 px-4 py-2.5">
        <span className="eyebrow !text-ink">acme/website · cycle 0412</span>
        <span className="eyebrow !text-warn">Simulated</span>
      </div>

      <div className="flex flex-col items-stretch px-4 pb-2 pt-4 sm:flex-row sm:items-center sm:px-5">
        {AGENTS.map((a, idx) => (
          <div key={a.id} className="contents">
            <div
              className={`hue-${a.id} min-w-0 flex-1 rounded-md border px-3.5 py-3 transition-colors duration-500 ${
                step.status[a.id] === "active" ? "border-hue bg-paper-2" : "border-rule-2 bg-paper-2/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Dot status={step.status[a.id]} agent={a.id} />
                  <span className="text-[14px] font-medium text-ink">{a.name}</span>
                </div>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-hue xl:inline">{a.role}</span>
              </div>
              <p
                key={step.line[a.id]}
                className={`rise mt-2 truncate font-mono text-[11px] ${
                  step.status[a.id] === "idle" ? "text-mute" : "text-ink-2"
                }`}
              >
                {step.line[a.id]}
              </p>
            </div>
            {idx < AGENTS.length - 1 && (
              <Connector lit={step.flow?.link === idx} back={step.flow?.link === idx && step.flow.back} />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 border-t border-rule-2 px-4 py-3 sm:px-5">
        <PhaseBadge phase={step.phase} />
        <p key={step.task} className="rise min-w-0 flex-1 text-[13px] leading-snug text-ink-2">
          {step.task}
        </p>
        <span className="hidden font-mono text-[10px] text-mute tnum sm:block">
          {String(i + 1).padStart(2, "0")}/{String(SCRIPT.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
