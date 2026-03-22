import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminDeleteUser, resolveContact, resolveReport, setSuspension } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { getAdminContacts, getAdminPayments, getAdminReports, getAdminStats, getAdminUsers } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { currency } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Admin",
  description: "Admin dashboard for moderation, payments, and safety operations.",
  path: "/admin",
});

export default async function AdminPage() {
  const { profile } = await requireAdmin();
  const [stats, users, reports, contacts, payments] = await Promise.all([
    getAdminStats(),
    getAdminUsers(),
    getAdminReports(),
    getAdminContacts(),
    getAdminPayments(),
  ]);

  return (
    <AppShell profile={profile!}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key}>
              <div className="text-sm text-slate-500">{key}</div>
              <div className="mt-2 text-3xl font-semibold text-ink">{key === "totalRevenue" ? currency(value) : value}</div>
            </Card>
          ))}
        </div>

        <Card>
          <h2 className="text-2xl font-semibold text-ink">Users</h2>
          <div className="mt-4 space-y-3">
            {users.slice(0, 12).map((user) => (
              <div key={user.id} className="flex flex-col gap-4 rounded-[1.5rem] bg-sand p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-semibold text-ink">{user.full_name || "Unnamed user"}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/users/${user.id}`}>
                    <Button variant="secondary">View</Button>
                  </Link>
                  <form action={async () => { "use server"; await setSuspension(user.id, !user.is_suspended); }}>
                    <Button type="submit" variant="secondary">{user.is_suspended ? "Activate" : "Suspend"}</Button>
                  </form>
                  <form action={async () => { "use server"; await adminDeleteUser(user.id); }}>
                    <Button type="submit" variant="danger">Delete</Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <h2 className="text-2xl font-semibold text-ink">Open reports</h2>
            <div className="mt-4 space-y-3">
              {reports.slice(0, 8).map((report) => (
                <div key={report.id} className="rounded-[1.5rem] bg-sand p-4">
                  <div className="font-semibold text-ink">{report.category}</div>
                  <p className="mt-2 text-sm text-slate-600">{report.details || "No details provided"}</p>
                  <form action={async () => { "use server"; await resolveReport(report.id, report.status === "resolved" ? "reviewing" : "resolved"); }} className="mt-3">
                    <Button type="submit" variant="secondary">{report.status === "resolved" ? "Reopen" : "Resolve"}</Button>
                  </form>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold text-ink">Contact queue</h2>
            <div className="mt-4 space-y-3">
              {contacts.slice(0, 8).map((contact) => (
                <div key={contact.id} className="rounded-[1.5rem] bg-sand p-4">
                  <div className="font-semibold text-ink">{contact.subject}</div>
                  <p className="mt-2 text-sm text-slate-600">{contact.message}</p>
                  <form action={async () => { "use server"; await resolveContact(contact.id, contact.status === "resolved" ? "reviewing" : "resolved"); }} className="mt-3">
                    <Button type="submit" variant="secondary">{contact.status === "resolved" ? "Reopen" : "Resolve"}</Button>
                  </form>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-2xl font-semibold text-ink">Payments</h2>
          <div className="mt-4 space-y-3">
            {payments.slice(0, 10).map((payment) => (
              <div key={payment.id} className="rounded-[1.5rem] bg-sand p-4 text-sm text-slate-700">
                {payment.plan} plan • {currency(payment.amount)} • {payment.status}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
