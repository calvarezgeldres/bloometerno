/**
 * imageUpload.ts — Validación, optimización y subida de imágenes del panel a Vercel Blob.
 *
 * Antes de subir: se rechaza lo que no sirve (archivo ilegible, peso, medidas), la
 * foto se ajusta al formato en que se muestra en la tienda y se achica y convierte
 * a WebP, así la tienda nunca carga fotos de varios MB directo del celular.
 */
import { upload } from "@vercel/blob/client";

export type ImageRules = {
  /** Peso máximo del archivo original */
  maxFileMB: number;
  /** Lado más corto mínimo, en px (las fotos chicas se ven pixeladas) */
  minSidePx: number;
  /** Proporción ancho/alto permitida (si no hay targetRatio) */
  minRatio: number;
  maxRatio: number;
  /**
   * Proporción ancho/alto en que se muestra la imagen en la tienda. Si está, no se
   * rechaza ninguna proporción: la foto se ajusta a esta (ver fitToRatio).
   */
  targetRatio?: number;
  /** Lado más largo de la imagen final, en px */
  outputMaxSidePx: number;
  /** Texto de ayuda para el panel */
  hint: string;
};

export const IMAGE_RULES = {
  // Las tarjetas de producto son verticales 3:4: cualquier foto se deja en 3:4
  // antes de subir, para que la tienda la muestre completa y sin recortes raros.
  product: {
    maxFileMB: 15,
    minSidePx: 600,
    minRatio: 0,
    maxRatio: Infinity,
    targetRatio: 3 / 4,
    outputMaxSidePx: 1600,
    hint: "Cualquier foto · hasta 15 MB · mínimo 600 px por lado · se ajusta sola al formato vertical 3:4",
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

// Se acepta cualquier imagen que el navegador sepa leer (JPG, PNG, WebP, GIF, AVIF,
// y HEIC de iPhone en Safari): igual sale convertida a WebP.
export const ACCEPT_ATTR = "image/*";

/**
 * Si recortar al formato pierde más que esto de la foto, en vez de recortar se
 * muestra entera sobre un fondo (si no, una foto panorámica quedaría reducida a una franja).
 */
const MAX_CROP_LOSS = 0.3;

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
      reject(
        new Error(
          "No se pudo leer la imagen. Puede que el archivo esté dañado o que este navegador no abra ese formato (ej: HEIC fuera de Safari). Prueba exportándola como JPG."
        )
      );
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Revisa el archivo contra las reglas. Devuelve la imagen decodificada o lanza un error con el motivo. */
export async function validateImage(file: File, rules: ImageRules): Promise<HTMLImageElement> {
  // Algunos celulares no informan el tipo (file.type vacío): se intenta leer igual
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("El archivo no es una imagen.");
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
  if (rules.targetRatio) return img;
  const ratio = w / h;
  if (ratio < rules.minRatio) {
    throw new Error(`La imagen es demasiado alta y angosta (${w}×${h} px). Usa una foto menos alargada.`);
  }
  if (ratio > rules.maxRatio) {
    throw new Error(`La imagen es demasiado ancha (${w}×${h} px). Usa una foto vertical o cuadrada.`);
  }
  return img;
}

/**
 * Dibuja la imagen en el canvas con la proporción `ratio`.
 * - Si la diferencia es moderada, recorta parejo desde el centro (lo normal en
 *   fotos de producto: el objeto suele ir al medio).
 * - Si recortar perdería mucho (ej: una foto panorámica en una tarjeta vertical),
 *   la muestra entera sobre una versión desenfocada de sí misma, o sobre blanco
 *   si el navegador no sabe desenfocar en canvas (Safari antiguo).
 */
function fitToRatio(ctx: CanvasRenderingContext2D, img: HTMLImageElement, ratio: number) {
  const { width: cw, height: ch } = ctx.canvas;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const kept = Math.min(w / h, ratio) / Math.max(w / h, ratio);

  // Recorte "cover": la porción central de la foto con la proporción buscada.
  // overscan > 0 la dibuja un poco más grande que el canvas (para el fondo desenfocado).
  const cover = (overscan = 0) => {
    const sw = w / h > ratio ? h * ratio : w;
    const sh = w / h > ratio ? h : w / ratio;
    const ox = cw * overscan;
    const oy = ch * overscan;
    ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh, -ox, -oy, cw + 2 * ox, ch + 2 * oy);
  };

  if (1 - kept <= MAX_CROP_LOSS) {
    cover();
    return;
  }

  // Fondo sólido primero: el desenfoque deja los bordes semitransparentes
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, cw, ch);
  if (typeof ctx.filter === "string") {
    ctx.filter = `blur(${Math.round(Math.max(cw, ch) / 25)}px)`;
    cover(0.1);
    ctx.filter = "none";
    // Velo claro para que el fondo no compita con el producto
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(0, 0, cw, ch);
  }

  const scale = Math.min(cw / w, ch / h);
  const dw = w * scale;
  const dh = h * scale;
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

/**
 * Ajusta la imagen al formato de la tienda (si las reglas lo piden), la achica si
 * hace falta y la convierte a WebP (JPG si el navegador no sabe generar WebP).
 */
export async function optimizeImage(img: HTMLImageElement, rules: ImageRules): Promise<Blob> {
  const ratio = rules.targetRatio ?? img.naturalWidth / img.naturalHeight;
  // Tamaño final: el mayor posible con esa proporción sin agrandar la foto ni pasar de outputMaxSidePx
  let outW = rules.targetRatio ? Math.min(img.naturalWidth, img.naturalHeight * ratio) : img.naturalWidth;
  let outH = outW / ratio;
  const scale = Math.min(1, rules.outputMaxSidePx / Math.max(outW, outH));
  outW = Math.round(outW * scale);
  outH = Math.round(outH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar la imagen.");
  ctx.imageSmoothingQuality = "high";
  if (rules.targetRatio) fitToRatio(ctx, img, ratio);
  else ctx.drawImage(img, 0, 0, outW, outH);

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
