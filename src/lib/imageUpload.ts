/**
 * imageUpload.ts — Validación, optimización y subida de imágenes del panel a Vercel Blob.
 *
 * Antes de subir: se rechaza lo que no sirve (formato, peso, medidas, proporción) y
 * lo que pasa se achica y se convierte a WebP, así la tienda nunca carga fotos de
 * varios MB directo del celular.
 */
import { upload } from "@vercel/blob/client";

export type ImageRules = {
  /** Peso máximo del archivo original */
  maxFileMB: number;
  /** Lado más corto mínimo, en px (las fotos chicas se ven pixeladas) */
  minSidePx: number;
  /** Proporción ancho/alto permitida */
  minRatio: number;
  maxRatio: number;
  /** Lado más largo de la imagen final, en px */
  outputMaxSidePx: number;
  /** Texto de ayuda para el panel */
  hint: string;
};

export const IMAGE_RULES = {
  // Las tarjetas de producto son verticales 3:4 y recortan la foto: se aceptan
  // de verticales a levemente horizontales, nada panorámico.
  product: {
    maxFileMB: 10,
    minSidePx: 600,
    minRatio: 0.6,
    maxRatio: 1.4,
    outputMaxSidePx: 1600,
    hint: "JPG, PNG o WebP · hasta 10 MB · mínimo 600 px por lado · vertical o cuadrada (ideal 3:4)",
  },
  // La portada usa tarjetas verticales y horizontales
  category: {
    maxFileMB: 10,
    minSidePx: 600,
    minRatio: 0.5,
    maxRatio: 2,
    outputMaxSidePx: 1800,
    hint: "JPG, PNG o WebP · hasta 10 MB · mínimo 600 px por lado",
  },
} satisfies Record<string, ImageRules>;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");

/** Tope del servidor (api/upload.ts): la imagen ya optimizada no puede pasar de esto */
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen. ¿El archivo está dañado?"));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Revisa el archivo contra las reglas. Devuelve la imagen decodificada o lanza un error con el motivo. */
export async function validateImage(file: File, rules: ImageRules): Promise<HTMLImageElement> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Formato no permitido. Usa una imagen JPG, PNG o WebP.");
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > rules.maxFileMB) {
    throw new Error(`La imagen pesa ${sizeMB.toFixed(1)} MB. El máximo es ${rules.maxFileMB} MB.`);
  }

  const img = await loadImage(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (Math.min(w, h) < rules.minSidePx) {
    throw new Error(`La imagen mide ${w}×${h} px. Debe tener al menos ${rules.minSidePx} px por lado.`);
  }
  const ratio = w / h;
  if (ratio < rules.minRatio) {
    throw new Error(`La imagen es demasiado alta y angosta (${w}×${h} px). Usa una foto menos alargada.`);
  }
  if (ratio > rules.maxRatio) {
    throw new Error(`La imagen es demasiado ancha (${w}×${h} px). Usa una foto vertical o cuadrada.`);
  }
  return img;
}

/** Achica la imagen (si hace falta) y la convierte a WebP (JPG si el navegador no sabe generar WebP). */
export async function optimizeImage(img: HTMLImageElement, rules: ImageRules): Promise<Blob> {
  const scale = Math.min(1, rules.outputMaxSidePx / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar la imagen.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.85, 0.75, 0.65]) {
    let blob = await canvasToBlob(canvas, "image/webp", quality);
    if (!blob || blob.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (blob && blob.size <= MAX_OUTPUT_BYTES) return blob;
  }
  throw new Error("No se pudo comprimir la imagen lo suficiente. Prueba con otra foto.");
}

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "imagen"
  );
}

/**
 * Valida, optimiza y sube la imagen. Devuelve la URL pública.
 * folder: "productos" | "categorias" (la API solo acepta esas carpetas).
 */
export async function uploadImage(file: File, folder: "productos" | "categorias", rules: ImageRules): Promise<string> {
  const img = await validateImage(file, rules);
  const blob = await optimizeImage(img, rules);
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const baseName = slugify(file.name.replace(/\.[^.]+$/, ""));

  try {
    const result = await upload(`${folder}/${baseName}.${ext}`, blob, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: blob.type,
    });
    return result.url;
  } catch (err: any) {
    throw new Error(err?.message ? `No se pudo subir la imagen: ${err.message}` : "No se pudo subir la imagen");
  }
}
