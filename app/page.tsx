import { Suspense } from "react";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * ServerCameraPicker fica no layout (sempre no HTML). Aqui so carrega a parte interativa.
 */
export default function Page() {
  return (
    <div style={{ backgroundColor: "#09090b", minHeight: "100vh" }}>
      <p className="pupilo-notice" style={{ margin: 0 }}>
        Se a tela estiver em branco sem botoes, feche a aba, rode <strong>npm run dev:clean</strong> e abra de novo:{" "}
        <strong>http://127.0.0.1:3000</strong> (nao abra o site como ficheiro no Explorer). Se vires 404 no /_next,
        apaga a pasta <strong>.next</strong> e executa de novo o comando.
      </p>
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
