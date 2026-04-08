export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { parseBody } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";

const VALID_PATCH_TYPES = ["selector_override", "field_mapping", "css_fix", "script_toggle", "feature_flag"] as const;

const createSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(VALID_PATCH_TYPES),
  hostnames: z.array(z.string().max(200)).min(1).max(50),
  data: z.record(z.string().max(100), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  description: z.string().max(500).optional(),
  priority: z.number().int().min(0).max(100).optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  active: z.boolean().optional(),
  name: z.string().min(1).max(200).optional(),
  type: z.enum(VALID_PATCH_TYPES).optional(),
  hostnames: z.array(z.string().max(200)).min(1).max(50).optional(),
  data: z.record(z.string().max(100), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  description: z.string().max(500).nullable().optional(),
  priority: z.number().int().min(0).max(100).optional(),
});

const deleteSchema = z.object({
  id: z.string().min(1),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return null;
  }
  return session.user;
}

// POST — Créer un nouveau patch
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = await rateLimit(`admin-hotpatch:${admin.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const data = await parseBody(req, createSchema);
  if (data instanceof NextResponse) return data;

  const patch = await prisma.hotPatch.create({
    data: {
      name: data.name,
      type: data.type,
      hostnames: data.hostnames,
      data: (data.data || {}) as Prisma.InputJsonValue,
      description: data.description || null,
      priority: data.priority || 0,
      active: true,
      createdBy: admin.id,
    },
  });

  return NextResponse.json({ ok: true, patch });
}

// PATCH — Toggle active / update
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = await rateLimit(`admin-hotpatch:${admin.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const data = await parseBody(req, updateSchema);
  if (data instanceof NextResponse) return data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  if (data.active !== undefined) updateData.active = data.active;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.hostnames !== undefined) updateData.hostnames = data.hostnames;
  if (data.data !== undefined) updateData.data = data.data;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority !== undefined) updateData.priority = data.priority;

  const patch = await prisma.hotPatch.update({
    where: { id: data.id },
    data: updateData,
  });

  return NextResponse.json({ ok: true, patch });
}

// DELETE — Supprimer un patch
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = await rateLimit(`admin-hotpatch:${admin.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const data = await parseBody(req, deleteSchema);
  if (data instanceof NextResponse) return data;

  await prisma.hotPatch.delete({ where: { id: data.id } });

  return NextResponse.json({ ok: true });
}
