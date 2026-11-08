interface Step {
  keys: string[];
  label: string;
}

function buildSteps(requireApproval: boolean, requireIdeaApproval: boolean): Step[] {
  return [
    { keys: ["IDEATING"], label: "Ideate" },
    ...(requireIdeaApproval ? [{ keys: ["AWAITING_IDEA_APPROVAL"], label: "Idea review" }] : []),
    { keys: ["CODING"], label: "Code" },
    { keys: ["TESTING", "FIXING"], label: "Test · fix" },
    { keys: ["SAFETY_CHECK"], label: "Safety" },
    { keys: ["PUSHING"], label: "Push" },
    ...(requireApproval ? [{ keys: ["AWAITING_APPROVAL"], label: "Approval" }] : []),
    { keys: ["MERGING"], label: "Merge" },
    { keys: ["DEPLOYING", "VERIFYING"], label: "Deploy" },
    { keys: ["COMPLETED"], label: "Done" },
  ];
}

/**
 * A ruler of the cycle: each phase is a segment whose top bar fills as the
 * cycle advances. Done segments are ink, the current one is the accent,
 * pending ones are hairlines.
 */
export default function PipelineStepper({
  phase,
  requireApproval,
  requireIdeaApproval = false,
}: {
  phase: string;
  requireApproval: boolean;
  requireIdeaApproval?: boolean;
}) {
  const failed = phase === "FAILED" || phase === "ROLLED_BACK";
  const steps = buildSteps(
    requireApproval || phase === "AWAITING_APPROVAL",
    requireIdeaApproval || phase === "AWAITING_IDEA_APPROVAL",
  );
  const currentIdx = steps.findIndex((s) => s.keys.includes(phase));
  const waiting = phase.startsWith("AWAITING");

  return (
    <ol className="flex gap-1" aria-label="Cycle progress">
      {steps.map((step, i) => {
        const done = !failed && currentIdx > i;
        const active = !failed && currentIdx === i;
        const bar = done
          ? "bg-accent/60"
          : active
            ? waiting
              ? "bg-warn"
              : "bg-accent"
            : failed
              ? "bg-bad/40"
              : "bg-rule";
        const text = done ? "text-ink-2" : active ? "text-ink" : "text-mute";
        return (
          <li key={step.label} className="min-w-0 flex-1" aria-current={active ? "step" : undefined}>
            <span className={`block h-[3px] rounded-full ${bar} ${active && !waiting ? "animate-[breathe_1.6s_ease-in-out_infinite]" : ""}`} />
            <span
              className={`mt-2 block truncate font-mono text-[10px] uppercase tracking-[0.12em] ${text}`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
      {failed && (
        <li className="ml-3 shrink-0 self-start">
          <span className="tag text-bad">{phase.replaceAll("_", " ").toLowerCase()}</span>
        </li>
      )}
    </ol>
  );
}
