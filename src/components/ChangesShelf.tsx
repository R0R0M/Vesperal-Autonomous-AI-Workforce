import { estimateCostUsd, formatTokens } from "@/lib/pricing";

export interface CommitExplanation {
  sha: string | null;
  message: string;
  overall: string;
  files: { file: string; whatChanged: string; purpose: string }[];
  createdAt: Date;
  taskTitle: string | null;
  isCurrentCycle: boolean;
}

interface LogRow {
  id: string;
  level: string;
  message: string;
  createdAt: Date;
}

function Head({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-t border-rule-2 pt-3">
      <span className="eyebrow !text-ink">{children}</span>
      {aside && <span className="eyebrow">{aside}</span>}
    </div>
  );
}

/** Right-hand ledger: what the cycle is, what it cost, what it committed, what the system logged. */
export default function ChangesShelf({
  ideaTitle,
  commits,
  coderBusy,
  inputTokens,
  outputTokens,
  totalInputTokens,
  totalOutputTokens,
  modelName,
  logs,
}: {
  ideaTitle: string | null;
  commits: CommitExplanation[];
  coderBusy: boolean;
  inputTokens: number;
  outputTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  modelName: string;
  logs: LogRow[];
}) {
  const cycleCost = estimateCostUsd(modelName, inputTokens, outputTokens);
  const totalCost = estimateCostUsd(modelName, totalInputTokens, totalOutputTokens);

  return (
    <aside className="space-y-10">
      <div>
        <Head>This cycle</Head>
        <p className={`mt-3 text-[15px] leading-snug ${ideaTitle ? "text-ink" : "text-mute"}`}>
          {ideaTitle ?? "No cycle yet."}
        </p>
      </div>

      <div>
        <Head aside={modelName}>Meter</Head>
        <table className="ledger mt-1">
          <tbody className="font-mono text-[12px]">
            <tr>
              <td className="text-ink-2">Cycle tokens</td>
              <td className="text-right text-ink tnum">
                {inputTokens + outputTokens === 0
                  ? "—"
                  : `${formatTokens(inputTokens)} in · ${formatTokens(outputTokens)} out`}
              </td>
            </tr>
            <tr>
              <td className="text-ink-2">Cycle cost</td>
              <td className="text-right text-ink tnum">
                {inputTokens + outputTokens === 0 ? "—" : `$${cycleCost.toFixed(4)}`}
              </td>
            </tr>
            <tr>
              <td className="text-ink-2">All-time tokens</td>
              <td className="text-right text-ink tnum">
                {formatTokens(totalInputTokens)} in · {formatTokens(totalOutputTokens)} out
              </td>
            </tr>
            <tr>
              <td className="text-ink-2">All-time cost</td>
              <td className="text-right text-ink tnum">${totalCost.toFixed(4)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <Head aside={commits.length > 0 ? `${commits.length}` : undefined}>Commits</Head>
        <ol className="max-h-[32rem] divide-y divide-rule overflow-y-auto">
          {coderBusy && (
            <li className="py-3">
              <p className="tag tag-live text-accent">Coder working</p>
              <p className="mt-1 text-[12px] text-mute">The next commit and its explanation land here.</p>
            </li>
          )}
          {commits.length === 0 && !coderBusy && (
            <li className="py-3 text-[13px] text-mute">No commits yet.</li>
          )}
          {commits.map((c, i) => (
            <li key={c.sha ?? i} className={`py-4 ${c.isCurrentCycle ? "" : "opacity-80"}`}>
              {!c.isCurrentCycle && c.taskTitle && (
                <p className="mb-1 truncate text-[11px] text-mute">{c.taskTitle}</p>
              )}
              <p className="break-words font-mono text-[12px] text-ink">
                {c.sha && <span className="mr-2 text-accent">{c.sha.slice(0, 7)}</span>}
                {c.message}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{c.overall}</p>
              {c.files.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.12em] text-mute hover:text-ink">
                    {c.files.length} file{c.files.length === 1 ? "" : "s"}
                  </summary>
                  <ul className="mt-2 space-y-2 border-l border-rule pl-3">
                    {c.files.map((f) => (
                      <li key={f.file} className="text-[12px]">
                        <p className="break-all font-mono text-ink">{f.file}</p>
                        <p className="text-ink-2">
                          {f.whatChanged} {f.purpose}
                        </p>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <time
                className="mt-2 block font-mono text-[10px] text-mute tnum"
                dateTime={new Date(c.createdAt).toISOString()}
              >
                {new Date(c.createdAt).toLocaleTimeString([], { hour12: false })}
              </time>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <Head>System log</Head>
        <ol className="mt-2 max-h-80 space-y-1 overflow-y-auto font-mono text-[11px]">
          {logs.map((log) => (
            <li key={log.id} className="grid grid-cols-[4.5rem_1fr] gap-2">
              <time className="whitespace-nowrap text-mute tnum" dateTime={new Date(log.createdAt).toISOString()}>
                {new Date(log.createdAt).toLocaleTimeString([], { hour12: false })}
              </time>
              <span
                className={
                  log.level === "error" ? "text-bad" : log.level === "warn" ? "text-warn" : "text-ink-2"
                }
              >
                {log.message}
              </span>
            </li>
          ))}
          {logs.length === 0 && <li className="text-mute">Nothing logged yet.</li>}
        </ol>
      </div>
    </aside>
  );
}
