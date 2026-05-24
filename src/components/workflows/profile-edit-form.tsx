"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileMode, ProfileProduct, StudentProfile } from "@/lib/types";
import { formatCredibilityScore } from "@/lib/credibility-colors";
import CredibilityChecklist from "@/components/profile/credibility-checklist";

type ProfileEditFormState = {
  profileImage: string;
  fullName: string;
  faculty: string;
  department: string;
  level: string;
  phone: string;
  email: string;
  locationText: string;
  primarySkill: string;
  bio: string;
  mode: ProfileMode;
  products: ProfileProduct[];
  verificationStatus?: "pending" | "verified";
};

type EditTab = "profile" | "contact" | "products";

const FACULTY_OPTIONS = [
  "School of Agriculture",
  "Faculty of Allied Health Sciences",
  "Faculty of Arts",
  "College of Medicine (Basic Medical Sciences)",
  "Faculty of Clinical Sciences",
  "School of Communication",
  "Faculty of Computing and Information Technology",
  "School of Creativity, Culture and Tourism Studies",
  "College of Medicine (Dentistry)",
  "Faculty of Education",
  "Faculty of Engineering",
  "Faculty of Environmental Sciences",
  "Faculty of Law",
  "School of Library, Archival and Information Science",
  "Faculty of Management Sciences",
  "Faculty of Science",
  "Faculty of Social Sciences",
  "School of Transport",
];

const LEVEL_OPTIONS = ["100", "200", "300", "400", "500", "600", "Postgraduate"];

const SKILL_OPTIONS = [
  "Graphics Design",
  "UI/UX Design",
  "Web Development",
  "Mobile App Development",
  "Data Analysis",
  "Photography",
  "Videography",
  "Video Editing",
  "Makeup Artistry",
  "Hair Styling",
  "Barbing",
  "Nail Technician",
  "Tailoring",
  "Fashion Design",
  "Laundry Services",
  "Cleaning Services",
  "Catering",
  "Baking",
  "Event Planning",
  "MC / Hosting",
  "Private Tutoring",
  "Math Tutoring",
  "Science Tutoring",
  "English Tutoring",
  "Programming Tutor",
  "CV Writing",
  "Assignment Help",
  "Research Assistance",
  "Social Media Management",
  "Content Writing",
  "Copywriting",
  "Digital Marketing",
  "SEO",
  "Brand Strategy",
  "Virtual Assistance",
  "Printing Services",
  "Typing Services",
  "Phone Repair",
  "Laptop Repair",
  "Electrical Repairs",
  "Interior Decoration",
  "Painting Services",
  "Fitness Training",
  "Dance Coaching",
  "Music Lessons",
  "Translation",
  "Public Speaking Coaching",
  "Photography Editing",
  "Crypto/Fintech Coaching",
  "Business Consulting",
  "Other",
];

function newProduct(): ProfileProduct {
  return {
    id: `prd_${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    price: "",
    description: "",
    image: "",
  };
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) {
    return "S";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function ProfileEditForm() {
  const [userId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem("plugr_user_id");
  });
  const [form, setForm] = useState<ProfileEditFormState | null>(null);
  const [credibilityValue, setCredibilityValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<EditTab>("profile");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [originalFullName, setOriginalFullName] = useState("");
  const router = useRouter();

  const canSave = useMemo(() => {
    if (!form) {
      return false;
    }

    return Boolean(
      form.fullName.trim() &&
        form.faculty &&
        form.department.trim() &&
        form.level &&
        form.phone.trim() &&
        form.locationText.trim() &&
        form.primarySkill &&
        form.mode,
    );
  }, [form]);

  useEffect(() => {
    if (!userId) {
      router.push("/auth?mode=login");
      return;
    }

    async function loadProfile() {
      try {
        const [userResponse, profileResponse] = await Promise.all([
          fetch(`/api/auth/me?userId=${userId}`),
          fetch(`/api/profile?userId=${userId}`),
        ]);

        if (!userResponse.ok || !profileResponse.ok) {
          throw new Error("Unable to load your profile.");
        }

        const userData = (await userResponse.json()) as { user: { fullName: string; email: string } };
        const profileData = (await profileResponse.json()) as { profile: StudentProfile | null };

        if (!profileData.profile) {
          setOriginalFullName(userData.user.fullName);
          setForm({
            profileImage: "",
            fullName: userData.user.fullName,
            faculty: "",
            department: "",
            level: "",
            phone: "",
            email: userData.user.email,
            locationText: "",
            primarySkill: "",
            bio: "",
            mode: "provider",
            products: [],
            verificationStatus: "pending",
          });
          return;
        }

        setForm({
          profileImage: profileData.profile.profileImage || "",
          fullName: profileData.profile.fullName,
          faculty: profileData.profile.faculty,
          department: profileData.profile.department,
          level: profileData.profile.level,
          phone: profileData.profile.phone,
          email: profileData.profile.email || userData.user.email,
          locationText: profileData.profile.locationText,
          primarySkill: profileData.profile.primarySkill || "",
          bio: profileData.profile.bio || "",
          mode: profileData.profile.mode,
          products: profileData.profile.products || [],
          verificationStatus: profileData.profile.verificationStatus,
        });
        setCredibilityValue(profileData.profile.credibility ?? null);
        setOriginalFullName(profileData.profile.fullName);
      } catch (requestError) {
        setError((requestError as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, userId]);

  if (!userId) {
    return null;
  }

  async function readImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read image."));
      reader.readAsDataURL(file);
    });
  }

  async function handleProfileImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !form) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setError(null);
    const imageData = await readImage(file);
    setForm((prev) => (prev ? { ...prev, profileImage: imageData } : prev));
  }

  async function handleProductImageChange(event: ChangeEvent<HTMLInputElement>, index: number) {
    const file = event.target.files?.[0];
    if (!file || !form) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setError(null);
    const imageData = await readImage(file);
    setForm((prev) => {
      if (!prev) {
        return prev;
      }
      const nextProducts = prev.products.slice();
      nextProducts[index] = { ...nextProducts[index], image: imageData };
      return { ...prev, products: nextProducts };
    });
  }

  function updateProduct(index: number, patch: Partial<ProfileProduct>) {
    setForm((prev) => {
      if (!prev) {
        return prev;
      }
      const nextProducts = prev.products.slice();
      nextProducts[index] = { ...nextProducts[index], ...patch };
      return { ...prev, products: nextProducts };
    });
  }

  function removeProduct(index: number) {
    setForm((prev) => {
      if (!prev) {
        return prev;
      }
      return { ...prev, products: prev.products.filter((_, idx) => idx !== index) };
    });
  }

  function addProduct() {
    setForm((prev) => {
      if (!prev) {
        return prev;
      }
      return { ...prev, products: [...prev.products, newProduct()] };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || !userId) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        userId,
        profileImage: form.profileImage || undefined,
        fullName: form.fullName,
        faculty: form.faculty,
        department: form.department,
        level: form.level,
        phone: form.phone,
        email: form.email,
        locationText: form.locationText,
        primarySkill: form.primarySkill,
        bio: form.bio,
        mode: form.mode,
        products: form.products.filter((product) => product.name.trim()).map((product) => ({
          ...product,
          name: product.name.trim(),
          price: product.price?.trim() || undefined,
          description: product.description?.trim() || undefined,
          image: product.image || undefined,
        })),
      };

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string; profile?: StudentProfile };
      if (!response.ok || !data.profile) {
        throw new Error(data.error || "Unable to save profile.");
      }

      setMessage("Profile updated successfully.");
      // refresh profile and credibility after save
      router.refresh();
      try {
        const refreshed = await fetch(`/api/profile?userId=${userId}`);
        if (refreshed.ok) {
          const d = await refreshed.json();
          setCredibilityValue(d.profile?.credibility ?? null);
        }
      } catch (e) {
        // ignore
      }
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-5">
        <div className="skeleton h-9 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
        </div>
        <div className="skeleton h-10 w-32 rounded-lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-black/10 bg-white p-5">
      {/* Credibility management widget (private profile) */}
      <div className="rounded-xl border border-black/10 bg-[var(--card)] p-4 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Credibility</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="inline-flex items-center gap-3">
              <span className="text-sm text-[var(--muted)]">Your score</span>
              <span className="rounded-md bg-black/5 px-2 py-1 font-semibold text-sm">
                {credibilityValue != null && Number.isFinite(Number(credibilityValue))
                  ? Number(credibilityValue).toFixed(1)
                  : "—"}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!userId) return;
                try {
                  setLoading(true);
                  await fetch('/api/profile/recompute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                  });
                  const refreshed = await fetch(`/api/profile?userId=${userId}`);
                  if (refreshed.ok) {
                    const d = await refreshed.json();
                    setCredibilityValue(d.profile?.credibility ?? null);
                    setMessage('Credibility refreshed');
                  }
                } catch (e) {
                  setError('Unable to refresh credibility.');
                } finally {
                  setLoading(false);
                }
              }}
              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold"
            >
              Refresh
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">Shows actions you can take to increase your credibility over time.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Quick breakdown</p>
          <p className="text-xs text-[var(--muted)] mt-1">Profile + Verification: 50 pts • Reviews: 50 pts</p>
        </div>

        <CredibilityChecklist profile={form} />
      </div>
      <div className="rounded-xl border border-black/10 bg-[var(--card)] p-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              activeTab === "profile" ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink)]"
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              activeTab === "contact" ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink)]"
            }`}
          >
            Contact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              activeTab === "products" ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink)]"
            }`}
          >
            Products
          </button>
        </div>
      </div>

      {form.verificationStatus === "verified" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Verification disclaimer</p>
          <p className="mt-1">If you change your name, your verified badge will go back under review.</p>
          {form.fullName.trim() !== originalFullName.trim() ? (
            <p className="mt-2 font-semibold">Changing your name now will send your verified badge back under review until it is checked again.</p>
          ) : null}
        </div>
      ) : null}

      {activeTab === "profile" ? (
        <section className="space-y-4 rounded-xl border border-black/10 bg-[var(--card)] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Profile photo</p>
            <p className="text-xs text-[var(--muted)]">Click photo to update.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label htmlFor="profile-image" className="cursor-pointer">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-black/15 bg-white">
                {form.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-[var(--accent)]">{initialsFromName(form.fullName)}</span>
                )}
              </div>
            </label>
            <input id="profile-image" type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
            <p className="text-sm text-[var(--muted)]">Tap image to replace profile picture.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-[var(--muted)]">
              Full name
              <input
                value={form.fullName}
                onChange={(event) => setForm((prev) => (prev ? { ...prev, fullName: event.target.value } : prev))}
                className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm font-medium text-[var(--muted)]">
              Skill
              <select
                value={form.primarySkill}
                onChange={(event) => setForm((prev) => (prev ? { ...prev, primarySkill: event.target.value } : prev))}
                className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
                required
              >
                <option value="">Select skill</option>
                {SKILL_OPTIONS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-[var(--muted)] sm:col-span-2">
              Bio
              <textarea
                value={form.bio}
                onChange={(event) => setForm((prev) => (prev ? { ...prev, bio: event.target.value } : prev))}
                className="mt-1 min-h-24 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-[var(--muted)] sm:col-span-2">
              Mode
              <select
                value={form.mode}
                onChange={(event) => setForm((prev) => (prev ? { ...prev, mode: event.target.value as ProfileMode } : prev))}
                className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              >
                <option value="provider">I provide services</option>
                <option value="requester">I request services</option>
                <option value="both">I do both</option>
              </select>
            </label>
          </div>
        </section>
      ) : null}

      {activeTab === "contact" ? (
        <section className="grid gap-3 rounded-xl border border-black/10 bg-[var(--card)] p-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[var(--muted)]">
            Phone
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, phone: event.target.value } : prev))}
              className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="text-sm font-medium text-[var(--muted)]">
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, email: event.target.value } : prev))}
              className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              type="email"
            />
          </label>
          <label className="text-sm font-medium text-[var(--muted)] sm:col-span-2">
            Campus location
            <input
              value={form.locationText}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, locationText: event.target.value } : prev))}
              className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="text-sm font-medium text-[var(--muted)]">
            Faculty
            <select
              value={form.faculty}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, faculty: event.target.value } : prev))}
              className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              required
            >
              <option value="">Select faculty</option>
              {FACULTY_OPTIONS.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-[var(--muted)]">
            Department
            <input
              value={form.department}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, department: event.target.value } : prev))}
              className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="text-sm font-medium text-[var(--muted)] sm:col-span-2">
            Level
            <select
              value={form.level}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, level: event.target.value } : prev))}
              className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              required
            >
              <option value="">Select level</option>
              {LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}

      {activeTab === "products" ? (
        <section className="rounded-xl border border-black/10 bg-[var(--card)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Products</p>
              <p className="text-xs text-[var(--muted)]">Upload products/services you offer.</p>
            </div>
            <button type="button" onClick={addProduct} className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm font-semibold">
              Add product
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {form.products.length === 0 ? <p className="text-sm text-[var(--muted)]">No products added yet.</p> : null}
            {form.products.map((product, index) => (
              <div key={product.id} className="rounded-lg border border-black/10 bg-white p-3">
                <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
                  <label htmlFor={`product-image-${product.id}`} className="cursor-pointer">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-black/15 bg-[var(--card)] text-xs text-[var(--muted)]">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt={product.name || "Product"} className="h-full w-full object-cover" />
                      ) : (
                        "Image"
                      )}
                    </div>
                  </label>
                  <div className="space-y-2">
                    <input
                      placeholder="Product name"
                      value={product.name}
                      onChange={(event) => updateProduct(index, { name: event.target.value })}
                      className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Price (optional)"
                      value={product.price || ""}
                      onChange={(event) => updateProduct(index, { price: event.target.value })}
                      className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
                    />
                    <textarea
                      placeholder="Short description"
                      value={product.description || ""}
                      onChange={(event) => updateProduct(index, { description: event.target.value })}
                      className="min-h-20 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <input
                    id={`product-image-${product.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(event) => void handleProductImageChange(event, index)}
                    className="text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !canSave}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
    </form>
  );
}
