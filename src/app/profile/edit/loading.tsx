export default function ProfileEditLoading() {
  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <div className="mx-auto mb-5 w-full max-w-6xl pt-4">
        <div className="skeleton h-16 w-full rounded-2xl" />
      </div>
      <section className="mx-auto max-w-5xl space-y-4 rounded-3xl border border-black/10 bg-[var(--card)] p-6 sm:p-8">
        <div className="skeleton h-7 w-48 rounded" />
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
        </div>
      </section>
    </main>
  );
}
