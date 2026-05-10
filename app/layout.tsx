import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { CRITICAL_PUPILO_CSS } from "./lib/critical-pupilo-css";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"]
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Pupilometro Digital",
  description: "Medicao de distancia pupilar com camera e deteccao facial local.",
  icons: {
    icon: "/favicon.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b"
};

/**
 * Forca resposta HTML fresca: evita HTML antigo a apontar para chunks inexistentes.
 * CSS global (Tailwind) passa a ser importado so em app/page.tsx — se o bundle CSS falhar,
 * este layout ainda aplica o fundo e botoes (critical CSS + classes).
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`pupilo-html ${fontSans.variable} ${fontMono.variable}`}
      style={{ backgroundColor: "#09090b" }}
    >
      <head>
        <style id="pupilo-critical" dangerouslySetInnerHTML={{ __html: CRITICAL_PUPILO_CSS }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className="pupilo-body min-h-screen font-sans antialiased [font-feature-settings:'ss01']"
        style={{
          margin: 0,
          minHeight: "100%",
          backgroundColor: "#09090b",
          color: "#e2e8f0"
        }}
      >
        {children}
      </body>
    </html>
  );
}
