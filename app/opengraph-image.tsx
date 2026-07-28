import { renderOgImage, alt, size, contentType } from "@/lib/og-image";

export { alt, size, contentType };
export const runtime = "edge";

export default function OpengraphImage() {
  return renderOgImage();
}
