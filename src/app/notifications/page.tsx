import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { getNotificationsForUser } from "@/lib/notification-store";

export default async function NotificationsPage() {
  const userId = (await cookies()).get("plugr_user_id")?.value;
  if (!userId) {
    redirect("/auth?mode=login");
  }

  const notifications = await getNotificationsForUser(userId, 50);

  return (
    <main className="page-shell px-5 pt-28 sm:px-8 lg:px-16">
      <SiteHeader current="/notifications" variant="default" />
      <div className="mx-auto max-w-5xl pb-8">
        <NotificationCenter userId={userId} initialNotifications={notifications} />
      </div>
      <SiteFooter />
    </main>
  );
}
