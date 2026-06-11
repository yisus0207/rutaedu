import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

import type { Viewport } from "next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "RutaEdu | Encuentra tu camino académico",
  description: "Encuentra universidades, carreras, cursos y becas que se adaptan a tus intereses y presupuesto en Colombia y Latinoamérica.",
  keywords: ["universidades", "carreras", "cursos", "becas", "educación", "test vocacional", "Colombia", "LATAM"],
  openGraph: {
    title: "RutaEdu | Encuentra tu camino académico",
    description: "Encuentra universidades, carreras, cursos y becas que se adaptan a tus intereses y presupuesto.",
    type: "website",
    locale: "es_CO",
    url: "https://rutaedu.com",
    siteName: "RutaEdu",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
