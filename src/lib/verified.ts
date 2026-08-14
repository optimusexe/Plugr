import type { StudentProfile } from "@/lib/types";

export function isVerifiedProvider(profile: StudentProfile | null | undefined): profile is StudentProfile {
  return Boolean(
    profile &&
      profile.verificationStatus === "verified" &&
      (profile.mode === "provider" || profile.mode === "both"),
  );
}
