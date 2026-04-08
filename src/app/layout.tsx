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
  title: "MQ — Mindset Quotient",
  description: "Measure and develop your inner leadership capacity",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MQ",
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
      </body>
    </html>
  );
}
