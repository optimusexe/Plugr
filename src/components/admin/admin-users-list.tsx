"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AdminMutationButton } from "@/components/admin/admin-mutation-button";
import type { AdminUserRow } from "@/lib/admin-store";

type AdminUsersListProps = {
  users: AdminUserRow[];
};

export function AdminUsersList({ users }: AdminUsersListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return users;
    }

    const query = search.toLowerCase();
    return users.filter(({ user, profile }) => {
      const name = user.fullName.toLowerCase();
      const email = user.email.toLowerCase();
      const skill = profile?.primarySkill?.toLowerCase() || "";
      const id = user.id.toLowerCase();

      return name.includes(query) || email.includes(query) || skill.includes(query) || id.includes(query);
    });
  }, [users, search]);

  return (
    <>
      <div className="mt-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, email, skill, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
        <div className="grid gap-4 border-b border-black/10 px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] md:grid-cols-[1.3fr_1.1fr_0.8fr_0.9fr_1fr_1fr]">
          <span>User</span>
          <span>Profile</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-black/10">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--muted)]">
              {search ? "No users found matching your search." : "No users yet."}
            </div>
          ) : (
            filtered.map(({ user, profile }) => (
              <div key={user.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1.3fr_1.1fr_0.8fr_0.9fr_1fr_1fr] md:items-center">
                <div>
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-sm text-[var(--muted)]">{user.id}</p>
                </div>
                <div>
                  <p className="font-semibold">{profile ? profile.mode : "No profile"}</p>
                  <p className="text-sm text-[var(--muted)]">{profile ? profile.primarySkill || "Skill not set" : "Setup required"}</p>
                </div>
                <p className="text-sm text-[var(--muted)]">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isAdmin ? "bg-[var(--accent)] text-white" : "bg-black/5 text-black/60"}`}>
                    {user.isAdmin ? "Admin" : "User"}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.verified ? "bg-emerald-100 text-emerald-700" : "bg-black/5 text-black/60"}`}>
                    {user.verified ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {profile ? `${profile.verificationStatus} badge` : "No profile"}
                </div>
                <div>
                  <AdminMutationButton
                    endpoint="/api/admin/users"
                    payload={{ userId: user.id, isAdmin: !user.isAdmin }}
                    label={user.isAdmin ? "Remove admin" : "Make admin"}
                    busyLabel={user.isAdmin ? "Removing..." : "Promoting..."}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-60 ${
                      user.isAdmin ? "bg-red-600" : "bg-[var(--accent)]"
                    }`}
                  />
                  {profile ? (
                    <Link
                      href={`/discover/provider/${profile.id}`}
                      className="mt-2 inline-flex text-xs font-semibold text-[var(--accent)]"
                    >
                      View public profile
                    </Link>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
