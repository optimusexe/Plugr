import { AppHeader } from "@/components/app-header";
import { ProfileSetupWorkflow } from "@/components/workflows/profile-setup-workflow";

export default function ProfileSetupPage() {
  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <section className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-[var(--card)] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Profile Setup</p>
        <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold">Complete your setup</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          let&apos;s get you started with some details about you
        </p>
        <div className="mt-6">
          <ProfileSetupWorkflow />
        </div>
      </section>
    </main>
  );
}
