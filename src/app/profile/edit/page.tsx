import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { ProfileEditForm } from "@/components/workflows/profile-edit-form";

export const metadata: Metadata = {
  title: "Edit Profile - Plugr",
  robots: { index: false, follow: false },
};

export default function ProfileEditPage() {
  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <section className="mx-auto max-w-5xl rounded-3xl border border-black/10 bg-[var(--card)] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Profile</p>
        <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold">Edit profile</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Update your details, upload products, and save when you are done.
        </p>
        <div className="mt-6">
          <ProfileEditForm />
        </div>
      </section>
    </main>
  );
}
