import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Justicia Indigena",
  description: "Curso de Justicia Indigena",
  icons: {
    icon: "/logo-cepabol.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="facebook-domain-verification" content="j2waann1ikslritv94oartioipv59e" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
