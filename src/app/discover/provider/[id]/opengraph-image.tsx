import { ImageResponse } from "next/og";
import { getProfileById } from "@/lib/profile-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Plugr provider profile preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: PageProps) {
  const { id } = await params;

  let provider = null;
  try {
    provider = await getProfileById(id);
  } catch {
    provider = null;
  }

  const name = provider?.fullName ?? "Provider";
  const skill = provider?.primarySkill || "Service provider";
  const location = provider?.locationText || "LASU Campus";
  const score = provider?.credibility ?? 0;
  const verified = provider?.verificationStatus === "verified";
  const profileImage = provider?.profileImage?.trim();
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "S";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #F7F4EE 0%, #F0EBE0 45%, #E9F3EE 100%)",
          fontFamily: "Arial, sans-serif",
          color: "#0F172A",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 1136,
            height: 566,
            margin: 32,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 32,
            overflow: "hidden",
            background: "rgba(255,255,255,0.45)",
          }}
        >
          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between", padding: 54 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src="https://useplugr.app/plugr.png"
                width={64}
                height={64}
                style={{ display: "flex", width: 64, height: 64, borderRadius: 14, objectFit: "cover" }}
              />
              <div style={{ display: "flex", flexDirection: "column", marginLeft: 16 }}>
                <span style={{ display: "flex", fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#64748B" }}>Plugr</span>
                <span style={{ display: "flex", fontSize: 16, color: "#64748B" }}>Campus talent discovery</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <h1 style={{ display: "flex", fontSize: 64, lineHeight: 1, letterSpacing: -2, margin: 0, fontWeight: 800 }}>{name}</h1>
              <p style={{ display: "flex", fontSize: 26, lineHeight: 1.2, margin: 0, marginTop: 12, color: "#0F172A", fontWeight: 600 }}>{skill}</p>
              <p style={{ display: "flex", fontSize: 20, lineHeight: 1.3, margin: 0, marginTop: 10, color: "#475569" }}>{location}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", padding: "10px 18px", borderRadius: 12, background: "#0F172A", color: "white", fontSize: 20, fontWeight: 700 }}>
                Credibility {score.toFixed(1)}
              </div>
              {verified && (
                <div style={{ display: "flex", marginLeft: 16, padding: "10px 18px", borderRadius: 12, background: "#16A34A", color: "white", fontSize: 20, fontWeight: 700 }}>
                  Verified
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 380, padding: 44, background: "rgba(255,255,255,0.72)", borderLeft: "1px solid rgba(15, 23, 42, 0.06)" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  display: "flex",
                  width: 160,
                  height: 160,
                  borderRadius: 28,
                  overflow: "hidden",
                  border: "4px solid rgba(255,255,255,0.8)",
                  background: "linear-gradient(135deg, #0F766E 0%, #115E59 100%)",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 54,
                  fontWeight: 800,
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    width={160}
                    height={160}
                    style={{ display: "flex", width: 160, height: 160, objectFit: "cover" }}
                  />
                ) : (
                  initials
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ display: "flex", fontSize: 14, textTransform: "uppercase", letterSpacing: 1.8, color: "#64748B", fontWeight: 700 }}>Location</span>
              <span style={{ display: "flex", fontSize: 22, fontWeight: 800, lineHeight: 1.2, color: "#0F172A", marginTop: 4 }}>{location}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", fontSize: 20, fontWeight: 800, color: "#0F172A" }}>useplugr.app</span>
              <div style={{ display: "flex", padding: "10px 16px", borderRadius: 14, background: "#0F172A", color: "white", fontSize: 16, fontWeight: 700 }}>
                {verified ? "Verified" : "Plugr"}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
