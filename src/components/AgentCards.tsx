import Reveal from "./Reveal";

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-ok" aria-label="pass">
      <path d="M1.5 5.5l2.3 2.3L8.5 2.5" />
    </svg>
  ) : (
    <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-bad" aria-label="fail">
      <path d="M2 2l6 6M8 2L2 8" />
    </svg>
  );
}

/* Each agent's mini interface, in its own idiom. */

function IdeatorPreview() {
  const rows = [
    { t: "Keyboard shortcuts for study sessions", s: 86 },
    { t: "Index notes by folder and date", s: 71 },
    { t: "Paginate study-set lists", s: 58 },
  ];
  return (
    <div className="space-y-2.5 font-mono text-[11px]">
      <div className="flex justify-between text-mute">
        <span>proposals · ranked</span>
        <span>11 scored</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.t} className="grid grid-cols-[1.25rem_1fr_2rem] items-center gap-2">
          <span className={i === 0 ? "text-hue" : "text-mute"}>{String(i + 1).padStart(2, "0")}</span>
          <div className="min-w-0">
            <p className={`truncate font-sans text-[12px] ${i === 0 ? "text-ink" : "text-ink-2"}`}>{r.t}</p>
            <span className="mt-1 block h-px w-full bg-rule-2">
              <span className={`block h-px ${i === 0 ? "bg-hue" : "bg-mute/60"}`} style={{ width: `${r.s}%` }} />
            </span>
          </div>
          <span className={`text-right tnum ${i === 0 ? "text-ink" : "text-mute"}`}>{r.s}</span>
        </div>
      ))}
    </div>
  );
}

function CoderPreview() {
  return (
    <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
      <p className="text-ink-2">
        <span className="text-mute">$ </span>git switch -c foundry/idea-0412
      </p>
      <p className="text-ink-2">
        <span className="text-mute">$ </span>edit src/hooks/use-keyboard-shortcuts.ts
      </p>
      <div className="well my-1 px-2.5 py-1.5">
        <p className="text-ok">+ export function useKeyboardShortcuts(map) {"{"}</p>
        <p className="text-ok">+   useEffect(() =&gt; bind(map), [map]);</p>
        <p className="text-bad">- // TODO: shortcuts</p>
      </div>
      <p className="text-ink-2">
        <span className="text-mute">$ </span>npm run lint && npm run typecheck <span className="text-ok">✓</span>
      </p>
      <p className="text-mute">3 files changed · commit a1f3c9e</p>
    </div>
  );
}

function TesterPreview() {
  const checks: [string, boolean, string][] = [
    ["typecheck", true, "0 errors"],
    ["lint", true, "0 warnings"],
    ["vitest", false, "42 passed · 1 failed"],
    ["security probe", true, "no findings"],
  ];
  return (
    <div className="font-mono text-[11px]">
      <ul className="space-y-1.5">
        {checks.map(([k, ok, v]) => (
          <li key={k} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-ink-2">
              <Check ok={ok} />
              {k}
            </span>
            <span className={ok ? "text-mute" : "text-bad"}>{v}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-rule pt-2">
        <span className="text-mute">verdict</span>
        <span className="text-warn">bug report → Coder</span>
      </div>
    </div>
  );
}

const AGENTS = [
  {
    id: "ideator",
    n: "01",
    name: "Ideator",
    role: "Research and planning",
    body: "Reads the whole repository and the memory of past cycles, scores candidate improvements across eleven dimensions, and writes the brief for the top-ranked one.",
    never: ["write code", "re-pitch a shipped idea"],
    Preview: IdeatorPreview,
  },
  {
    id: "coder",
    n: "02",
    name: "Coder",
    role: "Implementation",
    body: "Implements exactly the brief on an isolated branch in your conventions, runs your lint, types and tests before reporting, and explains each commit in plain English.",
    never: ["invent tasks", "push to your default branch"],
    Preview: CoderPreview,
  },
  {
    id: "tester",
    n: "03",
    name: "Tester",
    role: "Verification and gating",
    body: "Runs every suite, probes edge cases, hunts regressions and security holes, and files reproducible bug reports. Nothing merges without its approval.",
    never: ["edit code", "skip a failing suite"],
    Preview: TesterPreview,
  },
] as const;

/** Three agent cards that read as one coordinated system. */
export default function AgentCards() {
  return (
    <div>
      {/* Bus line linking the three cards (desktop). */}
      <div className="relative hidden h-2 md:block" aria-hidden>
        <svg className="absolute inset-y-0 left-[16.666%] right-[16.666%] h-2 w-[66.667%]" preserveAspectRatio="none" viewBox="0 0 100 8">
          <line x1="0" y1="4" x2="100" y2="4" className="march stroke-rule-2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute left-[16.666%] top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ideator" />
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coder" />
        <span className="absolute left-[83.333%] top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tester" />
      </div>

      <ol className="mt-4 grid gap-4 md:grid-cols-3">
        {AGENTS.map((a, i) => (
          <Reveal as="li" key={a.id} delay={i * 70} className={`hue-${a.id} flex`}>
            <article className="group panel flex w-full flex-col transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-hue">
              <header className="flex items-start justify-between px-5 pt-5">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.14em] text-hue">{a.n}</p>
                  <h3 className="mt-2 text-[17px] font-medium text-ink">{a.name}</h3>
                  <p className="text-[12px] text-ink-2">{a.role}</p>
                </div>
                <span className="mt-1.5 h-2 w-2 rounded-full bg-hue/70 transition-colors group-hover:bg-hue" />
              </header>

              <div className="mt-5 min-h-[12.5rem] border-y border-rule bg-paper px-5 py-4">
                <a.Preview />
              </div>

              <p className="px-5 pt-4 text-[13px] leading-relaxed text-ink-2">{a.body}</p>

              <footer className="mt-auto px-5 pb-5 pt-4">
                <p className="font-mono text-[11px] text-mute">
                  <span className="uppercase tracking-[0.12em] text-bad/80">never</span>
                  <span className="mx-2 text-rule-2">·</span>
                  {a.never.join(" · ")}
                </p>
              </footer>
            </article>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
