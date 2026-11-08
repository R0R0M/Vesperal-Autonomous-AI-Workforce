import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import ProfileForm from "@/components/ProfileForm";
import SectionHead from "@/components/SectionHead";
import { billingEnabled, getBalanceUsd, microsToUsd } from "@/lib/billing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [user, balanceUsd, transactions] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId } }),
    getBalanceUsd(userId),
    db.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <main className="mx-auto max-w-page px-6 pb-24 sm:px-10">
      <AppHeader user={session.user} crumbs={[{ label: "account" }]} />

      <div className="py-12 sm:py-16">
        <h1 className="font-serif text-5xl leading-none text-ink sm:text-6xl">Account</h1>
      </div>

      <div className="grid gap-16 lg:grid-cols-12">
        {/* Profile */}
        <section className="lg:col-span-5">
          <SectionHead n="01" title="Profile" />
          <div className="mt-6 flex items-center gap-4">
            {user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-14 w-14 rounded-md border border-rule-2" />
            )}
            <div>
              <p className="text-[17px] text-ink">{user.name ?? "Unnamed"}</p>
              <p className="font-mono text-[12px] text-ink-2">{user.email}</p>
              <p className="eyebrow mt-1">Signed in with GitHub</p>
            </div>
          </div>
          <div className="mt-8">
            <ProfileForm initialName={user.name ?? ""} />
          </div>
        </section>

        {/* Billing */}
        <section className="lg:col-span-6 lg:col-start-7">
          <SectionHead n="02" title="Billing" aside={billingEnabled() ? undefined : "not configured on this server"} />
          <p className="eyebrow mt-6">Balance</p>
          <p className={`mt-1 font-serif text-5xl leading-none tnum ${balanceUsd > 0 ? "text-ink" : "text-bad"}`}>
            ${balanceUsd.toFixed(2)}
          </p>

          <p className="eyebrow mb-2 mt-10">Transactions</p>
          {transactions.length === 0 ? (
            <p className="py-4 text-[13px] text-mute">No transactions yet.</p>
          ) : (
            <table className="ledger">
              <thead>
                <tr>
                  <th className="w-28">Date</th>
                  <th>Description</th>
                  <th className="pr-0 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="whitespace-nowrap font-mono text-[12px] text-mute tnum">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-ink-2">{t.description}</td>
                    <td
                      className={`whitespace-nowrap pr-0 text-right font-mono text-[12px] tnum ${
                        t.amountMicros >= 0 ? "text-ok" : "text-ink"
                      }`}
                    >
                      {t.amountMicros >= 0 ? "+" : "−"}${Math.abs(microsToUsd(t.amountMicros)).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
