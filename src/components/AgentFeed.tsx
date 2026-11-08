import PhaseBadge from "./PhaseBadge";
import Prose from "./Prose";

interface Message {
  id: string;
  fromAgent: string;
  toAgent: string;
  type: string;
  content: unknown;
  createdAt: Date;
}

const AGENT_TONE: Record<string, string> = {
  IDEATOR: "text-ideator",
  CODER: "text-coder",
  TESTER: "text-tester",
  SYSTEM: "text-ink-2",
};

const TYPE_LABEL: Record<string, string> = {
  ANALYSIS: "analysis",
  TASK_BRIEF: "brief",
  IMPLEMENTATION_REPORT: "report",
  CHANGE_SUMMARY: "commit",
  VERDICT: "verdict",
};

function ContentView({ type, content }: { type: string; content: Record<string, unknown> }) {
  switch (type) {
    case "ANALYSIS":
      return <p className="text-[13px] leading-relaxed text-ink-2">{String(content.summary ?? "")}</p>;
    case "TASK_BRIEF":
      return (
        <div className="space-y-2 text-[13px] leading-relaxed">
          <p className="text-[15px] text-ink">{String(content.title ?? "")}</p>
          <p className="text-ink-2">{String(content.description ?? "")}</p>
          {Array.isArray(content.acceptanceCriteria) && (
            <ol className="mt-2 space-y-1 border-l border-rule pl-3 text-ink-2">
              {(content.acceptanceCriteria as string[]).slice(0, 6).map((c, i) => (
                <li key={i} className="grid grid-cols-[1.5rem_1fr]">
                  <span className="font-mono text-[11px] text-mute">{String(i + 1).padStart(2, "0")}</span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      );
    case "IMPLEMENTATION_REPORT":
      return <Prose text={String(content.report ?? "").slice(0, 1500)} />;
    case "CHANGE_SUMMARY": {
      const changes = Array.isArray(content.changes)
        ? (content.changes as { file: string; whatChanged: string }[])
        : [];
      return (
        <div className="space-y-2 text-[13px] leading-relaxed">
          <p className="text-ink-2">{String(content.overall ?? "")}</p>
          {changes.length > 0 && (
            <ul className="space-y-1 border-l border-rule pl-3">
              {changes.slice(0, 8).map((c, i) => (
                <li key={i} className="text-ink-2">
                  <span className="font-mono text-[12px] text-ink">{c.file}</span>
                  <span className="text-mute"> · </span>
                  {c.whatChanged}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    case "VERDICT": {
      const approved = Boolean(content.approved);
      const bugs = Array.isArray(content.bugs) ? (content.bugs as { severity: string; title: string }[]) : [];
      return (
        <div className="space-y-2 text-[13px] leading-relaxed">
          <PhaseBadge phase={approved ? "COMPLETED" : "FAILED"} />
          <p className="text-ink-2">{String(content.summary ?? "")}</p>
          {bugs.length > 0 && (
            <ul className="space-y-1 border-l border-bad pl-3">
              {bugs.map((b, i) => (
                <li key={i} className="text-ink">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-bad">{b.severity}</span>
                  <span className="text-mute"> · </span>
                  {b.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    default:
      return (
        <pre className="well max-h-40 overflow-auto p-3">{JSON.stringify(content, null, 2)}</pre>
      );
  }
}

/** The agents' correspondence, newest first, rendered as a correspondence log. */
export default function AgentFeed({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return <p className="py-6 text-[13px] text-mute">No correspondence yet.</p>;
  }
  return (
    <ol className="divide-y divide-rule">
      {messages.map((m) => (
        <li key={m.id} className="py-5">
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em]">
            <span className={AGENT_TONE[m.fromAgent] ?? "text-ink-2"}>{m.fromAgent.toLowerCase()}</span>
            <span className="text-mute">to</span>
            <span className={AGENT_TONE[m.toAgent] ?? "text-ink-2"}>{m.toAgent.toLowerCase()}</span>
            <span className="text-mute">·</span>
            <span className="text-ink-2">{TYPE_LABEL[m.type] ?? m.type.toLowerCase()}</span>
            <time className="ml-auto normal-case tracking-normal text-mute" dateTime={new Date(m.createdAt).toISOString()}>
              {new Date(m.createdAt).toLocaleString()}
            </time>
          </div>
          <ContentView type={m.type} content={(m.content ?? {}) as Record<string, unknown>} />
        </li>
      ))}
    </ol>
  );
}
