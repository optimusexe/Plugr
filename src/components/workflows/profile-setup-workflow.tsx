"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileMode, StudentProfile } from "@/lib/types";

type ProfileFormState = {
  profileImage: string;
  fullName: string;
  faculty: string;
  department: string;
  level: string;
  phone: string;
  email: string;
  locationText: string;
  primarySkill: string;
  otherSkill: string;
  bio: string;
  mode: ProfileMode;
};

type StepId =
  | "photo"
  | "name"
  | "faculty"
  | "department"
  | "level"
  | "location"
  | "phone"
  | "skill"
  | "otherSkill"
  | "bio"
  | "mode";

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

const LASU_LOCATION_OPTIONS = [
  "LASU Main Gate (Ojo Campus)",
  "Senate Building",
  "Buba Marwa Auditorium",
  "Aderemi Makanjuola Lecture Theatre",
  "University Library",
  "Faculty of Science Complex",
  "Faculty of Engineering Complex",
  "Faculty of Arts Complex",
  "Faculty of Education Complex",
  "Faculty of Management Sciences Complex",
  "Faculty of Social Sciences Complex",
  "Faculty of Law Complex",
  "Faculty of Environmental Sciences Complex",
  "School of Communication",
  "School of Transport",
  "Student Affairs Division",
  "LASU Health Centre",
  "Sports Centre",
  "CBT/ICT Centre",
  "College of Medicine (Ikeja)",
];

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
];

const initialState: ProfileFormState = {
  profileImage: "",
  fullName: "",
  faculty: "",
  department: "",
  level: "",
  phone: "",
  email: "",
  locationText: "",
  primarySkill: "",
  otherSkill: "",
  bio: "",
  mode: "provider",
};

export function ProfileSetupWorkflow() {
  const [userId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("plugr_user_id");
  });
  const [form, setForm] = useState<ProfileFormState>(initialState);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const steps: Array<{ id: StepId; title: string; hint: string }> = useMemo(() => {
    const base: Array<{ id: StepId; title: string; hint: string }> = [
      { id: "photo", title: "Add your profile photo", hint: "Use a clear face photo for trust and faster responses." },
      { id: "name", title: "What is your full name?", hint: "Use your real name as it appears on campus records." },
      { id: "faculty", title: "Select your faculty", hint: "Choose your current faculty." },
      { id: "department", title: "Enter your department", hint: "Type your department name." },
      { id: "level", title: "Select your level", hint: "Pick your current level." },
      { id: "location", title: "Choose your campus location", hint: "Pick where you are usually available on campus." },
      { id: "phone", title: "What phone number should students call?", hint: "Use an active number for quick connection." },
      { id: "skill", title: "Select your skill", hint: "Choose one main skill students can find you for." },
    ];

    if (form.primarySkill === "Other") {
      base.push({ id: "otherSkill", title: "Tell us your skill", hint: "Enter the skill that best describes what you offer." });
    }

    base.push(
      { id: "bio", title: "Add a short bio", hint: "Give students a quick reason to trust you." },
      { id: "mode", title: "How do you want to use Plugr?", hint: "You can offer services, request services, or both." },
    );

    return base;
  }, [form.primarySkill]);

  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  useEffect(() => {
    if (!userId) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      try {
        const [userResponse, profileResponse] = await Promise.all([
          fetch(`/api/auth/me?userId=${userId}`),
          fetch(`/api/profile?userId=${userId}`),
        ]);

        if (!userResponse.ok || !profileResponse.ok) {
          throw new Error("Unable to load user profile.");
        }

        const userData = (await userResponse.json()) as {
          user: { fullName: string; email: string };
        };
        const profileData = (await profileResponse.json()) as { profile: StudentProfile | null };

        if (!profileData.profile) {
          setForm((prev) => ({ ...prev, fullName: userData.user.fullName, email: userData.user.email }));
          return;
        }

        const loadedSkill = profileData.profile.primarySkill || "";
        const matchedSkill = SKILL_OPTIONS.includes(loadedSkill) ? loadedSkill : loadedSkill ? "Other" : "";

        setForm({
          profileImage: profileData.profile.profileImage || "",
          fullName: profileData.profile.fullName,
          faculty: profileData.profile.faculty,
          department: profileData.profile.department,
          level: profileData.profile.level,
          phone: profileData.profile.phone,
          email: profileData.profile.email || userData.user.email,
          locationText: profileData.profile.locationText,
          primarySkill: matchedSkill,
          otherSkill: matchedSkill === "Other" ? loadedSkill : "",
          bio: profileData.profile.bio || "",
          mode: profileData.profile.mode,
        });
        setAvatarPreview(profileData.profile.profileImage || "");
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

  const resolvedSkill = form.primarySkill === "Other" ? form.otherSkill.trim() : form.primarySkill;

  function isCurrentStepValid(): boolean {
    switch (currentStep.id) {
      case "photo":
        return true;
      case "name":
        return form.fullName.trim().length > 2;
      case "faculty":
        return Boolean(form.faculty);
      case "department":
        return form.department.trim().length > 1;
      case "level":
        return Boolean(form.level);
      case "location":
        return Boolean(form.locationText);
      case "phone":
        return form.phone.trim().length >= 10;
      case "skill":
        return Boolean(form.primarySkill);
      case "otherSkill":
        return form.otherSkill.trim().length > 1;
      case "bio":
        return true;
      case "mode":
        return Boolean(form.mode);
      default:
        return false;
    }
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    setError(null);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const dataUrl = String(fileReader.result || "");
      setAvatarPreview(dataUrl);
      setForm((prev) => ({ ...prev, profileImage: dataUrl }));
    };
    fileReader.readAsDataURL(file);
  }

  function handleNext() {
    if (!isCurrentStepValid()) {
      setError("Please complete this step before continuing.");
      return;
    }

    setError(null);
    setMessage(null);
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function handleBack() {
    setError(null);
    setMessage(null);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!userId) {
      setError("Authentication session missing. Please login again.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          profileImage: form.profileImage || undefined,
          fullName: form.fullName,
          faculty: form.faculty,
          department: form.department,
          level: form.level,
          phone: form.phone,
          email: form.email,
          locationText: form.locationText,
          primarySkill: resolvedSkill,
          bio: form.bio,
          mode: form.mode,
        }),
      });

      const data = (await response.json()) as { error?: string; profile?: StudentProfile };
      if (!response.ok || !data.profile) {
        throw new Error(data.error || "Unable to save profile.");
      }

      setMessage("Profile saved successfully. You can now access the main app.");
      router.push("/discover");
      router.refresh();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="rounded-2xl border border-black/10 bg-white p-5 text-sm">Loading profile...</p>;
  }

  function renderStepField() {
    switch (currentStep.id) {
      case "photo":
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-28 w-28 overflow-hidden rounded-full border border-black/10 bg-white">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">No photo</div>
                )}
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm"
            />
          </div>
        );
      case "name":
        return (
          <input
            required
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm"
          />
        );
      case "faculty":
        return (
          <select
            required
            value={form.faculty}
            onChange={(event) => setForm((prev) => ({ ...prev, faculty: event.target.value }))}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm"
          >
            <option value="">Select faculty</option>
            {FACULTY_OPTIONS.map((faculty) => (
              <option key={faculty} value={faculty}>
                {faculty}
              </option>
            ))}
          </select>
        );
      case "department":
        return (
          <input
            required
            placeholder="e.g. Computer Science"
            value={form.department}
            onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm"
          />
        );
      case "level":
        return (
          <select
            required
            value={form.level}
            onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm"
          >
            <option value="">Select level</option>
            {LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        );
      case "location":
        return (
          <select
            required
            value={form.locationText}
            onChange={(event) => setForm((prev) => ({ ...prev, locationText: event.target.value }))}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm"
          >
            <option value="">Select campus location</option>
            {LASU_LOCATION_OPTIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        );
      case "phone":
        return (
          <input
            required
            placeholder="Enter active phone number"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm"
          />
        );
      case "skill":
        return (
          <select
            required
            value={form.primarySkill}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                primarySkill: event.target.value,
                otherSkill: event.target.value === "Other" ? prev.otherSkill : "",
              }))
            }
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm"
          >
            <option value="">Select skill</option>
            {SKILL_OPTIONS.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        );
      case "otherSkill":
        return (
          <input
            required
            placeholder="Enter your skill"
            value={form.otherSkill}
            onChange={(event) => setForm((prev) => ({ ...prev, otherSkill: event.target.value }))}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm"
          />
        );
      case "bio":
        return (
          <textarea
            placeholder="Write a short intro about what you offer"
            value={form.bio}
            onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
            className="min-h-28 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm"
          />
        );
      case "mode":
        return (
          <select
            value={form.mode}
            onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value as ProfileMode }))}
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm"
          >
            <option value="provider">I provide services</option>
            <option value="requester">I request services</option>
            <option value="both">I do both</option>
          </select>
        );
      default:
        return null;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          <span>
            Step {stepIndex + 1} of {steps.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-black/10">
          <div className="h-2 rounded-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h2 className="font-[var(--font-display)] text-2xl font-semibold">{currentStep.title}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">{currentStep.hint}</p>

      <div className="mt-5">{renderStepField()}</div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={stepIndex === 0}
          className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Back
        </button>

        {stepIndex < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={saving || !resolvedSkill}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Finish setup"}
          </button>
        )}
      </div>

      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
    </form>
  );
}
