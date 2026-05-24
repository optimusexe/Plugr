import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/auth-store";
import type { UserAccount } from "@/lib/types";

export async function getCurrentAdminUser(): Promise<UserAccount | null> {
  const userId = (await cookies()).get("plugr_user_id")?.value;
  if (!userId) {
    return null;
  }

  const user = await getUserById(userId);
  if (!user || !user.isAdmin) {
    return null;
  }

  return user;
}

export async function requireAdminUser(redirectTo = "/discover"): Promise<UserAccount> {
  const userId = (await cookies()).get("plugr_user_id")?.value;

  if (!userId) {
    redirect("/auth?mode=login");
  }

  const user = await getUserById(userId);

  if (!user) {
    redirect("/auth?mode=login");
  }

  if (!user.isAdmin) {
    redirect(redirectTo);
  }

  return user;
}