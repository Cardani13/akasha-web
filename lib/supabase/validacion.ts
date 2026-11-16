// Reglas compartidas por los formularios de cuenta
export const NOMBRE_VALIDO = /^[A-Za-z0-9_\- ]{3,24}$/;
export const MIN_CONTRASENA = 8;

export function errorNombre(nombre: string) {
  const n = nombre.trim();
  if (n.length < 3 || n.length > 24) return "El nombre debe tener entre 3 y 24 caracteres.";
  if (!NOMBRE_VALIDO.test(n)) return "Solo letras sin tilde, números, espacios, guiones y guiones bajos.";
  return null;
}

export function errorContrasena(contrasena: string, repetida: string) {
  if (contrasena.length < MIN_CONTRASENA) return `La contraseña necesita al menos ${MIN_CONTRASENA} caracteres.`;
  if (contrasena !== repetida) return "Las contraseñas no coinciden.";
  return null;
}

// Traduce los mensajes más habituales de Supabase Auth
export function traducirError(mensaje: string) {
  const m = mensaje.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Aún no has confirmado tu correo. Revisa tu bandeja de entrada.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Ya existe una cuenta con ese correo.";
  if (m.includes("rate limit") || m.includes("too many")) return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
  if (m.includes("password should be")) return `La contraseña necesita al menos ${MIN_CONTRASENA} caracteres.`;
  if (m.includes("reauthentication")) return "Por seguridad, sal y vuelve a entrar antes de cambiar la contraseña.";
  if (m.includes("same password") || m.includes("different from the old")) return "La nueva contraseña debe ser distinta de la anterior.";
  if (m.includes("duplicate") || m.includes("unique")) return "Ese nombre ya está en uso. Prueba con otro.";
  if (m.includes("unable to validate email") || m.includes("invalid format")) return "Ese correo no parece válido.";
  return "Algo ha fallado. Vuelve a intentarlo en un momento.";
}
