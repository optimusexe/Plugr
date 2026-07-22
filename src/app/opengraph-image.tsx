import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Plugr - Campus Talent Map";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          {/* Left side */}
          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between", padding: 54 }}>
            {/* Logo row */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src="https://useplugr.app/plugr.png"
                width={64}
                height={64}
                alt=""
                style={{ display: "flex", width: 64, height: 64, borderRadius: 14, objectFit: "cover" }}
              />
              <div style={{ display: "flex", flexDirection: "column", marginLeft: 16 }}>
                <span style={{ display: "flex", fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#64748B" }}>Plugr</span>
                <span style={{ display: "flex", fontSize: 16, color: "#64748B" }}>Campus talent discovery</span>
              </div>
            </div>

            {/* Headline */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h1 style={{ display: "flex", fontSize: 72, lineHeight: 1, letterSpacing: -3, margin: 0, fontWeight: 800 }}>Find the talent.</h1>
              <h1 style={{ display: "flex", fontSize: 72, lineHeight: 1, letterSpacing: -3, margin: 0, marginTop: 4, fontWeight: 400, color: "#0F766E" }}>Be the talent.</h1>
              <p style={{ display: "flex", fontSize: 22, lineHeight: 1.4, margin: 0, marginTop: 20, color: "#475569", maxWidth: 600 }}>The all-in-one discovery layer for students and professionals on campus.</p>
            </div>

            {/* Bottom bar */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ display: "flex", fontSize: 16, color: "#64748B" }}>Search Plugr</span>
              <span style={{ display: "flex", marginLeft: 12, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>useplugr.app</span>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 380, padding: 44, background: "rgba(255,255,255,0.72)", borderLeft: "1px solid rgba(15, 23, 42, 0.06)" }}>
            {/* Large logo */}
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
                }}
              >
                <img
                  src="https://useplugr.app/plugr.png"
                  width={160}
                  height={160}
                  alt=""
                  style={{ display: "flex", width: 160, height: 160, objectFit: "cover" }}
                />
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, background: "#16A34A" }} />
                <span style={{ display: "flex", marginLeft: 8, fontSize: 15, color: "#475569", fontWeight: 600 }}>Campus marketplace</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, background: "#0F766E" }} />
                <span style={{ display: "flex", marginLeft: 8, fontSize: 15, color: "#475569", fontWeight: 600 }}>Student-powered services</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, background: "#D97706" }} />
                <span style={{ display: "flex", marginLeft: 8, fontSize: 15, color: "#475569", fontWeight: 600 }}>Verified &amp; trusted providers</span>
              </div>
            </div>

            {/* URL + badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", fontSize: 20, fontWeight: 800, color: "#0F172A" }}>useplugr.app</span>
              <div style={{ display: "flex", padding: "10px 16px", borderRadius: 14, background: "#0F172A", color: "white", fontSize: 16, fontWeight: 700 }}>
                Plugr
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
