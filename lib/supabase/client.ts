import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// Cliente para componentes "use client": la sesión vive en cookies que comparte con el servidor
export function crearClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Los enlaces de los correos los procesan /auth/confirmar y /auth/sesion, no este cliente
    { auth: { detectSessionInUrl: false } },
  );
}

// Solo para pedir correos (registro y recuperar contraseña). Con el flujo "implicit" el enlace
// del correo trae la sesión en la URL y funciona en cualquier navegador o dispositivo,
// no solo en el que lo pidió (que es lo que exige el flujo PKCE del cliente normal).
export function crearClienteCorreo() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}
