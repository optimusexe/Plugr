"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Section = "account" | "danger";

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

  async function handleDeleteAccount() {
    setConfirming(true);

    try {
      const response = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Unable to delete account.");
      }

      // Redirect to home and clear client-side storage
      window.localStorage.removeItem("plugr_user_id");
      router.push("/");
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
      setConfirming(false);
    }
  }

  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 p-4">
      <h3 className="font-semibold text-red-700">Delete account</h3>
      <p className="mt-1 text-sm text-red-600">
        This will permanently delete your account, profile, and all associated data. This action cannot be undone.
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
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("account");

  return (
    <main className="page-shell px-5 py-8 pt-28 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold">Settings</h1>
          <p className="mt-1 text-[var(--muted)]">Manage your account and preferences.</p>
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
