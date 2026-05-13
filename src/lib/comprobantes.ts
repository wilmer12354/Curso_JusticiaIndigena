import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

const MAX_BYTES = 3 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Base tipo JuanAliaga_uidcorto (sin extensión), seguro para nombre de archivo */
export function receiptFileBaseFromName(fullName: string, userId: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const pascal = parts
    .map((p) => {
      const cleaned = stripAccents(p).replace(/[^a-zA-Z0-9]/g, "");
      if (!cleaned) return "";
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join("");
  const base = pascal || "Estudiante";
  return `${base}_${userId.slice(0, 8)}`;
}

/** Guarda el archivo en public/comprobantes y devuelve ruta tipo public/comprobantes/Nombre.ext */
export async function saveRegistrationReceipt(
  file: File,
  displayName: string,
  userId: string
): Promise<string> {
  const mime = file.type;
  const ext = MIME_TO_EXT[mime];
  if (!ext) {
    throw new Error("INVALID_RECEIPT_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("RECEIPT_TOO_LARGE");
  }
  const base = receiptFileBaseFromName(displayName || "Estudiante", userId);
  const filename = `${base}${ext}`;
  const dir = path.join(process.cwd(), "public", "comprobantes");
  await mkdir(dir, { recursive: true });
  const absFile = path.join(dir, filename);
  await writeFile(absFile, Buffer.from(await file.arrayBuffer()));
  return `public/comprobantes/${filename}`;
}

/** Guarda la foto del certificado en public/fotos_certificados y devuelve la ruta */
export async function saveCertificatePhoto(
  file: File,
  displayName: string,
  userId: string
): Promise<string> {
  const mime = file.type;
  const ext = MIME_TO_EXT[mime];
  if (!ext) {
    throw new Error("INVALID_PHOTO_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("PHOTO_TOO_LARGE");
  }
  const base = receiptFileBaseFromName(displayName || "Estudiante", userId);
  const filename = `${base}${ext}`;
  const dir = path.join(process.cwd(), "public", "fotos_certificados");
  await mkdir(dir, { recursive: true });
  const absFile = path.join(dir, filename);
  await writeFile(absFile, Buffer.from(await file.arrayBuffer()));
  return `public/fotos_certificados/${filename}`;
}

export async function deletePublicComprobanteIfExists(storedPath: string | null | undefined): Promise<void> {
  if (!storedPath || !storedPath.startsWith("public/comprobantes/")) return;
  const base = path.basename(storedPath);
  if (!base || base.includes("..") || base.includes("/") || base.includes("\\")) return;
  const abs = path.join(process.cwd(), "public", "comprobantes", base);
  await unlink(abs).catch(() => {});
}
