import { ImageResponse } from "next/og";
import { getProductById } from "@/lib/product-store";
import { getProfileById } from "@/lib/profile-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Plugr Stores product preview";
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

  let product = null;
  let provider = null;
  try {
    product = await getProductById(id);
    if (product) {
      provider = await getProfileById(product.providerId);
    }
  } catch {
    product = null;
  }

  const name = product?.name ?? "Product";
  const price = product?.price ?? null;
  const category = product?.category ?? "Store product";
  const image = product?.imageUrls?.[0] ?? null;
  const providerName = provider?.fullName ?? "Verified provider";
  const verified = provider?.verificationStatus === "verified";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "P";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #F7F4EE 0%, #F0EBE0 45%, #E9F3EE 100%)",
          fontFamily: "sans-serif",
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
          {/* Left: text */}
          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between", padding: 54 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src="https://useplugr.app/plugr.png"
                width={64}
                height={64}
                alt=""
                style={{ display: "flex", width: 64, height: 64, borderRadius: 14, objectFit: "cover" }}
              />
              <div style={{ display: "flex", flexDirection: "column", marginLeft: 16 }}>
                <span style={{ display: "flex", fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#64748B" }}>Plugr Stores</span>
                <span style={{ display: "flex", fontSize: 16, color: "#64748B" }}>Shop the campus</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ display: "flex", fontSize: 20, color: "#0F766E", fontWeight: 700 }}>{category}</span>
              <h1 style={{ display: "flex", fontSize: 52, lineHeight: 1.1, letterSpacing: -2, margin: 0, marginTop: 12, fontWeight: 800 }}>{name}</h1>
              {price ? (
                <span style={{ display: "flex", fontSize: 34, marginTop: 16, fontWeight: 800, color: "#0F766E" }}>{price}</span>
              ) : null}
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ display: "flex", fontSize: 20, color: "#475569", fontWeight: 600 }}>{providerName}</span>
              {verified ? (
                <span style={{ display: "flex", marginLeft: 12, padding: "6px 14px", borderRadius: 999, background: "#16A34A", color: "white", fontSize: 16, fontWeight: 700 }}>
                  Verified
                </span>
              ) : null}
            </div>
          </div>

          {/* Right: image */}
          <div style={{ display: "flex", width: 420, padding: 44, background: "rgba(255,255,255,0.72)", borderLeft: "1px solid rgba(15, 23, 42, 0.06)", alignItems: "center", justifyContent: "center" }}>
            {image ? (
              <img
                src={image}
                width={330}
                height={330}
                alt=""
                style={{ display: "flex", width: 330, height: 330, borderRadius: 28, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: 330,
                  height: 330,
                  borderRadius: 28,
                  background: "linear-gradient(135deg, #0F766E 0%, #115E59 100%)",
                  color: "white",
                  fontSize: 96,
                  fontWeight: 800,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {initials}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
