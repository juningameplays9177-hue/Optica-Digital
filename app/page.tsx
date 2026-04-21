import { Suspense } from "react";
import ServerCameraPicker from "./components/ServerCameraPicker";
import HomeClient from "./home-client";

/**
 * Server Component: o bloco ServerCameraPicker vai no HTML inicial — botoes reais sem depender de React hidratar.
 * HomeClient traz camera, deteccao e UI interativa.
 */
export default function Page() {
  return (
    <div style={{ backgroundColor: "#09090b", minHeight: "100vh" }}>
      <ServerCameraPicker />
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
