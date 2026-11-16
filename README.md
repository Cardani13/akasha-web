# AKASHA · web

Biblioteca personal de la saga Fate y el Nasuverse, con la identidad del manual de marca AKASHA.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Dónde está cada cosa

```
app/                     páginas. Cada carpeta es una URL
  page.tsx               →  /  (inicio)
  obra/[id]/page.tsx     →  /obra/zero  (detalle de cada obra)
  orden/page.tsx         →  /orden  (orden de visionado, con pestañas)
  sagas/page.tsx         →  /sagas  (todas las sagas)
  saga/[id]/page.tsx     →  /saga/zero  (una saga con todas sus obras)
  progreso/page.tsx      →  /progreso  (lo que llevas visto)
  layout.tsx             Header y Footer comunes a todas las páginas
  globals.css            colores, tipografías y estilos base de la marca
components/
  layout/                Header (menú), Buscador (lupa) y Footer (pie de página)
  catalogo/              Hero (banner grande), Carrusel (fila) y Tarjeta (portada)
  obra/                  Ficha (cabecera de la página de detalle)
  orden/                 Pestanas y ListaOrden (página de orden de visionado)
  saga/                  CabeceraSaga y RejillaObras (página de cada saga)
  ui/                    piezas pequeñas reutilizables: Logo y BarraProgreso
data/
  catalogo.json          catálogo completo del Nasuverse: obras, sagas, años, estudios, orden
  progreso.ts            obras que ya has visto (lista de ejemplo hasta que haya login)
lib/
  catalogo.ts            tipos y funciones para leer catalogo.json
  tarjetas.ts            convierte una obra en los datos de una Tarjeta
  descargas.ts           lee los enlaces de descarga de Supabase (tabla descargas)
public/imagenes/
  portadas/              una imagen por obra
```

Cada componente tiene al lado su archivo `.module.css` con el mismo nombre.

## Tareas sencillas

### Cambiar el texto de una obra (sinopsis, año, título)

Busca la obra en `data/catalogo.json` (por su `id` o su `titulo`) y cambia el texto entre comillas. La web entera lee de ese archivo.

### Cambiar qué sale en la portada

Al principio de `app/page.tsx` están la obra del banner (`DESTACADA`) y las filas (`FILAS_DE_SAGAS`), escritas con los ids del catálogo.

### Cambiar un orden de visionado

En `data/catalogo.json`, dentro de `"ordenes"`, están las cuatro listas: `recomendado`, `principal`, `extras` y `universo`. Cada paso tiene `titulo`, `detalle` y la lista de `obras` (ids). La fila "Empieza por aquí" de la portada usa `recomendado`.

### Poner un enlace de descarga

Los enlaces no están en el código: van en la tabla `descargas` de Supabase (Table Editor → `descargas` → Insert row). Cada fila es un enlace:

| columna    | qué poner                                                        |
| ---------- | ---------------------------------------------------------------- |
| `obra_id`  | el `id` de la obra en `data/catalogo.json` (por ejemplo `zero`)  |
| `orden`    | 1, 2, 3... si la obra tiene varios enlaces; si tiene uno, 1      |
| `etiqueta` | solo si tiene varios: `Temporada 1`, `OVA`... Si no, vacío       |
| `url`      | el enlace, empezando por `https://`                              |

No hace falta volver a publicar la web: el enlace sale solo en menos de un minuto. Cualquiera puede leer la tabla sin iniciar sesión, pero solo se puede escribir desde el panel de Supabase. La estructura de la tabla está en `supabase/descargas.sql`.

Si no tiene enlaces, su página dice "Enlace pendiente" (si está en el orden recomendado) o "Próximamente".

### Marcar una obra como vista

Añade su id a la lista de `data/progreso.ts`.

### Cambiar o añadir una portada

1. Copia la imagen en `public/imagenes/portadas/`. Vale JPG, PNG o WebP: Next la convierte y la redimensiona sola.
2. En la obra de `data/catalogo.json`, pon la ruta en `imagen` y `"imagenEsPlaceholder": false`, por ejemplo `"/imagenes/portadas/Fate_Zero.jpg"`.

Con unos 1600 px de ancho es suficiente.

### Cambiar un color o una tipografía

Todo está en `app/globals.css`, en las variables del principio (`--oro-grial`, `--rojo-sello`, `--ruta-ubw`...). No pongas colores sueltos dentro de los componentes: así toda la web cambia a la vez.

### Cambiar el menú o el pie de página

- Menú: lista `enlaces` en `components/layout/Header.tsx`.
- Pie: `components/layout/Footer.tsx`.

### Comprobar antes de subir

```bash
npm run build
```

Si termina sin errores, se puede subir a GitHub y Vercel lo publica solo.

## Vercel

El repositorio está importado en Vercel: cada push a `main` se publica en https://fate-fan-web.vercel.app. Necesita las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver `.env.example`), puestas en Vercel → Settings → Environment Variables.
