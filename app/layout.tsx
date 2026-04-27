import type { Metadata, Viewport } from "next";
import { CRITICAL_PUPILO_CSS } from "./lib/critical-pupilo-css";

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
    <html lang="pt-BR" className="pupilo-html" style={{ backgroundColor: "#09090b" }}>
      <head>
        <style id="pupilo-critical" dangerouslySetInnerHTML={{ __html: CRITICAL_PUPILO_CSS }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className="pupilo-body"
        style={{
          margin: 0,
          minHeight: "100%",
          backgroundColor: "#09090b",
          color: "#e2e8f0"
        }}
      >
        <p className="pupilo-notice" style={{ margin: 0 }}>
          Se a tela estiver em branco sem botoes, feche a aba, rode <strong>npm run dev:clean</strong> e
          abra de novo: <strong>http://127.0.0.1:3000</strong> (nao abra o site como ficheiro no Explorer). Se
          vires 404 no /_next, apaga a pasta <strong>.next</strong> e executa de novo o comando.
        </p>
        {children}
      </body>
    </html>
  );
}
