import type { Metadata } from "next";
import "./globals.css";
import ServerCameraPicker from "./components/ServerCameraPicker";

export const metadata: Metadata = {
  title: "Pupilometro Digital",
  description: "Medicao de distancia pupilar com camera e deteccao facial local.",
  icons: {
    icon: "/favicon.svg"
  }
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
        <p
          style={{
            margin: 0,
            padding: "10px 14px",
            backgroundColor: "#0c4a6e",
            color: "#ecfeff",
            fontSize: 13,
            lineHeight: 1.4,
            borderBottom: "1px solid #22d3ee"
          }}
        >
          Se a tela estiver em branco sem botoes, feche a aba, rode <strong>npm run dev:clean</strong> e
          abra de novo: <strong>http://localhost:3000</strong> (nao abra o HTML pelo Explorer).
        </p>
        <ServerCameraPicker />
        {children}
      </body>
    </html>
  );
}
