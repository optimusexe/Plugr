"use client";

import { FormEvent, useState } from "react";
import type { ProfileMode, StudentProfile } from "@/lib/types";

type RegisterFormState = {
  fullName: string;
  faculty: string;
  department: string;
  level: string;
  phone: string;
  email: string;
  locationText: string;
  mapLink: string;
  primarySkill: string;
  bio: string;
  mode: ProfileMode;
};

const initialState: RegisterFormState = {
  fullName: "",
  faculty: "",
  department: "",
  level: "",
  phone: "",
  email: "",
  locationText: "",
  mapLink: "",
  primarySkill: "",
  bio: "",
  mode: "provider",
};

export function RegisterWorkflow() {
  const [form, setForm] = useState<RegisterFormState>(initialState);
  const [busy, setBusy] = useState(false);
  const [savedProfile, setSavedProfile] = useState<StudentProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [switchProfileId, setSwitchProfileId] = useState("");
  const [switchMode, setSwitchMode] = useState<ProfileMode>("requester");
  const [switchResult, setSwitchResult] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSavedProfile(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Registration failed.");
      }

      const data = (await response.json()) as { profile: StudentProfile };
      setSavedProfile(data.profile);
      setForm(initialState);
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onSwitchMode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSwitchResult(null);

    if (!switchProfileId.trim()) {
      setSwitchResult("Enter a valid profile ID.");
      return;
    }

    const response = await fetch(`/api/profiles/${switchProfileId.trim()}/mode`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: switchMode }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setSwitchResult(data.error || "Unable to switch mode.");
      return;
    }

    setSwitchResult(`Role updated to ${switchMode}.`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="font-[var(--font-display)] text-2xl font-semibold">Create your student profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Full name"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            className="rounded-xl border border-black/15 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Faculty"
            value={form.faculty}
            onChange={(event) => setForm((prev) => ({ ...prev, faculty: event.target.value }))}
            className="rounded-xl border border-black/15 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Department"
            value={form.department}
            onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))}
            className="rounded-xl border border-black/15 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Level (e.g. 300L)"
            value={form.level}
            onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
            className="rounded-xl border border-black/15 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Phone"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="rounded-xl border border-black/15 px-3 py-2 text-sm"
          />
          <input
            placeholder="Email (optional)"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="rounded-xl border border-black/15 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Campus location"
            value={form.locationText}
            onChange={(event) => setForm((prev) => ({ ...prev, locationText: event.target.value }))}
            className="rounded-xl border border-black/15 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            placeholder="Google Maps link (optional)"
            value={form.mapLink}
            onChange={(event) => setForm((prev) => ({ ...prev, mapLink: event.target.value }))}
            className="rounded-xl border border-black/15 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            placeholder="Primary skill"
            value={form.primarySkill}
            onChange={(event) => setForm((prev) => ({ ...prev, primarySkill: event.target.value }))}
            className="rounded-xl border border-black/15 px-3 py-2 text-sm sm:col-span-2"
          />
          <textarea
            placeholder="Short bio"
            value={form.bio}
            onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
            className="min-h-24 rounded-xl border border-black/15 px-3 py-2 text-sm sm:col-span-2"
          />
          <select
            value={form.mode}
            onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value as ProfileMode }))}
            className="rounded-xl border border-black/15 px-3 py-2 text-sm sm:col-span-2"
          >
            <option value="provider">Provider mode</option>
            <option value="requester">Requester mode</option>
            <option value="both">Both modes</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Submitting..." : "Submit profile"}
        </button>

        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {savedProfile ? (
          <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            Profile created with ID {savedProfile.id}. Verification is currently pending.
          </p>
        ) : null}
      </form>

      <aside className="space-y-4">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-[var(--font-display)] text-xl font-semibold">Verification workflow</h3>
          <ol className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>1. Student submits profile and service details.</li>
            <li>2. Account enters pending state.</li>
            <li>3. Admin verification updates profile trust state.</li>
            <li>4. Verified profiles rank above unverified providers.</li>
          </ol>
        </div>

        <form onSubmit={onSwitchMode} className="rounded-2xl border border-black/10 bg-white p-5">
          <h3 className="font-[var(--font-display)] text-xl font-semibold">Switch role mode</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Use your profile ID to switch between roles anytime.</p>
          <input
            value={switchProfileId}
            onChange={(event) => setSwitchProfileId(event.target.value)}
            placeholder="Profile ID"
            className="mt-3 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
          />
          <select
            value={switchMode}
            onChange={(event) => setSwitchMode(event.target.value as ProfileMode)}
            className="mt-3 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
          >
            <option value="provider">Provider</option>
            <option value="requester">Requester</option>
            <option value="both">Both</option>
          </select>
          <button type="submit" className="mt-3 rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold">
            Update mode
          </button>
          {switchResult ? <p className="mt-3 rounded-xl bg-black/5 p-3 text-sm">{switchResult}</p> : null}
        </form>
      </aside>
    </div>
  );
}
