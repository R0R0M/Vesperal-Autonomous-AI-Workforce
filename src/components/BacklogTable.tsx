import PhaseBadge from "./PhaseBadge";

interface IdeaRow {
  id: string;
  title: string;
  description: string;
  priority: number;
  status: string;
  scores: unknown;
}

/** The Ideator's ranked backlog as a ledger. */
export default function BacklogTable({ ideas }: { ideas: IdeaRow[] }) {
  if (ideas.length === 0) {
    return <p className="py-6 text-[13px] text-mute">The Ideator has not proposed anything yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="ledger">
        <thead>
          <tr>
            <th className="w-12">Rank</th>
            <th>Idea</th>
            <th className="w-16 text-right">Impact</th>
            <th className="w-12 text-right">Risk</th>
            <th className="w-28 pr-0 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((idea) => {
            const scores = (idea.scores ?? {}) as Record<string, number>;
            return (
              <tr key={idea.id}>
                <td className="font-mono text-[12px] text-accent tnum">
                  {String(idea.priority).padStart(2, "0")}
                </td>
                <td>
                  <p className="text-ink">{idea.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-ink-2">{idea.description}</p>
                </td>
                <td className="text-right font-mono text-[12px] text-ink-2 tnum">{scores.userImpact ?? "—"}</td>
                <td className="text-right font-mono text-[12px] text-ink-2 tnum">{scores.risk ?? "—"}</td>
                <td className="pr-0 text-right">
                  <PhaseBadge phase={idea.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
