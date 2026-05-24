import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="relative mt-0 w-[calc(100%+2.5rem)] -mx-5 overflow-hidden border-t border-white/25 bg-[linear-gradient(135deg,var(--accent),#0b5f58)] text-white sm:w-[calc(100%+4rem)] sm:-mx-8 lg:w-[calc(100%+8rem)] lg:-mx-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-16">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/plugr.png"
              alt="Plugr logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <p className="font-[var(--font-display)] text-2xl font-semibold">Plugr</p>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/85">
            A student-first discovery and connection platform for quick search, trusted profiles, and fast campus contact.
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-12 lg:gap-16">
            <div className="flex flex-col gap-3 text-sm font-medium text-white/85">
              <Link href="/#features" className="transition hover:text-white">
                Features
              </Link>
              <Link href="/#how-it-works" className="transition hover:text-white">
                How it works
              </Link>
            </div>
            <div className="flex flex-col gap-3 text-sm font-medium text-white/85">
              <Link href="/#testimonials" className="transition hover:text-white">
                Testimonials
              </Link>
              <Link href="/#faqs" className="transition hover:text-white">
                FAQs
              </Link>
            </div>
            <div className="flex flex-col gap-3 text-sm font-medium text-white/85">
              <Link href="/register" className="transition hover:text-white">
                Register
              </Link>
              <Link href="/login" className="transition hover:text-white">
                Login
              </Link>
              <Link href="/help" className="transition hover:text-white">
                Help Center
              </Link>
            </div>
          </div>
          <div className="flex gap-4">
            <a
              href="https://x.com/useplugr"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white/60 text-white/85"
              aria-label="Follow Plugr on X"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.22-6.817-5.974 6.817h-3.31l7.732-8.835L2.882 2.25h6.82l4.713 6.231 5.429-6.231zM17.2 20.896h1.833L6.838 3.897H4.872l12.328 16.999z" />
              </svg>
            </a>
            <a
              href="mailto:contact@useplugr.app"
              className="transition hover:text-white/60 text-white/85"
              aria-label="Email Plugr"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none h-72 lg:h-96 flex select-none items-end justify-center overflow-hidden px-3 text-center text-[clamp(10rem,30vw,28rem)] font-black leading-none tracking-[-0.1em] text-white/8"
      >
        <span className="block whitespace-nowrap">Plugr</span>
      </div>
    </footer>
  );
}
