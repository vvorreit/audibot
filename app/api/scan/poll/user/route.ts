export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const POLL_INTERVAL_MS = 500;
const MAX_DURATION_MS = 10 * 60_000; // 10 min — long poll pour appareils appairés

/**
 * GET /api/scan/poll/user
 * SSE qui écoute TOUS les scans entrants de l'utilisateur (appareil appairé).
 * Contrairement à /api/scan/poll/[sessionId], pas besoin de connaître le sessionId.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const encoder = new TextEncoder();
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      send("ping");

      while (Date.now() - startTime < MAX_DURATION_MS) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        try {
          // Chercher n'importe quelle session avec un blob non livré
          const pending = await prisma.scanSession.findFirst({
            where: {
              userId,
              blob: { not: null },
              delivered: false,
            },
            select: { id: true, blob: true },
            orderBy: { createdAt: "desc" },
          });

          if (pending?.blob) {
            // Déterminer si c'est du JSON plain ou du chiffré
            if (pending.blob.startsWith("PLAIN:")) {
              send(pending.blob.slice(6)); // Envoyer le JSON brut
            } else {
              send(pending.blob); // Envoyer le blob chiffré tel quel
            }

            // Supprimer la session après livraison
            try {
              await prisma.scanSession.delete({ where: { id: pending.id } });
            } catch {
              // Déjà supprimée
            }

            // Continuer à écouter (le mobile peut scanner plusieurs documents)
            continue;
          }
        } catch {
          // Erreur DB — continuer
        }

        // Heartbeat toutes les 5s
        if ((Date.now() - startTime) % 5000 < POLL_INTERVAL_MS) {
          send("ping");
        }
      }

      send("timeout");
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
