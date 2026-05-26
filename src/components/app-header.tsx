"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingIdentity, setLoadingIdentity] = useState(true);
  const [displayName, setDisplayName] = useState("Student");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const userId = window.localStorage.getItem("plugr_user_id");
    if (!userId) {
      setLoadingIdentity(false);
      return;
    }

    async function hydrateUser() {
      try {
        const profileResponse = await fetch(`/api/profile?userId=${userId}`);
        if (profileResponse.ok) {
          const profileData = (await profileResponse.json()) as {
            profile: { fullName?: string; profileImage?: string } | null;
            user?: { isAdmin?: boolean } | null;
          };
          if (profileData.profile?.fullName) {
            setDisplayName(profileData.profile.fullName);
          }
          if (profileData.profile?.profileImage) {
            setImageUrl(profileData.profile.profileImage);
          }
          setIsAdmin(Boolean(profileData.user?.isAdmin));
          return;
        }

        const userResponse = await fetch(`/api/auth/me?userId=${userId}`);
        if (!userResponse.ok) {
          return;
        }
        const userData = (await userResponse.json()) as { user?: { fullName?: string; isAdmin?: boolean } };
        if (userData.user?.fullName) {
          setDisplayName(userData.user.fullName);
        }
        setIsAdmin(Boolean(userData.user?.isAdmin));
      } catch {
        // Keep default name and avatar when profile hydration fails.
      } finally {
        setLoadingIdentity(false);
      }
    }

    hydrateUser();
  }, []);

  const initials = useMemo(() => {
    const parts = displayName.trim().split(" ").filter(Boolean);
    if (parts.length === 0) {
      return "S";
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 1).toUpperCase();
    }
    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
  }, [displayName]);

  function handleLogout() {
    window.localStorage.removeItem("plugr_user_id");
    document.cookie = "plugr_user_id=; Path=/; Max-Age=0; SameSite=Lax";
    router.push("/auth?mode=login");
    router.refresh();
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function closeMenuOnOutsideInteraction(event: MouseEvent | TouchEvent | PointerEvent) {
      const target = event.target as Node | null;
      if (menuContainerRef.current && target && !menuContainerRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    function closeMenuOnScroll() {
      setMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeMenuOnOutsideInteraction, true);
    window.addEventListener("scroll", closeMenuOnScroll, true);

    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutsideInteraction, true);
      window.removeEventListener("scroll", closeMenuOnScroll, true);
    };
  }, [menuOpen]);

  return (
    <header className="fixed top-4 left-0 right-0 z-50">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex w-full items-center justify-between rounded-2xl border border-white/30 bg-white/60 px-4 py-2.5 text-[var(--ink)] shadow-[0_18px_50px_rgba(10,30,20,0.12)] backdrop-blur-2xl saturate-150 sm:px-6">
        <button
          type="button"
          onClick={() => router.push("/discover")}
          className="flex items-center gap-3 rounded-lg transition hover:opacity-80"
        >
          <Image
            src="/plugr.png"
            alt="Plugr"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-cover"
            priority
          />
          <span className="font-display text-xl font-semibold">Plugr</span>
        </button>

        <div ref={menuContainerRef} className="relative z-50 flex items-center gap-2 overflow-visible">
          <NotificationBell />
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            disabled={loadingIdentity}
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-2 py-1 text-left"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-semibold text-[var(--accent)]">
              {loadingIdentity ? (
                <span className="skeleton h-8 w-8 rounded-full" />
              ) : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            {loadingIdentity ? (
              <span className="skeleton h-4 w-24 rounded" />
            ) : (
              <span className="pr-2 text-sm font-semibold text-[var(--ink)]">{displayName}</span>
            )}
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-xl border border-black/10 bg-white text-[var(--ink)] shadow-lg">
              <Link
                href="/discover"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium hover:bg-black/5"
              >
                Discover
              </Link>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium hover:bg-black/5"
              >
                Profile
              </Link>
              <Link
                href="/verification"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium hover:bg-black/5"
              >
                Verification
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium hover:bg-black/5"
              >
                Settings
              </Link>
              <Link
                href="/help"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium hover:bg-black/5"
              >
                Help Center
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin/stats"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium hover:bg-black/5"
                >
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
      </div>
    </header>
  );
}
