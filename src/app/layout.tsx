import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import AuthProvider from "../components/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoneyQuest - Gamified Personal Finance",
  description: "MoneyQuest is a gamified personal finance PWA built with Next.js 15, Tailwind CSS, and Prisma.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoneyQuest",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "MoneyQuest - Gamified Personal Finance",
    description:
      "MoneyQuest is a gamified personal finance PWA built with Next.js 15, Tailwind CSS, and Prisma.",
    siteName: "MoneyQuest",
    type: "website",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: "#6366f1",
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#6366f1" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <ServiceWorkerProvider />
            <TooltipProvider>
              <AuthProvider>
                {children}
                <InstallPrompt />
              </AuthProvider>
              <Toaster richColors closeButton />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
