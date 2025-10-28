import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionAuthProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WiFi Payment Manager",
  description: "Sistem pembayaran WiFi bulanan dengan cicilan",
  keywords: ["WiFi", "Payment", "Manager", "Billing"],
  authors: [{ name: "WiFi Payment Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "WiFi Payment Manager",
    description: "Sistem pembayaran WiFi bulanan dengan cicilan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WiFi Payment Manager",
    description: "Sistem pembayaran WiFi bulanan dengan cicilan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionAuthProvider>
          {children}
          <Toaster 
            position="top-center"
            expand={true}
            richColors={true}
            closeButton={true}
            duration={5000}
          />
        </SessionAuthProvider>
      </body>
    </html>
  );
}
