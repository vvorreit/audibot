import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mocks ─────────────────────────────────────── */

const mocks = vi.hoisted(() => ({
  session: null as { user: { id: string; email: string } } | null,
  prismaUser: { findUnique: vi.fn(), update: vi.fn() },
  prismaOcrScanLog: { create: vi.fn() },
  callOcrService: vi.fn(),
  checkOcrHealth: vi.fn(),
  parseMutuelle: vi.fn(),
  parseOrdonnance: vi.fn(),
  scoreMutuelle: vi.fn(),
  scoreOrdonnance: vi.fn(),
  computeScore: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockImplementation(() => Promise.resolve(mocks.session)),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: mocks.prismaUser,
    ocrScanLog: mocks.prismaOcrScanLog,
  },
}));

vi.mock("@/lib/ocrClient", () => ({
  callOcrService: (...args: unknown[]) => mocks.callOcrService(...args),
  checkOcrHealth: () => mocks.checkOcrHealth(),
}));

vi.mock("@/lib/parsers", () => ({
  parseMutuelle: (...args: unknown[]) => mocks.parseMutuelle(...args),
  parseOrdonnance: (...args: unknown[]) => mocks.parseOrdonnance(...args),
  scoreMutuelle: (...args: unknown[]) => mocks.scoreMutuelle(...args),
  scoreOrdonnance: (...args: unknown[]) => mocks.scoreOrdonnance(...args),
}));

vi.mock("@/lib/ocrScore", () => ({
  computeScore: (...args: unknown[]) => mocks.computeScore(...args),
}));

import { POST } from "@/app/api/ocr/process/route";
import { NextRequest } from "next/server";

function makeRequest(file?: File, type?: string): NextRequest {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (type) formData.append("type", type);
  return new NextRequest("http://localhost/api/ocr/process", {
    method: "POST",
    body: formData,
  });
}

const ESSENTIEL_SCAN_LIMIT = 80;

describe("POST /api/ocr/process", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = null;
  });

  it("retourne 401 si non authentifié", async () => {
    mocks.session = null;
    const res = await POST(makeRequest(new File(["test"], "test.jpg", { type: "image/jpeg" })));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("authentifié");
  });

  it("retourne 404 si user introuvable", async () => {
    mocks.session = { user: { id: "u1", email: "a@b.com" } };
    mocks.prismaUser.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest(new File(["test"], "test.jpg", { type: "image/jpeg" })));
    expect(res.status).toBe(404);
  });

  it("retourne 200 avec résultat OCR si user PRO (pas de limite de scan)", async () => {
    mocks.session = { user: { id: "u1", email: "pro@b.com" } };
    mocks.prismaUser.findUnique.mockResolvedValue({
      id: "u1",
      plan: "PRO",
      createdAt: new Date(),
      monthlyScanCount: 999,
      monthlyScanResetAt: new Date(),
    });
    mocks.callOcrService.mockResolvedValue({
      text: "ordonnance patient test",
      confidence: 0.95,
      processing_time_ms: 200,
      preprocessing: {},
    });
    mocks.parseOrdonnance.mockReturnValue({ patientName: "Test" });
    mocks.scoreOrdonnance.mockReturnValue(80);
    mocks.computeScore.mockReturnValue({
      globalScore: 85,
      ocrConfidence: 0.95,
      dataScore: 80,
      level: "high",
    });
    mocks.prismaOcrScanLog.create.mockResolvedValue({});

    const res = await POST(makeRequest(new File(["img"], "scan.jpg", { type: "image/jpeg" })));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("text");
    expect(body).toHaveProperty("score");
    expect(body).toHaveProperty("parsed");
  });

  it("retourne 403 si user ESSENTIEL a atteint la limite de scans", async () => {
    mocks.session = { user: { id: "u1", email: "ess@b.com" } };
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    mocks.prismaUser.findUnique.mockResolvedValue({
      id: "u1",
      plan: "ESSENTIEL",
      createdAt: new Date(Date.now() - 5 * 86_400_000), // within trial
      monthlyScanCount: ESSENTIEL_SCAN_LIMIT,
      monthlyScanResetAt: new Date(monthStart.getTime() + 86_400_000), // this month
    });

    const res = await POST(makeRequest(new File(["img"], "scan.jpg", { type: "image/jpeg" })));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Limite");
  });

  it("retourne 200 et traite OCR si user ESSENTIEL sous la limite", async () => {
    mocks.session = { user: { id: "u1", email: "ess@b.com" } };
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    mocks.prismaUser.findUnique.mockResolvedValue({
      id: "u1",
      plan: "ESSENTIEL",
      createdAt: new Date(Date.now() - 2 * 86_400_000),
      monthlyScanCount: 10,
      monthlyScanResetAt: new Date(monthStart.getTime() + 86_400_000),
    });
    mocks.callOcrService.mockResolvedValue({
      text: "mutuelle AMC adhérent test",
      confidence: 0.88,
      processing_time_ms: 150,
      preprocessing: {},
    });
    mocks.parseMutuelle.mockReturnValue({ organisme: "Almerys" });
    mocks.scoreMutuelle.mockReturnValue(75);
    mocks.computeScore.mockReturnValue({
      globalScore: 79,
      ocrConfidence: 0.88,
      dataScore: 75,
      level: "medium",
    });
    mocks.prismaOcrScanLog.create.mockResolvedValue({});

    const res = await POST(makeRequest(new File(["img"], "mut.jpg", { type: "image/jpeg" })));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.parsed).toEqual({ organisme: "Almerys" });
  });

  it("reset le compteur si monthlyScanResetAt est dans le mois précédent", async () => {
    mocks.session = { user: { id: "u1", email: "ess@b.com" } };
    // monthlyScanResetAt in previous month
    const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15);
    mocks.prismaUser.findUnique.mockResolvedValue({
      id: "u1",
      plan: "ESSENTIEL",
      createdAt: new Date(Date.now() - 3 * 86_400_000),
      monthlyScanCount: ESSENTIEL_SCAN_LIMIT, // was at limit last month
      monthlyScanResetAt: lastMonth, // last month → count resets to 0
    });
    mocks.callOcrService.mockResolvedValue({
      text: "ordonnance test",
      confidence: 0.9,
      processing_time_ms: 100,
      preprocessing: {},
    });
    mocks.parseOrdonnance.mockReturnValue({});
    mocks.scoreOrdonnance.mockReturnValue(50);
    mocks.computeScore.mockReturnValue({
      globalScore: 65,
      ocrConfidence: 0.9,
      dataScore: 50,
      level: "medium",
    });
    mocks.prismaOcrScanLog.create.mockResolvedValue({});

    const res = await POST(makeRequest(new File(["img"], "o.jpg", { type: "image/jpeg" })));
    // Should pass because count resets to 0 for new month
    expect(res.status).toBe(200);
  });

  it("appelle callOcrService avec le buffer du fichier", async () => {
    mocks.session = { user: { id: "u1", email: "pro@b.com" } };
    mocks.prismaUser.findUnique.mockResolvedValue({
      id: "u1",
      plan: "PRO",
      createdAt: new Date(),
      monthlyScanCount: 0,
      monthlyScanResetAt: null,
    });
    mocks.callOcrService.mockResolvedValue({
      text: "test text",
      confidence: 0.8,
      processing_time_ms: 100,
      preprocessing: {},
    });
    mocks.parseOrdonnance.mockReturnValue({});
    mocks.scoreOrdonnance.mockReturnValue(0);
    mocks.computeScore.mockReturnValue({
      globalScore: 24,
      ocrConfidence: 0.8,
      dataScore: 0,
      level: "low",
    });
    mocks.prismaOcrScanLog.create.mockResolvedValue({});

    await POST(makeRequest(new File(["image data"], "test.jpg", { type: "image/jpeg" })));
    expect(mocks.callOcrService).toHaveBeenCalledOnce();
    expect(mocks.callOcrService.mock.calls[0][1]).toBe("test.jpg");
    expect(mocks.callOcrService.mock.calls[0][2]).toBe("image/jpeg");
  });

  it("retourne 500 si callOcrService throw", async () => {
    mocks.session = { user: { id: "u1", email: "pro@b.com" } };
    mocks.prismaUser.findUnique.mockResolvedValue({
      id: "u1",
      plan: "PRO",
      createdAt: new Date(),
      monthlyScanCount: 0,
      monthlyScanResetAt: null,
    });
    mocks.callOcrService.mockRejectedValue(new Error("Service OCR indisponible"));

    const res = await POST(makeRequest(new File(["img"], "s.jpg", { type: "image/jpeg" })));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("OCR");
  });

  it("retourne 400 si fichier manquant", async () => {
    mocks.session = { user: { id: "u1", email: "pro@b.com" } };
    mocks.prismaUser.findUnique.mockResolvedValue({
      id: "u1",
      plan: "PRO",
      createdAt: new Date(),
      monthlyScanCount: 0,
      monthlyScanResetAt: null,
    });

    const res = await POST(makeRequest()); // no file
    expect(res.status).toBe(400);
  });
});
