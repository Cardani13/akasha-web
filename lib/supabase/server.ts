import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente para páginas de servidor y rutas: hay que crearlo en cada petición
export async function crearClienteServidor() {
  const almacen = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => almacen.getAll(),
        setAll(lista) {
          // Desde un componente de servidor no se pueden escribir cookies; ya lo hace el proxy
          try {
            lista.forEach(({ name, value, options }) => almacen.set(name, value, options));
          } catch {}
        },
      },
    },
  );
}
