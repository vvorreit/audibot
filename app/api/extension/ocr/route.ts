export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, getExtCors, optionsCors } from "@/lib/extensionAuth";
import { rateLimit } from "@/lib/rateLimit";
import { callOcrService } from "@/lib/ocrClient";
import { parseMutuelle, parseOrdonnance, scoreMutuelle, scoreOrdonnance } from "@/lib/parsers";
import { computeScore } from "@/lib/ocrScore";
import fs from "fs/promises";
import path from "path";

const TRIAL_DAYS = 15;
const UPLOADS_DIR = "/app/uploads/documents";

/** Normalise un nom pour le fichier : minuscules, accents supprimés, espaces → _ */
function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Génère le nom normalisé : nom_prenom_type_YYYY-MM-DD.pdf */
function buildFileName(
  nom: string | undefined,
  prenom: string | undefined,
  docType: string
): string {
  const date = new Date().toISOString().slice(0, 10);
  const typeName = docType === "mutuelle" ? "carte_mutuelle" : "ordonnance";
  const parts = [
    slugify(nom || "inconnu"),
    slugify(prenom || "inconnu"),
    typeName,
    date,
  ];
  return parts.join("_") + ".pdf";
}

export async function OPTIONS() {
  return optionsCors();
}

export async function POST(req: NextRequest) {
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await rateLimit(`ext-ocr:${ip}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429, headers: getExtCors(req.headers.get('origin')) });
  }

  const user = await prisma.user.findUnique({
    where: { syncToken: token },
    select: {
      id: true,
      role: true,
      plan: true,
      teamId: true,
      createdAt: true,
      monthlyScanCount: true,
      monthlyScanResetAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401, headers: getExtCors(req.headers.get('origin')) });
  }

  // Rate limit par plan (sauf ADMIN/PRO/EQUIPE)
  const isPro = user.role === "ADMIN" || user.plan === "PRO" || user.plan === "EQUIPE" || user.plan === "CABINET" || user.plan === "RESEAU";
  if (!isPro) {
    const trialDaysLeft = Math.max(
      0,
      TRIAL_DAYS - Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000)
    );
    if (trialDaysLeft <= 0) {
      return NextResponse.json({ error: "Période d'essai terminée" }, { status: 403, headers: getExtCors(req.headers.get('origin')) });
    }
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) || "auto";
  const patientNom = (formData.get("patientNom") as string) || undefined;
  const patientPrenom = (formData.get("patientPrenom") as string) || undefined;

  if (!file) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  // Limiter la taille (10 MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    /* Passe le type de document au service OCR pour optimiser le layout */
    const ocrDocType = type === "auto" ? "auto" : type === "mutuelle" ? "mutuelle" : "ordonnance";
    const ocrResult = await callOcrService(buffer, file.name, file.type, ocrDocType as "auto" | "mutuelle" | "ordonnance");

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

    // ── Stocker le fichier avec nom normalisé ──
    const normalizedName = buildFileName(patientNom, patientPrenom, docType);
    const userDir = path.join(UPLOADS_DIR, user.id);
    // Path traversal protection
    if (!path.resolve(userDir).startsWith(path.resolve(UPLOADS_DIR))) {
      return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
    }
    await fs.mkdir(userDir, { recursive: true });

    // Si un fichier du même nom existe, ajouter un suffixe
    let finalName = normalizedName;
    let filePath = path.join(userDir, finalName);
    let counter = 1;
    while (true) {
      try {
        await fs.access(filePath);
        // Le fichier existe, ajouter un suffixe
        const base = normalizedName.replace(".pdf", "");
        finalName = `${base}_${counter}.pdf`;
        filePath = path.join(userDir, finalName);
        counter++;
      } catch {
        // Le fichier n'existe pas, on peut l'utiliser
        break;
      }
    }

    await fs.writeFile(filePath, buffer);

    // ── Sauvegarder en DB ──
    const doc = await prisma.patientDocument.create({
      data: {
        userId: user.id,
        teamId: user.teamId ?? undefined,
        type: docType === "mutuelle" ? "carte_mutuelle" : "ordonnance",
        fileName: finalName,
        originalName: file.name,
        filePath: path.relative(UPLOADS_DIR, filePath),
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
        ocrScore: score.globalScore,
      },
    });

    // ── Log OCR + incrément compteur dans une transaction atomique ──
    // processingMeta : métriques techniques uniquement (pas de PII)
    const processingMeta = {
      preprocessing: ocrResult.preprocessing,
      timing: ocrResult.timing,
    };

    await prisma.$transaction([
      prisma.ocrScanLog.create({
        data: {
          userId: user.id,
          type: docType,
          success: score.globalScore >= 50,
          ocrConfidence: score.ocrConfidence,
          dataScore: score.dataScore,
          globalScore: score.globalScore,
          level: score.level,
          fileName: finalName,
          processingMeta,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { monthlyScanCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      type: docType,
      parsed,
      score,
      confidence: ocrResult.confidence,
      document: {
        id: doc.id,
        fileName: finalName,
        type: doc.type,
      },
    }, { headers: getExtCors(req.headers.get('origin')) });
  } catch (err: unknown) {
    console.error("[Extension OCR] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur OCR interne" },
      { status: 500, headers: getExtCors(req.headers.get('origin')) }
    );
  }
}
