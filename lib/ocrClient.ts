/**
 * Client HTTP pour le microservice OCR PaddleOCR.
 * Utilisé côté serveur (API routes) pour communiquer avec le service Python.
 * Supporte le doc_type hint pour optimiser le layout OCR.
 */

export interface OcrServiceResult {
  text: string;
  confidence: number;
  pages: number;
  processing_time_ms: number;
  preprocessing: {
    deskew_angle: number;
    binarization: string;
    sharpness_score: number;
    sharpened: boolean;
    colored_background: boolean;
    original_size: string;
    processed_size: string;
  };
  zones?: {
    layout: string;
    h_lines?: number;
    v_lines?: number;
    density_top?: number;
    density_mid?: number;
    density_bot?: number;
  };
  timing: {
    preprocess_ms: number;
    ocr_ms: number;
    postprocess_ms: number;
  };
}

export interface OcrServiceError {
  error: string;
  code: string;
}

function getOcrServiceUrl(): string {
  return process.env.OCR_SERVICE_URL || "http://ocr:8000";
}

async function resolveOcrUrl(): Promise<string> {
  const base = getOcrServiceUrl();
  /* Si l'URL utilise un hostname Docker, résoudre en IPv4 pour éviter les timeouts DNS */
  try {
    const url = new URL(base);
    if (url.hostname === "ocr" || url.hostname === "localhost") {
      const dns = await import("dns");
      const { address } = await dns.promises.lookup(url.hostname, { family: 4 });
      return `http://${address}:${url.port}`;
    }
  } catch { /* fallback à l'URL originale */ }
  return base;
}

export async function callOcrService(
  fileBuffer: Buffer,
  filename: string,
  contentType: string,
  docType: "auto" | "mutuelle" | "ordonnance" = "auto"
): Promise<OcrServiceResult> {
  const base = await resolveOcrUrl();
  const url = `${base}/ocr`;

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: contentType });
  formData.append("file", blob, filename);
  formData.append("doc_type", docType);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as OcrServiceError | null;
      throw new Error(body?.error ?? `OCR service error: ${res.status}`);
    }

    return (await res.json()) as OcrServiceResult;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkOcrHealth(): Promise<boolean> {
  try {
    const url = await resolveOcrUrl();
    const res = await fetch(`${url}/health`, {
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
