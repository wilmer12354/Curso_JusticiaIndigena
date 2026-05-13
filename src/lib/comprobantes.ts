import { put, del } from "@vercel/blob";
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

/** Guarda el archivo en Vercel Blob y devuelve la URL */
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
  const filename = `comprobantes/${base}${ext}`;
  const blob = await put(filename, file, { access: 'public' });
  return blob.url;
}

export async function savePaymentReceipt(
  file: File,
  displayName: string,
  userId: string,
  cuota: number
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
  const suffix = cuota > 0 ? `cuota${cuota}` : "full";
  const filename = `comprobantes/${base}_${suffix}${ext}`;
  const blob = await put(filename, file, { access: 'public' });
  return blob.url;
}

/** Guarda la foto del certificado en Vercel Blob y devuelve la URL */
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
  const filename = `fotos_certificados/${base}${ext}`;
  const blob = await put(filename, file, { access: 'public' });
  return blob.url;
}

export async function deletePublicComprobanteIfExists(storedPath: string | null | undefined): Promise<void> {
  if (!storedPath) return;
  if (storedPath.startsWith("https://")) {
    await del(storedPath).catch(() => {});
  }
  // For old local paths, can't delete on Vercel, so skip
}
