import { Suspense } from "react";
import ReceitaClient from "./receita-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ReceitaPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-[#06060a] text-slate-500"
          style={{ padding: 32, fontSize: 14 }}
        >
          A carregar ficha de receita…
        </div>
      }
    >
      <ReceitaClient />
    </Suspense>
  );
}
