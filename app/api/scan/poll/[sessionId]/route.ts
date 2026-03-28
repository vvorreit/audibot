export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const POLL_INTERVAL_MS = 500;
const MAX_DURATION_MS = 90_000;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { sessionId } = await params;
  const userId = (session.user as { id: string }).id;

  // Vérifier que la session appartient à cet user
  const scanSession = await prisma.scanSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true, blob: true, expiresAt: true },
  });

  if (!scanSession) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Heartbeat initial
      send("ping");

      while (Date.now() - startTime < MAX_DURATION_MS) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        let current: { blob: string | null; delivered: boolean; expiresAt: Date } | null;
        try {
          current = await prisma.scanSession.findUnique({
            where: { id: sessionId },
            select: { blob: true, delivered: true, expiresAt: true },
          });
        } catch {
          break;
        }

        if (!current || current.delivered || current.expiresAt < new Date()) {
          send("expired");
          break;
        }

        if (current.blob) {
          // Envoyer le blob et supprimer la session immédiatement
          send(current.blob);
          try {
            await prisma.scanSession.delete({ where: { id: sessionId } });
          } catch {
            // Déjà supprimée — pas grave
          }
          break;
        }

        // Heartbeat toutes les 5s
        if ((Date.now() - startTime) % 5000 < POLL_INTERVAL_MS) {
          send("ping");
        }
      }

      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
