import type { Metadata, Viewport } from "next";
import { Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ImagePal — Local Image Editor",
  description:
    "A powerful, local-first image editor with crop, filters, adjustments, layers, resize, compress, and format conversion. All processing runs in your browser.",
  keywords: [
    "image editor",
    "photo editor",
    "online image editor",
    "local-first",
    "browser image processing",
    "crop image",
    "image filters",
    "layers",
    "resize",
    "compress image",
    "format converter",
    "webp to png",
    "png to jpg",
  ],
  authors: [{ name: "Musa Musakannike" }],
  creator: "Musa Musakannike",
  publisher: "ImagePal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "ImagePal — Professional Local Image Editor",
    description: "Edit images professionally directly in your browser. Fast, secure, and local-first.",
    url: "https://imagepal.codiac.online",
    siteName: "ImagePal",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ImagePal Editor Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImagePal — Professional Local Image Editor",
    description: "Edit images professionally directly in your browser. Fast, secure, and local-first.",
    creator: "@musakannike",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://imagepal.codiac.online",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
