import { Suspense } from "react";
import "./globals.css";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * ServerCameraPicker fica no layout (sempre no HTML). Aqui so carrega a parte interativa.
 */
export default function Page() {
  return (
    <div style={{ backgroundColor: "#09090b", minHeight: "100vh" }}>
      <Suspense
        fallback={
          <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: 14 }}>
            Carregando camera e medicoes…
          </div>
        }
      >
        <HomeClient />
      </Suspense>
    </div>
  );
}
