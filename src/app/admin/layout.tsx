import type { ReactNode } from "react";
import { requireAdminUser } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const adminUser = await requireAdminUser();

  return <AdminShell adminName={adminUser.fullName}>{children}</AdminShell>;
}