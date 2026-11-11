import Link from "next/link";
import { signIn } from "@/auth";
import Wordmark from "@/components/Wordmark";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-page flex-col px-6 sm:px-10">
      <div className="flex items-center justify-between py-6">
        <Wordmark />
        <Link href="/" className="link font-mono text-[11px] uppercase tracking-[0.16em]">
          Back
        </Link>
      </div>

      <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-8">
            <span className="text-accent">00</span>&ensp;Sign in
          </p>
          <h1 className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] text-ink">
            Clock in with <em>GitHub.</em>
          </h1>
          <p className="mt-8 max-w-md text-ink-2">
            GitHub is used only to identify you. Access to each repository is granted later with
            a token you control, encrypted at rest, revocable at any time.
          </p>
          <form
            className="mt-10"
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/" });
            }}
          >
            <button type="submit" className="btn-accent btn-lg">
              Continue with GitHub
            </button>
          </form>
        </div>

        <dl className="divide-y divide-rule border-t border-rule-2 lg:col-span-4 lg:col-start-9">
          {[
            ["Starter credit", "$1.00, no card"],
            ["Repository access", "Per-repo token, Contents and Pull requests scopes"],
            ["Stored", "AES-256-GCM, server side"],
            ["Revoke", "Any time, from GitHub or from Vesperal"],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-3 text-[13px]">
              <dt className="eyebrow">{k}</dt>
              <dd className="text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
