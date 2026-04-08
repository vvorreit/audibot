export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, getExtCors, optionsCors } from "@/lib/extensionAuth";
import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = "/app/uploads/documents";

export async function OPTIONS() {
  return optionsCors();
}

/** GET — liste les documents du patient (filtre par nom/prénom optionnel) */
export async function GET(req: NextRequest) {
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  const user = await prisma.user.findUnique({
    where: { syncToken: token },
    select: { id: true, teamId: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401, headers: getExtCors(req.headers.get('origin')) });
  }

  const where: Record<string, unknown> = user.teamId
    ? { teamId: user.teamId }
    : { userId: user.id };

  const docs = await prisma.patientDocument.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      fileName: true,
      fileSize: true,
      ocrScore: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ documents: docs }, { headers: getExtCors(req.headers.get('origin')) });
}

/** DELETE — supprime un document */
export async function DELETE(req: NextRequest) {
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  const user = await prisma.user.findUnique({
    where: { syncToken: token },
    select: { id: true, teamId: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401, headers: getExtCors(req.headers.get('origin')) });
  }

  const { documentId } = await req.json();
  if (!documentId) {
    return NextResponse.json({ error: "documentId requis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  const doc = await prisma.patientDocument.findUnique({
    where: { id: documentId },
  });

  if (!doc || (doc.userId !== user.id && doc.teamId !== user.teamId)) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404, headers: getExtCors(req.headers.get('origin')) });
  }

  // Supprimer le fichier
  try {
    const fullPath = path.join(UPLOADS_DIR, doc.filePath);
    await fs.unlink(fullPath);
  } catch { /* ignore if file already removed */ }

  await prisma.patientDocument.delete({ where: { id: documentId } });

  return NextResponse.json({ ok: true }, { headers: getExtCors(req.headers.get('origin')) });
}
