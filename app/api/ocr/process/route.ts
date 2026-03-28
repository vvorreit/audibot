import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { callOcrService } from "@/lib/ocrClient";
import { parseMutuelle, parseOrdonnance, scoreMutuelle, scoreOrdonnance } from "@/lib/parsers";
import { computeScore } from "@/lib/ocrScore";

export const dynamic = "force-dynamic";

const ESSENTIEL_SCAN_LIMIT = 80;
const TRIAL_DAYS = 14;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      plan: true,
      createdAt: true,
      monthlyScanCount: true,
      monthlyScanResetAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const isPro = user.plan === "PRO" || user.plan === "EQUIPE";
  const trialDaysLeft = Math.max(
    0,
    TRIAL_DAYS - Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000)
  );

  if (!isPro && trialDaysLeft <= 0) {
    return NextResponse.json({ error: "Période d'essai terminée" }, { status: 403 });
  }

  if (user.plan === "ESSENTIEL") {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const count =
      user.monthlyScanResetAt && new Date(user.monthlyScanResetAt) >= monthStart
        ? user.monthlyScanCount
        : 0;
    if (count >= ESSENTIEL_SCAN_LIMIT) {
      return NextResponse.json({ error: "Limite mensuelle atteinte" }, { status: 403 });
    }
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) || "auto";

  if (!file) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const ocrResult = await callOcrService(buffer, file.name, file.type);

    const docType =
      type === "auto"
        ? ocrResult.text.match(/mutuelle|adhérent|AMC|tiers.payant|télétransmission/i)
          ? "mutuelle"
          : "ordonnance"
        : type;

    let parsed;
    let dataScore: number;

    if (docType === "mutuelle") {
      parsed = parseMutuelle(ocrResult.text);
      dataScore = scoreMutuelle(parsed);
    } else {
      parsed = parseOrdonnance(ocrResult.text);
      dataScore = scoreOrdonnance(parsed);
    }

    const score = computeScore(ocrResult.confidence, dataScore);

    await prisma.ocrScanLog.create({
      data: {
        userId: user.id,
        type: docType,
        success: score.globalScore >= 50,
        ocrConfidence: score.ocrConfidence,
        dataScore: score.dataScore,
        globalScore: score.globalScore,
        level: score.level,
        fileName: file.name,
      },
    });

    return NextResponse.json({
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      parsed,
      score,
      processingTimeMs: ocrResult.processing_time_ms,
      preprocessing: ocrResult.preprocessing,
    });
  } catch (err: unknown) {
    console.error("[OCR API] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur OCR interne" },
      { status: 500 }
    );
  }
}
