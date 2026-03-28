import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkOcrHealth } from "@/lib/ocrClient";
import os from "os";

export const dynamic = "force-dynamic";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  latencyMs?: number;
  checkedAt: string;
  note?: string;
}

function getSystemMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const ramPct = Math.round((usedMem / totalMem) * 100);

  const cpus = os.cpus();
  const loadAvg = os.loadavg(); // [1min, 5min, 15min]
  const cpuCount = cpus.length;

  return {
    ram: {
      totalMb: Math.round(totalMem / 1024 / 1024),
      usedMb: Math.round(usedMem / 1024 / 1024),
      freeMb: Math.round(freeMem / 1024 / 1024),
      usedPct: ramPct,
      status: ramPct > 90 ? "critical" : ramPct > 75 ? "warning" : "ok",
    },
    cpu: {
      count: cpuCount,
      loadAvg1m: Math.round(loadAvg[0] * 100) / 100,
      loadAvg5m: Math.round(loadAvg[1] * 100) / 100,
      usedPct: Math.round((loadAvg[0] / cpuCount) * 100),
      status: loadAvg[0] / cpuCount > 0.9 ? "critical" : loadAvg[0] / cpuCount > 0.7 ? "warning" : "ok",
    },
    uptime: Math.round(os.uptime() / 3600) + "h",
    nodeVersion: process.version,
  };
}

export async function GET() {
  const services: ServiceStatus[] = [];
  const now = new Date().toISOString();

  /* Database */
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    services.push({ name: "database", status: "operational", latencyMs: Date.now() - start, checkedAt: now });
  } catch {
    services.push({ name: "database", status: "down", checkedAt: now });
  }

  /* API (self-check) */
  services.push({ name: "api", status: "operational", checkedAt: now });

  /* OCR */
  try {
    const start = Date.now();
    const ocrOk = await checkOcrHealth();
    services.push({
      name: "ocr",
      status: ocrOk ? "operational" : "degraded",
      latencyMs: Date.now() - start,
      checkedAt: now,
      note: ocrOk ? "PaddleOCR actif" : "Fallback Tesseract.js",
    });
  } catch {
    services.push({ name: "ocr", status: "degraded", checkedAt: now });
  }

  const system = getSystemMetrics();

  const overall = services.every((s) => s.status === "operational")
    ? "operational"
    : services.some((s) => s.status === "down")
      ? "down"
      : "degraded";

  // Retourner un statut HTTP 503 si DB est down (UptimeRobot détecte le code HTTP)
  const httpStatus = overall === "down" ? 503 : 200;

  return NextResponse.json(
    {
      status: overall,
      services,
      system,
      checkedAt: now,
    },
    { status: httpStatus }
  );
}
