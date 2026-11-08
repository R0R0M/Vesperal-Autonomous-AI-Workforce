type Kind = "live" | "waiting" | "ok" | "bad" | "idle";

const KIND: Record<string, Kind> = {
  IDEATING: "live",
  CODING: "live",
  TESTING: "live",
  FIXING: "live",
  SAFETY_CHECK: "live",
  PUSHING: "live",
  MERGING: "live",
  DEPLOYING: "live",
  VERIFYING: "live",
  TRIGGERED: "live",
  RUNNING: "live",
  ACTIVE: "live",
  AWAITING_IDEA_APPROVAL: "waiting",
  AWAITING_APPROVAL: "waiting",
  COMPLETED: "ok",
  SUCCEEDED: "ok",
  DONE: "ok",
  FAILED: "bad",
  ROLLED_BACK: "bad",
  ERROR: "bad",
  REJECTED: "bad",
  PAUSED: "idle",
  IDLE: "idle",
  BACKLOG: "idle",
};

const TONE: Record<Kind, string> = {
  live: "tag-live text-accent",
  waiting: "text-warn",
  ok: "text-ok",
  bad: "text-bad",
  idle: "text-mute",
};

/** Mono status tag with a square indicator. Used for phases, repo and deploy statuses, and idea states. */
export default function PhaseBadge({ phase }: { phase: string }) {
  const kind = KIND[phase] ?? "idle";
  return <span className={`tag ${TONE[kind]}`}>{phase.replaceAll("_", " ").toLowerCase()}</span>;
}
