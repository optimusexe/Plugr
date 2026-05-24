export default function DiscoverLoading() {
  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <div className="mx-auto mb-5 w-full max-w-6xl pt-4">
        <div className="skeleton h-16 w-full rounded-2xl" />
      </div>
      <section className="mx-auto max-w-5xl space-y-4">
        <div className="skeleton h-44 w-full rounded-2xl" />
        <div className="skeleton h-36 w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-40 w-full rounded-2xl" />
          <div className="skeleton h-40 w-full rounded-2xl" />
        </div>
      </section>
    </main>
  );
}
