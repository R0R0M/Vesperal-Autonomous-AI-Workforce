"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddRepoForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/repositories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: form.get("url"),
        githubToken: form.get("githubToken"),
        schedule: form.get("schedule"),
        mergeMode: form.get("mergeMode"),
        autoMergePr: form.get("autoMergePr") === "on",
        requireHumanApproval: form.get("requireHumanApproval") === "on",
        deployHookUrl: form.get("deployHookUrl") || "",
        healthCheckUrl: form.get("healthCheckUrl") || "",
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(typeof body.error === "string" ? body.error : "Failed to connect repository");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        Connect a repository
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel p-6 sm:p-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-3xl leading-none text-ink">Connect a repository</h2>
        <button
          type="button"
          className="link font-mono text-[11px] uppercase tracking-[0.16em]"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
      <p className="mt-3 max-w-prose text-[13px] text-ink-2">
        Use a fine-grained token scoped to this repository with Contents and Pull requests set to
        read and write. It is encrypted before it is stored.
      </p>

      <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="url">
            Repository
          </label>
          <input id="url" name="url" required className="input" placeholder="owner/name or URL" />
        </div>
        <div>
          <label className="label" htmlFor="githubToken">
            GitHub token
          </label>
          <input
            id="githubToken"
            name="githubToken"
            required
            type="password"
            className="input"
            placeholder="github_pat_…"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor="schedule">
            Schedule
          </label>
          <select id="schedule" name="schedule" className="input" defaultValue="CONTINUOUS">
            <option value="CONTINUOUS">Continuous</option>
            <option value="NIGHTLY">Nightly</option>
            <option value="MANUAL">Manual only</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="mergeMode">
            Merge mode
          </label>
          <select id="mergeMode" name="mergeMode" className="input" defaultValue="PULL_REQUEST">
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
            placeholder="https://api.vercel.com/v1/integrations/deploy/…"
          />
        </div>
        <div>
          <label className="label" htmlFor="healthCheckUrl">
            Health check URL <span className="text-mute">optional</span>
          </label>
          <input id="healthCheckUrl" name="healthCheckUrl" className="input" placeholder="https://example.com/api/health" />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 text-[13px] text-ink">
        <label className="flex items-center gap-3">
          <input type="checkbox" name="autoMergePr" defaultChecked /> Auto-merge pull requests the Tester approves
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" name="requireHumanApproval" /> Ask me before anything merges
        </label>
      </div>

      {error && <p className="mt-4 text-[13px] text-bad">{error}</p>}

      <div className="mt-8">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Validating" : "Connect"}
        </button>
      </div>
    </form>
  );
}
