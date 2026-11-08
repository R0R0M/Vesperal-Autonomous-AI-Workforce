import Link from "next/link";
import { signOut } from "@/auth";
import ThemeToggle from "./ThemeToggle";
import Wordmark from "./Wordmark";

/** Signed-in chrome: wordmark, account, theme, sign out. */
export default function AppHeader({
  user,
  crumbs = [],
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  /** Breadcrumb trail after the wordmark, e.g. [{ label: "acme/website", href: "/repos/x" }]. */
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <header className="sticky top-0 z-40 -mx-6 border-b border-rule bg-paper/85 px-6 backdrop-blur-md sm:-mx-10 sm:px-10">
      <div className="mx-auto flex max-w-page items-center justify-between py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Wordmark small />
          {crumbs.map((c) => (
            <span key={c.label} className="flex min-w-0 items-center gap-3">
              <span className="text-rule" aria-hidden>
                /
              </span>
              {c.href ? (
                <Link
                  href={c.href}
                  className="truncate font-mono text-[12px] text-ink-2 transition-colors hover:text-ink"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="truncate font-mono text-[12px] text-ink">{c.label}</span>
              )}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2 transition-colors hover:text-ink sm:inline"
          >
            Account
          </Link>
          <ThemeToggle />
          {user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="hidden h-7 w-7 rounded-md border border-rule-2 sm:block" />
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="btn-secondary btn-sm whitespace-nowrap" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
