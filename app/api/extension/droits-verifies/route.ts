export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { getExtCors, optionsCors } from "@/lib/extensionAuth";
import { z } from "zod";

const droitsSchema = z.object({
  portal: z.string().max(100).optional(),
  droitsOuverts: z.boolean().nullable().optional(),
  dateFinDroits: z.string().max(50).nullable().optional(),
  tauxPEC: z.string().max(20).nullable().optional(),
  organisme: z.string().max(100).nullable().optional(),
});

export async function OPTIONS(req: NextRequest) {
  return optionsCors(req);
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const syncToken = auth?.replace("Bearer ", "");
    if (!syncToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: getExtCors(req.headers.get("origin")) });
    }

    const allowed = await rateLimit(`droits-verifies:${syncToken}`, 30, 60_000);
    if (!allowed) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: getExtCors(req.headers.get("origin")) });

    const user = await prisma.user.findUnique({
      where: { syncToken },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 401, headers: getExtCors(req.headers.get("origin")) });
    }

    const body = await req.json();
    const parsed = droitsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Données invalides" }, { status: 400, headers: getExtCors(req.headers.get("origin")) });
    }

    const record = await prisma.droitsVerifies.create({
      data: {
        userId: user.id,
        portal: parsed.data.portal || "inconnu",
        droitsOuverts: parsed.data.droitsOuverts ?? null,
        dateFinDroits: parsed.data.dateFinDroits || null,
        tauxPEC: parsed.data.tauxPEC || null,
        organisme: parsed.data.organisme || null,
      },
    });

    return NextResponse.json({ ok: true, id: record.id }, { headers: getExtCors(req.headers.get("origin")) });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: getExtCors(req.headers.get("origin")) });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: getExtCors(req.headers.get("origin")) });
    }

    const allowedGet = await rateLimit(`droits-verifies:${token}`, 30, 60_000);
    if (!allowedGet) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: getExtCors(req.headers.get("origin")) });

    const user = await prisma.user.findUnique({
      where: { syncToken: token },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 401, headers: getExtCors(req.headers.get("origin")) });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const record = await prisma.droitsVerifies.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, data: record || null }, { headers: getExtCors(req.headers.get("origin")) });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: getExtCors(req.headers.get("origin")) });
  }
}
