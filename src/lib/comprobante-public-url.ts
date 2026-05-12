/** Ruta guardada en BD → URL bajo la carpeta `public` (uso en cliente y servidor). */
export function comprobantePublicUrl(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (stored.startsWith("data:")) return stored;
  if (stored.startsWith("public/")) {
    return `/${stored.slice("public/".length)}`;
  }
  if (stored.startsWith("/")) return stored;
  return null;
}
