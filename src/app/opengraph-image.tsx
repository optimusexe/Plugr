import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Plugr - Campus Talent Map";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #F7F4EE 0%, #F0EBE0 45%, #E9F3EE 100%)",
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
          <div style={{ flex: 1, padding: 54, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="https://useplugr.app/plugr.png" width={64} height={64} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#64748B" }}>Plugr</span>
                <span style={{ fontSize: 16, color: "#64748B" }}>Campus talent discovery</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
              <h1 style={{ fontSize: 76, lineHeight: 0.95, letterSpacing: -3, margin: 0, fontWeight: 800 }}>Plugr</h1>
              <p style={{ fontSize: 28, lineHeight: 1.2, margin: 0, color: "#0F172A", fontWeight: 600 }}>Find the talent. Be the talent.</p>
              <p style={{ fontSize: 22, lineHeight: 1.45, margin: 0, color: "#475569", maxWidth: 720 }}>The all-in-one discovery layer for professionals on campus.</p>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 16, color: "#64748B" }}>Search Plugr</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>useplugr.app</span>
            </div>
          </div>

          <div style={{ width: 400, padding: 44, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(255,255,255,0.72)", borderLeft: "1px solid rgba(15, 23, 42, 0.06)" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 160, height: 160, borderRadius: 999, overflow: "hidden", border: "8px solid rgba(255,255,255,0.8)", boxShadow: "0 20px 50px rgba(15,23,42,0.18)", background: "#CBD5E1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="https://useplugr.app/plugr.png" width={160} height={160} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 15, color: "#64748B" }}>Campus marketplace</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>useplugr.app</span>
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 18, background: "#0F172A", color: "white", fontSize: 18, fontWeight: 700 }}>Plugr</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
