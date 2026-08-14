import { ImageResponse } from "next/og";
import { getStoreBySlug } from "@/lib/store-store";
import { getProductsByProvider } from "@/lib/product-store";
import { getProfileById } from "@/lib/profile-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Plugr Stores storefront preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: PageProps) {
  const { slug } = await params;

  let store = null;
  let products: { name: string; imageUrls: string[] }[] = [];
  let provider = null;
  try {
    store = await getStoreBySlug(slug);
    if (store) {
      const [fetchedProducts, fetchedProvider] = await Promise.all([
        getProductsByProvider(store.providerId, 3),
        getProfileById(store.providerId),
      ]);
      products = fetchedProducts.map((p) => ({ name: p.name, imageUrls: p.imageUrls }));
      provider = fetchedProvider;
    }
  } catch {
    store = null;
  }

  const name = store?.name ?? "Store";
  const tagline = store?.tagline ?? "Shop verified products on campus";
  const count = products.length;
  const logo = store?.logoUrl ?? null;
  const verified = provider?.verificationStatus === "verified";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "S";

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
          {/* Left: store identity */}
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
              <h1 style={{ display: "flex", fontSize: 56, lineHeight: 1.05, letterSpacing: -2, margin: 0, fontWeight: 800 }}>{name}</h1>
              <span style={{ display: "flex", fontSize: 24, marginTop: 14, color: "#475569", fontWeight: 600 }}>{tagline}</span>
              <span style={{ display: "flex", marginTop: 18, fontSize: 18, color: "#0F766E", fontWeight: 700 }}>
                {count} product{count === 1 ? "" : "s"} • Verified store
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              {verified ? (
                <span style={{ display: "flex", padding: "6px 14px", borderRadius: 999, background: "#16A34A", color: "white", fontSize: 16, fontWeight: 700 }}>
                  Verified provider
                </span>
              ) : null}
              {products.length > 0 ? (
                <div style={{ display: "flex", marginLeft: 16 }}>
                  {products.map((p, i) => {
                    const img = p.imageUrls[0];
                    return img ? (
                      <img
                        key={`${p.name}-${i}`}
                        src={img}
                        width={56}
                        height={56}
                        alt=""
                        style={{ display: "flex", width: 56, height: 56, borderRadius: 14, objectFit: "cover", border: "2px solid white", marginLeft: i > 0 ? -14 : 0 }}
                      />
                    ) : null;
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: logo */}
          <div style={{ display: "flex", width: 420, padding: 44, background: "rgba(255,255,255,0.72)", borderLeft: "1px solid rgba(15, 23, 42, 0.06)", alignItems: "center", justifyContent: "center" }}>
            {logo ? (
              <img
                src={logo}
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
