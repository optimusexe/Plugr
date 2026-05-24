import Link from "next/link";
import { getAdminUsers } from "@/lib/admin-store";
import { AdminUsersList } from "@/components/admin/admin-users-list";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,25,20,0.08)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">User management</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Users</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
          Promote trusted users to admins, review profile completion, and keep the platform team small and controlled.
        </p>
      </header>

      <AdminUsersList users={users} />
    </section>
  );
}