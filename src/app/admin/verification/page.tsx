import { PaginatedPending, PaginatedVerified } from "@/components/admin/paginated-verification";

export default async function AdminVerificationPage() {
  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,25,20,0.08)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Approvals</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Verification review</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">Review pending badge applications, inspect profile completion, approve trusted users, or remove a badge when needed.</p>
      </header>

      <div className="space-y-8">
        <PaginatedPending initialLimit={10} />
        <PaginatedVerified initialLimit={10} />
      </div>
    </section>
  );
}