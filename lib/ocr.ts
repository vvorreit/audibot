/* Tesseract et PDF.js sont chargés uniquement au premier scan — jamais au mount du dashboard.
   Cela économise ~46Mo de WASM/lang sur le chargement initial. */

// ── Types ────────────────────────────────────────────────────────────────────

export interface OcrResult {
  text: string;
  confidence: number;
}

// ── Initialisation PDF.js (lazy, une seule fois) ─────────────────────────────

let pdfJsLoaded = false;

async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfJsLoaded) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfJsLoaded = true;
  }
  return pdfjs;
}

// ── Helpers canvas ──────────────────────────────────────────────────────────

function makeCanvas(w: number, h: number) {
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(w, h);
    ctx = canvas.getContext("2d")!;
  } else {
    const el = document.createElement("canvas");
    el.width = w;
    el.height = h;
    canvas = el;
    ctx = el.getContext("2d")!;
  }
  return { canvas, ctx };
}

async function canvasToFile(canvas: HTMLCanvasElement | OffscreenCanvas, name: string): Promise<File> {
  let blob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: "image/png" });
  } else {
    blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), "image/png")
    );
  }
  return new File([blob], name, { type: "image/png" });
}

// ── Image → texte via Tesseract (lazy import) ────────────────────────────────

/** Crée un worker Tesseract configuré (lazy, usage unique). */
async function createOcrWorker(onProgress?: (progress: number) => void) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("fra", 1, {
    workerPath: "/tesseract/worker.min.js",
    workerBlobURL: false,
    corePath: "/tesseract",
    langPath: "/tesseract",
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  await worker.setParameters({ preserve_interword_spaces: "1" });
  return worker;
}

/** OCR brut sur un fichier image (sans preprocessing — utilisé quand le
 *  preprocessing a déjà été appliqué, ex: extractTextFromPDFOCR).
 *  Si un `worker` existant est passé, le réutilise (batch multi-pages). */
async function recognizeRaw(
  file: File,
  onProgress?: (progress: number) => void,
  existingWorker?: Awaited<ReturnType<typeof createOcrWorker>>
): Promise<OcrResult> {
  const worker = existingWorker ?? await createOcrWorker(onProgress);
  const url = URL.createObjectURL(file);
  try {
    const { data } = await worker.recognize(url);
    return { text: data.text, confidence: data.confidence };
  } finally {
    if (!existingWorker) await worker.terminate();
    URL.revokeObjectURL(url);
  }
}

/** Point d'entrée OCR pour images brutes (photos, captures).
 *  Applique preprocessing + détection de rotation si nécessaire. */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  const worker = await createOcrWorker(onProgress);

  const preprocessed = await preprocessImageFile(file);
  const url = URL.createObjectURL(preprocessed);
  try {
    const { data } = await worker.recognize(url);

    /* Si le texte est trop court, tenter une rotation à 90° / 270°
       (photo de document prise en paysage) */
    if (data.text.replace(/\s/g, "").length < 50) {
      const rotated = await tryRotations(worker, file);
      if (rotated && rotated.text.replace(/\s/g, "").length > data.text.replace(/\s/g, "").length) {
        return rotated;
      }
    }

    return { text: data.text, confidence: data.confidence };
  } finally {
    await worker.terminate();
    URL.revokeObjectURL(url);
  }
}

/** Tente l'OCR à 90° et 270° et retourne le meilleur résultat, ou null. */
async function tryRotations(
  worker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>>,
  file: File
): Promise<OcrResult | null> {
  let best: OcrResult | null = null;
  let bestLen = 0;

  for (const angle of [90, 270]) {
    const rotated = await rotateImageFile(file, angle);
    const preprocessed = await preprocessImageFile(rotated);
    const url = URL.createObjectURL(preprocessed);
    try {
      const { data } = await worker.recognize(url);
      const len = data.text.replace(/\s/g, "").length;
      if (len > bestLen) {
        bestLen = len;
        best = { text: data.text, confidence: data.confidence };
      }
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return best;
}

/** Tourne une image de `angle` degrés et retourne un nouveau File. */
async function rotateImageFile(file: File, angle: number): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const swap = angle === 90 || angle === 270;
  const w = swap ? bitmap.height : bitmap.width;
  const h = swap ? bitmap.width : bitmap.height;

  const { canvas, ctx } = makeCanvas(w, h);
  ctx.translate(w / 2, h / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close();

  return canvasToFile(canvas, file.name);
}

/** Charge un fichier image dans un canvas, applique le preprocessing OCR,
 *  et retourne un File PNG prêt pour Tesseract. */
async function preprocessImageFile(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const { canvas, ctx } = makeCanvas(width, height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  preprocessForOCR(ctx, width, height);
  return canvasToFile(canvas, file.name);
}

// ── PDF → texte natif (extraction directe, sans OCR) ─────────────────────────
// Beaucoup plus rapide et précis pour les PDF numériques (non scannés)

async function extractTextFromPDFNative(file: File): Promise<OcrResult> {
  const pdfjs = await getPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const texts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const items = content.items
      .filter((item): item is typeof item & { str: string; transform: number[] } => "str" in item)
      .map(item => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        w: (item as any).width || 0
      }));

    const Y_TOLERANCE = 4;

    items.sort((a, b) => {
      const diffY = Math.abs(a.y - b.y);
      if (diffY < Y_TOLERANCE) {
        return a.x - b.x;
      }
      return b.y - a.y;
    });

    let currentY: number | null = null;
    let currentX: number | null = null;
    let line = "";

    for (const item of items) {
      if (currentY === null) {
        currentY = item.y;
        currentX = item.x + item.w;
        line = item.str;
        continue;
      }

      if (Math.abs(item.y - currentY) > Y_TOLERANCE) {
        texts.push(line);
        line = item.str;
        currentY = item.y;
        currentX = item.x + item.w;
      } else {
        const gap = item.x - (currentX || 0);
        if (gap > 10) {
          line += "   " + item.str;
        } else if (gap > 2) {
          line += " " + item.str;
        } else {
          line += item.str;
        }
        currentX = item.x + item.w;
      }
    }
    if (line) texts.push(line);
    texts.push("");
  }

  return { text: texts.join("\n"), confidence: 95 };
}

// ── Preprocessing image pour améliorer l'OCR ────────────────────────────────
// Applique : grayscale → auto-contrast → sharpen sur les pixels du canvas.
// Testé sur des ordonnances scannées : +10-57% de caractères reconnus.

function preprocessForOCR(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const d = imageData.data;

  /* 1. Grayscale (luminance ITU-R BT.601) */
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i + 1] = d[i + 2] = gray;
  }

  /* 2. Auto-contrast : étire l'histogramme sur [0..255] avec 1% de cutoff */
  let min = 255, max = 0;
  const totalPixels = d.length / 4;
  const cutoff = Math.floor(totalPixels * 0.01);
  const histogram = new Uint32Array(256);

  for (let i = 0; i < d.length; i += 4) histogram[d[i]]++;

  let cumLow = 0;
  for (let v = 0; v < 256; v++) {
    cumLow += histogram[v];
    if (cumLow >= cutoff) { min = v; break; }
  }
  let cumHigh = 0;
  for (let v = 255; v >= 0; v--) {
    cumHigh += histogram[v];
    if (cumHigh >= cutoff) { max = v; break; }
  }

  const range = max - min || 1;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.min(255, Math.max(0, Math.round(((d[i] - min) / range) * 255)));
    d[i] = d[i + 1] = d[i + 2] = v;
  }

  /* 3. Sharpen (noyau 3×3 unsharp : renforce les contours du texte) */
  const src = new Uint8ClampedArray(d);
  const w4 = width * 4;
  const strength = 0.3;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const center = src[idx];
      const neighbors =
        src[idx - w4 - 4] + src[idx - w4] + src[idx - w4 + 4] +
        src[idx - 4]                       + src[idx + 4] +
        src[idx + w4 - 4] + src[idx + w4] + src[idx + w4 + 4];
      const avg = neighbors / 8;
      const sharpened = center + strength * (center - avg);
      const v = Math.min(255, Math.max(0, Math.round(sharpened)));
      d[idx] = d[idx + 1] = d[idx + 2] = v;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ── PDF → texte via OCR (fallback pour PDF scannés) ──────────────────────────
// Scale 3.0 ≈ 216 DPI (vs 2.5 = 180 DPI), meilleur compromis qualité/perf.

async function extractTextFromPDFOCR(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  const pdfjs = await getPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const texts: string[] = [];
  let totalConfidence = 0;

  /* Un seul worker Tesseract pour toutes les pages (évite de recharger ~46 Mo de WASM/lang à chaque page) */
  const worker = await createOcrWorker(onProgress);

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 3.0 });
      const w = Math.round(viewport.width);
      const h = Math.round(viewport.height);

      const { canvas, ctx } = makeCanvas(w, h);

      await page.render({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvasContext: ctx as any,
        canvas: canvas instanceof HTMLCanvasElement ? canvas : null,
        viewport,
      }).promise;

      preprocessForOCR(ctx, w, h);

      const imageFile = await canvasToFile(canvas, `page-${i}.png`);
      const pageResult = await recognizeRaw(imageFile, (p) => {
        if (onProgress) onProgress(Math.round(((i - 1 + p / 100) / pdf.numPages) * 100));
      }, worker);
      texts.push(pageResult.text);
      totalConfidence += pageResult.confidence;
    }
  } finally {
    await worker.terminate();
  }

  return { text: texts.join("\n"), confidence: pdf.numPages > 0 ? totalConfidence / pdf.numPages : 0 };
}

// ── Point d'entrée principal ──────────────────────────────────────────────────

export async function processDocument(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  if (file.type === "application/pdf") {
    /* 1. Extraction native (PDF numérique — rapide) */
    let nativeResult: OcrResult | null = null;
    try {
      nativeResult = await extractTextFromPDFNative(file);
    } catch (err) {
      console.warn("[OCR] Native PDF extraction failed, falling back to OCR:", err);
    }

    if (nativeResult && nativeResult.text.replace(/\s/g, "").length > 100) {
      onProgress?.(100);
      return nativeResult;
    }

    /* 2. Fallback OCR (PDF scanné) */
    return extractTextFromPDFOCR(file, onProgress);
  }

  return extractTextFromImage(file, onProgress);
}
