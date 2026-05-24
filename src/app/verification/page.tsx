import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { getVerificationProgress } from "@/lib/verification-store";

export const metadata = {
  title: "Verification Checklist - Plugr",
  description: "Complete your verification to build trust in the Plugr community",
};

async function getVerificationData(userId: string) {
  try {
    return getVerificationProgress(userId);
  } catch (error) {
    console.error("Error loading verification data:", error);
    return null;
  }
}

const CHECK_LABELS: Record<string, { title: string; description: string }> = {
  email_verified: {
    title: "School Email",
    description: "Verify a LASU student email ending with @st.lasu.edu.ng.",
  },
  faculty_id_verified: {
    title: "Faculty/Student ID",
    description: "Upload a valid LASU ID card photo for identity confirmation.",
  },
  profile_photo_verified: {
    title: "Profile Picture",
    description: "Add a clear profile image so people can recognize you.",
  },
  profile_complete: {
    title: "Complete Profile",
    description: "Fill required details like faculty, department, and location.",
  },
  bio_verified: {
    title: "Bio and Skill",
    description: "Write a bio and include at least one service skill.",
  },
};

function resolveActionUrl(checkType: string, fallback?: string) {
  if (checkType === "email_verified") return "/verification/email";
  if (checkType === "faculty_id_verified") return "/verification/id";
  if (checkType === "profile_photo_verified") return "/profile/edit";
  if (checkType === "profile_complete") return "/profile/edit";
  if (checkType === "bio_verified") return "/profile/edit";
  return fallback || "/verification";
}

export default async function VerificationPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("plugr_user_id")?.value;

  if (!userId) {
    redirect("/auth?mode=login");
  }

  const verificationData = await getVerificationData(userId);

  if (!verificationData) {
    return (
      <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
        <AppHeader />
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-900">Verification unavailable</h1>
            <p className="mt-2 text-sm text-red-700">Failed to load your verification status. Please try again.</p>
          </div>
        </div>
      </main>
    );
  }

  const completionPercentage = verificationData.percentageComplete;
  const completedCount = verificationData.completedChecks;
  const totalCount = verificationData.totalChecks;
  const isFullyVerified = completionPercentage === 100;

  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />

      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-black/10 bg-[var(--card)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Trust and Safety</p>
          <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold">Verification Checklist</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Complete each step to prove your LASU student identity and increase your visibility in discovery.
          </p>

          {isFullyVerified ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">You are verified.</p>
              <p className="mt-1">
                Your verified badge is now visible on discovery and on your profile. Updating your profile will place the badge back under review.
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>
                  {completedCount} of {totalCount} checks complete
                </span>
                <span className="font-semibold text-[var(--ink)]">{completionPercentage}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ${
                isFullyVerified
                  ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "bg-black/5 text-[var(--muted)]"
              }`}
            >
              {isFullyVerified ? "Fully verified" : "In progress"}
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {verificationData.checks.map((check) => {
            const label =
              CHECK_LABELS[check.checkType] ??
              ({ title: check.checkType, description: check.description } as {
                title: string;
                description: string;
              });

            const actionUrl = resolveActionUrl(check.checkType, check.actionUrl);

            return (
              <article
                key={check.id}
                className={`rounded-2xl border p-5 transition-colors ${
                  check.completed
                    ? "border-[var(--accent)]/30 bg-[var(--card)]"
                    : "border-black/10 bg-[var(--card)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-xl">
                    {check.icon}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      check.completed
                        ? "bg-[var(--accent)] text-white"
                        : "bg-black/10 text-[var(--muted)]"
                    }`}
                  >
                    {check.completed ? "Done" : "Pending"}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-[var(--ink)]">{label.title}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{label.description}</p>

                {check.completedAt ? (
                  <p className="mt-4 text-xs font-medium text-[var(--accent)]">
                    Completed {new Date(check.completedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                ) : (
                  <Link
                    href={actionUrl}
                    className="mt-4 inline-flex items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent)]/90"
                  >
                    Start step
                  </Link>
                )}
              </article>
            );
          })}
        </section>

        <div className="flex justify-center">
          <Link
            href="/profile"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
          >
            Back to profile
          </Link>
        </div>
      </div>
    </main>
  );
}