import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pupilometro Digital",
  description: "Medicao de distancia pupilar com camera e deteccao facial local."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ backgroundColor: "#09090b" }}>
      <body
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
