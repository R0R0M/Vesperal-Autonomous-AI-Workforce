"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    setMessage(res.ok ? "Saved." : "Could not save. Names are 1 to 60 characters.");
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={save} className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <div className="min-w-64 flex-1">
        <label className="label" htmlFor="displayName">
          Display name
        </label>
        <input id="displayName" className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <button type="submit" className="btn-secondary btn-sm" disabled={saving}>
        {saving ? "Saving" : "Save"}
      </button>
      {message && <p className="w-full font-mono text-[12px] text-ink-2">{message}</p>}
    </form>
  );
}
