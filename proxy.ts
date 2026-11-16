import type { NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/proxy";

export function proxy(request: NextRequest) {
  return actualizarSesion(request);
}

export const config = {
  // Todo menos estáticos e imágenes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)"],
};
