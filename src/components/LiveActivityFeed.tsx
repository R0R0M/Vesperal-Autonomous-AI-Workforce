interface ToolEventRow {
  id: string;
  agent: string;
  tool: string;
  summary: string;
  detail: string | null;
  createdAt: Date;
}

const AGENT_TONE: Record<string, string> = {
  CODER: "text-coder",
  TESTER: "text-tester",
  IDEATOR: "text-ideator",
};

const TOOL_LABELS: Record<string, string> = {
  bash: "run",
  write_file: "edit",
  read_file: "read",
  list_files: "list",
  usage: "tokens",
};

function DiffView({ text }: { text: string }) {
  return (
    <pre className="well mt-2 max-h-96 overflow-auto p-3 text-[11px]">
      {text.split("\n").map((line, i) => {
        const cls = line.startsWith("+")
          ? "text-ok"
          : line.startsWith("-")
            ? "text-bad"
            : line.startsWith("@@")
              ? "text-coder"
              : "text-ink-2";
        return (
          <div key={i} className={cls}>
            {line || " "}
          </div>
        );
      })}
    </pre>
  );
}

/**
 * Every tool action the agents take, newest first: commands with their
 * output, file edits as colored diffs. AutoRefresh keeps it near-live.
 */
export default function LiveActivityFeed({ events }: { events: ToolEventRow[] }) {
  if (events.length === 0) {
    return (
      <p className="py-6 text-[13px] text-mute">
        Nothing yet. This fills in as the Coder and Tester work.
      </p>
    );
  }
  return (
    <ol className="max-h-[36rem] divide-y divide-rule overflow-y-auto font-mono text-[12px]">
      {events.map((e, idx) => {
        const isDiff = e.tool === "write_file";
        const isUsage = e.tool === "usage";
        const hasDetail = !!e.detail && e.detail !== "(no output)";
        return (
          <li key={e.id} className="py-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:grid sm:grid-cols-[4.5rem_4rem_3rem_1fr]">
              <time className="text-mute tnum" dateTime={new Date(e.createdAt).toISOString()}>
                {new Date(e.createdAt).toLocaleTimeString([], { hour12: false })}
              </time>
              <span className={`uppercase tracking-[0.12em] text-[10px] ${AGENT_TONE[e.agent] ?? "text-ink-2"}`}>
                {e.agent.toLowerCase()}
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-mute">
                {TOOL_LABELS[e.tool] ?? e.tool}
              </span>
              <span className={`w-full break-all sm:w-auto ${isDiff ? "text-ink" : isUsage ? "text-mute" : "text-ink-2"}`}>
                {e.summary}
              </span>
            </div>
            {hasDetail && (
              <details open={isDiff && idx === 0} className="sm:pl-[13.5rem]">
                <summary className="cursor-pointer text-[10px] uppercase tracking-[0.12em] text-mute hover:text-ink">
                  {isDiff ? "diff" : "output"}
                </summary>
                {isDiff ? (
                  <DiffView text={e.detail!} />
                ) : (
                  <pre className="well mt-2 max-h-60 overflow-auto p-3 text-[11px]">{e.detail}</pre>
                )}
              </details>
            )}
          </li>
        );
      })}
    </ol>
  );
}
