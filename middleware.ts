import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Reduz "HTML antigo" apontando para chunks 404 (cache agressivo / abas muito abertas).
 * Em produção ainda deixa o navegador cachear assets imutaveis; HTML nao fica congelado.
 */
export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "") {
    res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.headers.set("Pragma", "no-cache");
  }
  return res;
}

export const config = {
  matcher: ["/"]
};
