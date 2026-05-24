import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <main className="page-shell px-5 pt-28 sm:px-8 lg:px-16">
      <SiteHeader current="/" />

      <section className="mx-auto my-20 max-w-3xl text-center">
        <h1 className="font-display mb-4 text-6xl sm:text-7xl">404</h1>
        <p className="mb-4 text-xl font-semibold">Page not found</p>
        <p className="mb-6 text-[var(--muted)]">We couldn't find the page you were looking for. It may have been moved or removed.</p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">
            Go home
          </Link>
          <Link href="/discover" className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold">
            Search listings
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
