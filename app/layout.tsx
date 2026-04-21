import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pupilometro Digital",
  description: "Medicao de distancia pupilar com camera e deteccao facial local."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
