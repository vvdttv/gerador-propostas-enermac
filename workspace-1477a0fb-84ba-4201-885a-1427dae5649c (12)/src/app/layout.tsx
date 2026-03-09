import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enermac - Gerador de Pré-propostas",
  description: "Sistema de geração de pré-propostas para biodigestores e geradores de energia com biogás.",
  keywords: ["Enermac", "Biodigestor", "Biogás", "Energia Renovável", "Geradores"],
  authors: [{ name: "Enermac" }],
  icons: {
    icon: "/enermac_logo.jpeg",
  },
  openGraph: {
    title: "Enermac - Gerador de Pré-propostas",
    description: "Sistema de geração de pré-propostas para biodigestores e geradores de energia com biogás.",
    siteName: "Enermac",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
