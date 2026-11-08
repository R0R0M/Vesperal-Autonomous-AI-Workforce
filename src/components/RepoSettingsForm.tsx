"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ModelOption {
  id: string;
  label: string;
  tagline: string;
  pricing: string;
}

export default function RepoSettingsForm({
  repo,
  models,
}: {
  repo: {
    id: string;
    schedule: string;
    mergeMode: string;
    autoMergePr: boolean;
    requireHumanApproval: boolean;
    requireIdeaApproval: boolean;
    model: string;
    deployHookUrl: string | null;
    healthCheckUrl: string | null;
  };
  models: ModelOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/repositories/${repo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schedule: form.get("schedule"),
        mergeMode: form.get("mergeMode"),
        model: form.get("model"),
        autoMergePr: form.get("autoMergePr") === "on",
        requireHumanApproval: form.get("requireHumanApproval") === "on",
        requireIdeaApproval: form.get("requireIdeaApproval") === "on",
        deployHookUrl: (form.get("deployHookUrl") as string) || "",
        healthCheckUrl: (form.get("healthCheckUrl") as string) || "",
        ...(form.get("githubToken") ? { githubToken: form.get("githubToken") } : {}),
      }),
    });
    setSaving(false);
    setMessage(res.ok ? "Saved." : "Could not save settings.");
    if (res.ok) router.refresh();
  }

  async function onDelete() {
    if (
      !confirm(
        "Disconnect this repository? Its history, analytics, and backlog in Foundry will be deleted. The GitHub repository itself is untouched.",
      )
    ) {
      return;
    }
    setDeleting(true);
    const res = await fetch(`/api/repositories/${repo.id}`, { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/";
      return;
    }
    setDeleting(false);
    setMessage("Could not disconnect the repository.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-12">
      {/* Model */}
      <fieldset>
        <legend className="eyebrow mb-4">Model</legend>
        <div className="grid border-t border-rule-2 sm:grid-cols-3">
          {models.map((m, i) => (
            <label
              key={m.id}
              className={`flex cursor-pointer flex-col gap-1 border-b border-rule py-4 pr-4 has-[:checked]:text-ink sm:border-b-0 ${
                i > 0 ? "sm:border-l sm:pl-4" : ""
              }`}
            >
              <span className="flex items-center gap-3">
                <input type="radio" name="model" value={m.id} defaultChecked={repo.model === m.id} />
                <span className="text-[15px] text-ink">{m.label}</span>
              </span>
              <span className="pl-[1.6rem] text-[13px] text-ink-2">{m.tagline}</span>
              <span className="pl-[1.6rem] font-mono text-[11px] text-mute">{m.pricing}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="schedule">
            Schedule
          </label>
          <select id="schedule" name="schedule" className="input" defaultValue={repo.schedule}>
            <option value="CONTINUOUS">Continuous</option>
            <option value="NIGHTLY">Nightly</option>
            <option value="MANUAL">Manual only</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="mergeMode">
            Merge mode
          </label>
          <select id="mergeMode" name="mergeMode" className="input" defaultValue={repo.mergeMode}>
            <option value="PULL_REQUEST">Pull requests</option>
            <option value="DIRECT_MERGE">Direct merge to default branch</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="deployHookUrl">
            Deploy hook URL <span className="text-mute">optional</span>
          </label>
          <input
            id="deployHookUrl"
            name="deployHookUrl"
            className="input"
            defaultValue={repo.deployHookUrl ?? ""}
            placeholder="https://api.vercel.com/v1/integrations/deploy/…"
          />
        </div>
        <div>
          <label className="label" htmlFor="healthCheckUrl">
            Health check URL <span className="text-mute">optional</span>
          </label>
          <input
            id="healthCheckUrl"
            name="healthCheckUrl"
            className="input"
            defaultValue={repo.healthCheckUrl ?? ""}
            placeholder="https://example.com/api/health"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="githubToken">
            Replace GitHub token <span className="text-mute">leave blank to keep the current one</span>
          </label>
          <input
            id="githubToken"
            name="githubToken"
            type="password"
            className="input"
            placeholder="github_pat_…"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 text-[13px] text-ink">
        <label className="flex items-center gap-3">
          <input type="checkbox" name="requireIdeaApproval" defaultChecked={repo.requireIdeaApproval} />
          Ask me to approve each idea before the Coder starts
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" name="requireHumanApproval" defaultChecked={repo.requireHumanApproval} />
          Ask me before anything merges
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" name="autoMergePr" defaultChecked={repo.autoMergePr} />
          Auto-merge pull requests the Tester approves
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving" : "Save settings"}
        </button>
        {message && <p className="font-mono text-[12px] text-ink-2">{message}</p>}
      </div>

      {/* Disconnect */}
      <div className="border-t border-bad/40 pt-4">
        <p className="eyebrow !text-bad">Disconnect</p>
        <p className="mt-2 max-w-prose text-[13px] text-ink-2">
          Removes this repository and all of its Foundry data: history, analytics, backlog and
          memory. Your code on GitHub is not affected.
        </p>
        <button type="button" className="btn-danger btn-sm mt-4" onClick={onDelete} disabled={deleting}>
          {deleting ? "Disconnecting" : "Disconnect repository"}
        </button>
      </div>
    </form>
  );
}
