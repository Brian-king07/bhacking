import type { Metadata, Viewport } from "next";
import { Manrope, Syne } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BHACKING — Donde lo digital encuentra la moda",
  description:
    "Catálogo BHACKING: moda curada. Consulta disponibilidad y pedidos por WhatsApp.",
  applicationName: "BHACKING",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BHACKING",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn(manrope.variable, syne.variable, "h-full antialiased")}
    >
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <PwaRegister />
        <Toaster />
      </body>
    </html>
  );
}
