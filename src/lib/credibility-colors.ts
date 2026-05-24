/**
 * Credibility color mapping utility
 * Maps credibility scores (0-100) to color levels with visual indicators
 */

export type CredibilityLevel = "critical" | "low" | "moderate" | "good" | "excellent";

export interface CredibilityColor {
  level: CredibilityLevel;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

const CREDIBILITY_RANGES: Array<{
  min: number;
  max: number;
  level: CredibilityLevel;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}> = [
  {
    min: 0,
    max: 10,
    level: "critical",
    label: "Critical",
    bgClass: "bg-red-100",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
  {
    min: 11,
    max: 20,
    level: "low",
    label: "Low",
    bgClass: "bg-orange-100",
    textClass: "text-orange-700",
    borderClass: "border-orange-200",
  },
  {
    min: 21,
    max: 30,
    level: "moderate",
    label: "Moderate",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-700",
    borderClass: "border-yellow-200",
  },
  {
    min: 31,
    max: 60,
    level: "good",
    label: "Good",
    bgClass: "bg-amber-100",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  {
    min: 61,
    max: 100,
    level: "excellent",
    label: "Excellent",
    bgClass: "bg-green-100",
    textClass: "text-green-700",
    borderClass: "border-green-200",
  },
];

/**
 * Get credibility color information for a given score
 * @param score - Credibility score (0-100)
 * @returns CredibilityColor object with styling classes and metadata
 */
export function getCredibilityColor(score: number | null | undefined): CredibilityColor {
  const normalizedScore = score != null ? Math.max(0, Math.min(100, score)) : 0;

  const range = CREDIBILITY_RANGES.find((r) => normalizedScore >= r.min && normalizedScore <= r.max);

  if (!range) {
    // Default to critical if out of range
    return {
      level: "critical",
      label: "Unknown",
      bgClass: "bg-red-100",
      textClass: "text-red-700",
      borderClass: "border-red-200",
    };
  }

  return {
    level: range.level,
    label: range.label,
    bgClass: range.bgClass,
    textClass: range.textClass,
    borderClass: range.borderClass,
  };
}

/**
 * Get the credibility level only (without styling)
 * @param score - Credibility score (0-100)
 * @returns The credibility level
 */
export function getCredibilityLevel(score: number | null | undefined): CredibilityLevel {
  const color = getCredibilityColor(score);
  return color.level;
}

/**
 * Format credibility display text with badge styling
 * @param score - Credibility score (0-100)
 * @returns Object with formatted score text and level info
 */
export function formatCredibilityScore(score: number | null | undefined) {
  const displayScore = Number.isFinite(Number(score)) ? Number(score).toFixed(1) : "—";
  const color = getCredibilityColor(score as number);

  return {
    displayScore,
    color,
  };
}
