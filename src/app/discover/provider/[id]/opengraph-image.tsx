import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/profile-store";
import {
  formatCredibilityValue,
  getProviderBioSnippet,
  getProviderCredibilityLabel,
  getProviderDisplaySkill,
  getProviderShareSubtitle,
} from "@/lib/provider-seo";

export const runtime = "nodejs";
export const alt = "Plugr provider profile preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

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

function credibilityPalette(score: number): { background: string; accent: string; text: string } {
  if (score >= 61) {
    return { background: "#E8F8EF", accent: "#16A34A", text: "#0F172A" };
  }
  if (score >= 31) {
    return { background: "#FFF7E6", accent: "#D97706", text: "#0F172A" };
  }
  if (score >= 21) {
    return { background: "#FEF9C3", accent: "#CA8A04", text: "#0F172A" };
  }
  if (score >= 11) {
    return { background: "#FFF1E5", accent: "#EA580C", text: "#0F172A" };
  }
  return { background: "#FDE8E8", accent: "#DC2626", text: "#0F172A" };
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: PageProps) {
  const { id } = await params;
  const provider = await getProfileById(id);

  if (!provider) {
    notFound();
  }

  const skill = getProviderDisplaySkill(provider);
  const bio = getProviderBioSnippet(provider, 140);
  const subtitle = getProviderShareSubtitle(provider);
  const scoreValue = Number.isFinite(provider.credibility) ? Math.max(0, Math.min(100, provider.credibility)) : 0;
  const credibilityLabel = getProviderCredibilityLabel(scoreValue);
  const palette = credibilityPalette(scoreValue);
  const initials = initialsFromName(provider.fullName);
  const profileImage = provider.profileImage?.trim();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #F7F4EE 0%, #F0EBE0 45%, #E9F3EE 100%)",
          position: "relative",
          fontFamily: "Arial, sans-serif",
          color: "#0F172A",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 32,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 32,
            display: "flex",
            overflow: "hidden",
            background: "rgba(255,255,255,0.45)",
            boxShadow: "0 30px 80px rgba(15,23,42,0.12)",
          }}
        >
          <div style={{ flex: 1.15, padding: 54, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img src="https://useplugr.app/plugr.png" width={64} height={64} style={{ borderRadius: 18 }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#64748B" }}>Plugr</span>
                <span style={{ fontSize: 16, color: "#64748B" }}>Campus talent discovery</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 630 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 14px",
                    borderRadius: 999,
                    background: palette.background,
                    color: palette.accent,
                    fontSize: 18,
                    fontWeight: 800,
                    border: `1px solid ${palette.accent}33`,
                  }}
                >
                  Credibility {formatCredibilityValue(scoreValue)}
                </span>
                <span style={{ fontSize: 18, color: "#475569", fontWeight: 700 }}>{credibilityLabel}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h1 style={{ fontSize: 76, lineHeight: 0.95, letterSpacing: -3, margin: 0, fontWeight: 800 }}>
                  {provider.fullName}
                </h1>
                <p style={{ fontSize: 28, lineHeight: 1.2, margin: 0, color: "#0F172A", fontWeight: 600 }}>{skill}</p>
                <p style={{ fontSize: 22, lineHeight: 1.45, margin: 0, color: "#475569", maxWidth: 560 }}>{subtitle}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 19, lineHeight: 1.45, margin: 0, color: "#334155", maxWidth: 620 }}>{bio}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#64748B", fontSize: 16 }}>
                <span style={{ display: "inline-flex", width: 10, height: 10, borderRadius: 999, background: "#16A34A" }} />
                <span>Shared from Plugr</span>
              </div>
            </div>
          </div>

          <div style={{ width: 400, padding: 44, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(255,255,255,0.72)", borderLeft: "1px solid rgba(15, 23, 42, 0.06)" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 999,
                  overflow: "hidden",
                  border: "8px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 20px 50px rgba(15,23,42,0.18)",
                  background: "#CBD5E1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0F172A",
                  fontSize: 54,
                  fontWeight: 800,
                }}
              >
                {profileImage ? (
                  <img src={profileImage} width={160} height={160} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  initials
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 16, textTransform: "uppercase", letterSpacing: 1.8, color: "#64748B", fontWeight: 700 }}>Location</span>
                <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2, color: "#0F172A" }}>{provider.locationText}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 16, textTransform: "uppercase", letterSpacing: 1.8, color: "#64748B", fontWeight: 700 }}>Faculty</span>
                <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2, color: "#0F172A" }}>{provider.faculty}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 16, textTransform: "uppercase", letterSpacing: 1.8, color: "#64748B", fontWeight: 700 }}>Level</span>
                <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2, color: "#0F172A" }}>{provider.level}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 15, color: "#64748B" }}>Search Plugr</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>useplugr.app</span>
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 18,
                  background: "#0F172A",
                  color: "white",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {provider.verificationStatus === "verified" ? "Verified" : "Pending review"}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
