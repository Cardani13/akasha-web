import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/server";

// Destino de los enlaces de los correos (confirmar cuenta y recuperar contraseña).
// Acepta los dos formatos de Supabase: ?code=… (PKCE) y ?token_hash=…&type=…
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  // Solo rutas internas, para que el enlace no sirva como redirección abierta
  const siguiente = searchParams.get("next") ?? "/";
  const destino = siguiente.startsWith("/") && !siguiente.startsWith("//") ? siguiente : "/";

  const supabase = await crearClienteServidor();
  let ok = false;
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && tipo) ok = !(await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash })).error;

  if (ok) return NextResponse.redirect(new URL(destino, origin));
  // Abierto en otro navegador el código PKCE no sirve, aunque el correo sí queda confirmado
  return NextResponse.redirect(new URL("/entrar?aviso=enlace-invalido", origin));
}
