import type { Metadata, Viewport } from "next";
import "./globals.css";

const assetBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "\uD3EC\uCEE4 \uB79C\uB364 \uB514\uD39C\uC2A4",
  description: "\uC190\uD328\uB85C \uD0C0\uC6CC\uB97C \uC18C\uD658\uD558\uACE0 \uD3EC\uCEE4 \uC871\uBCF4\uB85C \uACB0\uC18D\uD558\uB294 \uC911\uC138 \uB3C4\uD2B8 \uD0C0\uC6CC \uB514\uD39C\uC2A4",
  icons: { icon: `${assetBase}/favicon.svg`, shortcut: `${assetBase}/favicon.svg` },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
