"use client";

import React, { useEffect, useState } from "react";
import { AdminMutationButton } from "@/components/admin/admin-mutation-button";

type User = any;
type Profile = any;

type PendingRow = { user: User | null; profile: Profile; progress: any };
type VerifiedRow = { user: User | null; profile: Profile };

export function PaginatedPending({ initialLimit = 10 }: { initialLimit?: number }) {
  const [limit, setLimit] = useState(initialLimit);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset]);

  async function fetchPage() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/verification?status=pending&limit=${limit}&offset=${offset}`, { cache: "no-store" });
      const data = await res.json();
      setTotal(data.total ?? 0);
      setRows(data.rows ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pending badges</h2>
        <div className="text-sm text-[var(--muted)]">{total} awaiting review</div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-[var(--muted)]">No pending verification requests right now.</div>
      ) : (
        rows.map(({ user, profile, progress }) => (
          <article key={profile.id} className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Pending badge</p>
                <h3 className="mt-1 text-2xl font-semibold">{profile.fullName}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{user?.email}</p>
              </div>
              <div className="rounded-2xl bg-[var(--card)] px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Completion</p>
                <p className="mt-1 text-2xl font-semibold">{progress?.percentageComplete}%</p>
                <p className="text-xs text-[var(--muted)]">
                  {progress?.completedChecks}/{progress?.totalChecks} checks
                </p>
              </div>
            </div>

            <div className="mt-4 h-3 rounded-full bg-black/5">
              <div className="h-3 rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(0, Math.min(100, progress?.percentageComplete || 0))}%` }} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(progress?.checks || []).map((check: any) => (
                <span key={check.id} className={`rounded-full px-3 py-1 text-xs font-semibold ${check.completed ? "bg-emerald-100 text-emerald-700" : "bg-black/5 text-black/60"}`}>
                  {check.description}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <AdminMutationButton endpoint="/api/admin/verification" payload={{ userId: user?.id, approved: true }} label="Approve badge" busyLabel="Approving..." />
              <AdminMutationButton endpoint="/api/admin/verification" payload={{ userId: user?.id, approved: false }} label="Keep pending" busyLabel="Saving..." className="rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-black/5" />
            </div>
          </article>
        ))
      )}

      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="px-3 py-1 rounded border">Prev</button>
          <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} className="px-3 py-1 rounded border">Next</button>
        </div>
        <div className="text-sm text-[var(--muted)]">Showing {Math.min(total, offset + 1)}–{Math.min(total, offset + limit)} of {total}</div>
      </div>
    </div>
  );
}

export function PaginatedVerified({ initialLimit = 10 }: { initialLimit?: number }) {
  const [limit, setLimit] = useState(initialLimit);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<VerifiedRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset]);

  async function fetchPage() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/verification?status=verified&limit=${limit}&offset=${offset}`, { cache: "no-store" });
      const data = await res.json();
      setTotal(data.total ?? 0);
      setRows(data.rows ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Approved badges</h2>
        <div className="text-sm text-[var(--muted)]">{total} active</div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-[var(--muted)]">No approved badges yet.</div>
      ) : (
        rows.map(({ user, profile }) => (
          <article key={profile.id} className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(15,25,20,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Approved badge</p>
                <h3 className="mt-1 text-2xl font-semibold">{profile.fullName}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{user?.email}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Verified</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">Badge visible publicly</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <AdminMutationButton endpoint="/api/admin/verification" payload={{ userId: user?.id, approved: false }} label="Undo verification" busyLabel="Revoking..." className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50" />
            </div>
          </article>
        ))
      )}

      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="px-3 py-1 rounded border">Prev</button>
          <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} className="px-3 py-1 rounded border">Next</button>
        </div>
        <div className="text-sm text-[var(--muted)]">Showing {Math.min(total, offset + 1)}–{Math.min(total, offset + limit)} of {total}</div>
      </div>
    </div>
  );
}
