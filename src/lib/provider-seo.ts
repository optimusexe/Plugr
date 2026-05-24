import type { StudentProfile } from "@/lib/types";
import { getCredibilityColor } from "@/lib/credibility-colors";

function cleanText(value?: string | null): string {
  return value ? value.trim().replace(/\s+/g, " ") : "";
}

function fallbackText(value: string, fallback: string): string {
  return value.length > 0 ? value : fallback;
}

export function getProviderDisplaySkill(provider: StudentProfile): string {
  return fallbackText(cleanText(provider.primarySkill), "Service provider");
}

export function getProviderSeoTitle(provider: StudentProfile): string {
  const skill = getProviderDisplaySkill(provider);
  return `${provider.fullName} - ${skill} on Plugr | Credibility ${formatCredibilityValue(provider.credibility)}`;
}

export function getProviderSeoDescription(provider: StudentProfile): string {
  const skill = getProviderDisplaySkill(provider);
  const bio = cleanText(provider.bio);
  const location = cleanText(provider.locationText);
  const profileBits = [skill, location, bio].filter(Boolean);

  return fallbackText(
    profileBits.join(". "),
    `${provider.fullName} offers ${skill} on Plugr. View their profile, credibility score, and contact details.`,
  );
}

export function getProviderShareSubtitle(provider: StudentProfile): string {
  const skill = getProviderDisplaySkill(provider);
  const location = cleanText(provider.locationText);
  const parts = [skill, location].filter(Boolean);
  return fallbackText(parts.join(" • "), "Campus talent profile");
}

export function getProviderBioSnippet(provider: StudentProfile, maxLength = 120): string {
  const bio = cleanText(provider.bio);
  if (!bio) {
    return "No bio provided yet.";
  }

  if (bio.length <= maxLength) {
    return bio;
  }

  return `${bio.slice(0, maxLength).trimEnd()}...`;
}

export function getProviderCredibilityLabel(credibility: number): string {
  return getCredibilityColor(credibility).label;
}

export function formatCredibilityValue(credibility: number): string {
  const normalized = Number.isFinite(credibility) ? Math.max(0, Math.min(100, credibility)) : 0;
  return normalized.toFixed(1);
}
