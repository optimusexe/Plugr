"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Section = "account" | "danger";

type AccountSummary = {
  id: string;
  fullName: string;
  email: string;
  verified: boolean;
  isAdmin: boolean;
  deactivatedUntil?: string;
};

function toDateTimeLocalValue(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (input: number) => `${input}`.padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function SettingsAccountForm() {
  const [section, setSection] = useState<"password" | "email" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Unable to change password.");
      }

      setSuccess("Password changed successfully.");
      setSection(null);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const newEmail = formData.get("newEmail") as string;

    if (!newEmail) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Unable to change email.");
      }

      setSuccess("Email changed successfully.");
      setSection(null);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4">
        <button
          type="button"
          onClick={() => setSection(section === "password" ? null : "password")}
          className="w-full text-left font-semibold"
        >
          Change password
        </button>
        {section === "password" && (
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-3 border-t border-black/10 pt-4">
            <input
              type="password"
              name="oldPassword"
              placeholder="Current password"
              disabled={loading}
              className="w-full rounded-lg border border-black/10 bg-[var(--card)] px-3 py-2 text-sm outline-none disabled:opacity-60"
              required
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New password"
              disabled={loading}
              className="w-full rounded-lg border border-black/10 bg-[var(--card)] px-3 py-2 text-sm outline-none disabled:opacity-60"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              disabled={loading}
              className="w-full rounded-lg border border-black/10 bg-[var(--card)] px-3 py-2 text-sm outline-none disabled:opacity-60"
              required
            />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-4">
        <button
          type="button"
          onClick={() => setSection(section === "email" ? null : "email")}
          className="w-full text-left font-semibold"
        >
          Change email
        </button>
        {section === "email" && (
          <form onSubmit={handleEmailChange} className="mt-4 space-y-3 border-t border-black/10 pt-4">
            <input
              type="email"
              name="newEmail"
              placeholder="New email address"
              disabled={loading}
              className="w-full rounded-lg border border-black/10 bg-[var(--card)] px-3 py-2 text-sm outline-none disabled:opacity-60"
              required
            />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update email"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function SettingsDangerZone() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalMode, setModalMode] = useState<"delete" | "reactivate" | null>(null);
  const [modalPassword, setModalPassword] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deactivateUntil, setDeactivateUntil] = useState("");
  const [account, setAccount] = useState<AccountSummary | null>(null);

  useEffect(() => {
    const userId = window.localStorage.getItem("plugr_user_id");

    if (!userId) {
      router.push("/auth?mode=login");
      return;
    }

    let cancelled = false;

    async function loadAccount() {
      try {
        const response = await fetch(`/api/auth/me?userId=${userId}`);

        if (!response.ok) {
          throw new Error("Unable to load account status.");
        }

        const data = (await response.json()) as { user: AccountSummary };

        if (!cancelled) {
          setAccount(data.user);
          setDeactivateUntil(toDateTimeLocalValue(data.user.deactivatedUntil));
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
        }
      }
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const isDeactivated = useMemo(() => {
    if (!account?.deactivatedUntil) {
      return false;
    }

    return new Date(account.deactivatedUntil).getTime() > Date.now();
  }, [account?.deactivatedUntil]);

  async function handleDeactivateAccount() {
    setError("");
    setSuccess("");
    setDeactivating(true);

    try {
      const response = await fetch("/api/auth/account/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ until: new Date(deactivateUntil).toISOString() }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Unable to deactivate account.");
      }

      const data = (await response.json()) as { deactivatedUntil?: string };
      setAccount((prev) => (prev ? { ...prev, deactivatedUntil: data.deactivatedUntil } : prev));
      setSuccess("Account deactivated. You can reactivate it anytime before the chosen time.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeactivating(false);
    }
  }

  async function handleReactivateAccount() {
    // Open password modal to confirm reactivation
    setModalError("");
    setModalPassword("");
    setModalMode("reactivate");
    setShowPasswordModal(true);
  }

  async function handleDeleteAccount() {
    // Open password modal to confirm deletion
    setModalError("");
    setModalPassword("");
    setModalMode("delete");
    setShowPasswordModal(true);
  }

  async function handleModalSubmit() {
    setModalError("");
    setModalLoading(true);

    try {
      if (modalMode === "delete") {
        const response = await fetch("/api/auth/account", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmed: true, password: modalPassword }),
          credentials: "include",
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || "Unable to delete account.");
        }

        window.localStorage.removeItem("plugr_user_id");
        window.localStorage.removeItem("plugr_verification_user_id");
        router.push("/");
        router.refresh();
      } else if (modalMode === "reactivate") {
        const response = await fetch("/api/auth/account/deactivate", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: modalPassword }),
          credentials: "include",
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || "Unable to reactivate account.");
        }

        setAccount((prev) => (prev ? { ...prev, deactivatedUntil: undefined } : prev));
        setDeactivateUntil("");
        setSuccess("Account reactivated.");
      }

      setShowPasswordModal(false);
      setModalMode(null);
    } catch (err) {
      setModalError((err as Error).message);
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4">
        <h3 className="font-semibold text-[var(--ink)]">Deactivate account</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Pause your account until a chosen date. You can come back any time before that time is up.
        </p>
        {isDeactivated && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Your account is currently deactivated until {account?.deactivatedUntil ? new Date(account.deactivatedUntil).toLocaleString() : "unknown"}.
          </p>
        )}
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold text-[var(--ink)]">Reactivate date and time</label>
          <input
            type="datetime-local"
            value={deactivateUntil}
            onChange={(event) => setDeactivateUntil(event.target.value)}
            disabled={deactivating || reactivating}
            className="w-full rounded-lg border border-black/10 bg-[var(--card)] px-3 py-2 text-sm outline-none disabled:opacity-60"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDeactivateAccount}
              disabled={deactivating || reactivating || !deactivateUntil}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {deactivating ? "Saving..." : "Deactivate account"}
            </button>
            {isDeactivated && (
              <button
                type="button"
                onClick={handleReactivateAccount}
                disabled={reactivating || deactivating}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {reactivating ? "Reactivating..." : "Reactivate now"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
        <h3 className="font-semibold text-red-700">Delete account</h3>
        <p className="mt-1 text-sm text-red-600">
          This permanently removes your account and all of your data from Plugr. You can always come back later by creating a new account.
        </p>
        {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Delete account
        </button>
      ) : (
        <div className="mt-3 space-y-2 rounded-lg bg-white p-3">
          <p className="text-sm font-semibold">Are you sure? This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={confirming}
              className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={confirming}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {confirming ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </div>
        )}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Confirm {modalMode === "delete" ? "deletion" : "reactivation"}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">Enter your password to continue.</p>
            <input
              type="password"
              value={modalPassword}
              onChange={(e) => setModalPassword(e.target.value)}
              className="mt-4 w-full rounded-lg border border-black/10 bg-[var(--card)] px-3 py-2 text-sm outline-none"
              placeholder="Password"
            />
            {modalError && <p className="mt-2 text-sm text-red-700">{modalError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setModalMode(null);
                }}
                disabled={modalLoading}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                disabled={modalLoading || !modalPassword}
                className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {modalLoading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {(error || success) && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {error || success}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("account");

  return (
    <main className="page-shell px-5 py-8 pt-28 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold">Settings</h1>
          <p className="mt-1 text-[var(--muted)]">Manage your account, privacy, and access.</p>
        </div>

        <div className="mb-6 flex gap-2 border-b border-black/10">
          <button
            onClick={() => setSection("account")}
            className={`px-4 py-3 font-semibold transition ${
              section === "account"
                ? "border-b-2 border-[var(--accent)] text-[var(--ink)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setSection("danger")}
            className={`px-4 py-3 font-semibold transition ${
              section === "danger"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Danger zone
          </button>
        </div>

        {section === "account" && <SettingsAccountForm />}
        {section === "danger" && <SettingsDangerZone />}
      </div>
    </main>
  );
}
