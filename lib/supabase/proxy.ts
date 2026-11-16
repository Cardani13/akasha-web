import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Renueva la sesión antes de cada página para que el token no caduque mientras navegas
export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(lista) {
          lista.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
        },
      },
    },
  );

  // No meter código entre crear el cliente y getUser: es lo que refresca las cookies
  await supabase.auth.getUser();
  return respuesta;
}
