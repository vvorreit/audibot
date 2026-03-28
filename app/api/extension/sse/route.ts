export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getPortalCorsHeaders } from "@/lib/cors";

export async function GET(req: NextRequest) {
  const CORS = getPortalCorsHeaders(req.headers.get("origin"));
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ error: "Token requis" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }

  const user = await prisma.user.findUnique({
    where: { syncToken: token },
    select: { id: true },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "Token invalide" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }

  const userId = user.id;
  const encoder = new TextEncoder();
  const MAX_DURATION_MS = 25 * 60 * 1000; /* 25 minutes */
  const POLL_INTERVAL_MS = 5000;
  const KEEPALIVE_INTERVAL_MS = 15000;
  const startTime = Date.now();

  let closed = false;
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let keepaliveInterval: ReturnType<typeof setInterval> | null = null;

  function cleanup() {
    closed = true;
    if (pollInterval) clearInterval(pollInterval);
    if (keepaliveInterval) clearInterval(keepaliveInterval);
    pollInterval = null;
    keepaliveInterval = null;
  }

  const stream = new ReadableStream({
    async start(controller) {
      /* Send initial connection event */
      controller.enqueue(encoder.encode("data: {\"type\":\"connected\"}\n\n"));

      /* Cleanup expired events on connect */
      await prisma.extensionEvent
        .deleteMany({ where: { expiresAt: { lt: new Date() } } })
        .catch(function () {});

      pollInterval = setInterval(async () => {
        if (closed) return;

        /* Check max duration */
        if (Date.now() - startTime > MAX_DURATION_MS) {
          try {
            controller.enqueue(
              encoder.encode("data: {\"type\":\"reconnect\"}\n\n")
            );
            controller.close();
          } catch {
            /* stream already closed */
          }
          cleanup();
          return;
        }

        try {
          /* Fetch undelivered events for this user */
          const events = await prisma.extensionEvent.findMany({
            where: {
              userId,
              delivered: false,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "asc" },
            take: 10,
          });

          for (const event of events) {
            if (closed) break;
            const payload = JSON.stringify({
              type: event.type,
              payload: event.payload,
              id: event.id,
            });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));

            /* Mark as delivered */
            await prisma.extensionEvent.update({
              where: { id: event.id },
              data: { delivered: true },
            });
          }
        } catch {
          /* Silently ignore DB errors to keep connection alive */
        }
      }, POLL_INTERVAL_MS);

      keepaliveInterval = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          cleanup();
        }
      }, KEEPALIVE_INTERVAL_MS);
    },
    cancel() {
      /* Client disconnected — clear intervals immediately */
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      Connection: "keep-alive",
      ...CORS,
    },
  });
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: getPortalCorsHeaders(req.headers.get("origin")),
  });
}
