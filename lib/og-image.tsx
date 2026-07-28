import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

// Shared social-card renderer used by both app/opengraph-image.tsx and
// app/twitter-image.tsx so the two stay pixel-identical. Colors mirror
// globals.css (bg #000, text #fff, secondary #aab0b6, accent #1d9bf0).

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteConfig.name} — Software Developer & Researcher`;

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#000000",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>
          {siteConfig.name}
        </div>
        <div style={{ marginTop: 24, fontSize: 40, color: "#aab0b6" }}>
          Software Developer &amp; Researcher
        </div>
        <div style={{ marginTop: 48, height: 8, width: 180, backgroundColor: "#1d9bf0", borderRadius: 4 }} />
      </div>
    ),
    { ...size }
  );
}
