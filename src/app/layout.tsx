import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MQ — Mindset Quotient®",
  description: "Measure and develop your inner leadership capacity",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MQ",
  },
  icons: {
    icon: [
      // Browser tab favicon — adapts to the user's colour scheme.
      // Light mode: dark mark (M black, Q teal). Dark mode: white mark (M white, Q teal).
      { url: "/favicon-light.png",    media: "(prefers-color-scheme: light)", type: "image/png", sizes: "64x64" },
      { url: "/favicon-light-32.png", media: "(prefers-color-scheme: light)", type: "image/png", sizes: "32x32" },
      { url: "/favicon-dark.png",     media: "(prefers-color-scheme: dark)",  type: "image/png", sizes: "64x64" },
      { url: "/favicon-dark-32.png",  media: "(prefers-color-scheme: dark)",  type: "image/png", sizes: "32x32" },
      // PWA / Android home-screen icons — branded tile background.
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0A2E2A",
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <ToastProvider>
          <main id="main-content" className="pb-20">
            {children}
          </main>
        </ToastProvider>
        <BottomNav />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
