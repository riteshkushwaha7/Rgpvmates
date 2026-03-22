import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { profile } = await requireAdmin();
  const { userId } = await params;
  const admin = createAdminClient();
  const [{ data: user }, { data: reports }, { data: payments }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    admin.from("reports").select("*").eq("reported_user_id", userId).order("created_at", { ascending: false }),
    admin.from("payments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  if (!user) notFound();

  return (
    <AppShell profile={profile!}>
      <div className="space-y-6">
        <Card>
          <h1 className="text-3xl font-semibold text-ink">{user.full_name || "User detail"}</h1>
          <p className="mt-3 text-sm text-slate-600">
            {user.email} • {user.city || "City hidden"} • subscription {user.subscription_plan}
          </p>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold text-ink">Reports</h2>
          <div className="mt-4 space-y-3">
            {(reports || []).map((report) => (
              <div key={report.id} className="rounded-[1.5rem] bg-sand p-4 text-sm text-slate-700">
                {report.category} • {report.status}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold text-ink">Payments</h2>
          <div className="mt-4 space-y-3">
            {(payments || []).map((payment) => (
              <div key={payment.id} className="rounded-[1.5rem] bg-sand p-4 text-sm text-slate-700">
                {payment.plan} • {payment.amount} • {payment.status}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
