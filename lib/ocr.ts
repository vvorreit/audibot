import { createWorker } from "tesseract.js";

// ── Types ────────────────────────────────────────────────────────────────────

export interface OcrResult {
  text: string;
  confidence: number;
}

// ── Initialisation PDF.js (une seule fois) ──────────────────────────────────

let pdfJsLoaded = false;

async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfJsLoaded) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfJsLoaded = true;
  }
  return pdfjs;
}

// ── Image → texte via Tesseract ───────────────────────────────────────────────

export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  const worker = await createWorker("fra+eng", 1, {
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

  const imageUrl = URL.createObjectURL(file);
  try {
    const { data } = await worker.recognize(imageUrl);
    return { text: data.text, confidence: data.confidence };
  } finally {
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);
  }
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

// ── PDF → texte via OCR (fallback pour PDF scannés) ──────────────────────────

async function extractTextFromPDFOCR(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  const pdfjs = await getPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const texts: string[] = [];
  let totalConfidence = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.5 });

    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    if (typeof OffscreenCanvas !== "undefined") {
      canvas = new OffscreenCanvas(viewport.width, viewport.height);
      ctx = canvas.getContext("2d")!;
    } else {
      const el = document.createElement("canvas");
      el.width = viewport.width;
      el.height = viewport.height;
      canvas = el;
      ctx = el.getContext("2d")!;
    }

    await page.render({
      canvasContext: ctx as any,
      canvas: canvas instanceof HTMLCanvasElement ? canvas : null,
      viewport,
    }).promise;

    let blob: Blob;
    if (canvas instanceof OffscreenCanvas) {
      blob = await canvas.convertToBlob({ type: "image/png" });
    } else {
      blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/png")
      );
    }

    const imageFile = new File([blob], `page-${i}.png`, { type: "image/png" });
    const pageResult = await extractTextFromImage(imageFile, (p) => {
      if (onProgress) onProgress(Math.round(((i - 1 + p / 100) / pdf.numPages) * 100));
    });
    texts.push(pageResult.text);
    totalConfidence += pageResult.confidence;
  }

  return { text: texts.join("\n"), confidence: pdf.numPages > 0 ? totalConfidence / pdf.numPages : 0 };
}

// ── Point d'entrée principal ──────────────────────────────────────────────────

export async function processDocument(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  if (file.type === "application/pdf") {
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

    return extractTextFromPDFOCR(file, onProgress);
  }

  return extractTextFromImage(file, onProgress);
}
